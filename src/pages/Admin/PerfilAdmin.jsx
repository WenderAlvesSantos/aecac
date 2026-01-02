import { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Space,
} from 'antd'
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
} from '@ant-design/icons'
import { getPerfil, updatePerfil } from '../../lib/api'

const PerfilAdmin = () => {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadPerfil()
  }, [])

  const loadPerfil = async () => {
    setLoading(true)
    try {
      const response = await getPerfil()
      form.setFieldsValue({
        name: response.data.name,
        email: response.data.email,
      })
    } catch (error) {
      message.error('Erro ao carregar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values) => {
    try {
      setLoading(true)
      
      const data = {
        name: values.name,
        email: values.email,
      }

      // Se forneceu nova senha, incluir senhas
      if (values.newPassword) {
        if (!values.currentPassword) {
          message.error('Por favor, informe a senha atual para alterar a senha')
          return
        }
        data.currentPassword = values.currentPassword
        data.newPassword = values.newPassword
      }

      await updatePerfil(data)
      message.success('Perfil atualizado com sucesso')
      
      // Atualizar dados do usuário no localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      user.name = values.name
      user.email = values.email
      localStorage.setItem('user', JSON.stringify(user))
      
      // Limpar campos de senha
      form.setFieldsValue({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      message.error('Erro ao salvar perfil: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Meu Perfil</h2>
      
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          loading={loading}
        >
          <Form.Item
            name="name"
            label="Nome"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Seu nome completo"
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
              placeholder="seu@email.com"
            />
          </Form.Item>

          <div style={{ marginTop: '32px', marginBottom: '16px' }}>
            <h3>Alterar Senha</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Deixe em branco se não desejar alterar a senha
            </p>
          </div>

          <Form.Item
            name="currentPassword"
            label="Senha Atual"
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Digite sua senha atual"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Nova Senha"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !getFieldValue('currentPassword')) {
                    return Promise.resolve()
                  }
                  if (value.length < 6) {
                    return Promise.reject(new Error('A senha deve ter pelo menos 6 caracteres'))
                  }
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Digite a nova senha"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirmar Nova Senha"
            dependencies={['newPassword']}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !getFieldValue('newPassword')) {
                    return Promise.resolve()
                  }
                  if (value !== getFieldValue('newPassword')) {
                    return Promise.reject(new Error('As senhas não coincidem'))
                  }
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirme a nova senha"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Salvar Alterações
              </Button>
              <Button onClick={() => loadPerfil()}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default PerfilAdmin

