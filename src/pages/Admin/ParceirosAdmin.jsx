import { useState, useEffect } from 'react'
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
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import {
  getParceiros,
  createParceiro,
  updateParceiro,
  deleteParceiro,
} from '../../lib/api'

const { TextArea } = Input

const ParceirosAdmin = () => {
  const [parceiros, setParceiros] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingParceiro, setEditingParceiro] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadParceiros()
  }, [])

  const loadParceiros = async () => {
    setLoading(true)
    try {
      const response = await getParceiros()
      setParceiros(response.data)
    } catch (error) {
      message.error('Erro ao carregar parceiros')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingParceiro(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (parceiro) => {
    setEditingParceiro(parceiro)
    form.setFieldsValue(parceiro)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteParceiro(id)
      message.success('Parceiro deletado com sucesso')
      loadParceiros()
    } catch (error) {
      message.error('Erro ao deletar parceiro')
    }
  }

  const handleSubmit = async (values) => {
    try {
      if (editingParceiro) {
        await updateParceiro(editingParceiro._id, values)
        message.success('Parceiro atualizado com sucesso')
      } else {
        await createParceiro(values)
        message.success('Parceiro criado com sucesso')
      }

      setModalVisible(false)
      form.resetFields()
      loadParceiros()
    } catch (error) {
      message.error('Erro ao salvar parceiro')
    }
  }

  const columns = [
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
      title: 'Descrição',
      dataIndex: 'descricao',
      key: 'descricao',
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
            title="Tem certeza que deseja deletar este parceiro?"
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
        <h2>Gerenciar Parceiros</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Novo Parceiro
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={parceiros}
        loading={loading}
        rowKey="_id"
      />

      <Modal
        title={editingParceiro ? 'Editar Parceiro' : 'Novo Parceiro'}
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
              <Select.Option value="Financeiro">Financeiro</Select.Option>
              <Select.Option value="Varejo">Varejo</Select.Option>
              <Select.Option value="Tecnologia">Tecnologia</Select.Option>
              <Select.Option value="Educação">Educação</Select.Option>
              <Select.Option value="Logística">Logística</Select.Option>
              <Select.Option value="Marketing">Marketing</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="descricao"
            label="Descrição"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="cor"
            label="Cor (hex)"
            initialValue="#1890ff"
          >
            <Input placeholder="#1890ff" />
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

export default ParceirosAdmin

