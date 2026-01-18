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
  Tag,
  Tooltip,
} from 'antd'
import { PlusOutlined, DeleteOutlined, UploadOutlined, CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons'
import {
  getEmpresasPendentes,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
  aprovarEmpresa,
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

// Função para formatar CNPJ
const formatCNPJ = (value) => {
  if (!value) return ''
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 14) {
    return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
      .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})$/, '$1.$2.$3/$4')
      .replace(/^(\d{2})(\d{3})(\d{3})$/, '$1.$2.$3')
      .replace(/^(\d{2})(\d{3})$/, '$1.$2')
      .replace(/^(\d{2})$/, '$1')
  }
  return value
}

// Função para formatar CEP
const formatCEP = (value) => {
  if (!value) return ''
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 8) {
    return numbers.replace(/^(\d{5})(\d{3})$/, '$1-$2')
  }
  return value
}


const EmpresasAdmin = () => {
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [viewingEmpresa, setViewingEmpresa] = useState(null)
  const [editingEmpresa, setEditingEmpresa] = useState(null)
  const [form] = Form.useForm()
  const editingEmpresaRef = useRef(null)
  const [filtroStatus, setFiltroStatus] = useState('all')

  useEffect(() => {
    loadEmpresas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroStatus])

  const loadEmpresas = async () => {
    setLoading(true)
    try {
      const response = await getEmpresasPendentes(filtroStatus === 'all' ? null : filtroStatus)
      // Garantir que todas as empresas tenham status definido
      const empresasComStatus = response.data.map(empresa => ({
        ...empresa,
        status: empresa.status || 'pendente' // Default para pendente se não tiver status
      }))
      setEmpresas(empresasComStatus)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
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

  const handleView = (empresa) => {
    setViewingEmpresa(empresa)
    setViewModalVisible(true)
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
            // Formatar campos ao carregar para edição
            const empresaData = { ...empresa }
            if (empresaData.telefone) {
              empresaData.telefone = formatPhone(empresaData.telefone)
            }
            if (empresaData.whatsapp) {
              empresaData.whatsapp = formatPhone(empresaData.whatsapp)
            }
            if (empresaData.cnpj) {
              empresaData.cnpj = formatCNPJ(empresaData.cnpj)
            }
            if (empresaData.cep) {
              empresaData.cep = formatCEP(empresaData.cep)
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

  const handleAprovar = async (empresaId, acao) => {
    try {
      await aprovarEmpresa(empresaId, acao)
      message.success(`Empresa ${acao === 'aprovar' ? 'aprovada' : 'rejeitada'} com sucesso`)
      loadEmpresas()
    } catch (error) {
      message.error('Erro ao processar solicitação')
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
      
      // Limpar CNPJ e CEP (remover formatação)
      if (formData.cnpj) {
        formData.cnpj = formData.cnpj.replace(/\D/g, '')
      }
      if (formData.cep) {
        formData.cep = formData.cep.replace(/\D/g, '')
      }
      
      console.log('Dados finais a serem enviados:', {
        nome: formData.nome,
        categoria: formData.categoria,
        cnpj: formData.cnpj,
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          pendente: 'orange',
          aprovado: 'green',
          rejeitado: 'red',
        }
        const labels = {
          pendente: 'Pendente',
          aprovado: 'Aprovado',
          rejeitado: 'Rejeitado',
        }
        return <Tag color={colors[status] || 'default'}>{labels[status] || status}</Tag>
      },
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 150,
      render: (_, record) => {
        const isPendente = record.status === 'pendente' || !record.status
        return (
          <Space size="middle">
            {isPendente && (
              <>
                <Popconfirm
                  title="Confirmar aprovação desta empresa?"
                  description="A empresa será aprovada e um email será enviado automaticamente."
                  onConfirm={() => handleAprovar(record._id, 'aprovar')}
                  okText="Sim, aprovar"
                  cancelText="Cancelar"
                  okButtonProps={{ type: 'primary', danger: false }}
                >
                  <Tooltip title="Aprovar empresa">
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      style={{ background: '#52c41a', borderColor: '#52c41a' }}
                      shape="circle"
                    />
                  </Tooltip>
                </Popconfirm>
                <Popconfirm
                  title="Confirmar rejeição desta empresa?"
                  description="A empresa será rejeitada e um email será enviado automaticamente."
                  onConfirm={() => handleAprovar(record._id, 'rejeitar')}
                  okText="Sim, rejeitar"
                  cancelText="Cancelar"
                  okButtonProps={{ type: 'primary', danger: true }}
                >
                  <Tooltip title="Rejeitar empresa">
                    <Button
                      danger
                      icon={<CloseOutlined />}
                      shape="circle"
                    />
                  </Tooltip>
                </Popconfirm>
              </>
            )}
            <Tooltip title="Visualizar empresa">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handleView(record)}
                shape="circle"
              />
            </Tooltip>
            <Popconfirm
              title="Tem certeza que deseja deletar esta empresa?"
              onConfirm={() => handleDelete(record._id)}
              okText="Sim"
              cancelText="Não"
            >
              <Tooltip title="Deletar empresa">
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                  shape="circle"
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        )
      },
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        marginBottom: '24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <h2 style={{ margin: 0 }}>Gerenciar Empresas</h2>
        <Space size="large" wrap>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 500 }}>Filtrar por status:</span>
            <Select
              value={filtroStatus}
              onChange={setFiltroStatus}
              style={{ width: 160, minWidth: 160 }}
              placeholder="Selecione o status"
            >
              <Select.Option value="all">Todas</Select.Option>
              <Select.Option value="pendente">Pendentes</Select.Option>
              <Select.Option value="aprovado">Aprovadas</Select.Option>
              <Select.Option value="rejeitado">Rejeitadas</Select.Option>
            </Select>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            size="large"
          >
            Nova Empresa
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={empresas}
        loading={loading}
        rowKey="_id"
        scroll={{ x: 'max-content' }}
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
        width={window.innerWidth < 768 ? '95%' : 600}
        destroyOnHidden={true}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="cnpj"
            label="CNPJ"
            rules={[
              { required: true, message: 'CNPJ é obrigatório' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve()
                  const cnpjLimpo = value.replace(/\D/g, '')
                  if (cnpjLimpo.length !== 14) {
                    return Promise.reject(new Error('CNPJ deve ter 14 dígitos'))
                  }
                  return Promise.resolve()
                },
              },
            ]}
          >
            <Input
              placeholder="00.000.000/0000-00"
              maxLength={18}
              normalize={(value) => formatCNPJ(value)}
              disabled={!!editingEmpresa}
            />
          </Form.Item>

          <Form.Item
            name="nome"
            label="Nome"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="responsavel"
            label="Nome do Responsável"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Input placeholder="Nome completo do responsável" />
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
            name="whatsapp"
            label="WhatsApp"
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
            name="cep"
            label="CEP"
            rules={[
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve()
                  const cepLimpo = value.replace(/\D/g, '')
                  if (cepLimpo.length !== 8) {
                    return Promise.reject(new Error('CEP deve ter 8 dígitos'))
                  }
                  return Promise.resolve()
                },
              },
            ]}
          >
            <Input
              placeholder="00000-000"
              maxLength={9}
              normalize={(value) => formatCEP(value)}
            />
          </Form.Item>

          <Form.Item
            name="endereco"
            label="Endereço Completo"
          >
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item
            name="imagemFile"
            label="Logomarca"
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

      {/* Modal de Visualização */}
      <Modal
        title="Visualizar Empresa"
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false)
          setViewingEmpresa(null)
        }}
        footer={[
          <Button key="close" onClick={() => {
            setViewModalVisible(false)
            setViewingEmpresa(null)
          }}>
            Fechar
          </Button>
        ]}
        width={window.innerWidth < 768 ? '95%' : 700}
      >
        {viewingEmpresa && (
          <div style={{ padding: '16px 0' }}>
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              {viewingEmpresa.imagem && (
                <Image
                  src={viewingEmpresa.imagem}
                  alt="Fachada"
                  width={200}
                  height={200}
                  style={{ objectFit: 'cover', borderRadius: '8px' }}
                />
              )}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <strong>CNPJ:</strong>
                <div>{viewingEmpresa.cnpj ? formatCNPJ(viewingEmpresa.cnpj) : '-'}</div>
              </div>
              <div>
                <strong>Status:</strong>
                <div>
                  <Tag color={viewingEmpresa.status === 'aprovado' ? 'green' : viewingEmpresa.status === 'rejeitado' ? 'red' : 'orange'}>
                    {viewingEmpresa.status === 'aprovado' ? 'Aprovado' : viewingEmpresa.status === 'rejeitado' ? 'Rejeitado' : 'Pendente'}
                  </Tag>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <strong>Nome da Empresa:</strong>
              <div>{viewingEmpresa.nome || '-'}</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <strong>Responsável:</strong>
              <div>{viewingEmpresa.responsavel || '-'}</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <strong>Categoria:</strong>
              <div>{viewingEmpresa.categoria || '-'}</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <strong>Descrição:</strong>
              <div style={{ whiteSpace: 'pre-wrap' }}>{viewingEmpresa.descricao || '-'}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <strong>Telefone:</strong>
                <div>{viewingEmpresa.telefone ? formatPhone(viewingEmpresa.telefone) : '-'}</div>
              </div>
              <div>
                <strong>WhatsApp:</strong>
                <div>{viewingEmpresa.whatsapp ? formatPhone(viewingEmpresa.whatsapp) : '-'}</div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <strong>Email:</strong>
              <div>{viewingEmpresa.email || '-'}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <strong>CEP:</strong>
                <div>{viewingEmpresa.cep ? formatCEP(viewingEmpresa.cep) : '-'}</div>
              </div>
              <div>
                <strong>Endereço:</strong>
                <div>{viewingEmpresa.endereco || '-'}</div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <strong>Site:</strong>
              <div>
                {viewingEmpresa.site ? (
                  <a href={viewingEmpresa.site} target="_blank" rel="noopener noreferrer">
                    {viewingEmpresa.site}
                  </a>
                ) : '-'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <strong>Facebook:</strong>
                <div>
                  {viewingEmpresa.facebook ? (
                    <a href={viewingEmpresa.facebook} target="_blank" rel="noopener noreferrer">
                      Ver perfil
                    </a>
                  ) : '-'}
                </div>
              </div>
              <div>
                <strong>Instagram:</strong>
                <div>
                  {viewingEmpresa.instagram ? (
                    <a href={viewingEmpresa.instagram} target="_blank" rel="noopener noreferrer">
                      Ver perfil
                    </a>
                  ) : '-'}
                </div>
              </div>
              <div>
                <strong>LinkedIn:</strong>
                <div>
                  {viewingEmpresa.linkedin ? (
                    <a href={viewingEmpresa.linkedin} target="_blank" rel="noopener noreferrer">
                      Ver perfil
                    </a>
                  ) : '-'}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                <div><strong>Cadastrado em:</strong> {viewingEmpresa.createdAt ? new Date(viewingEmpresa.createdAt).toLocaleString('pt-BR') : '-'}</div>
                {viewingEmpresa.updatedAt && (
                  <div><strong>Atualizado em:</strong> {new Date(viewingEmpresa.updatedAt).toLocaleString('pt-BR')}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default EmpresasAdmin

