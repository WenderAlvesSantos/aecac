import { useState, useEffect } from 'react'
import { Row, Col, Typography, Card, Tag, Space, Button, Calendar, Badge, Spin, Empty } from 'antd'
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { getEventos } from '../lib/api'

const { Title, Paragraph } = Typography

const Eventos = () => {
  const [viewMode, setViewMode] = useState('list') // 'list' ou 'calendar'
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEventos()
  }, [])

  const loadEventos = async () => {
    try {
      const response = await getEventos()
      setEventos(response.data)
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
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

  // Dados de exemplo - fallback
  const fallbackEventos = [
    {
      id: 1,
      titulo: 'Workshop de Inovação Empresarial',
      descricao: 'Workshop sobre inovação e transformação digital para empresas',
      data: '2024-03-15',
      hora: '14:00',
      local: 'Auditório AECAC - Águas Claras',
      categoria: 'Workshop',
      palestrante: 'Dr. João Silva',
      vagas: 50,
      vagasDisponiveis: 12,
    },
    {
      id: 2,
      titulo: 'Networking Empresarial',
      descricao: 'Encontro mensal de networking entre empresários associados',
      data: '2024-03-20',
      hora: '18:30',
      local: 'Hotel Águas Claras',
      categoria: 'Networking',
      palestrante: null,
      vagas: 100,
      vagasDisponiveis: 45,
    },
    {
      id: 3,
      titulo: 'Palestra: Marketing Digital',
      descricao: 'Como usar marketing digital para alavancar seus negócios',
      data: '2024-03-25',
      hora: '19:00',
      local: 'Centro de Convenções',
      categoria: 'Palestra',
      palestrante: 'Maria Santos',
      vagas: 80,
      vagasDisponiveis: 30,
    },
    {
      id: 4,
      titulo: 'Feira Comercial de Águas Claras',
      descricao: 'Feira anual com exposição de produtos e serviços locais',
      data: '2024-04-10',
      hora: '09:00',
      local: 'Parque de Águas Claras',
      categoria: 'Feira',
      palestrante: null,
      vagas: 500,
      vagasDisponiveis: 200,
    },
    {
      id: 5,
      titulo: 'Workshop de Gestão Financeira',
      descricao: 'Aprenda a gerenciar as finanças da sua empresa',
      data: '2024-04-15',
      hora: '14:00',
      local: 'Auditório AECAC - Águas Claras',
      categoria: 'Workshop',
      palestrante: 'Carlos Mendes',
      vagas: 40,
      vagasDisponiveis: 15,
    },
  ]

  const getCategoryColor = (categoria) => {
    const colors = {
      Workshop: 'blue',
      Networking: 'green',
      Palestra: 'purple',
      Feira: 'orange',
      'Reunião': 'cyan',
    }
    return colors[categoria] || 'default'
  }

  const eventosFuturos = eventos.filter((evento) => 
    dayjs(evento.data).isAfter(dayjs(), 'day') || dayjs(evento.data).isSame(dayjs(), 'day')
  )

  const eventosPassados = eventos.filter((evento) => 
    dayjs(evento.data).isBefore(dayjs(), 'day')
  )

  const getDateCellData = (value) => {
    if (!value) return null
    const dateStr = value.format('YYYY-MM-DD')
    const eventosDoDia = eventos.filter((e) => {
      if (!e.data) return false
      return dayjs(e.data).format('YYYY-MM-DD') === dateStr
    })
    
    if (eventosDoDia.length === 0) return null
    
    return (
      <div style={{ fontSize: '12px' }}>
        {eventosDoDia.map((evento, index) => (
          <Badge
            key={index}
            status="success"
            text={
              <span style={{ fontSize: '11px' }}>
                {evento.titulo.length > 20 
                  ? evento.titulo.substring(0, 20) + '...' 
                  : evento.titulo}
              </span>
            }
          />
        ))}
      </div>
    )
  }

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
            Eventos
          </Title>
          <Paragraph
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '18px',
            }}
          >
            Confira nossos eventos, workshops, palestras e encontros
            empresariais
          </Paragraph>
        </div>
      </div>

      {/* Toggle View Mode */}
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Space>
          <Button
            type={viewMode === 'list' ? 'primary' : 'default'}
            onClick={() => setViewMode('list')}
          >
            Lista
          </Button>
          <Button
            type={viewMode === 'calendar' ? 'primary' : 'default'}
            onClick={() => setViewMode('calendar')}
          >
            Calendário
          </Button>
        </Space>
      </div>

      <div style={{ padding: '0 24px 64px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {viewMode === 'list' ? (
            <>
              {/* Eventos Futuros */}
              {eventosFuturos.length === 0 && eventosPassados.length === 0 ? (
                <Empty description="Nenhum evento cadastrado" />
              ) : eventosFuturos.length > 0 && (
                <div style={{ marginBottom: '48px' }}>
                  <Title level={2} style={{ marginBottom: '24px' }}>
                    Próximos Eventos
                  </Title>
                  <Row gutter={[24, 24]}>
                    {eventosFuturos.map((evento) => (
                      <Col xs={24} md={12} key={evento._id}>
                        <Card
                          hoverable
                          style={{
                            height: '100%',
                            borderRadius: '8px',
                          }}
                        >
                          <div style={{ marginBottom: '16px' }}>
                            <Space>
                              <Tag color={getCategoryColor(evento.categoria)}>
                                {evento.categoria}
                              </Tag>
                              {evento.vagasDisponiveis > 0 ? (
                                <Tag color="green">
                                  {evento.vagasDisponiveis} vagas disponíveis
                                </Tag>
                              ) : (
                                <Tag color="red">Esgotado</Tag>
                              )}
                            </Space>
                          </div>
                          <Title level={4} style={{ marginBottom: '12px' }}>
                            {evento.titulo}
                          </Title>
                          <Paragraph style={{ marginBottom: '16px' }}>
                            {evento.descricao}
                          </Paragraph>
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <div>
                              <CalendarOutlined style={{ marginRight: '8px' }} />
                              <span>
                                {dayjs(evento.data).format('DD/MM/YYYY')}
                              </span>
                            </div>
                            <div>
                              <ClockCircleOutlined style={{ marginRight: '8px' }} />
                              <span>{evento.hora}</span>
                            </div>
                            <div>
                              <EnvironmentOutlined style={{ marginRight: '8px' }} />
                              <span>{evento.local}</span>
                            </div>
                            {evento.palestrante && (
                              <div>
                                <UserOutlined style={{ marginRight: '8px' }} />
                                <span>Palestrante: {evento.palestrante}</span>
                              </div>
                            )}
                          </Space>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}

              {/* Eventos Passados */}
              {eventosPassados.length > 0 && (
                <div>
                  <Title level={2} style={{ marginBottom: '24px' }}>
                    Eventos Realizados
                  </Title>
                  <Row gutter={[24, 24]}>
                    {eventosPassados.map((evento) => (
                      <Col xs={24} md={12} key={evento._id}>
                        <Card
                          style={{
                            height: '100%',
                            borderRadius: '8px',
                            opacity: 0.7,
                          }}
                        >
                          <Tag color="default" style={{ marginBottom: '16px' }}>
                            Realizado
                          </Tag>
                          <Title level={4} style={{ marginBottom: '12px' }}>
                            {evento.titulo}
                          </Title>
                          <Paragraph style={{ marginBottom: '16px' }}>
                            {evento.descricao}
                          </Paragraph>
                          <Space direction="vertical" size="small">
                            <div>
                              <CalendarOutlined style={{ marginRight: '8px' }} />
                              <span>
                                {dayjs(evento.data).format('DD/MM/YYYY')}
                              </span>
                            </div>
                            <div>
                              <EnvironmentOutlined style={{ marginRight: '8px' }} />
                              <span>{evento.local}</span>
                            </div>
                          </Space>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </>
          ) : (
            <Card>
              <Calendar
                cellRender={(value) => getDateCellData(value)}
                style={{ background: '#fff' }}
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default Eventos

