import { useState, useEffect, useRef } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Popconfirm,
  Upload,
  Image,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import {
  getEmpresas,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
} from '../../lib/api'

const { TextArea } = Input

// Função para formatar telefone
const formatPhone = (value) => {
  if (!value) return ''
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '')
  
  // Aplica máscara: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  } else {
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  }
}

// Função para remover máscara do telefone
const removePhoneMask = (value) => {
  if (!value) return ''
  return value.replace(/\D/g, '')
}

const EmpresasAdmin = () => {
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingEmpresa, setEditingEmpresa] = useState(null)
  const [form] = Form.useForm()
  const editingEmpresaRef = useRef(null)

  useEffect(() => {
    loadEmpresas()
  }, [])

  const loadEmpresas = async () => {
    setLoading(true)
    try {
      const response = await getEmpresas()
      setEmpresas(response.data)
    } catch (error) {
      message.error('Erro ao carregar empresas')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingEmpresa(null)
    form.resetFields()
    form.setFieldsValue({ imagemFile: [] })
    setModalVisible(true)
  }

  const handleEdit = (empresa) => {
    setEditingEmpresa(empresa)
    editingEmpresaRef.current = empresa
    setModalVisible(true)
  }

  // Efeito para carregar dados quando o modal de edição abrir
  useEffect(() => {
    if (modalVisible && editingEmpresaRef.current) {
      const empresa = editingEmpresaRef.current
      
      // Preparar a imagem para exibição no Upload
      let imagemFileList = []
      if (empresa.imagem) {
        // Se a imagem está em base64, criar um objeto de arquivo para o Upload
        // O Upload do Ant Design precisa de url e thumbUrl para exibir a imagem
        const imageUrl = empresa.imagem
        imagemFileList = [{
          uid: '-1',
          name: 'imagem.jpg',
          status: 'done',
          url: imageUrl, // base64 data URL
          thumbUrl: imageUrl, // Para preview no picture-card
          originFileObj: null, // Não é um novo arquivo, é uma imagem existente
        }]
      }
      
      // Definir valores do formulário após o modal estar montado
      // Usar requestAnimationFrame para garantir que o Form está renderizado
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (form && modalVisible) {
            // Formatar telefone ao carregar para edição
            const empresaData = { ...empresa }
            if (empresaData.telefone) {
              empresaData.telefone = formatPhone(empresaData.telefone)
            }
            form.setFieldsValue({
              ...empresaData,
              imagemFile: imagemFileList,
            })
          }
        }, 100)
      })
    } else if (!modalVisible) {
      // Limpar referência quando o modal fechar
      editingEmpresaRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalVisible])

  const handleDelete = async (id) => {
    try {
      await deleteEmpresa(id)
      message.success('Empresa deletada com sucesso')
      loadEmpresas()
    } catch (error) {
      message.error('Erro ao deletar empresa')
    }
  }

  const compressImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.75) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        // Usar window.Image para evitar conflito com o componente Image do Ant Design
        const img = new window.Image()
        img.src = event.target.result
        
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          
          // Calcular novas dimensões mantendo proporção
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width = width * ratio
            height = height * ratio
          }
          
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          
          // Converter para base64 com compressão (sempre usar JPEG para melhor compressão)
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
          const originalSizeMB = (file.size / 1024 / 1024).toFixed(2)
          const compressedSizeMB = (compressedBase64.length / 1024 / 1024).toFixed(2)
          const reduction = ((1 - compressedBase64.length / file.size) * 100).toFixed(1)
          
          console.log('✅ Imagem comprimida:', {
            original: `${originalSizeMB}MB (${file.size} bytes)`,
            compressed: `${compressedSizeMB}MB (${compressedBase64.length} bytes)`,
            reduction: `${reduction}%`,
            dimensions: `${img.width}x${img.height} → ${width}x${height}`
          })
          resolve(compressedBase64)
        }
        
        img.onerror = (error) => {
          console.error('❌ Erro ao carregar imagem:', error)
          reject(new Error('Erro ao carregar a imagem'))
        }
      }
      
      reader.onerror = (error) => {
        console.error('❌ Erro ao ler arquivo:', error)
        reject(new Error('Erro ao ler o arquivo'))
      }
    })
  }

  const convertImageToBase64 = (file) => {
    // Sempre comprimir imagens maiores que 500KB ou PNGs
    if (file.type === 'image/png' || file.size > 500000) {
      console.log('📦 Comprimindo imagem antes de converter...')
      return compressImage(file, 1200, 1200, 0.75)
    }
    
    // Para imagens pequenas, converter diretamente
    console.log('📤 Convertendo imagem pequena diretamente...')
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result
        const sizeMB = (result.length / 1024 / 1024).toFixed(2)
        console.log(`✅ Imagem convertida para base64: ${sizeMB}MB`)
        resolve(result)
      }
      reader.onerror = (error) => {
        console.error('❌ Erro ao converter imagem:', error)
        reject(error)
      }
    })
  }

  const handleSubmit = async (values) => {
    try {
      console.log('=== INÍCIO DO SUBMIT ===')
      console.log('Valores do formulário:', {
        ...values,
        imagemFile: values.imagemFile ? `[${values.imagemFile.length} arquivo(s)]` : 'nenhum'
      })
      
      const formData = { ...values }
      
      // Processar imagem se houver upload
      if (values.imagemFile && values.imagemFile.length > 0) {
        const file = values.imagemFile[0]
        console.log('Arquivo encontrado:', {
          name: file.name,
          size: file.size,
          type: file.type,
          hasOriginFileObj: !!file.originFileObj,
          hasUrl: !!file.url
        })
        
        if (file.originFileObj) {
          // Nova imagem enviada - converter para base64
          console.log('Convertendo nova imagem para base64...')
          try {
            const base64 = await convertImageToBase64(file.originFileObj)
            formData.imagem = base64
            console.log('✅ Imagem convertida com sucesso! Tamanho base64:', base64.length, 'caracteres')
          } catch (error) {
            console.error('❌ Erro ao converter imagem:', error)
            message.error('Erro ao processar a imagem. Tente novamente.')
            return
          }
        } else if (file.url) {
          // Imagem existente (não alterada)
          if (file.url.startsWith('data:')) {
            // Já está em base64
            formData.imagem = file.url
            console.log('Mantendo imagem existente (base64)')
          } else {
            // URL externa (não deveria acontecer, mas mantém)
            formData.imagem = file.url
            console.log('Mantendo URL de imagem existente')
          }
        }
      } else {
        // Sem imagem no formulário
        if (editingEmpresa && editingEmpresa.imagem) {
          // Se estava editando e tinha imagem, mas foi removida
          formData.imagem = null
          console.log('Imagem removida pelo usuário')
        } else {
          formData.imagem = null
          console.log('Nenhuma imagem fornecida')
        }
      }
      
      delete formData.imagemFile
      
      console.log('Dados finais a serem enviados:', {
        nome: formData.nome,
        categoria: formData.categoria,
        hasImagem: !!formData.imagem,
        imagemLength: formData.imagem ? formData.imagem.length : 0,
        imagemPreview: formData.imagem ? formData.imagem.substring(0, 50) + '...' : null
      })

      if (editingEmpresa) {
        console.log('Atualizando empresa existente...')
        await updateEmpresa(editingEmpresa._id, formData)
        message.success('Empresa atualizada com sucesso')
      } else {
        console.log('Criando nova empresa...')
        await createEmpresa(formData)
        message.success('Empresa criada com sucesso')
      }

      setModalVisible(false)
      form.resetFields()
      loadEmpresas()
      console.log('=== FIM DO SUBMIT (SUCESSO) ===')
    } catch (error) {
      console.error('=== ERRO NO SUBMIT ===', error)
      console.error('Erro completo:', error.response || error)
      message.error('Erro ao salvar empresa: ' + (error.response?.data?.error || error.message))
    }
  }

  const columns = [
    {
      title: 'Imagem',
      dataIndex: 'imagem',
      key: 'imagem',
      width: 100,
      render: (imagem) => {
        if (imagem) {
          return (
            <Image
              src={imagem}
              alt="Fachada"
              width={60}
              height={60}
              style={{ objectFit: 'cover', borderRadius: '4px' }}
              preview={false}
            />
          )
        }
        return <span style={{ color: '#ccc' }}>Sem imagem</span>
      },
    },
    {
      title: 'Nome',
      dataIndex: 'nome',
      key: 'nome',
    },
    {
      title: 'Categoria',
      dataIndex: 'categoria',
      key: 'categoria',
    },
    {
      title: 'Telefone',
      dataIndex: 'telefone',
      key: 'telefone',
      render: (telefone) => telefone ? formatPhone(telefone) : '-',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
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
            title="Tem certeza que deseja deletar esta empresa?"
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
        <h2>Gerenciar Empresas</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Nova Empresa
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={empresas}
        loading={loading}
        rowKey="_id"
      />

      <Modal
        title={editingEmpresa ? 'Editar Empresa' : 'Nova Empresa'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setEditingEmpresa(null)
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
            name="categoria"
            label="Categoria"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Select>
              <Select.Option value="Varejo">Varejo</Select.Option>
              <Select.Option value="Alimentação">Alimentação</Select.Option>
              <Select.Option value="Tecnologia">Tecnologia</Select.Option>
              <Select.Option value="Saúde">Saúde</Select.Option>
              <Select.Option value="Serviços">Serviços</Select.Option>
              <Select.Option value="Beleza">Beleza</Select.Option>
              <Select.Option value="Construção">Construção</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="descricao"
            label="Descrição"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="telefone"
            label="Telefone"
            normalize={(value) => {
              if (!value) return ''
              return formatPhone(value)
            }}
          >
            <Input
              placeholder="(61) 99999-9999"
              maxLength={15}
            />
          </Form.Item>

          <Form.Item
            name="site"
            label="Site"
            rules={[
              {
                type: 'url',
                message: 'URL inválida',
              },
            ]}
          >
            <Input placeholder="https://www.exemplo.com.br" />
          </Form.Item>

          <Form.Item
            name="facebook"
            label="Facebook"
            rules={[
              {
                type: 'url',
                message: 'URL inválida',
              },
            ]}
          >
            <Input placeholder="https://facebook.com/empresa" />
          </Form.Item>

          <Form.Item
            name="instagram"
            label="Instagram"
            rules={[
              {
                type: 'url',
                message: 'URL inválida',
              },
            ]}
          >
            <Input placeholder="https://instagram.com/empresa" />
          </Form.Item>

          <Form.Item
            name="linkedin"
            label="LinkedIn"
            rules={[
              {
                type: 'url',
                message: 'URL inválida',
              },
            ]}
          >
            <Input placeholder="https://linkedin.com/company/empresa" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
          >
            <Input type="email" />
          </Form.Item>

          <Form.Item
            name="endereco"
            label="Endereço"
          >
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item
            name="imagemFile"
            label="Imagem da Fachada"
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
                // Não fazer upload automático, vamos processar manualmente
                return false
              }}
              accept="image/*"
              onRemove={() => {
                form.setFieldValue('imagemFile', [])
              }}
              onChange={(info) => {
                // Garantir que apenas 1 arquivo seja mantido
                let fileList = [...info.fileList]
                
                // Se houver mais de 1 arquivo, manter apenas o último
                if (fileList.length > 1) {
                  fileList = [fileList[fileList.length - 1]]
                  message.warning('Apenas uma imagem é permitida. A última imagem selecionada será mantida.')
                }
                
                // Atualizar o campo do formulário
                form.setFieldValue('imagemFile', fileList)
              }}
              onPreview={(file) => {
                // Abrir preview da imagem
                if (file.url || file.thumbUrl) {
                  window.open(file.url || file.thumbUrl, '_blank')
                }
              }}
              previewFile={(file) => {
                // Permitir preview de imagens base64
                return file.url || file.thumbUrl || file.originFileObj
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

export default EmpresasAdmin

