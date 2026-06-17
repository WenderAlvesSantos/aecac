import { useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import { UserOutlined, LockOutlined, HomeOutlined } from '@ant-design/icons'
import { motion } from 'motion/react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../lib/api'
import PublicLayout from '../../components/public-site/PublicLayout'
import { glassPanel, pageSubtitle, pageTitle } from '../../components/public-site/publicUi'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const response = await login(values.email, values.password)
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      message.success('Login realizado com sucesso!')
      navigate('/admin')
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Erro ao fazer login. Verifique suas credenciais.'
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PublicLayout bare>
      <div className="w-full px-6 py-12 lg:px-12">
        <div className="mx-auto max-w-lg">
          <motion.div
            className="mb-8 text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <h1 className={pageTitle}>Painel Administrativo</h1>
            <p className={`${pageSubtitle} mt-2`}>Acesse com suas credenciais para gerenciar a AECAC.</p>
          </motion.div>

          <motion.div
            className={`${glassPanel} p-8 sm:p-10`}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            <Form
              name="admin-login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
              className="cadastro-fundador-form"
              requiredMark
            >
              <Form.Item
                name="email"
                label="E-mail"
                rules={[
                  { required: true, message: 'Por favor, insira seu e-mail' },
                  { type: 'email', message: 'E-mail inválido' },
                ]}
              >
                <Input prefix={<UserOutlined className="text-gray-500" />} placeholder="seu@email.com" />
              </Form.Item>

              <Form.Item
                name="password"
                label="Senha"
                rules={[{ required: true, message: 'Por favor, insira sua senha' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-500" />}
                  placeholder="Sua senha"
                />
              </Form.Item>

              <Form.Item className="!mb-0">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="default"
                    htmlType="submit"
                    block
                    loading={loading}
                    className="!h-auto !min-h-[52px] !rounded-xl !border-0 !bg-gradient-to-r !from-[#1e4d7b] !to-[#5b9bd5] !px-4 !py-5 !text-lg !font-semibold !text-white hover:!brightness-110"
                    style={{ boxShadow: '0 10px 40px rgba(91, 155, 213, 0.25)' }}
                  >
                    Entrar
                  </Button>
                </motion.div>
              </Form.Item>
            </Form>

            <div className="mt-8 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
              >
                <HomeOutlined />
                Voltar para o site
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </PublicLayout>
  )
}

export default Login
