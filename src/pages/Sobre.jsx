import { useState, useEffect } from 'react'
import { Row, Col, Typography, Card, Timeline, Divider, Spin } from 'antd'
import {
  TeamOutlined,
  TrophyOutlined,
  HeartOutlined,
  SafetyOutlined,
  GlobalOutlined,
  BulbOutlined,
  RocketOutlined,
} from '@ant-design/icons'
import { getSobre, getDiretoria } from '../lib/api'
import { useFeatureFlags } from '../contexts/FeatureFlagsContext'

const { Title, Paragraph } = Typography

const Sobre = () => {
  const { flags } = useFeatureFlags()
  const [sobre, setSobre] = useState(null)
  const [diretoria, setDiretoria] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [sobreRes, diretoriaRes] = await Promise.all([
        getSobre(),
        getDiretoria(),
      ])
      setSobre(sobreRes.data)
      setDiretoria(diretoriaRes.data)
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
          <Title level={1} style={{ color: '#fff', marginBottom: '16px', fontSize: window.innerWidth < 768 ? '32px' : '42px', fontWeight: 'bold', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            Sobre a AECAC
          </Title>
          <Paragraph
            style={{
              color: 'rgba(255,255,255,0.95)',
              fontSize: window.innerWidth < 768 ? '16px' : '20px',
              lineHeight: '1.8',
            }}
          >
            Conheça nossa história, valores e o trabalho que desenvolvemos para
            fortalecer o comércio em Águas Claras
          </Paragraph>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div style={{ padding: window.innerWidth < 768 ? '32px 16px' : '64px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* História */}
          <Row gutter={[32, 32]} style={{ marginBottom: '64px' }}>
            <Col xs={24} md={12}>
              <Card
                hoverable
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  border: '1px solid #e0e0e0',
                  height: '100%',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: '#fff',
                  opacity: 0,
                  transform: 'translateY(30px)',
                  animation: 'fadeInUp 0.6s ease-out 0.1s forwards',
                }}
                bodyStyle={{ padding: '32px' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(26, 35, 126, 0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                }}
              >
                <Title level={2} style={{ color: '#1a237e', marginBottom: '20px', fontSize: '26px', fontWeight: 'bold' }}>Nossa História</Title>
                <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', whiteSpace: 'pre-line', color: '#666' }}>
                  {sobre?.historia || 'A Associação Empresarial e Comercial de Águas Claras (AECAC) foi fundada com o objetivo de unir empresários e comerciantes da região, criando uma rede sólida de apoio mútuo e desenvolvimento conjunto.'}
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
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: '#fff',
                  opacity: 0,
                  transform: 'translateY(30px)',
                  animation: 'fadeInUp 0.6s ease-out 0.2s forwards',
                }}
                bodyStyle={{ padding: '32px' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(21, 101, 192, 0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                }}
              >
                <Title level={2} style={{ marginBottom: '32px' }}>Nossos Valores</Title>
                {sobre?.valores && sobre.valores.length > 0 ? (
                  <Timeline
                    mode="left"
                    items={sobre.valores.map((valor, index) => {
                      const valorTitulo = typeof valor === 'string' ? valor : (valor.titulo || valor)
                      const valorDescricao = typeof valor === 'object' && valor.descricao ? valor.descricao : null
                      const icons = [TeamOutlined, TrophyOutlined, HeartOutlined, SafetyOutlined, GlobalOutlined, BulbOutlined]
                      const colors = ['blue', 'green', 'red', 'orange', 'purple', 'cyan']
                      const IconComponent = icons[index % icons.length]
                      const color = colors[index % colors.length]
                      
                      return {
                        color: color,
                        dot: <IconComponent style={{ fontSize: '20px' }} />,
                        children: (
                          <div>
                            <Title level={5} style={{ marginBottom: '8px' }}>
                              {valorTitulo}
                            </Title>
                            {valorDescricao && (
                              <Paragraph style={{ marginBottom: 0, fontSize: '14px', color: '#666' }}>
                                {valorDescricao}
                              </Paragraph>
                            )}
                          </div>
                        ),
                      }
                    })}
                  />
                ) : (
                  <Timeline
                    mode="left"
                    items={[
                      {
                        color: 'blue',
                        dot: <TeamOutlined style={{ fontSize: '20px' }} />,
                        children: (
                          <div>
                            <Title level={5} style={{ marginBottom: '8px' }}>
                              União
                            </Title>
                            <Paragraph style={{ marginBottom: 0, fontSize: '14px', color: '#666' }}>
                              Acreditamos no poder da união e da colaboração entre empresários.
                            </Paragraph>
                          </div>
                        ),
                      },
                      {
                        color: 'green',
                        dot: <TrophyOutlined style={{ fontSize: '20px' }} />,
                        children: (
                          <div>
                            <Title level={5} style={{ marginBottom: '8px' }}>
                              Excelência
                            </Title>
                            <Paragraph style={{ marginBottom: 0, fontSize: '14px', color: '#666' }}>
                              Buscamos sempre a excelência em tudo que fazemos.
                            </Paragraph>
                          </div>
                        ),
                      },
                      {
                        color: 'red',
                        dot: <HeartOutlined style={{ fontSize: '20px' }} />,
                        children: (
                          <div>
                            <Title level={5} style={{ marginBottom: '8px' }}>
                              Comprometimento
                            </Title>
                            <Paragraph style={{ marginBottom: 0, fontSize: '14px', color: '#666' }}>
                              Dedicamos-nos integralmente ao desenvolvimento do comércio local.
                            </Paragraph>
                          </div>
                        ),
                      },
                      {
                        color: 'orange',
                        dot: <SafetyOutlined style={{ fontSize: '20px' }} />,
                        children: (
                          <div>
                            <Title level={5} style={{ marginBottom: '8px' }}>
                              Transparência
                            </Title>
                            <Paragraph style={{ marginBottom: 0, fontSize: '14px', color: '#666' }}>
                              Agimos com transparência e ética em todas as nossas ações.
                            </Paragraph>
                          </div>
                        ),
                      },
                    ]}
                  />
                )}
              </Card>
            </Col>
          </Row>

          <Divider />

          {/* Missão e Visão */}
          <div style={{ marginBottom: '64px' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
              Missão e Visão
            </Title>
            <Row gutter={[32, 32]}>
              <Col xs={24} md={12}>
                <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
                  <Title level={3}>Missão</Title>
                  <Paragraph style={{ fontSize: '16px', whiteSpace: 'pre-line' }}>
                    {sobre?.missao || 'Promover o desenvolvimento econômico e social de Águas Claras, fortalecendo os laços entre empresários e criando um ambiente propício para o crescimento dos negócios locais.'}
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
                  <Title level={3}>Visão</Title>
                  <Paragraph style={{ fontSize: '16px', whiteSpace: 'pre-line' }}>
                    {sobre?.visao || 'Ser a principal referência em associação empresarial na região de Águas Claras, reconhecida pela excelência em representar e fortalecer o setor comercial local.'}
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </div>

          <Divider />

          {/* Objetivos */}
          <div style={{ marginBottom: '64px' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: '48px', color: '#1a237e', fontSize: '32px', fontWeight: 'bold' }}>
              Nossos Objetivos
            </Title>
            <Row gutter={[24, 24]}>
              {[
                { title: 'Fortalecer o Comércio Local', color: '#1a237e', text: 'Promover o crescimento e desenvolvimento das empresas associadas através de ações estratégicas e parcerias.' },
                { title: 'Facilitar Networking', color: '#1565c0', text: 'Criar oportunidades para que empresários se conectem e desenvolvam relacionamentos comerciais duradouros.' },
                { title: 'Representar Interesses', color: '#00c853', text: 'Representar os interesses dos associados junto a órgãos públicos e privados, defendendo políticas favoráveis ao comércio.' },
                { title: 'Promover Eventos', color: '#42a5f5', text: 'Organizar eventos, palestras e workshops para capacitação e desenvolvimento dos associados.' },
                { title: 'Desenvolver Parcerias', color: '#1a237e', text: 'Estabelecer parcerias estratégicas que beneficiem os associados e a comunidade local.' },
                { title: 'Incentivar Inovação', color: '#1565c0', text: 'Fomentar a inovação e modernização dos negócios locais através de conhecimento e recursos compartilhados.' },
              ].map((item, index) => (
                <Col xs={24} sm={12} md={8} key={index}>
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
                      animation: `fadeInUp 0.6s ease-out ${0.5 + index * 0.1}s forwards`,
                    }}
                    bodyStyle={{ padding: '28px', position: 'relative', zIndex: 1 }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)'
                      e.currentTarget.style.boxShadow = `0 12px 24px ${item.color}33`
                      const overlay = e.currentTarget.querySelector('.card-overlay')
                      if (overlay) overlay.style.opacity = '1'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                      const overlay = e.currentTarget.querySelector('.card-overlay')
                      if (overlay) overlay.style.opacity = '0'
                    }}
                  >
                    <div
                      className="card-overlay"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(135deg, ${item.color}08 0%, ${item.color}15 100%)`,
                        opacity: 0,
                        transition: 'opacity 0.4s ease',
                        zIndex: 0,
                      }}
                    />
                    <Title level={4} style={{ color: item.color, marginBottom: '16px', fontSize: '18px', fontWeight: '600', position: 'relative', zIndex: 1 }}>
                      {item.title}
                    </Title>
                    <Paragraph style={{ color: '#666', fontSize: '15px', lineHeight: '1.7', margin: 0, position: 'relative', zIndex: 1 }}>
                      {item.text}
                    </Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          <Divider />

          {/* Diretoria */}
          {diretoria.length > 0 && (
            <div>
              <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
                Nossa Diretoria
              </Title>
              <Row gutter={[24, 24]} justify="center">
                {diretoria.map((membro) => (
                  <Col xs={24} sm={12} md={8} key={membro._id} style={{ display: 'flex' }}>
                    <Card 
                      hoverable 
                      style={{ 
                        textAlign: 'center',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: '380px',
                      }}
                      bodyStyle={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        padding: '24px',
                      }}
                    >
                      {membro.foto ? (
                        <div
                          style={{
                            width: '180px',
                            height: '180px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            margin: '0 auto 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#f0f0f0',
                            position: 'relative',
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={membro.foto}
                            alt={membro.nome}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              objectPosition: 'center center',
                              display: 'block',
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            width: '180px',
                            height: '180px',
                            borderRadius: '50%',
                            background: '#f0f0f0',
                            margin: '0 auto 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '64px',
                            color: '#1890ff',
                            flexShrink: 0,
                          }}
                        >
                          <TeamOutlined />
                        </div>
                      )}
                      <Title level={4} style={{ marginBottom: '8px', flexShrink: 0 }}>{membro.cargo}</Title>
                      <Paragraph style={{ marginBottom: 0, flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>{membro.nome}</Paragraph>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}

export default Sobre

