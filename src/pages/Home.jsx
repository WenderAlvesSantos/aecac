import { useState, useEffect } from 'react'
import { Row, Col, Typography, Button, Card, Statistic, Space } from 'antd'
import {
  TeamOutlined,
  ShopOutlined,
  TrophyOutlined,
  ArrowRightOutlined,
  RocketOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getEmpresas, getParceiros } from '../lib/api'
import { useFeatureFlags } from '../contexts/FeatureFlagsContext'

const { Title, Paragraph } = Typography

const Home = () => {
  const navigate = useNavigate()
  const { flags } = useFeatureFlags()
  const [stats, setStats] = useState({
    empresas: 0,
    parceiros: 0,
  })
  const [, setIsVisible] = useState(false)

  useEffect(() => {
    loadData()
    // Animação de entrada
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  const loadData = async () => {
    try {
      const [empresasRes, parceirosRes] = await Promise.all([
        getEmpresas(),
        getParceiros(),
      ])
      setStats({
        empresas: empresasRes.data.length,
        parceiros: parceirosRes.data.length,
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

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
      <div>
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a237e 0%, #1565c0 50%, #00c853 100%)',
          color: '#fff',
          padding: window.innerWidth < 768 ? '60px 16px' : '120px 24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '600px',
            height: '600px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            filter: 'blur(80px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-30%',
            left: '-10%',
            width: '500px',
            height: '500px',
            background: 'rgba(0, 200, 83, 0.1)',
            borderRadius: '50%',
            filter: 'blur(80px)',
          }}
        />
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {flags.preCadastroMode && (
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '8px 20px',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <RocketOutlined style={{ fontSize: '18px' }} />
                <span style={{ fontSize: '14px', fontWeight: '600' }}>Em Breve</span>
              </div>
            </div>
          )}
          <Title
            level={1}
            style={{ 
              color: '#fff', 
              fontSize: window.innerWidth < 768 ? '36px' : '56px', 
              marginBottom: window.innerWidth < 768 ? '16px' : '24px',
              fontWeight: 'bold',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              letterSpacing: '2px',
            }}
          >
            AECAC
          </Title>
          <Title
            level={2}
            style={{ 
              color: '#fff', 
              fontWeight: '300', 
              marginBottom: '16px', 
              fontSize: window.innerWidth < 768 ? '18px' : '26px',
              textShadow: '0 1px 5px rgba(0,0,0,0.2)',
            }}
          >
            Associação Empresarial e Comercial de Águas Claras
          </Title>
          <Paragraph
            style={{
              color: 'rgba(255,255,255,0.95)',
              fontSize: window.innerWidth < 768 ? '15px' : '20px',
              marginBottom: '40px',
              lineHeight: '1.8',
              maxWidth: '800px',
              margin: '0 auto 40px',
            }}
          >
            A voz organizada, respeitada e influente dos empresários de Águas Claras.
          </Paragraph>
          <Space size="large" direction={window.innerWidth < 768 ? 'vertical' : 'horizontal'} style={{ width: window.innerWidth < 768 ? '100%' : 'auto' }}>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate('/sobre')}
              block={window.innerWidth < 768}
              style={{
                height: '50px',
                fontSize: '16px',
                fontWeight: '600',
                background: '#fff',
                color: '#1565c0',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              Conheça Mais
            </Button>
            {!flags.preLancamento && flags.mostrarEmpresas && (
              <Button
                size="large"
                style={{ 
                  background: 'rgba(255,255,255,0.15)', 
                  color: '#fff',
                  border: '2px solid rgba(255,255,255,0.5)',
                  height: '50px',
                  fontSize: '16px',
                  fontWeight: '600',
                  backdropFilter: 'blur(10px)',
                }}
                onClick={() => navigate('/empresas')}
                block={window.innerWidth < 768}
              >
                Ver Empresas
              </Button>
            )}
          </Space>
        </div>
      </div>

      {/* Estatísticas */}
      {!flags.preLancamento && (
        <div style={{ padding: window.innerWidth < 768 ? '48px 16px' : '80px 24px', background: '#f8f9fa' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} md={6}>
                <Card
                  hoverable
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: 'none',
                    transition: 'all 0.3s ease',
                  }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <Statistic
                    title="Empresas Associadas"
                    value={stats.empresas}
                    prefix={<ShopOutlined style={{ color: '#1565c0' }} />}
                    valueStyle={{ color: '#1565c0', fontSize: '32px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card
                  hoverable
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: 'none',
                    transition: 'all 0.3s ease',
                  }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <Statistic
                    title="Parceiros Estratégicos"
                    value={stats.parceiros}
                    prefix={<TeamOutlined style={{ color: '#00c853' }} />}
                    valueStyle={{ color: '#00c853', fontSize: '32px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card
                  hoverable
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: 'none',
                    transition: 'all 0.3s ease',
                  }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <Statistic
                    title="Anos de Atuação"
                    value={10}
                    prefix={<TrophyOutlined style={{ color: '#1a237e' }} />}
                    valueStyle={{ color: '#1a237e', fontSize: '32px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card
                  hoverable
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: 'none',
                    transition: 'all 0.3s ease',
                  }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <Statistic
                    title="Eventos Realizados"
                    value={50}
                    prefix={<TrophyOutlined style={{ color: '#42a5f5' }} />}
                    valueStyle={{ color: '#42a5f5', fontSize: '32px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      )}

      {/* Benefícios */}
      <div style={{ padding: window.innerWidth < 768 ? '48px 16px' : '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Title 
            level={2} 
            style={{ 
              textAlign: 'center', 
              marginBottom: window.innerWidth < 768 ? '40px' : '60px', 
              fontSize: window.innerWidth < 768 ? '24px' : '36px',
              fontWeight: 'bold',
              color: '#1a237e',
            }}
          >
            Por que se associar?
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={8}>
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
                <Title level={4} style={{ color: '#1565c0', marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>Networking</Title>
                <Paragraph style={{ color: '#666', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
                  Conecte-se com outros empresários e expanda sua rede de
                  contatos profissionais.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
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
                <Title level={4} style={{ color: '#00c853', marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>Visibilidade</Title>
                <Paragraph style={{ color: '#666', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
                  Aumente a visibilidade da sua empresa na região de Águas
                  Claras.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
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
                <Title level={4} style={{ color: '#42a5f5', marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>Eventos</Title>
                <Paragraph style={{ color: '#666', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
                  Participe de eventos exclusivos, palestras e workshops para
                  desenvolvimento empresarial.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
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
                <Title level={4} style={{ color: '#1a237e', marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>Representação</Title>
                <Paragraph style={{ color: '#666', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
                  Tenha voz ativa nas decisões que impactam o comércio local.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
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
                <Title level={4} style={{ color: '#1565c0', marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>Descontos</Title>
                <Paragraph style={{ color: '#666', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
                  Aproveite descontos especiais em produtos e serviços de
                  parceiros.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
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
                <Title level={4} style={{ color: '#00c853', marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>Suporte</Title>
                <Paragraph style={{ color: '#666', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
                  Receba orientação e suporte para o crescimento do seu negócio.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* CTA Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a237e 0%, #1565c0 100%)',
          color: '#fff',
          padding: window.innerWidth < 768 ? '50px 16px' : '80px 24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '400px',
            height: '400px',
            background: 'rgba(0, 200, 83, 0.1)',
            borderRadius: '50%',
            filter: 'blur(60px)',
            animation: 'pulse 4s ease-in-out infinite',
          }}
        />
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Title level={2} style={{ color: '#fff', marginBottom: '20px', fontSize: window.innerWidth < 768 ? '26px' : '38px', fontWeight: 'bold' }}>
            {flags.preCadastroMode ? 'Fazer Pré-Cadastro' : 'Faça parte da AECAC'}
          </Title>
          <Paragraph
            style={{
              color: 'rgba(255,255,255,0.95)',
              fontSize: window.innerWidth < 768 ? '16px' : '20px',
              marginBottom: '40px',
              lineHeight: '1.8',
            }}
          >
            {flags.preCadastroMode 
              ? 'Em breve estaremos disponíveis. Registre seu interesse e seja um dos primeiros a fazer parte da AECAC em Águas Claras.'
              : 'Junte-se a nós e fortaleça seu negócio junto com outros empresários de Águas Claras.'
            }
          </Paragraph>
          <Space size="large" direction={window.innerWidth < 768 ? 'vertical' : 'horizontal'} style={{ width: window.innerWidth < 768 ? '100%' : 'auto' }}>
            <Button
              type="default"
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={() => navigate('/sobre')}
              style={{ 
                background: '#fff', 
                color: '#1565c0',
                height: '50px',
                fontSize: '16px',
                fontWeight: '600',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease',
              }}
              block={window.innerWidth < 768}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              Saiba Mais
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate('/como-associar')}
              block={window.innerWidth < 768}
              style={{
                background: 'linear-gradient(135deg, #00c853 0%, #00e676 100%)',
                borderColor: '#00c853',
                height: '50px',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(0, 200, 83, 0.3)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 200, 83, 0.4)'
                e.currentTarget.style.background = 'linear-gradient(135deg, #00e676 0%, #00c853 100%)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 200, 83, 0.3)'
                e.currentTarget.style.background = 'linear-gradient(135deg, #00c853 0%, #00e676 100%)'
              }}
            >
              {flags.preCadastroMode ? '🚀 Fazer Pré-Cadastro' : 'Associar Minha Empresa'}
            </Button>
          </Space>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
    </>
  )
}

export default Home

