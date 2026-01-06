import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Popconfirm,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, MailOutlined } from '@ant-design/icons'
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} from '../../lib/api'

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadUsuarios()
  }, [])

  const loadUsuarios = async () => {
    setLoading(true)
    try {
      const response = await getUsuarios()
      setUsuarios(response.data)
    } catch (error) {
      message.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingUsuario(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario)
    form.setFieldsValue({
      name: usuario.name,
      email: usuario.email,
      password: '', // Não preencher senha
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteUsuario(id)
      message.success('Usuário deletado com sucesso')
      loadUsuarios()
    } catch (error) {
      message.error('Erro ao deletar usuário: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleSubmit = async (values) => {
    try {
      const data = {
        name: values.name,
        email: values.email,
      }

      // Apenas incluir senha se for novo usuário ou se foi fornecida
      if (!editingUsuario || values.password) {
        if (!values.password) {
          message.error('Senha é obrigatória')
          return
        }
        if (values.password.length < 6) {
          message.error('A senha deve ter pelo menos 6 caracteres')
          return
        }
        data.password = values.password
      }

      if (editingUsuario) {
        await updateUsuario(editingUsuario._id, data)
        message.success('Usuário atualizado com sucesso')
      } else {
        await createUsuario(data)
        message.success('Usuário criado com sucesso')
      }

      setModalVisible(false)
      form.resetFields()
      loadUsuarios()
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
      message.error('Erro ao salvar usuário: ' + (error.response?.data?.error || error.message))
    }
  }

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Data de Criação',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => {
        if (!date) return '-'
        return new Date(date).toLocaleDateString('pt-BR')
      },
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
            title="Tem certeza que deseja deletar este usuário?"
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
        <h2>Gerenciar Usuários</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Novo Usuário
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={usuarios}
        loading={loading}
        rowKey="_id"
        scroll={{ x: 'max-content' }}
      />

      <Modal
        title={editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setEditingUsuario(null)
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
            name="name"
            label="Nome"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nome completo"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Campo obrigatório' },
              { type: 'email', message: 'Email inválido' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="usuario@exemplo.com"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={editingUsuario ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!editingUsuario && !value) {
                    return Promise.reject(new Error('Senha é obrigatória'))
                  }
                  if (value && value.length < 6) {
                    return Promise.reject(new Error('A senha deve ter pelo menos 6 caracteres'))
                  }
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <Input.Password
              placeholder={editingUsuario ? 'Deixe em branco para manter a senha atual' : 'Mínimo 6 caracteres'}
            />
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

export default UsuariosAdmin

