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
  Image,
  Upload,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import {
  getGaleria,
  createImagem,
  updateImagem,
  deleteImagem,
  updateOrdemGaleria,
} from '../../lib/api'

const { TextArea } = Input

const GaleriaAdmin = () => {
  const [imagens, setImagens] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingImagem, setEditingImagem] = useState(null)
  const [form] = Form.useForm()
  const editingImagemRef = useRef(null)

  useEffect(() => {
    loadImagens()
  }, [])

  // Efeito para carregar dados quando o modal de edição abrir
  useEffect(() => {
    if (modalVisible && editingImagemRef.current) {
      const imagem = editingImagemRef.current
      
      let imagemFileList = []
      if (imagem.url) {
        const imageUrl = imagem.url
        imagemFileList = [{
          uid: '-1',
          name: 'imagem.jpg',
          status: 'done',
          url: imageUrl,
          thumbUrl: imageUrl,
          originFileObj: null,
        }]
      }
      
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (form && modalVisible) {
            form.setFieldsValue({
              ...imagem,
              imagemFile: imagemFileList,
            })
          }
        }, 100)
      })
    } else if (!modalVisible) {
      editingImagemRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalVisible])

  const loadImagens = async () => {
    setLoading(true)
    try {
      const response = await getGaleria()
      setImagens(response.data)
    } catch (error) {
      message.error('Erro ao carregar imagens')
    } finally {
      setLoading(false)
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

  const handleCreate = () => {
    setEditingImagem(null)
    editingImagemRef.current = null
    form.resetFields()
    form.setFieldsValue({ imagemFile: [] })
    setModalVisible(true)
  }

  const handleEdit = (imagem) => {
    setEditingImagem(imagem)
    editingImagemRef.current = imagem
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteImagem(id)
      message.success('Imagem deletada com sucesso')
      loadImagens()
    } catch (error) {
      message.error('Erro ao deletar imagem')
    }
  }

  const handleSubmit = async (values) => {
    try {
      const formData = { ...values }
      
      // Processar imagem se houver upload
      if (values.imagemFile && values.imagemFile.length > 0) {
        const file = values.imagemFile[0]
        
        if (file.originFileObj) {
          // Nova imagem enviada - converter para base64
          const base64 = await convertImageToBase64(file.originFileObj)
          formData.url = base64
        } else if (file.url && file.url.startsWith('data:')) {
          // Imagem existente em base64 (não alterada)
          formData.url = file.url
        } else if (file.url) {
          // URL de imagem existente
          formData.url = file.url
        }
      } else {
        // Sem imagem no formulário
        if (editingImagem && editingImagem.url) {
          // Se estava editando e tinha imagem, mas foi removida
          formData.url = null
        } else {
          formData.url = null
        }
      }
      
      delete formData.imagemFile

      if (editingImagem) {
        await updateImagem(editingImagem._id, formData)
        message.success('Imagem atualizada com sucesso')
      } else {
        // Calcular ordem para nova imagem (adicionar no final)
        const maxOrder = imagens.length > 0 
          ? Math.max(...imagens.map(img => img.order || 0))
          : -1
        formData.order = maxOrder + 1
        await createImagem(formData)
        message.success('Imagem criada com sucesso')
      }

      setModalVisible(false)
      form.resetFields()
      loadImagens()
    } catch (error) {
      console.error('Erro ao salvar imagem:', error)
      message.error('Erro ao salvar imagem: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleMoveUp = async (index) => {
    if (index === 0) return
    
    const newImagens = [...imagens]
    const temp = newImagens[index].order
    newImagens[index].order = newImagens[index - 1].order
    newImagens[index - 1].order = temp
    
    try {
      await updateOrdemGaleria(newImagens.map(img => ({ id: img._id, order: img.order })))
      message.success('Ordem atualizada com sucesso')
      loadImagens()
    } catch (error) {
      message.error('Erro ao atualizar ordem')
    }
  }

  const handleMoveDown = async (index) => {
    if (index === imagens.length - 1) return
    
    const newImagens = [...imagens]
    const temp = newImagens[index].order
    newImagens[index].order = newImagens[index + 1].order
    newImagens[index + 1].order = temp
    
    try {
      await updateOrdemGaleria(newImagens.map(img => ({ id: img._id, order: img.order })))
      message.success('Ordem atualizada com sucesso')
      loadImagens()
    } catch (error) {
      message.error('Erro ao atualizar ordem')
    }
  }

  const columns = [
    {
      title: 'Ordem',
      key: 'order',
      width: 100,
      render: (_, record, index) => (
        <Space>
          <Button
            type="text"
            icon={<ArrowUpOutlined />}
            onClick={() => handleMoveUp(index)}
            disabled={index === 0}
            size="small"
          />
          <Button
            type="text"
            icon={<ArrowDownOutlined />}
            onClick={() => handleMoveDown(index)}
            disabled={index === imagens.length - 1}
            size="small"
          />
        </Space>
      ),
    },
    {
      title: 'Imagem',
      dataIndex: 'url',
      key: 'url',
      render: (url) => (
        <Image
          src={url}
          alt="Preview"
          width={80}
          height={80}
          style={{ objectFit: 'cover' }}
        />
      ),
    },
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
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
            title="Tem certeza que deseja deletar esta imagem?"
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
        <h2>Gerenciar Galeria</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Nova Imagem
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={[...imagens].sort((a, b) => (a.order || 0) - (b.order || 0))}
        loading={loading}
        rowKey="_id"
        pagination={false}
      />

      <Modal
        title={editingImagem ? 'Editar Imagem' : 'Nova Imagem'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setEditingImagem(null)
          editingImagemRef.current = null
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
            name="imagemFile"
            label="Imagem"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e.slice(0, 1)
              }
              if (e?.fileList) {
                return e.fileList.slice(0, 1)
              }
              return []
            }}
          >
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
                const isLt5M = file.size / 1024 / 1024 < 5
                if (!isLt5M) {
                  message.error('A imagem deve ter menos de 5MB!')
                  return Upload.LIST_IGNORE
                }
                return false
              }}
              accept="image/*"
              onRemove={() => {
                form.setFieldValue('imagemFile', [])
              }}
              onChange={(info) => {
                let fileList = [...info.fileList]
                if (fileList.length > 1) {
                  fileList = [fileList[fileList.length - 1]]
                  message.warning('Apenas uma imagem é permitida.')
                }
                form.setFieldValue('imagemFile', fileList)
              }}
              onPreview={(file) => {
                if (file.url || file.thumbUrl) {
                  window.open(file.url || file.thumbUrl, '_blank')
                }
              }}
              previewFile={(file) => {
                // Retornar Promise com a URL para preview
                return Promise.resolve(file.url || file.thumbUrl || '')
              }}
            >
              {(form.getFieldValue('imagemFile')?.length || 0) >= 1 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <div style={{ marginTop: -16, marginBottom: 16, fontSize: '12px', color: '#666' }}>
            Tamanho máximo: 5MB. Formatos: JPG, PNG, GIF, WebP. Apenas 1 imagem.
          </div>

          <Form.Item
            name="title"
            label="Título"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Descrição"
          >
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Salvar
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default GaleriaAdmin

