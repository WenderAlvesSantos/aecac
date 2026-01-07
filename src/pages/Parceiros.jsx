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
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div style={{ background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      {/* Header Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a237e 0%, #1565c0 50%, #00c853 100%)',
          color: '#fff',
          padding: window.innerWidth < 768 ? '50px 16px' : '100px 24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: 'absolute',
            top: '-30%',
            right: '-10%',
            width: '500px',
            height: '500px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            filter: 'blur(80px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-20%',
            left: '-10%',
            width: '400px',
            height: '400px',
            background: 'rgba(0, 200, 83, 0.1)',
            borderRadius: '50%',
            filter: 'blur(80px)',
          }}
        />
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Title level={1} style={{ color: '#fff', marginBottom: '16px', fontSize: window.innerWidth < 768 ? '32px' : '42px', fontWeight: 'bold', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            Nossos Parceiros
          </Title>
          <Paragraph
            style={{
              color: 'rgba(255,255,255,0.95)',
              fontSize: window.innerWidth < 768 ? '16px' : '20px',
              lineHeight: '1.8',
            }}
          >
            Conheça nossos parceiros estratégicos que oferecem benefícios
            exclusivos para empresas associadas
          </Paragraph>
        </div>
      </div>

      {/* Lista de Parceiros */}
      <div style={{ padding: window.innerWidth < 768 ? '32px 16px' : '64px 24px' }}>
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
              {parceiros.map((parceiro, index) => (
                <Col xs={24} sm={12} md={8} key={parceiro._id}>
                  <Card
                    hoverable
                    style={{
                      height: '100%',
                      textAlign: 'center',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      border: '1px solid #e0e0e0',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: '#fff',
                      overflow: 'hidden',
                      position: 'relative',
                      opacity: 0,
                      transform: 'translateY(30px)',
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`,
                    }}
                    bodyStyle={{ padding: '32px', position: 'relative', zIndex: 1 }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)'
                      e.currentTarget.style.boxShadow = `0 12px 24px ${parceiro.cor || '#1565c0'}33`
                      const icon = e.currentTarget.querySelector('.partner-icon')
                      if (icon) icon.style.transform = 'scale(1.15) rotate(5deg)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                      const icon = e.currentTarget.querySelector('.partner-icon')
                      if (icon) icon.style.transform = 'scale(1) rotate(0deg)'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '56px',
                        color: parceiro.cor || '#1565c0',
                        marginBottom: '20px',
                        transition: 'transform 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                      {getIconForCategory(parceiro.categoria)}
                    </div>
                    <Title level={4} style={{ marginBottom: '12px', color: '#1a237e', fontSize: '20px', fontWeight: '600' }}>
                      {parceiro.nome}
                    </Title>
                    <Tag 
                      color={parceiro.cor || 'blue'} 
                      style={{ 
                        marginBottom: '16px',
                        fontSize: '13px',
                        padding: '4px 12px',
                        borderRadius: '6px',
                      }}
                    >
                      {parceiro.categoria}
                    </Tag>
                    <Paragraph style={{ color: '#666', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
                      {parceiro.descricao}
                    </Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* Seção de Benefícios */}
          <div style={{ marginTop: '64px' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: '48px', color: '#1a237e', fontSize: '32px', fontWeight: 'bold' }}>
              Benefícios para Associados
            </Title>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card
                  hoverable
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    border: '1px solid #e0e0e0',
                    height: '100%',
                    transition: 'all 0.3s ease',
                  }}
                  bodyStyle={{ padding: '28px' }}
                >
                  <Title level={4} style={{ color: '#1565c0', marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>Descontos Exclusivos</Title>
                  <Paragraph style={{ color: '#666', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
                    Aproveite descontos especiais em produtos e serviços dos
                    nossos parceiros, exclusivos para empresas associadas à
                    AECAC.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card
                  hoverable
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    border: '1px solid #e0e0e0',
                    height: '100%',
                    transition: 'all 0.3s ease',
                  }}
                  bodyStyle={{ padding: '28px' }}
                >
                  <Title level={4} style={{ color: '#00c853', marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>Prioridade no Atendimento</Title>
                  <Paragraph style={{ color: '#666', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
                    Receba atendimento prioritário e personalizado dos nossos
                    parceiros, com suporte dedicado para sua empresa.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card
                  hoverable
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    border: '1px solid #e0e0e0',
                    height: '100%',
                    transition: 'all 0.3s ease',
                  }}
                  bodyStyle={{ padding: '28px' }}
                >
                  <Title level={4} style={{ color: '#42a5f5', marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>Condições Especiais</Title>
                  <Paragraph style={{ color: '#666', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
                    Acesse condições especiais de pagamento e financiamento
                    através dos nossos parceiros financeiros.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card
                  hoverable
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    border: '1px solid #e0e0e0',
                    height: '100%',
                    transition: 'all 0.3s ease',
                  }}
                  bodyStyle={{ padding: '28px' }}
                >
                  <Title level={4} style={{ color: '#1a237e', marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>Eventos Exclusivos</Title>
                  <Paragraph style={{ color: '#666', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
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
              padding: window.innerWidth < 768 ? '32px 24px' : '48px',
              background: 'linear-gradient(135deg, rgba(26, 35, 126, 0.05) 0%, rgba(21, 101, 192, 0.05) 50%, rgba(0, 200, 83, 0.05) 100%)',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '1px solid #e0e0e0',
            }}
          >
            <Title level={3} style={{ color: '#1a237e', marginBottom: '16px', fontSize: '28px', fontWeight: 'bold' }}>Torne-se um Parceiro</Title>
            <Paragraph style={{ fontSize: '16px', marginBottom: '24px', color: '#666', lineHeight: '1.8' }}>
              Sua empresa pode se tornar um parceiro estratégico da AECAC e
              oferecer benefícios exclusivos para nossos associados.
            </Paragraph>
            <Paragraph style={{ fontSize: '18px', color: '#1565c0', fontWeight: '600' }}>
              Entre em contato: <a href={`mailto:${emailContato}`} style={{ color: '#1565c0' }}>{emailContato}</a>
            </Paragraph>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default Parceiros

