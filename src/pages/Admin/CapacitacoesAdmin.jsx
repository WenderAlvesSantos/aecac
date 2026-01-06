import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Space,
  Popconfirm,
  Upload,
  Image,
  Select,
  DatePicker,
  Tag,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons'
import {
  getCapacitacoes,
  createCapacitacao,
  updateCapacitacao,
  deleteCapacitacao,
  createNotificacao,
} from '../../lib/api'
import dayjs from 'dayjs'

const { TextArea } = Input

const CapacitacoesAdmin = () => {
  const [capacitacoes, setCapacitacoes] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCapacitacao, setEditingCapacitacao] = useState(null)
  const [imagemRemovida, setImagemRemovida] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadCapacitacoes()
  }, [])

  const loadCapacitacoes = async () => {
    setLoading(true)
    try {
      const response = await getCapacitacoes()
      setCapacitacoes(response.data)
    } catch (error) {
      message.error('Erro ao carregar capacitações')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingCapacitacao(null)
    setImagemRemovida(false)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (capacitacao) => {
    setEditingCapacitacao(capacitacao)
    setImagemRemovida(false)
    form.setFieldsValue({
      ...capacitacao,
      data: capacitacao.data ? dayjs(capacitacao.data) : null,
    })
    setModalVisible(true)
  }

  const handleRemoverImagem = () => {
    setImagemRemovida(true)
    form.setFieldValue('imagemFile', [])
  }

  const handleDelete = async (id) => {
    try {
      await deleteCapacitacao(id)
      message.success('Capacitação deletada com sucesso')
      loadCapacitacoes()
    } catch (error) {
      message.error('Erro ao deletar capacitação')
    }
  }

  const handleSubmit = async (values) => {
    try {
      const formData = {
        ...values,
        data: values.data ? values.data.toISOString() : null,
      }

      // Processar imagem se houver
      if (values.imagemFile && values.imagemFile.length > 0) {
        const file = values.imagemFile[0]
        if (file.originFileObj) {
          formData.imagem = await convertImageToBase64(file.originFileObj)
        } else if (file.url || file.thumbUrl) {
          formData.imagem = file.url || file.thumbUrl
        }
      } else if (editingCapacitacao && editingCapacitacao.imagem && !imagemRemovida) {
        formData.imagem = editingCapacitacao.imagem
      }

      delete formData.imagemFile

      if (editingCapacitacao) {
        await updateCapacitacao(editingCapacitacao._id, formData)
        message.success('Capacitação atualizada com sucesso')
      } else {
        await createCapacitacao(formData)
        message.success('Capacitação criada com sucesso')
        
        // Criar notificação para todos os associados
        try {
          await createNotificacao({
            tipo: 'capacitacao',
            titulo: 'Nova Capacitação Disponível!',
            mensagem: `Uma nova capacitação foi adicionada: ${formData.titulo}. Data: ${dayjs(formData.data).format('DD/MM/YYYY HH:mm')}`,
            link: '/capacitacoes',
          })
        } catch (error) {
          console.error('Erro ao criar notificação:', error)
          // Não falhar o cadastro se a notificação falhar
        }
      }

      setModalVisible(false)
      form.resetFields()
      setImagemRemovida(false)
      loadCapacitacoes()
    } catch (error) {
      message.error('Erro ao salvar capacitação: ' + (error.response?.data?.error || error.message))
    }
  }

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const columns = [
    {
      title: 'Imagem',
      dataIndex: 'imagem',
      key: 'imagem',
      width: 100,
      render: (imagem) =>
        imagem ? (
          <Image src={imagem} alt="Capacitação" width={60} height={60} style={{ objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 60, height: 60, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Sem imagem
          </div>
        ),
    },
    {
      title: 'Título',
      dataIndex: 'titulo',
      key: 'titulo',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      render: (tipo) => <Tag color="blue">{tipo}</Tag>,
    },
    {
      title: 'Data',
      dataIndex: 'data',
      key: 'data',
      render: (data) => data ? dayjs(data).format('DD/MM/YYYY HH:mm') : '-',
    },
    {
      title: 'Local',
      dataIndex: 'local',
      key: 'local',
      render: (local) => local || '-',
    },
    {
      title: 'Vagas',
      key: 'vagas',
      render: (_, record) => {
        const vagasDisponiveis = record.vagas 
          ? `${record.vagas - (record.inscritos?.length || 0)}/${record.vagas}`
          : 'Ilimitadas'
        return (
          <span>
            <UserOutlined /> {vagasDisponiveis}
          </span>
        )
      },
    },
    {
      title: 'Valor',
      dataIndex: 'valor',
      key: 'valor',
      render: (valor) => valor ? `R$ ${valor}` : 'Gratuito',
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
            title="Tem certeza que deseja deletar esta capacitação?"
            onConfirm={() => handleDelete(record._id)}
            okText="Sim"
            cancelText="Não"
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
        <h2>Gerenciar Capacitações</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Nova Capacitação
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={capacitacoes}
        loading={loading}
        rowKey="_id"
        scroll={{ x: 'max-content' }}
      />

      <Modal
        title={editingCapacitacao ? 'Editar Capacitação' : 'Nova Capacitação'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setEditingCapacitacao(null)
        }}
        footer={null}
        width={window.innerWidth < 768 ? '95%' : 700}
        destroyOnHidden={true}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="titulo"
            label="Título"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="descricao"
            label="Descrição"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="tipo"
            label="Tipo"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Select>
              <Select.Option value="palestra">Palestra</Select.Option>
              <Select.Option value="curso">Curso</Select.Option>
              <Select.Option value="workshop">Workshop</Select.Option>
              <Select.Option value="treinamento">Treinamento</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="data"
            label="Data e Hora"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="local"
            label="Local"
          >
            <Input placeholder="Local do evento" />
          </Form.Item>

          <Form.Item
            name="link"
            label="Link"
          >
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item
            name="vagas"
            label="Número de Vagas"
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Deixe vazio para ilimitadas" />
          </Form.Item>

          <Form.Item
            name="valor"
            label="Valor (R$)"
          >
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="Deixe vazio para gratuito" />
          </Form.Item>

          <Form.Item
            name="imagemFile"
            label="Imagem"
            rules={[
              {
                required: true,
                validator: (_, value) => {
                  const temImagemExistente = editingCapacitacao && editingCapacitacao.imagem && !imagemRemovida
                  const temArquivo = value && value.length > 0
                  if (temImagemExistente || temArquivo) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Imagem é obrigatória'))
                }
              }
            ]}
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
            {(!editingCapacitacao || !editingCapacitacao.imagem || imagemRemovida) ? (
              <Upload
                listType="picture-card"
                maxCount={1}
                beforeUpload={() => false}
              >
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            ) : null}
          </Form.Item>

          {editingCapacitacao && editingCapacitacao.imagem && !imagemRemovida && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '8px' }}>Imagem atual:</div>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Image src={editingCapacitacao.imagem} width={200} />
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={handleRemoverImagem}
                  style={{ position: 'absolute', top: '8px', right: '8px' }}
                >
                  Remover
                </Button>
              </div>
            </div>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCapacitacao ? 'Atualizar' : 'Criar'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false)
                form.resetFields()
                setEditingCapacitacao(null)
                setImagemRemovida(false)
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

export default CapacitacoesAdmin

