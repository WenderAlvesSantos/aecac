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
  Empty,
  Tooltip,
} from 'antd'
import ImgCrop from 'antd-img-crop'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  HolderOutlined,
  SearchOutlined,
  ClearOutlined,
} from '@ant-design/icons'
import {
  getDiretoria,
  createMembro,
  updateMembro,
  deleteMembro,
  updateOrdemDiretoria,
} from '../../lib/api'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { glassPanel, pageSubtitleLeft, pageTitle } from '../../components/public-site/publicUi'

function normalizeSearch(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

const FOTO_FILTER_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'com', label: 'Com foto' },
  { value: 'sem', label: 'Sem foto' },
]

// Componente de linha arrastável
const Row = (props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props['data-row-key'],
  })

  const style = {
    ...props.style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    cursor: 'move',
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  }

  return <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />
}

const DiretoriaAdmin = () => {
  const [diretoria, setDiretoria] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingMembro, setEditingMembro] = useState(null)
  const editingMembroRef = useRef(null)
  const [form] = Form.useForm()
  const [filtroNome, setFiltroNome] = useState('')
  const [filtroCargo, setFiltroCargo] = useState('all')
  const [filtroFoto, setFiltroFoto] = useState('all')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    })
  )

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

  const cargosDisponiveis = useMemo(
    () => [...new Set(diretoria.map((m) => m.cargo).filter(Boolean))].sort(),
    [diretoria]
  )

  const diretoriaFiltrada = useMemo(() => {
    const nomeQ = normalizeSearch(filtroNome)

    return diretoria.filter((membro) => {
      if (nomeQ && !normalizeSearch(membro.nome).includes(nomeQ)) return false
      if (filtroCargo !== 'all' && membro.cargo !== filtroCargo) return false
      const temFoto = Boolean(membro.foto && membro.foto.startsWith('data:image'))
      if (filtroFoto === 'com' && !temFoto) return false
      if (filtroFoto === 'sem' && temFoto) return false
      return true
    })
  }, [diretoria, filtroNome, filtroCargo, filtroFoto])

  const temFiltrosAtivos = filtroNome || filtroCargo !== 'all' || filtroFoto !== 'all'

  const limparFiltros = () => {
    setFiltroNome('')
    setFiltroCargo('all')
    setFiltroFoto('all')
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

  const onDragEnd = async ({ active, over }) => {
    if (temFiltrosAtivos) return
    if (active.id !== over?.id) {
      const activeIndex = diretoria.findIndex((i) => i._id === active.id)
      const overIndex = diretoria.findIndex((i) => i._id === over?.id)
      
      const newDiretoria = arrayMove(diretoria, activeIndex, overIndex)
      setDiretoria(newDiretoria)

      try {
        // Enviar apenas _id de cada membro para evitar 413 (payload com base64 é muito grande)
        await updateOrdemDiretoria(newDiretoria.map(({ _id }) => ({ _id })))
        message.success('Ordem atualizada com sucesso')
      } catch (error) {
        message.error('Erro ao atualizar ordem')
        // Reverter em caso de erro
        loadDiretoria()
      }
    }
  }

  const convertImageToBase64 = (file) => {
    // O antd-img-crop já retorna a imagem cropada exatamente como o usuário ajustou
    // Usar diretamente sem processamento adicional para preservar o crop exato
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
          // Nova imagem enviada - usar diretamente do crop sem processamento
          // O antd-img-crop já fez o crop exato, então apenas convertemos para base64
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
    ...(!temFiltrosAtivos
      ? [
          {
            key: 'sort',
            width: 50,
            render: () => (
              <HolderOutlined className="cursor-move text-gray-500" title="Arraste para reordenar" />
            ),
          },
        ]
      : []),
    {
      title: 'Foto',
      dataIndex: 'foto',
      key: 'foto',
      width: 80,
      render: (foto) => {
        if (foto && foto.startsWith('data:image')) {
          return (
            <Image
              src={foto}
              alt="Foto"
              width={48}
              height={48}
              className="rounded-lg object-cover"
              preview={false}
            />
          )
        }
        return <span className="text-xs text-gray-600">—</span>
      },
    },
    {
      title: 'Nome',
      dataIndex: 'nome',
      key: 'nome',
      ellipsis: true,
    },
    {
      title: 'Cargo',
      dataIndex: 'cargo',
      key: 'cargo',
      ellipsis: true,
    },
    {
      title: 'Ordem',
      key: 'ordem',
      width: 80,
      render: (_, record) => {
        const posicao = diretoria.findIndex((m) => m._id === record._id) + 1
        return <span className="text-sm text-gray-400">{posicao > 0 ? posicao : '—'}</span>
      },
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Editar membro">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              shape="circle"
            />
          </Tooltip>
          <Popconfirm
            title="Tem certeza que deseja excluir este membro?"
            onConfirm={() => handleDelete(record._id)}
            okText="Sim"
            cancelText="Não"
          >
            <Tooltip title="Excluir membro">
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
            Diretoria
          </h1>
          <p className={`${pageSubtitleLeft} !mx-0 !max-w-2xl !text-base`}>
            Gerencie os membros exibidos na página Sobre. Arraste as linhas para definir a ordem de exibição.
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size="large"
          className="!shrink-0 !h-11 !rounded-xl !border-0 !bg-gradient-to-r !from-[#1e4d7b] !to-[#5b9bd5] !px-5 !font-semibold hover:!brightness-110"
        >
          Novo membro
        </Button>
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs text-gray-500">Nome</label>
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
            <label className="mb-1.5 block text-xs text-gray-500">Cargo</label>
            <Select
              value={filtroCargo}
              onChange={setFiltroCargo}
              className="w-full"
              popupClassName="admin-managed-select-dropdown"
              options={[
                { value: 'all', label: 'Todos os cargos' },
                ...cargosDisponiveis.map((c) => ({ value: c, label: c })),
              ]}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-gray-500">Foto</label>
            <Select
              value={filtroFoto}
              onChange={setFiltroFoto}
              className="w-full"
              popupClassName="admin-managed-select-dropdown"
              options={FOTO_FILTER_OPTIONS}
            />
          </div>
        </div>

        <p className="mb-0 mt-4 text-xs text-gray-500">
          Mostrando <span className="text-gray-300">{diretoriaFiltrada.length}</span> de{' '}
          <span className="text-gray-300">{diretoria.length}</span> membros
          {temFiltrosAtivos && (
            <span className="text-amber-300/80"> · reordenação desativada enquanto houver filtros</span>
          )}
        </p>
      </div>

      <div className={`${glassPanel} overflow-hidden p-2 sm:p-4`}>
        <DndContext sensors={sensors} modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
          <SortableContext
            items={diretoriaFiltrada.map((i) => i._id)}
            strategy={verticalListSortingStrategy}
          >
            <Table
              components={
                temFiltrosAtivos
                  ? undefined
                  : {
                      body: { row: Row },
                    }
              }
              columns={columns}
              dataSource={diretoriaFiltrada}
              loading={loading}
              rowKey="_id"
              scroll={{ x: 'max-content' }}
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `${total} membro${total !== 1 ? 's' : ''}`,
                pageSizeOptions: ['10', '20', '50'],
                defaultPageSize: 10,
              }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      temFiltrosAtivos
                        ? 'Nenhum membro encontrado com os filtros aplicados'
                        : 'Nenhum membro cadastrado na diretoria'
                    }
                  >
                    {temFiltrosAtivos ? (
                      <Button onClick={limparFiltros} icon={<ClearOutlined />}>
                        Limpar filtros
                      </Button>
                    ) : (
                      <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Cadastrar membro
                      </Button>
                    )}
                  </Empty>
                ),
              }}
            />
          </SortableContext>
        </DndContext>
      </div>

      <Modal
        title={editingMembro ? 'Editar membro' : 'Novo membro'}
        open={modalVisible}
        rootClassName="admin-managed-modal"
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setEditingMembro(null)
          editingMembroRef.current = null
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
              <ImgCrop
                rotationSlider
                quality={1}
                aspect={1}
                shape="rect"
                zoomSlider
                showGrid
                modalTitle="Ajustar Foto (será exibida em formato circular)"
                modalOk="Confirmar"
                modalCancel="Cancelar"
                minZoom={1}
                maxZoom={3}
                fillColor="transparent"
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
              </ImgCrop>
              <div style={{ marginTop: 8, color: '#666', fontSize: '12px' }}>
                Apenas uma imagem. Formatos: JPG, PNG. Máximo recomendado: 1MB. Ajuste a foto no formato quadrado - ela será exibida em formato circular na página.
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

