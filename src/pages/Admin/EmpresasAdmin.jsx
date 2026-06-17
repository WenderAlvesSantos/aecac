import { useState, useEffect, useRef, useMemo } from 'react'
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
  Empty,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  SearchOutlined,
  ClearOutlined,
} from '@ant-design/icons'
import {
  getEmpresasPendentes,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
  aprovarEmpresa,
} from '../../lib/api'
import {
  instagramHandleForForm,
  instagramHandleToStoredUrl,
  normalizeInstagramInput,
} from '../../lib/instagram'
import { glassPanel, pageSubtitleLeft, pageTitle } from '../../components/public-site/publicUi'

const { TextArea } = Input

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os status' },
  { value: 'pendente', label: 'Aguardando análise' },
  { value: 'pre-cadastro', label: 'Cadastro de fundador' },
  { value: 'aprovado', label: 'Aprovados' },
  { value: 'rejeitado', label: 'Rejeitados' },
]

const STATUS_TAG = {
  'pre-cadastro': { color: 'blue', label: 'Fundador' },
  pendente: { color: 'orange', label: 'Pendente' },
  aprovado: { color: 'green', label: 'Aprovado' },
  rejeitado: { color: 'red', label: 'Rejeitado' },
}

function normalizeSearch(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

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
  const [filtroNome, setFiltroNome] = useState('')
  const [filtroCnpj, setFiltroCnpj] = useState('')
  const [filtroEmail, setFiltroEmail] = useState('')
  const [filtroResponsavel, setFiltroResponsavel] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('all')

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
      console.error('Erro ao carregar fundadores:', error)
      message.error('Erro ao carregar fundadores')
    } finally {
      setLoading(false)
    }
  }

  const categoriasDisponiveis = useMemo(
    () => [...new Set(empresas.map((e) => e.categoria).filter(Boolean))].sort(),
    [empresas]
  )

  const empresasFiltradas = useMemo(() => {
    const nomeQ = normalizeSearch(filtroNome)
    const cnpjQ = filtroCnpj.replace(/\D/g, '')
    const emailQ = normalizeSearch(filtroEmail)
    const respQ = normalizeSearch(filtroResponsavel)

    return empresas.filter((empresa) => {
      if (nomeQ && !normalizeSearch(empresa.nome).includes(nomeQ)) return false
      if (cnpjQ && !(empresa.cnpj || '').replace(/\D/g, '').includes(cnpjQ)) return false
      if (emailQ && !normalizeSearch(empresa.email).includes(emailQ)) return false
      if (respQ && !normalizeSearch(empresa.responsavel).includes(respQ)) return false
      if (filtroCategoria !== 'all' && empresa.categoria !== filtroCategoria) return false
      return true
    })
  }, [empresas, filtroNome, filtroCnpj, filtroEmail, filtroResponsavel, filtroCategoria])

  const resumoStatus = useMemo(() => {
    const base = { pendente: 0, aprovado: 0, rejeitado: 0, 'pre-cadastro': 0 }
    empresasFiltradas.forEach((e) => {
      const s = e.status || 'pendente'
      if (base[s] !== undefined) base[s] += 1
    })
    return base
  }, [empresasFiltradas])

  const temFiltrosAtivos =
    filtroNome ||
    filtroCnpj ||
    filtroEmail ||
    filtroResponsavel ||
    filtroCategoria !== 'all' ||
    filtroStatus !== 'all'

  const limparFiltros = () => {
    setFiltroNome('')
    setFiltroCnpj('')
    setFiltroEmail('')
    setFiltroResponsavel('')
    setFiltroCategoria('all')
    setFiltroStatus('all')
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
            if (empresaData.instagram !== undefined && empresaData.instagram !== null) {
              empresaData.instagram = instagramHandleForForm(empresaData.instagram)
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
      message.success('Fundador removido com sucesso')
      loadEmpresas()
    } catch (error) {
      message.error('Erro ao remover fundador')
    }
  }

  const handleAprovar = async (empresaId, acao) => {
    try {
      await aprovarEmpresa(empresaId, acao)
      message.success(`Cadastro ${acao === 'aprovar' ? 'aprovado' : 'rejeitado'} com sucesso`)
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

      formData.instagram = instagramHandleToStoredUrl(values.instagram)
      
      console.log('Dados finais a serem enviados:', {
        nome: formData.nome,
        categoria: formData.categoria,
        cnpj: formData.cnpj,
        hasImagem: !!formData.imagem,
        imagemLength: formData.imagem ? formData.imagem.length : 0,
        imagemPreview: formData.imagem ? formData.imagem.substring(0, 50) + '...' : null
      })

      if (editingEmpresa) {
        console.log('Atualizando cadastro de fundador...')
        await updateEmpresa(editingEmpresa._id, formData)
        message.success('Cadastro de fundador atualizado com sucesso')
      } else {
        console.log('Criando novo cadastro de fundador...')
        await createEmpresa(formData)
        message.success('Cadastro de fundador criado com sucesso')
      }

      setModalVisible(false)
      form.resetFields()
      loadEmpresas()
      console.log('=== FIM DO SUBMIT (SUCESSO) ===')
    } catch (error) {
      console.error('=== ERRO NO SUBMIT ===', error)
      console.error('Erro completo:', error.response || error)
      message.error('Erro ao salvar cadastro: ' + (error.response?.data?.error || error.message))
    }
  }

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'nome',
      key: 'nome',
      ellipsis: true,
    },
    {
      title: 'CNPJ',
      dataIndex: 'cnpj',
      key: 'cnpj',
      width: 160,
      render: (cnpj) => (cnpj ? formatCNPJ(cnpj) : '-'),
    },
    {
      title: 'Categoria',
      dataIndex: 'categoria',
      key: 'categoria',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const meta = STATUS_TAG[status] || { color: 'default', label: status || 'Pendente' }
        return <Tag color={meta.color}>{meta.label}</Tag>
      },
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 150,
      render: (_, record) => {
        const isPendente = record.status === 'pendente' || record.status === 'pre-cadastro' || !record.status
        return (
          <Space size="middle">
            {isPendente && (
              <>
                <Popconfirm
                  title="Confirmar aprovação deste cadastro?"
                  description="O fundador será aprovado e um e-mail será enviado automaticamente."
                  onConfirm={() => handleAprovar(record._id, 'aprovar')}
                  okText="Sim, aprovar"
                  cancelText="Cancelar"
                  okButtonProps={{ type: 'primary', danger: false }}
                >
                  <Tooltip title="Aprovar fundador">
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      style={{ background: '#52c41a', borderColor: '#52c41a' }}
                      shape="circle"
                    />
                  </Tooltip>
                </Popconfirm>
                <Popconfirm
                  title="Confirmar rejeição deste cadastro?"
                  description="O cadastro será rejeitado e um e-mail será enviado automaticamente."
                  onConfirm={() => handleAprovar(record._id, 'rejeitar')}
                  okText="Sim, rejeitar"
                  cancelText="Cancelar"
                  okButtonProps={{ type: 'primary', danger: true }}
                >
                  <Tooltip title="Rejeitar cadastro">
                    <Button
                      danger
                      icon={<CloseOutlined />}
                      shape="circle"
                    />
                  </Tooltip>
                </Popconfirm>
              </>
            )}
            <Tooltip title="Visualizar cadastro">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handleView(record)}
                shape="circle"
              />
            </Tooltip>
            <Popconfirm
              title="Tem certeza que deseja excluir este cadastro de fundador?"
              onConfirm={() => handleDelete(record._id)}
              okText="Sim"
              cancelText="Não"
            >
              <Tooltip title="Excluir cadastro">
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
    <div className="mx-auto max-w-7xl">
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={`${pageTitle} !mb-2 !text-left !text-2xl sm:!text-3xl lg:!text-4xl`}>
            Fundadores
          </h1>
          <p className={`${pageSubtitleLeft} !mx-0 !max-w-2xl !text-base`}>
            Gerencie cadastros, aprove ou rejeite fundadores e acompanhe o status de cada empresa.
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size="large"
          className="!shrink-0 !h-11 !rounded-xl !border-0 !bg-gradient-to-r !from-[#1e4d7b] !to-[#5b9bd5] !px-5 !font-semibold hover:!brightness-110"
        >
          Novo fundador
        </Button>
      </div>

      {/* Resumo */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Exibidos', value: empresasFiltradas.length, color: 'text-white' },
          { label: 'Aguardando', value: resumoStatus.pendente + resumoStatus['pre-cadastro'], color: 'text-amber-300' },
          { label: 'Aprovados', value: resumoStatus.aprovado, color: 'text-[#6cb541]' },
          { label: 'Rejeitados', value: resumoStatus.rejeitado, color: 'text-red-400' },
        ].map((item) => (
          <div key={item.label} className={`${glassPanel} px-4 py-3`}>
            <p className="m-0 text-xs text-gray-500">{item.label}</p>
            <p className={`m-0 mt-1 text-2xl font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className={`${glassPanel} mb-6 p-5 sm:p-6`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <SearchOutlined className="text-[#5b9bd5]" />
            Filtros
          </div>
          {temFiltrosAtivos && (
            <Button
              type="text"
              icon={<ClearOutlined />}
              onClick={limparFiltros}
              className="!text-gray-400 hover:!text-white"
              size="small"
            >
              Limpar filtros
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="xl:col-span-2">
            <label className="mb-1.5 block text-xs text-gray-500">Nome da empresa</label>
            <Input
              placeholder="Buscar por nome..."
              prefix={<SearchOutlined className="text-gray-600" />}
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
              allowClear
              className="!rounded-xl"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-gray-500">CNPJ</label>
            <Input
              placeholder="00.000.000/0000-00"
              value={filtroCnpj}
              onChange={(e) => setFiltroCnpj(formatCNPJ(e.target.value))}
              allowClear
              className="!rounded-xl"
              maxLength={18}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-gray-500">E-mail</label>
            <Input
              placeholder="contato@empresa.com"
              value={filtroEmail}
              onChange={(e) => setFiltroEmail(e.target.value)}
              allowClear
              className="!rounded-xl"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-gray-500">Responsável</label>
            <Input
              placeholder="Nome do responsável"
              value={filtroResponsavel}
              onChange={(e) => setFiltroResponsavel(e.target.value)}
              allowClear
              className="!rounded-xl"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-gray-500">Categoria</label>
            <Select
              value={filtroCategoria}
              onChange={setFiltroCategoria}
              className="w-full"
              popupClassName="admin-managed-select-dropdown"
              options={[
                { value: 'all', label: 'Todas' },
                ...categoriasDisponiveis.map((c) => ({ value: c, label: c })),
              ]}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-gray-500">Status</label>
            <Select
              value={filtroStatus}
              onChange={setFiltroStatus}
              className="w-full"
              popupClassName="admin-managed-select-dropdown"
              options={STATUS_OPTIONS}
            />
          </div>
        </div>

        <p className="mb-0 mt-4 text-xs text-gray-500">
          Mostrando <span className="text-gray-300">{empresasFiltradas.length}</span> de{' '}
          <span className="text-gray-300">{empresas.length}</span> cadastros
          {filtroStatus !== 'all' && (
            <>
              {' '}
              · status:{' '}
              <span className="text-gray-300">
                {STATUS_OPTIONS.find((o) => o.value === filtroStatus)?.label}
              </span>
            </>
          )}
        </p>
      </div>

      {/* Tabela */}
      <div className={`${glassPanel} overflow-hidden p-2 sm:p-4`}>
        <Table
          columns={columns}
          dataSource={empresasFiltradas}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 'max-content' }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `${total} fundador${total !== 1 ? 'es' : ''}`,
            pageSizeOptions: ['10', '20', '50'],
            defaultPageSize: 10,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  temFiltrosAtivos
                    ? 'Nenhum fundador encontrado com os filtros aplicados'
                    : 'Nenhum cadastro de fundador ainda'
                }
              >
                {temFiltrosAtivos ? (
                  <Button onClick={limparFiltros} icon={<ClearOutlined />}>
                    Limpar filtros
                  </Button>
                ) : (
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Cadastrar fundador
                  </Button>
                )}
              </Empty>
            ),
          }}
        />
      </div>

      <Modal
        title={editingEmpresa ? 'Editar cadastro de fundador' : 'Novo cadastro de fundador'}
        open={modalVisible}
        rootClassName="admin-managed-modal"
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
            label="Nome da empresa (fundador)"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Input placeholder="Razão social ou nome fantasia" />
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
            <Select popupClassName="admin-managed-select-dropdown">
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
            label="Descrição (negócio do fundador)"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <TextArea rows={3} placeholder="Atividade e diferenciais do fundador" />
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
            normalize={(v) => normalizeInstagramInput(v)}
            rules={[{ max: 50, message: 'No máximo 50 caracteres' }]}
          >
            <Input prefix="@" placeholder="usuario" allowClear />
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
        title="Visualizar cadastro de fundador"
        open={viewModalVisible}
        rootClassName="admin-managed-modal"
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
          <div className="admin-modal-detail-grid py-4">
            <div className="mb-6 text-center">
              {viewingEmpresa.imagem && (
                <Image
                  src={viewingEmpresa.imagem}
                  alt="Logomarca"
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
                  <Tag color={viewingEmpresa.status === 'aprovado' ? 'green' : viewingEmpresa.status === 'rejeitado' ? 'red' : viewingEmpresa.status === 'pre-cadastro' ? 'blue' : 'orange'}>
                    {viewingEmpresa.status === 'aprovado' ? 'Aprovado' : viewingEmpresa.status === 'rejeitado' ? 'Rejeitado' : viewingEmpresa.status === 'pre-cadastro' ? 'Fundador' : 'Pendente'}
                  </Tag>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <strong>Nome da empresa (fundador):</strong>
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

            <div className="admin-modal-detail-footer mt-6 pt-4 text-xs">
                <div><strong>Cadastrado em:</strong> {viewingEmpresa.createdAt ? new Date(viewingEmpresa.createdAt).toLocaleString('pt-BR') : '-'}</div>
                {viewingEmpresa.updatedAt && (
                  <div><strong>Atualizado em:</strong> {new Date(viewingEmpresa.updatedAt).toLocaleString('pt-BR')}</div>
                )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default EmpresasAdmin

