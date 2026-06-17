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
  Select,
  Upload,
  Tag,
  Drawer,
  Tabs,
  DatePicker,
  Empty,
  Tooltip,
} from 'antd'
import dayjs from 'dayjs'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  EyeOutlined,
  DownloadOutlined,
  FolderOutlined,
  SearchOutlined,
  ClearOutlined,
} from '@ant-design/icons'
import {
  getDocumentos,
  createDocumento,
  updateDocumento,
  deleteDocumento,
  getCategoriasDocumentos,
  createCategoriaDocumento,
  deleteCategoriaDocumento,
} from '../../lib/api'
import { glassPanel, pageSubtitleLeft, pageTitle } from '../../components/public-site/publicUi'

const { TextArea } = Input
const { TabPane } = Tabs

const DocumentosAdmin = () => {
  const [documentos, setDocumentos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [categoriasModalVisible, setCategoriasModalVisible] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewDocumento, setPreviewDocumento] = useState(null)
  const [editingDocumento, setEditingDocumento] = useState(null)
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroNome, setFiltroNome] = useState('')
  const [filtroCriadoPor, setFiltroCriadoPor] = useState('')
  const [filtroDataInicio, setFiltroDataInicio] = useState(null)
  const [filtroDataFim, setFiltroDataFim] = useState(null)
  const [form] = Form.useForm()
  const [categoriaForm] = Form.useForm()
  const editingDocumentoRef = useRef(null)

  useEffect(() => {
    loadDocumentos()
    loadCategorias()
  }, [])

  useEffect(() => {
    loadDocumentos()
  }, [filtroCategoria, filtroNome, filtroCriadoPor, filtroDataInicio, filtroDataFim])

  useEffect(() => {
    if (modalVisible && editingDocumentoRef.current) {
      const documento = editingDocumentoRef.current

      let arquivoFileList = []
      if (documento.arquivo) {
        arquivoFileList = [{
          uid: '-1',
          name: documento.nome || 'documento',
          status: 'done',
          url: documento.arquivo,
          originFileObj: null,
        }]
      }

      requestAnimationFrame(() => {
        setTimeout(() => {
          if (form && modalVisible) {
            form.setFieldsValue({
              nome: documento.nome,
              categoria: documento.categoria,
              arquivoFile: arquivoFileList,
            })
          }
        }, 100)
      })
    } else if (!modalVisible) {
      editingDocumentoRef.current = null
    }
  }, [modalVisible, form])

  const loadDocumentos = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filtroCategoria !== 'todas') {
        params.categoria = filtroCategoria
      }
      if (filtroNome) {
        params.nome = filtroNome
      }
      if (filtroCriadoPor) {
        params.criadoPor = filtroCriadoPor
      }
      if (filtroDataInicio) {
        params.dataInicio = filtroDataInicio.format('YYYY-MM-DD')
      }
      if (filtroDataFim) {
        params.dataFim = filtroDataFim.format('YYYY-MM-DD')
      }

      const response = await getDocumentos(params.categoria || null, params)
      setDocumentos(response.data)
    } catch (error) {
      message.error('Erro ao carregar documentos')
    } finally {
      setLoading(false)
    }
  }

  const loadCategorias = async () => {
    try {
      const response = await getCategoriasDocumentos()
      setCategorias(response.data)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleCreate = () => {
    setEditingDocumento(null)
    editingDocumentoRef.current = null
    form.resetFields()
    form.setFieldsValue({ arquivoFile: [] })
    setModalVisible(true)
  }

  const handleEdit = (documento) => {
    setEditingDocumento(documento)
    editingDocumentoRef.current = documento
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteDocumento(id)
      message.success('Documento deletado com sucesso')
      loadDocumentos()
    } catch (error) {
      message.error('Erro ao deletar documento')
    }
  }

  const handleSubmit = async (values) => {
    try {
      const formData = { ...values }

      // Processar arquivo se houver upload
      if (values.arquivoFile && values.arquivoFile.length > 0) {
        const file = values.arquivoFile[0]

        if (file.originFileObj) {
          // Novo arquivo enviado - converter para base64
          try {
            const base64File = await convertFileToBase64(file.originFileObj)
            formData.arquivo = base64File
            formData.tipoArquivo = file.originFileObj.type
            formData.tamanhoArquivo = file.originFileObj.size
          } catch (error) {
            message.error('Erro ao processar o arquivo. Tente novamente.')
            return
          }
        } else if (file.url) {
          // Arquivo existente (não alterado)
          if (file.url.startsWith('data:')) {
            formData.arquivo = file.url
            // Manter tipo e tamanho do documento existente
            if (editingDocumento) {
              formData.tipoArquivo = editingDocumento.tipoArquivo
              formData.tamanhoArquivo = editingDocumento.tamanhoArquivo
            }
          }
        }
      } else {
        // Sem arquivo no formulário
        if (editingDocumento && editingDocumento.arquivo) {
          // Se estava editando e tinha arquivo, mas foi removido
          formData.arquivo = null
        } else {
          formData.arquivo = null
        }
      }

      delete formData.arquivoFile

      if (editingDocumento) {
        await updateDocumento(editingDocumento._id, formData)
        message.success('Documento atualizado com sucesso')
      } else {
        await createDocumento(formData)
        message.success('Documento criado com sucesso')
      }

      setModalVisible(false)
      form.resetFields()
      loadDocumentos()
    } catch (error) {
      console.error('Erro ao salvar documento:', error)
      message.error('Erro ao salvar documento: ' + (error.response?.data?.error || error.message))
    }
  }

  const handlePreview = (documento) => {
    if (documento.tipoArquivo === 'application/pdf') {
      setPreviewDocumento(documento)
      setPreviewVisible(true)
    } else {
      message.info('Visualização disponível apenas para PDFs. Use o botão de download para outros formatos.')
    }
  }

  const handleDownload = (documento) => {
    try {
      const link = document.createElement('a')
      link.href = documento.arquivo
      link.download = documento.nome || 'documento'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      message.success('Download iniciado')
    } catch (error) {
      message.error('Erro ao fazer download do arquivo')
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (tipoArquivo) => {
    if (tipoArquivo?.includes('pdf')) return '📄'
    if (tipoArquivo?.includes('word') || tipoArquivo?.includes('document')) return '📝'
    if (tipoArquivo?.includes('excel') || tipoArquivo?.includes('spreadsheet')) return '📊'
    return '📎'
  }

  const temFiltrosAtivos =
    filtroNome ||
    filtroCriadoPor ||
    filtroDataInicio ||
    filtroDataFim ||
    filtroCategoria !== 'todas'

  const limparFiltros = () => {
    setFiltroCategoria('todas')
    setFiltroNome('')
    setFiltroCriadoPor('')
    setFiltroDataInicio(null)
    setFiltroDataFim(null)
  }

  // Gerenciamento de Categorias
  const handleCreateCategoria = () => {
    categoriaForm.resetFields()
    setCategoriasModalVisible(true)
  }

  const handleSubmitCategoria = async (values) => {
    try {
      await createCategoriaDocumento(values)
      message.success('Categoria criada com sucesso')
      setCategoriasModalVisible(false)
      categoriaForm.resetFields()
      loadCategorias()
    } catch (error) {
      message.error('Erro ao criar categoria: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleDeleteCategoria = async (categoria) => {
    try {
      const categoriaObj = typeof categoria === 'string' 
        ? categorias.find(c => (typeof c === 'string' ? c : c.nome) === categoria)
        : categoria

      if (!categoriaObj || !categoriaObj._id) {
        message.warning('Esta categoria não pode ser deletada pois é usada por documentos.')
        return
      }

      await deleteCategoriaDocumento(categoriaObj._id)
      message.success('Categoria deletada com sucesso')
      loadCategorias()
    } catch (error) {
      message.error('Erro ao deletar categoria: ' + (error.response?.data?.error || error.message))
    }
  }

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'nome',
      key: 'nome',
      ellipsis: true,
      render: (text, record) => (
        <Space>
          <span>{getFileIcon(record.tipoArquivo)}</span>
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Categoria',
      dataIndex: 'categoria',
      key: 'categoria',
      render: (categoria) => <Tag color="blue">{categoria}</Tag>,
    },
    {
      title: 'Tipo',
      dataIndex: 'tipoArquivo',
      key: 'tipoArquivo',
      responsive: ['md'],
      render: (tipo) => {
        if (tipo?.includes('pdf')) return <Tag color="red">PDF</Tag>
        if (tipo?.includes('word') || tipo?.includes('document')) return <Tag color="blue">Word</Tag>
        if (tipo?.includes('excel') || tipo?.includes('spreadsheet')) return <Tag color="green">Excel</Tag>
        return <Tag>{tipo || 'N/A'}</Tag>
      },
    },
    {
      title: 'Tamanho',
      dataIndex: 'tamanhoArquivo',
      key: 'tamanhoArquivo',
      responsive: ['lg'],
      render: (tamanho) => formatFileSize(tamanho),
    },
    {
      title: 'Criado por',
      dataIndex: 'criadoPor',
      key: 'criadoPor',
      ellipsis: true,
      render: (criadoPor) => criadoPor?.nome || '—',
    },
    {
      title: 'Data',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (date) => (date ? new Date(date).toLocaleDateString('pt-BR') : '—'),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space size="middle">
          {record.tipoArquivo?.includes('pdf') && (
            <Tooltip title="Visualizar PDF">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handlePreview(record)}
                shape="circle"
              />
            </Tooltip>
          )}
          <Tooltip title="Download">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
              shape="circle"
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              shape="circle"
            />
          </Tooltip>
          <Popconfirm
            title="Tem certeza que deseja excluir este documento?"
            onConfirm={() => handleDelete(record._id)}
            okText="Sim"
            cancelText="Não"
          >
            <Tooltip title="Excluir">
              <Button type="text" danger icon={<DeleteOutlined />} shape="circle" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={`${pageTitle} !mb-2 !text-left !text-2xl sm:!text-3xl lg:!text-4xl`}>
            Documentos
          </h1>
          <p className={`${pageSubtitleLeft} !mx-0 !max-w-2xl !text-base`}>
            Gerencie atas, arquivos e categorias. Visualize PDFs ou faça download dos documentos.
          </p>
        </div>
        <Space wrap className="!shrink-0">
          <Button
            icon={<FolderOutlined />}
            onClick={handleCreateCategoria}
            className="!h-11 !rounded-xl !border-white/15 !bg-white/5 !text-gray-200 hover:!border-white/25 hover:!text-white"
          >
            Categorias
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            size="large"
            className="!h-11 !rounded-xl !border-0 !bg-gradient-to-r !from-[#1e4d7b] !to-[#5b9bd5] !px-5 !font-semibold hover:!brightness-110"
          >
            Novo documento
          </Button>
        </Space>
      </div>

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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <label className="mb-1.5 block text-xs text-gray-500">Nome do documento</label>
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
            <label className="mb-1.5 block text-xs text-gray-500">Criado por</label>
            <Input
              placeholder="Buscar por usuário..."
              value={filtroCriadoPor}
              onChange={(e) => setFiltroCriadoPor(e.target.value)}
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
                { value: 'todas', label: 'Todas as categorias' },
                ...categorias.map((cat) => {
                  const nome = typeof cat === 'string' ? cat : cat.nome
                  return { value: nome, label: nome }
                }),
              ]}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-gray-500">Data início</label>
            <DatePicker
              placeholder="Selecione"
              value={filtroDataInicio}
              onChange={setFiltroDataInicio}
              format="DD/MM/YYYY"
              className="w-full"
              popupClassName="admin-managed-picker-dropdown"
              allowClear
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-gray-500">Data fim</label>
            <DatePicker
              placeholder="Selecione"
              value={filtroDataFim}
              onChange={setFiltroDataFim}
              format="DD/MM/YYYY"
              className="w-full"
              popupClassName="admin-managed-picker-dropdown"
              allowClear
            />
          </div>
        </div>

        <p className="mb-0 mt-4 text-xs text-gray-500">
          {loading ? 'Carregando...' : (
            <>
              <span className="text-gray-300">{documentos.length}</span> documento
              {documentos.length !== 1 ? 's' : ''} encontrado{documentos.length !== 1 ? 's' : ''}
            </>
          )}
        </p>
      </div>

      <div className={`${glassPanel} overflow-hidden p-2 sm:p-4`}>
        <Table
          columns={columns}
          dataSource={documentos}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `${total} documento${total !== 1 ? 's' : ''}`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  temFiltrosAtivos
                    ? 'Nenhum documento encontrado com os filtros aplicados'
                    : 'Nenhum documento cadastrado ainda'
                }
              >
                {temFiltrosAtivos ? (
                  <Button onClick={limparFiltros} icon={<ClearOutlined />}>
                    Limpar filtros
                  </Button>
                ) : (
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Cadastrar documento
                  </Button>
                )}
              </Empty>
            ),
          }}
        />
      </div>

      {/* Modal de Documento */}
      <Modal
        title={editingDocumento ? 'Editar documento' : 'Novo documento'}
        open={modalVisible}
        rootClassName="admin-managed-modal"
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setEditingDocumento(null)
          editingDocumentoRef.current = null
        }}
        footer={null}
        width={window.innerWidth < 768 ? '95%' : 600}
        destroyOnClose={true}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="nome"
            label="Nome do Documento"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Input placeholder="Ex: Ata de Reunião - Janeiro 2024" />
          </Form.Item>

          <Form.Item
            name="categoria"
            label="Categoria"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Select
              placeholder="Selecione ou digite uma categoria"
              showSearch
              popupClassName="admin-managed-select-dropdown"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={categorias.map((cat) => {
                const nome = typeof cat === 'string' ? cat : cat.nome
                return { value: nome, label: nome }
              })}
            />
          </Form.Item>

          <Form.Item
            name="arquivoFile"
            label="Arquivo"
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
            rules={[
              {
                validator: (_, value) => {
                  if (!editingDocumento && (!value || value.length === 0)) {
                    return Promise.reject(new Error('Arquivo é obrigatório'))
                  }
                  return Promise.resolve()
                },
              },
            ]}
          >
            <Upload
              maxCount={1}
              multiple={false}
              beforeUpload={(file) => {
                const tiposPermitidos = [
                  'application/pdf',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  'application/vnd.ms-excel',
                ]

                if (!tiposPermitidos.includes(file.type)) {
                  message.error('Apenas arquivos PDF, Word ou Excel são permitidos!')
                  return Upload.LIST_IGNORE
                }

                const isLt10M = file.size / 1024 / 1024 < 10
                if (!isLt10M) {
                  message.error('O arquivo deve ser menor que 10MB!')
                  return Upload.LIST_IGNORE
                }

                return false // Não fazer upload automático
              }}
              onChange={(info) => {
                let fileList = [...info.fileList]
                if (fileList.length > 1) {
                  fileList = [fileList[fileList.length - 1]]
                  message.warning('Apenas um arquivo é permitido. O último arquivo selecionado será mantido.')
                }
                form.setFieldValue('arquivoFile', fileList)
              }}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
            >
              <Button icon={<UploadOutlined />}>Selecionar Arquivo</Button>
            </Upload>
            <div style={{ marginTop: 8, color: '#666', fontSize: '12px' }}>
              Formatos permitidos: PDF, Word (.doc, .docx), Excel (.xls, .xlsx). Máximo: 10MB.
            </div>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Salvar
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false)
                  form.resetFields()
                  setEditingDocumento(null)
                  editingDocumentoRef.current = null
                }}
              >
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Categorias */}
      <Modal
        title="Gerenciar categorias"
        open={categoriasModalVisible}
        rootClassName="admin-managed-modal"
        onCancel={() => {
          setCategoriasModalVisible(false)
          categoriaForm.resetFields()
        }}
        footer={null}
        width={window.innerWidth < 768 ? '95%' : 600}
      >
        <Tabs defaultActiveKey="list">
          <TabPane tab="Listar" key="list">
            <div style={{ marginBottom: '16px' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                categoriaForm.resetFields()
                // Mudar para aba de criar
              }}>
                Nova Categoria
              </Button>
            </div>
            <Table
              dataSource={categorias.map((cat, index) => {
                const nome = typeof cat === 'string' ? cat : cat.nome
                const _id = typeof cat === 'string' ? null : cat._id
                const custom = typeof cat === 'string' ? false : cat.custom
                return { key: index, nome, _id, custom }
              })}
              columns={[
                {
                  title: 'Nome',
                  dataIndex: 'nome',
                  key: 'nome',
                },
                {
                  title: 'Tipo',
                  dataIndex: 'custom',
                  key: 'custom',
                  render: (custom) => custom ? <Tag color="green">Customizada</Tag> : <Tag>Do Documento</Tag>,
                },
                {
                  title: 'Ações',
                  key: 'actions',
                  width: 80,
                  render: (_, record) => (
                    record.custom && record._id ? (
                      <Popconfirm
                        title="Tem certeza que deseja excluir esta categoria?"
                        onConfirm={() => handleDeleteCategoria(record)}
                        okText="Sim"
                        cancelText="Não"
                      >
                        <Tooltip title="Excluir">
                          <Button type="text" danger icon={<DeleteOutlined />} shape="circle" />
                        </Tooltip>
                      </Popconfirm>
                    ) : (
                      <span className="text-xs text-gray-500">—</span>
                    )
                  ),
                },
              ]}
              pagination={false}
            />
          </TabPane>
          <TabPane tab="Criar Nova" key="create">
            <Form
              form={categoriaForm}
              layout="vertical"
              onFinish={handleSubmitCategoria}
            >
              <Form.Item
                name="nome"
                label="Nome da Categoria"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <Input placeholder="Ex: Atas, Relatórios, Contratos" />
              </Form.Item>

              <Form.Item
                name="descricao"
                label="Descrição (opcional)"
              >
                <TextArea rows={3} placeholder="Descrição da categoria" />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    Criar Categoria
                  </Button>
                  <Button
                    onClick={() => {
                      categoriaForm.resetFields()
                    }}
                  >
                    Limpar
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Modal>

      {/* Drawer para Preview de PDF */}
      <Drawer
        title={previewDocumento?.nome}
        placement="right"
        onClose={() => {
          setPreviewVisible(false)
          setPreviewDocumento(null)
        }}
        open={previewVisible}
        width={window.innerWidth < 768 ? '100%' : '80%'}
        styles={{
          header: { background: '#18181b', borderBottom: '1px solid rgba(255,255,255,0.1)' },
          body: { background: '#0a0a0a', padding: 0 },
        }}
        className="admin-managed-drawer"
      >
        {previewDocumento && (
          <iframe
            src={previewDocumento.arquivo}
            style={{
              width: '100%',
              height: 'calc(100vh - 100px)',
              border: 'none',
            }}
            title={previewDocumento.nome}
          />
        )}
      </Drawer>
    </div>
  )
}

export default DocumentosAdmin

