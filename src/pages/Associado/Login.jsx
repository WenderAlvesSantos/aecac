import { useState } from 'react'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { loginAssociado, registerAssociado } from '../../lib/api'
import { useNavigate } from 'react-router-dom'
import Logo from '../../components/Logo'

const { Title } = Typography

const AssociadoLogin = () => {
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const navigate = useNavigate()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      let response
      if (isRegister) {
        // Registrar novo associado
        response = await registerAssociado(values.email, values.password, values.name)
        message.success('Cadastro realizado com sucesso!')
      } else {
        // Login
        response = await loginAssociado(values.email, values.password)
        message.success('Login realizado com sucesso!')
      }
      
      localStorage.setItem('associadoToken', response.data.token)
      localStorage.setItem('associado', JSON.stringify(response.data.user))
      navigate('/associado')
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao processar solicitação.'
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
          <Title level={4}>Área do Associado</Title>
          <p>{isRegister ? 'Cadastre-se para acessar benefícios exclusivos' : 'Acesse benefícios exclusivos e capacitações'}</p>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          {isRegister && (
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Por favor, insira seu nome!' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nome completo"
              />
            </Form.Item>
          )}

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Por favor, insira seu email!' },
              { type: 'email', message: 'Email inválido!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email da empresa aprovada"
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
              {isRegister ? 'Cadastrar' : 'Entrar'}
            </Button>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
            <Button
              type="link"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se'}
            </Button>
          </Form.Item>

          {!isRegister && (
            <div style={{ marginTop: '16px', padding: '12px', background: '#f0f7ff', borderRadius: '4px', fontSize: '12px', color: '#666' }}>
              <strong>Primeira vez?</strong> Use o mesmo email cadastrado na sua empresa aprovada para criar sua conta de associado.
            </div>
          )}
        </Form>
      </Card>
    </div>
  )
}

export default AssociadoLogin

