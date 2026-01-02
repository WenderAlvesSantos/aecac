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
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  getEventos,
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
  const [form] = Form.useForm()

  useEffect(() => {
    loadEventos()
  }, [])

  const loadEventos = async () => {
    setLoading(true)
    try {
      const response = await getEventos()
      setEventos(response.data)
    } catch (error) {
      message.error('Erro ao carregar eventos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingEvento(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (evento) => {
    setEditingEvento(evento)
    form.setFieldsValue({
      ...evento,
      data: evento.data ? dayjs(evento.data) : null,
    })
    setModalVisible(true)
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

      if (editingEvento) {
        await updateEvento(editingEvento._id, data)
        message.success('Evento atualizado com sucesso')
      } else {
        await createEvento(data)
        message.success('Evento criado com sucesso')
      }

      setModalVisible(false)
      form.resetFields()
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
      />

      <Modal
        title={editingEvento ? 'Editar Evento' : 'Novo Evento'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        footer={null}
        width={600}
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

export default EventosAdmin

