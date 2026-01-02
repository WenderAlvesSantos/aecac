import { useState, useEffect, useRef } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Popconfirm,
  Upload,
  Image,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import {
  getDiretoria,
  createMembro,
  updateMembro,
  deleteMembro,
} from '../../lib/api'

const DiretoriaAdmin = () => {
  const [diretoria, setDiretoria] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingMembro, setEditingMembro] = useState(null)
  const editingMembroRef = useRef(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadDiretoria()
  }, [])

  const loadDiretoria = async () => {
    setLoading(true)
    try {
      const response = await getDiretoria()
      setDiretoria(response.data)
    } catch (error) {
      message.error('Erro ao carregar diretoria')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingMembro(null)
    editingMembroRef.current = null
    form.resetFields()
    form.setFieldsValue({ fotoFile: [] })
    setModalVisible(true)
  }

  const handleEdit = (membro) => {
    setEditingMembro(membro)
    editingMembroRef.current = membro
    setModalVisible(true)
  }

  // Efeito para carregar dados quando o modal de edição abrir
  useEffect(() => {
    if (modalVisible && editingMembroRef.current) {
      const membro = editingMembroRef.current
      
      // Preparar a imagem para exibição no Upload
      let fotoFileList = []
      if (membro.foto && membro.foto.startsWith('data:image')) {
        // Se a imagem está em base64, criar um objeto de arquivo para o Upload
        fotoFileList = [{
          uid: '-1',
          name: 'foto.jpg',
          status: 'done',
          url: membro.foto,
          thumbUrl: membro.foto,
          originFileObj: null,
        }]
      }
      
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (form && modalVisible) {
            form.setFieldsValue({
              nome: membro.nome,
              cargo: membro.cargo,
              fotoFile: fotoFileList,
            })
          }
        }, 100)
      })
    } else if (!modalVisible) {
      editingMembroRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalVisible])

  const handleDelete = async (id) => {
    try {
      await deleteMembro(id)
      message.success('Membro deletado com sucesso')
      loadDiretoria()
    } catch (error) {
      message.error('Erro ao deletar membro')
    }
  }

  const compressImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.75) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new window.Image()
        img.src = event.target.result
        
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width = width * ratio
            height = height * ratio
          }
          
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
          resolve(compressedBase64)
        }
        
        img.onerror = (error) => {
          reject(new Error('Erro ao carregar a imagem'))
        }
      }
      
      reader.onerror = (error) => {
        reject(new Error('Erro ao ler o arquivo'))
      }
    })
  }

  const convertImageToBase64 = (file) => {
    if (file.type === 'image/png' || file.size > 500000) {
      return compressImage(file, 1200, 1200, 0.75)
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleSubmit = async (values) => {
    try {
      const formData = { ...values }
      
      // Processar imagem se houver upload
      if (values.fotoFile && values.fotoFile.length > 0) {
        const file = values.fotoFile[0]
        
        if (file.originFileObj) {
          // Nova imagem enviada - converter para base64
          try {
            const base64Image = await convertImageToBase64(file.originFileObj)
            formData.foto = base64Image
          } catch (error) {
            message.error('Erro ao processar a imagem. Tente novamente.')
            return
          }
        } else if (file.url) {
          // Imagem existente (não alterada)
          if (file.url.startsWith('data:')) {
            // Já está em base64
            formData.foto = file.url
          } else {
            // URL externa (não deveria acontecer, mas mantém)
            formData.foto = file.url
          }
        }
      } else {
        // Sem imagem no formulário
        if (editingMembro && editingMembro.foto) {
          // Se estava editando e tinha imagem, mas foi removida
          formData.foto = null
        } else {
          formData.foto = null
        }
      }
      
      // Remover fotoFile do formData antes de enviar
      delete formData.fotoFile

      if (editingMembro) {
        await updateMembro(editingMembro._id, formData)
        message.success('Membro atualizado com sucesso')
      } else {
        await createMembro(formData)
        message.success('Membro criado com sucesso')
      }

      setModalVisible(false)
      form.resetFields()
      loadDiretoria()
    } catch (error) {
      console.error('Erro ao salvar membro:', error)
      message.error('Erro ao salvar membro: ' + (error.response?.data?.error || error.message))
    }
  }

  const previewFile = (file) => {
    return new Promise((resolve) => {
      if (file.url) {
        resolve(file.url)
      } else if (file.originFileObj) {
        const reader = new FileReader()
        reader.readAsDataURL(file.originFileObj)
        reader.onload = () => resolve(reader.result)
      }
    })
  }

  const columns = [
    {
      title: 'Foto',
      dataIndex: 'foto',
      key: 'foto',
      width: 100,
      render: (foto) => {
        if (foto && foto.startsWith('data:image')) {
          return (
            <Image
              src={foto}
              alt="Foto"
              width={60}
              height={60}
              style={{ objectFit: 'cover', borderRadius: '4px' }}
              preview={false}
            />
          )
        }
        return '-'
      },
    },
    {
      title: 'Nome',
      dataIndex: 'nome',
      key: 'nome',
    },
    {
      title: 'Cargo',
      dataIndex: 'cargo',
      key: 'cargo',
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Editar
          </Button>
          <Popconfirm
            title="Tem certeza que deseja deletar este membro?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Deletar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Gerenciar Diretoria</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Novo Membro
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={diretoria}
        loading={loading}
        rowKey="_id"
      />

      <Modal
        title={editingMembro ? 'Editar Membro' : 'Novo Membro'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setEditingMembro(null)
          editingMembroRef.current = null
        }}
        footer={null}
        width={600}
        destroyOnHidden={true}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="nome"
            label="Nome"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="cargo"
            label="Cargo"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Input placeholder="Ex: Presidente, Vice-Presidente, Diretor" />
          </Form.Item>

          <Form.Item
            name="fotoFile"
            label="Foto"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e.slice(0, 1) // Garantir apenas 1 arquivo
              }
              if (e?.fileList) {
                return e.fileList.slice(0, 1) // Garantir apenas 1 arquivo
              }
              return []
            }}
          >
            <div>
              <Upload
                listType="picture-card"
                maxCount={1}
                multiple={false}
                beforeUpload={(file) => {
                  const isImage = file.type.startsWith('image/')
                  if (!isImage) {
                    message.error('Apenas arquivos de imagem são permitidos!')
                    return Upload.LIST_IGNORE
                  }
                  const isLt10M = file.size / 1024 / 1024 < 10
                  if (!isLt10M) {
                    message.error('A imagem deve ser menor que 10MB!')
                    return Upload.LIST_IGNORE
                  }
                  return false // Não fazer upload automático
                }}
                onChange={(info) => {
                  // Garantir que apenas 1 arquivo seja mantido
                  let fileList = [...info.fileList]
                  
                  // Se houver mais de 1 arquivo, manter apenas o último
                  if (fileList.length > 1) {
                    fileList = [fileList[fileList.length - 1]]
                    message.warning('Apenas uma imagem é permitida. A última imagem selecionada será mantida.')
                  }
                  
                  // Atualizar o form manualmente
                  form.setFieldValue('fotoFile', fileList)
                }}
                onPreview={(file) => {
                  // Abrir preview da imagem
                  if (file.url || file.originFileObj) {
                    previewFile(file).then((url) => {
                      const image = new window.Image()
                      image.src = url
                      const imgWindow = window.open(url)
                      imgWindow?.document.write(image.outerHTML)
                    })
                  }
                }}
                previewFile={previewFile}
                accept="image/*"
              >
                {(form.getFieldValue('fotoFile')?.length || 0) < 1 && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
              <div style={{ marginTop: 8, color: '#666', fontSize: '12px' }}>
                Apenas uma imagem. Formatos: JPG, PNG. Máximo recomendado: 1MB.
              </div>
            </div>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Salvar
              </Button>
              <Button onClick={() => {
                setModalVisible(false)
                form.resetFields()
                setEditingMembro(null)
                editingMembroRef.current = null
              }}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default DiretoriaAdmin

