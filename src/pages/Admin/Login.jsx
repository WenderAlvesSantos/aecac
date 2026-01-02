import { useState } from 'react'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { login } from '../../lib/api'
import { useNavigate } from 'react-router-dom'
import Logo from '../../components/Logo'

const { Title } = Typography

const Login = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      console.log('Tentando fazer login com:', { email: values.email })
      const response = await login(values.email, values.password)
      console.log('Login bem-sucedido:', response.data)
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      message.success('Login realizado com sucesso!')
      navigate('/admin')
    } catch (error) {
      console.error('Erro no login:', error)
      console.error('Response:', error.response)
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao fazer login. Verifique suas credenciais.'
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '24px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Logo height="80px" style={{ marginBottom: '16px' }} />
          <p>Painel Administrativo</p>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Por favor, insira seu email!' },
              { type: 'email', message: 'Email inválido!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Senha"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
            >
              Entrar
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Login

