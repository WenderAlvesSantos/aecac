import { useState, useEffect } from 'react'
import { Row, Col, Typography, Card, Tag, Space, Spin, Empty } from 'antd'
import {
  BankOutlined,
  ShopOutlined,
  GlobalOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import { getParceiros, getConfiguracoes } from '../lib/api'

const { Title, Paragraph } = Typography

const getIconForCategory = (categoria) => {
  const icons = {
    Financeiro: <BankOutlined />,
    Varejo: <ShopOutlined />,
    Tecnologia: <GlobalOutlined />,
    Educação: <TrophyOutlined />,
    Logística: <GlobalOutlined />,
    Marketing: <GlobalOutlined />,
  }
  return icons[categoria] || <GlobalOutlined />
}

const Parceiros = () => {
  const [parceiros, setParceiros] = useState([])
  const [loading, setLoading] = useState(true)
  const [emailContato, setEmailContato] = useState('contato@aecac.org.br')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [parceirosRes, configuracoesRes] = await Promise.all([
        getParceiros(),
        getConfiguracoes(),
      ])
      setParceiros(parceirosRes.data)
      if (configuracoesRes.data?.contato?.email) {
        setEmailContato(configuracoesRes.data.contato.email)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '100px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    )
  }


  const categorias = [
    'Financeiro',
    'Varejo',
    'Tecnologia',
    'Educação',
    'Logística',
    'Marketing',
  ]

  return (
    <div style={{ background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      {/* Header Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Title level={1} style={{ color: '#fff', marginBottom: '16px' }}>
            Nossos Parceiros
          </Title>
          <Paragraph
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '18px',
            }}
          >
            Conheça nossos parceiros estratégicos que oferecem benefícios
            exclusivos para empresas associadas
          </Paragraph>
        </div>
      </div>

      {/* Lista de Parceiros */}
      <div style={{ padding: '64px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Filtros por Categoria */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <Space wrap>
              {categorias.map((categoria) => (
                <Tag
                  key={categoria}
                  color="blue"
                  style={{
                    padding: '4px 16px',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  {categoria}
                </Tag>
              ))}
            </Space>
          </div>

          {/* Cards de Parceiros */}
          {parceiros.length === 0 ? (
            <Empty description="Nenhum parceiro cadastrado" />
          ) : (
            <Row gutter={[24, 24]}>
              {parceiros.map((parceiro) => (
                <Col xs={24} sm={12} md={8} key={parceiro._id}>
                  <Card
                    hoverable
                    style={{
                      height: '100%',
                      textAlign: 'center',
                      borderRadius: '8px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '48px',
                        color: parceiro.cor || '#1890ff',
                        marginBottom: '16px',
                      }}
                    >
                      {getIconForCategory(parceiro.categoria)}
                    </div>
                    <Title level={4} style={{ marginBottom: '8px' }}>
                      {parceiro.nome}
                    </Title>
                    <Tag color={parceiro.cor || 'blue'} style={{ marginBottom: '16px' }}>
                      {parceiro.categoria}
                    </Tag>
                    <Paragraph style={{ color: '#666' }}>
                      {parceiro.descricao}
                    </Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* Seção de Benefícios */}
          <div style={{ marginTop: '64px' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
              Benefícios para Associados
            </Title>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card>
                  <Title level={4}>Descontos Exclusivos</Title>
                  <Paragraph>
                    Aproveite descontos especiais em produtos e serviços dos
                    nossos parceiros, exclusivos para empresas associadas à
                    AECAC.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card>
                  <Title level={4}>Prioridade no Atendimento</Title>
                  <Paragraph>
                    Receba atendimento prioritário e personalizado dos nossos
                    parceiros, com suporte dedicado para sua empresa.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card>
                  <Title level={4}>Condições Especiais</Title>
                  <Paragraph>
                    Acesse condições especiais de pagamento e financiamento
                    através dos nossos parceiros financeiros.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card>
                  <Title level={4}>Eventos Exclusivos</Title>
                  <Paragraph>
                    Participe de eventos e workshops exclusivos organizados em
                    parceria com nossos parceiros estratégicos.
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </div>

          {/* CTA */}
          <div
            style={{
              marginTop: '64px',
              padding: '48px',
              background: '#fff',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Title level={3}>Torne-se um Parceiro</Title>
            <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
              Sua empresa pode se tornar um parceiro estratégico da AECAC e
              oferecer benefícios exclusivos para nossos associados.
            </Paragraph>
            <Paragraph style={{ fontSize: '16px', color: '#1890ff' }}>
              Entre em contato: {emailContato}
            </Paragraph>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Parceiros

