import { useState, useEffect } from 'react'
import { Card, Row, Col, Typography, Button, Space, Form, Input, message, Avatar, Divider } from 'antd'
import {
  UserOutlined,
  ShopOutlined,
  EditOutlined,
  LockOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getPerfil, updatePerfil } from '../../lib/api'
import api from '../../lib/api'

const { Title, Text } = Typography

const PerfilAssociado = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [perfil, setPerfil] = useState(null)
  const [empresa, setEmpresa] = useState(null)
  const [form] = Form.useForm()
  const [senhaForm] = Form.useForm()
  const [alterandoSenha, setAlterandoSenha] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const perfilRes = await getPerfil().catch(() => ({ data: null }))
      const perfilData = perfilRes.data
      setPerfil(perfilData)

      // Buscar empresa do associado
      if (perfilData?.empresaId) {
        try {
          const empresaRes = await api.get(`/empresas/${perfilData.empresaId}`)
          setEmpresa(empresaRes.data)
        } catch (error) {
          console.error('Erro ao buscar empresa:', error)
        }
      }

      form.setFieldsValue({
        name: perfilData?.name || '',
        email: perfilData?.email || '',
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePerfil = async (values) => {
    try {
      await updatePerfil(values)
      message.success('Perfil atualizado com sucesso!')
      loadData()
    } catch (error) {
      message.error(error.response?.data?.error || 'Erro ao atualizar perfil')
    }
  }

  const handleAlterarSenha = async (values) => {
    try {
      setAlterandoSenha(true)
      await updatePerfil({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      message.success('Senha alterada com sucesso!')
      senhaForm.resetFields()
    } catch (error) {
      message.error(error.response?.data?.error || 'Erro ao alterar senha')
    } finally {
      setAlterandoSenha(false)
    }
  }

  return (
    <div>
      <Row gutter={[24, 24]}>
        {/* Perfil do Usuário */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <UserOutlined />
                <span>Meu Perfil</span>
              </Space>
            }
            loading={loading}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdatePerfil}
            >
              <Form.Item
                name="name"
                label="Nome"
                rules={[{ required: true, message: 'Nome é obrigatório' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Email é obrigatório' },
                  { type: 'email', message: 'Email inválido' }
                ]}
              >
                <Input disabled />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Atualizar Perfil
                </Button>
              </Form.Item>
            </Form>

            <Divider>Alterar Senha</Divider>

            <Form
              form={senhaForm}
              layout="vertical"
              onFinish={handleAlterarSenha}
            >
              <Form.Item
                name="currentPassword"
                label="Senha Atual"
                rules={[{ required: true, message: 'Senha atual é obrigatória' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Digite sua senha atual" />
              </Form.Item>
              <Form.Item
                name="newPassword"
                label="Nova Senha"
                rules={[
                  { required: true, message: 'Nova senha é obrigatória' },
                  { min: 6, message: 'A senha deve ter no mínimo 6 caracteres' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Digite a nova senha" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="Confirmar Nova Senha"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Confirmação de senha é obrigatória' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('As senhas não coincidem'))
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Confirme a nova senha" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={alterandoSenha}>
                  Alterar Senha
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Dados da Empresa */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ShopOutlined />
                <span>Dados da Empresa</span>
              </Space>
            }
            loading={loading}
            extra={
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate('/associado/editar-empresa')}
              >
                Editar Empresa
              </Button>
            }
          >
            {empresa ? (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <Text strong>Nome:</Text>
                  <div>{empresa.nome}</div>
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <div>
                  <Text strong>CNPJ:</Text>
                  <div>{empresa.cnpj ? empresa.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : '-'}</div>
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <div>
                  <Text strong>Categoria:</Text>
                  <div>{empresa.categoria || '-'}</div>
                </div>
                <Divider style={{ margin: '12px 0' }} />
                {empresa.descricao && (
                  <>
                    <div>
                      <Text strong>Descrição:</Text>
                      <div>{empresa.descricao}</div>
                    </div>
                    <Divider style={{ margin: '12px 0' }} />
                  </>
                )}
                {empresa.telefone && (
                  <>
                    <div>
                      <Text strong>Telefone:</Text>
                      <div>{empresa.telefone}</div>
                    </div>
                    <Divider style={{ margin: '12px 0' }} />
                  </>
                )}
                {empresa.whatsapp && (
                  <>
                    <div>
                      <Text strong>WhatsApp:</Text>
                      <div>{empresa.whatsapp}</div>
                    </div>
                    <Divider style={{ margin: '12px 0' }} />
                  </>
                )}
                {empresa.email && (
                  <>
                    <div>
                      <Text strong>Email:</Text>
                      <div>{empresa.email}</div>
                    </div>
                    <Divider style={{ margin: '12px 0' }} />
                  </>
                )}
                {empresa.endereco && (
                  <>
                    <div>
                      <Text strong>Endereço:</Text>
                      <div>{empresa.endereco}</div>
                    </div>
                    <Divider style={{ margin: '12px 0' }} />
                  </>
                )}
                {empresa.site && (
                  <>
                    <div>
                      <Text strong>Site:</Text>
                      <div>
                        <a href={empresa.site} target="_blank" rel="noopener noreferrer">
                          {empresa.site}
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </Space>
            ) : (
              <div>
                <Text type="secondary">Nenhuma empresa vinculada</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default PerfilAssociado

