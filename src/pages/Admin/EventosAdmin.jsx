import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Select,
  message,
  Space,
  Popconfirm,
  Upload,
  Image,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  getEventosAdmin,
  createEvento,
  updateEvento,
  deleteEvento,
} from '../../lib/api'

const { TextArea } = Input

const EventosAdmin = () => {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingEvento, setEditingEvento] = useState(null)
  const [imagemRemovida, setImagemRemovida] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadEventos()
  }, [])

  const loadEventos = async () => {
    setLoading(true)
    try {
      const response = await getEventosAdmin()
      setEventos(response.data)
    } catch (error) {
      message.error('Erro ao carregar eventos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingEvento(null)
    setImagemRemovida(false)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (evento) => {
    setEditingEvento(evento)
    setImagemRemovida(false)
    form.setFieldsValue({
      ...evento,
      data: evento.data ? dayjs(evento.data) : null,
    })
    setModalVisible(true)
  }

  const handleRemoverImagem = () => {
    setImagemRemovida(true)
    form.setFieldValue('imagemFile', [])
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

  const handleDelete = async (id) => {
    try {
      await deleteEvento(id)
      message.success('Evento deletado com sucesso')
      loadEventos()
    } catch (error) {
      message.error('Erro ao deletar evento')
    }
  }

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        data: values.data.format('YYYY-MM-DD'),
      }

      // Processar imagem se houver
      if (values.imagemFile && values.imagemFile.length > 0) {
        const file = values.imagemFile[0]
        if (file.originFileObj) {
          data.imagem = await convertImageToBase64(file.originFileObj)
        } else if (file.url || file.thumbUrl) {
          data.imagem = file.url || file.thumbUrl
        }
      } else if (editingEvento && editingEvento.imagem && !imagemRemovida) {
        data.imagem = editingEvento.imagem
      }

      delete data.imagemFile

      if (editingEvento) {
        await updateEvento(editingEvento._id, data)
        message.success('Evento atualizado com sucesso')
      } else {
        await createEvento(data)
        message.success('Evento criado com sucesso')
      }

      setModalVisible(false)
      form.resetFields()
      setImagemRemovida(false)
      loadEventos()
    } catch (error) {
      message.error('Erro ao salvar evento')
    }
  }

  const columns = [
    {
      title: 'Título',
      dataIndex: 'titulo',
      key: 'titulo',
    },
    {
      title: 'Data',
      dataIndex: 'data',
      key: 'data',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Hora',
      dataIndex: 'hora',
      key: 'hora',
    },
    {
      title: 'Local',
      dataIndex: 'local',
      key: 'local',
    },
    {
      title: 'Categoria',
      dataIndex: 'categoria',
      key: 'categoria',
    },
    {
      title: 'Vagas',
      key: 'vagas',
      render: (_, record) => `${record.vagasDisponiveis}/${record.vagas}`,
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
            title="Tem certeza que deseja deletar este evento?"
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
        <h2>Gerenciar Eventos</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Novo Evento
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={eventos}
        loading={loading}
        rowKey="_id"
        scroll={{ x: 'max-content' }}
      />

      <Modal
        title={editingEvento ? 'Editar Evento' : 'Novo Evento'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        footer={null}
        width={window.innerWidth < 768 ? '95%' : 600}
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
            name="data"
            label="Data"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="hora"
            label="Hora"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Input placeholder="Ex: 14:00" />
          </Form.Item>

          <Form.Item
            name="local"
            label="Local"
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
              <Select.Option value="Workshop">Workshop</Select.Option>
              <Select.Option value="Networking">Networking</Select.Option>
              <Select.Option value="Palestra">Palestra</Select.Option>
              <Select.Option value="Feira">Feira</Select.Option>
              <Select.Option value="Reunião">Reunião</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="palestrante"
            label="Palestrante (opcional)"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="vagas"
            label="Total de Vagas"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="imagemFile"
            label="Imagem"
            rules={[
              {
                required: true,
                validator: (_, value) => {
                  const temImagemExistente = editingEvento && editingEvento.imagem && !imagemRemovida
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
            {(!editingEvento || !editingEvento.imagem || imagemRemovida) ? (
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

          {editingEvento && editingEvento.imagem && !imagemRemovida && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '8px' }}>Imagem atual:</div>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Image src={editingEvento.imagem} width={200} />
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
                Salvar
              </Button>
              <Button onClick={() => {
                setModalVisible(false)
                form.resetFields()
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

export default EventosAdmin

