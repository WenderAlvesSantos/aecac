import { useState, useEffect } from 'react'
import { Row, Col, Typography, Card, Space, Button, Divider, Spin, Alert } from 'antd'
import {
  GiftOutlined,
  TeamOutlined,
  CalendarOutlined,
  BookOutlined,
  ShopOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  RocketOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getConfiguracoes } from '../lib/api'
import { useFeatureFlags } from '../contexts/FeatureFlagsContext'

const { Title, Paragraph } = Typography

const ComoAssociar = () => {
  const navigate = useNavigate()
  const { flags } = useFeatureFlags()
  const [valorMensalidade, setValorMensalidade] = useState(100.00)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConfiguracoes()
  }, [])

  const loadConfiguracoes = async () => {
    try {
      const response = await getConfiguracoes()
      const valor = response.data?.valorMensalidade || 100.00
      setValorMensalidade(valor)
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      // Mantém o valor padrão em caso de erro
    } finally {
      setLoading(false)
    }
  }

  const beneficios = [
    {
      icon: <GiftOutlined />,
      title: 'Benefícios Exclusivos',
      description: 'Ofereça descontos e vantagens especiais em seus produtos e serviços para potenciais clientes através do site da AECAC.',
    },
    {
      icon: <CalendarOutlined />,
      title: 'Eventos e Networking',
      description: 'Promova seus eventos exclusivos, workshops e oportunidades de networking para qualquer pessoa com acesso ao site.',
    },
    {
      icon: <BookOutlined />,
      title: 'Capacitações',
      description: 'Divulgue e promova seus cursos, palestras e treinamentos para alcançar um público maior através da plataforma.',
    },
    {
      icon: <ShopOutlined />,
      title: 'Visibilidade',
      description: 'Destaque no diretório de empresas associadas, aumentando sua visibilidade no mercado e atraindo novos clientes.',
    },
    {
      icon: <TeamOutlined />,
      title: 'Representatividade',
      description: 'Faça parte de uma organização que representa e defende os interesses do comércio em Águas Claras.',
    },
    {
      icon: <TrophyOutlined />,
      title: 'Credibilidade',
      description: 'Ganhe credibilidade e confiança ao fazer parte de uma associação reconhecida e respeitada.',
    },
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
                marginBottom: '16px',
                fontSize: window.innerWidth < 768 ? '32px' : '42px',
                fontWeight: 'bold',
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              {flags.preCadastroMode ? 'Fazer Pré-Cadastro na AECAC' : 'Como Associar-se à AECAC'}
            </Title>
            <Paragraph
              style={{
                color: 'rgba(255,255,255,0.95)',
                fontSize: window.innerWidth < 768 ? '16px' : '20px',
                lineHeight: '1.8',
              }}
            >
              {flags.preCadastroMode 
                ? 'Em breve estaremos disponíveis! Registre seu interesse e seja um dos primeiros empresários a fazer parte da AECAC em Águas Claras.'
                : 'Junte-se à Associação Empresarial e Comercial de Águas Claras e fortaleça seu negócio com uma rede de apoio e oportunidades exclusivas'
              }
            </Paragraph>
          </div>
        </div>

        {/* Content Section */}
        <div style={{ padding: window.innerWidth < 768 ? '32px 16px' : '64px 24px', maxWidth: '1200px', margin: '0 auto' }}>
          {/* Alert de Pré-Lançamento */}
          {flags.preCadastroMode && (
            <Alert
              message="🚀 Em breve estaremos disponíveis!"
              description="Registre seu interesse agora e seja um dos primeiros a fazer parte da AECAC. Entraremos em contato assim que o lançamento oficial acontecer."
              type="info"
              showIcon
              style={{ 
                marginBottom: '32px',
                borderRadius: '12px',
                padding: '16px 24px'
              }}
            />
          )}

          {/* Investimento */}
          {!flags.preCadastroMode && (
            <Card
              style={{
                marginBottom: '48px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                border: '1px solid #e0e0e0',
                background: 'linear-gradient(135deg, rgba(26, 35, 126, 0.05) 0%, rgba(21, 101, 192, 0.05) 50%, rgba(0, 200, 83, 0.05) 100%)',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <Title level={2} style={{ color: '#1a237e', marginBottom: '16px' }}>
                  Investimento Mensal
                </Title>
                {loading ? (
                  <Spin size="large" />
                ) : (
                  <div
                    style={{
                      fontSize: '48px',
                      fontWeight: 'bold',
                      color: '#00c853',
                      marginBottom: '8px',
                    }}
                  >
                    R$ {valorMensalidade.toFixed(2).replace('.', ',')}
                  </div>
                )}
                <Paragraph style={{ fontSize: '18px', color: '#666', marginBottom: '24px' }}>
                  Assinatura mensal que dá acesso a todos os benefícios e serviços da AECAC
                </Paragraph>
                <Space size="large">
                  <Button
                    type="primary"
                    size="large"
                    icon={<ArrowRightOutlined />}
                    onClick={() => navigate('/cadastro-empresa')}
                    style={{
                      background: '#00c853',
                      borderColor: '#00c853',
                      height: '48px',
                      padding: '0 32px',
                      fontSize: '16px',
                      fontWeight: '600',
                    }}
                  >
                    Associar Minha Empresa
                  </Button>
                </Space>
              </div>
            </Card>
          )}

          {/* Benefícios */}
          <div style={{ marginBottom: '48px' }}>
            <Title level={2} style={{ color: '#1a237e', marginBottom: '32px', textAlign: 'center' }}>
              {flags.preCadastroMode ? 'O que você terá ao se associar' : 'Benefícios de se Associar'}
            </Title>
            <Row gutter={[24, 24]}>
              {beneficios.map((beneficio, index) => (
                <Col
                  xs={24}
                  sm={12}
                  md={8}
                  key={index}
                  style={{
                    animation: `fadeInUp 0.8s ease-out forwards ${index * 0.1}s`,
                    opacity: 0,
                  }}
                >
                  <Card
                    hoverable
                    style={{
                      height: '100%',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      border: '1px solid #e0e0e0',
                      transition: 'all 0.3s ease',
                    }}
                    bodyStyle={{ padding: '32px', textAlign: 'center' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)'
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '48px',
                        color: '#1565c0',
                        marginBottom: '16px',
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      {beneficio.icon}
                    </div>
                    <Title level={4} style={{ color: '#1a237e', marginBottom: '12px' }}>
                      {beneficio.title}
                    </Title>
                    <Paragraph style={{ color: '#666', lineHeight: '1.7' }}>
                      {beneficio.description}
                    </Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          <Divider />

          {/* Processo de Associação */}
          <div style={{ marginBottom: '48px' }}>
            <Title level={2} style={{ color: '#1a237e', marginBottom: '32px', textAlign: 'center' }}>
              {flags.preCadastroMode ? 'Como Funciona o Pré-Cadastro' : 'Processo de Associação'}
            </Title>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={6}>
                <Card
                  style={{
                    height: '100%',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    border: '1px solid #e0e0e0',
                    textAlign: 'center',
                  }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: '#1565c0',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      margin: '0 auto 16px',
                    }}
                  >
                    1
                  </div>
                  <Title level={4} style={{ color: '#1a237e', marginBottom: '8px' }}>
                    {flags.preCadastroMode ? 'Pré-Cadastro' : 'Cadastro'}
                  </Title>
                  <Paragraph style={{ color: '#666', fontSize: '14px' }}>
                    {flags.preCadastroMode 
                      ? 'Preencha o formulário de pré-cadastro para participar da AECAC'
                      : 'Preencha o formulário de cadastro com os dados da sua empresa'
                    }
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={6}>
                <Card
                  style={{
                    height: '100%',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    border: '1px solid #e0e0e0',
                    textAlign: 'center',
                  }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: '#1565c0',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      margin: '0 auto 16px',
                    }}
                  >
                    2
                  </div>
                  <Title level={4} style={{ color: '#1a237e', marginBottom: '8px' }}>
                    {flags.preCadastroMode ? 'Aguardar Contato' : 'Análise'}
                  </Title>
                  <Paragraph style={{ color: '#666', fontSize: '14px' }}>
                    {flags.preCadastroMode
                      ? 'Entraremos em contato assim que o lançamento oficial acontecer'
                      : 'Nossa equipe analisa o cadastro e verifica a documentação'
                    }
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={6}>
                <Card
                  style={{
                    height: '100%',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    border: '1px solid #e0e0e0',
                    textAlign: 'center',
                  }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: '#1565c0',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      margin: '0 auto 16px',
                    }}
                  >
                    3
                  </div>
                  <Title level={4} style={{ color: '#1a237e', marginBottom: '8px' }}>
                    {flags.preCadastroMode ? 'Lançamento' : 'Aprovação'}
                  </Title>
                  <Paragraph style={{ color: '#666', fontSize: '14px' }}>
                    {flags.preCadastroMode
                      ? 'No lançamento oficial, você terá prioridade para se associar'
                      : 'Após a aprovação, você receberá as credenciais de acesso'
                    }
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={6}>
                <Card
                  style={{
                    height: '100%',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    border: '1px solid #e0e0e0',
                    textAlign: 'center',
                  }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: '#00c853',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      margin: '0 auto 16px',
                    }}
                  >
                    <CheckCircleOutlined />
                  </div>
                  <Title level={4} style={{ color: '#1a237e', marginBottom: '8px' }}>
                    {flags.preCadastroMode ? 'Seja um Pioneiro' : 'Ativação'}
                  </Title>
                  <Paragraph style={{ color: '#666', fontSize: '14px' }}>
                    {flags.preCadastroMode
                      ? 'Seja um dos fundadores e ajude a construir a AECAC'
                      : 'Comece a aproveitar todos os benefícios da associação'
                    }
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </div>

          {/* CTA Final */}
          <Card
            style={{
              marginTop: '48px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '1px solid #e0e0e0',
              background: flags.preCadastroMode 
                ? 'linear-gradient(135deg, #00c853 0%, #00e676 100%)'
                : 'linear-gradient(135deg, #1a237e 0%, #1565c0 100%)',
              color: '#fff',
              textAlign: 'center',
            }}
            bodyStyle={{ padding: '48px' }}
          >
            <Title level={2} style={{ color: '#fff', marginBottom: '16px' }}>
              {flags.preCadastroMode ? '🚀 Seja um Pioneiro!' : 'Pronto para se Associar?'}
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', marginBottom: '32px' }}>
              {flags.preCadastroMode
                ? 'Faça seu pré-cadastro agora e tenha prioridade no lançamento oficial da AECAC'
                : 'Faça parte da AECAC e fortaleça seu negócio com uma rede de apoio e oportunidades exclusivas'
              }
            </Paragraph>
            <Button
              type="primary"
              size="large"
              icon={flags.preCadastroMode ? <RocketOutlined /> : <ArrowRightOutlined />}
              onClick={() => navigate('/cadastro-empresa')}
              style={{
                background: flags.preCadastroMode ? '#1a237e' : '#00c853',
                borderColor: flags.preCadastroMode ? '#1a237e' : '#00c853',
                height: '48px',
                padding: '0 32px',
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              {flags.preCadastroMode ? 'Fazer Pré-Cadastro Agora' : 'Cadastrar Minha Empresa'}
            </Button>
          </Card>
        </div>
      </div>
    </>
  )
}

export default ComoAssociar

