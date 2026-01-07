import { useState, useEffect, useMemo } from 'react'
import { Card, Row, Col, Typography, Space, Tag, Empty, Statistic, Progress, List, Spin } from 'antd'
import {
  GiftOutlined,
  BookOutlined,
  CalendarOutlined,
  ShoppingOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getBeneficios, getCapacitacoes, getEventos, getResgates } from '../../lib/api'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const AssociadoDashboard = () => {
  const navigate = useNavigate()
  const [beneficios, setBeneficios] = useState([])
  const [capacitacoes, setCapacitacoes] = useState([])
  const [eventos, setEventos] = useState([])
  const [resgates, setResgates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [beneficiosRes, capacitacoesRes, eventosRes, resgatesRes] = await Promise.all([
        getBeneficios().catch(() => ({ data: [] })),
        getCapacitacoes().catch(() => ({ data: [] })),
        getEventos().catch(() => ({ data: [] })),
        getResgates().catch(() => ({ data: [] }))
      ])

      setBeneficios(beneficiosRes.data || [])
      setCapacitacoes(capacitacoesRes.data || [])
      setEventos(eventosRes.data || [])
      setResgates(resgatesRes.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const totalBeneficios = beneficios.length
    const totalCapacitacoes = capacitacoes.length
    const totalEventos = eventos.length
    const totalResgates = resgates.length


    // Top 5 benefícios mais resgatados
    const beneficioResgates = {}
    resgates.forEach(resgate => {
      const beneficioId = resgate.beneficio?._id || resgate.beneficioId
      if (beneficioId) {
        beneficioResgates[beneficioId] = (beneficioResgates[beneficioId] || 0) + 1
      }
    })

    const topBeneficios = Object.entries(beneficioResgates)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, count]) => {
        const beneficio = beneficios.find(b => b._id === id)
        return beneficio ? { ...beneficio, count } : null
      })
      .filter(Boolean)

    // Próximos eventos e capacitações
    const hoje = dayjs()
    const proximosEventos = eventos
      .filter(e => e.data && dayjs(e.data) >= hoje)
      .sort((a, b) => dayjs(a.data) - dayjs(b.data))
      .slice(0, 5)

    const proximasCapacitacoes = capacitacoes
      .filter(c => c.data && dayjs(c.data) >= hoje)
      .sort((a, b) => dayjs(a.data) - dayjs(b.data))
      .slice(0, 5)

    // Resgates por mês (últimos 6 meses)
    const mesesAtras = 6
    const resgatesPorMes = []
    for (let i = mesesAtras - 1; i >= 0; i--) {
      const mes = dayjs().subtract(i, 'month')
      const mesInicio = mes.startOf('month')
      const mesFim = mes.endOf('month')
      const count = resgates.filter(r => {
        const dataResgate = dayjs(r.dataResgate)
        return dataResgate >= mesInicio && dataResgate <= mesFim
      }).length
      resgatesPorMes.push({
        mes: mes.format('MMM/YYYY'),
        count
      })
    }

    return {
      totalBeneficios,
      totalCapacitacoes,
      totalEventos,
      totalResgates,
      topBeneficios,
      proximosEventos,
      proximasCapacitacoes,
      resgatesPorMes
    }
  }, [beneficios, capacitacoes, eventos, resgates])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: '24px' }}>Dashboard</Title>

      {/* Cards de Estatísticas */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total de Benefícios"
              value={stats.totalBeneficios}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total de Capacitações"
              value={stats.totalCapacitacoes}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total de Eventos"
              value={stats.totalEventos}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total de Resgates"
              value={stats.totalResgates}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Resumo de Resgates */}
        <Col xs={24} lg={12}>
          <Card title="Resumo de Resgates" style={{ height: '100%' }}>
            {stats.totalResgates > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    Total de resgates realizados por clientes
                  </Text>
                  <div style={{ marginTop: '16px' }}>
                    <Statistic
                      title="Total de Resgates"
                      value={stats.totalResgates}
                      valueStyle={{ fontSize: '32px', color: '#1890ff' }}
                    />
                  </div>
                </div>
              </Space>
            ) : (
              <Empty description="Nenhum resgate realizado ainda" />
            )}
          </Card>
        </Col>

        {/* Top 5 Benefícios Mais Resgatados */}
        <Col xs={24} lg={12}>
          <Card 
            title="Top 5 Benefícios Mais Resgatados"
            extra={
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {stats.totalResgates} resgate{stats.totalResgates !== 1 ? 's' : ''} total
              </Text>
            }
            style={{ height: '100%' }}
          >
            {stats.topBeneficios.length > 0 ? (
              <List
                dataSource={stats.topBeneficios}
                renderItem={(item, index) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Tag color="orange">#{index + 1}</Tag>
                          <Text strong>{item.titulo}</Text>
                        </Space>
                      }
                      description={
                        <Space>
                          <Text type="secondary">{item.count} resgate{item.count !== 1 ? 's' : ''}</Text>
                          {item.codigo && <Tag>Código: {item.codigo}</Tag>}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Nenhum benefício foi resgatado ainda" />
            )}
          </Card>
        </Col>

        {/* Próximos Eventos */}
        <Col xs={24} lg={12}>
          <Card 
            title="Próximos Eventos"
            extra={
              <Text type="secondary" style={{ fontSize: '12px', cursor: 'pointer' }} onClick={() => navigate('/associado/eventos')}>
                Ver todos
              </Text>
            }
            style={{ height: '100%' }}
          >
            {stats.proximosEventos.length > 0 ? (
              <List
                dataSource={stats.proximosEventos}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>{item.titulo}</Text>
                          {item.categoria && <Tag>{item.categoria}</Tag>}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small">
                          <Text type="secondary">
                            {dayjs(item.data).format('DD/MM/YYYY')} {item.hora && `às ${item.hora}`}
                          </Text>
                          {item.local && <Text type="secondary"><CalendarOutlined /> {item.local}</Text>}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Nenhum evento próximo" />
            )}
          </Card>
        </Col>

        {/* Próximas Capacitações */}
        <Col xs={24} lg={12}>
          <Card 
            title="Próximas Capacitações"
            extra={
              <Text type="secondary" style={{ fontSize: '12px', cursor: 'pointer' }} onClick={() => navigate('/associado/capacitacoes')}>
                Ver todas
              </Text>
            }
            style={{ height: '100%' }}
          >
            {stats.proximasCapacitacoes.length > 0 ? (
              <List
                dataSource={stats.proximasCapacitacoes}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>{item.titulo}</Text>
                          {item.tipo && <Tag>{item.tipo}</Tag>}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small">
                          <Text type="secondary">
                            {dayjs(item.data).format('DD/MM/YYYY HH:mm')}
                          </Text>
                          {item.local && <Text type="secondary"><CalendarOutlined /> {item.local}</Text>}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Nenhuma capacitação próxima" />
            )}
          </Card>
        </Col>

        {/* Resgates por Mês */}
        <Col xs={24}>
          <Card title="Resgates nos Últimos 6 Meses">
            {stats.resgatesPorMes.some(r => r.count > 0) ? (
              <Row gutter={[16, 16]}>
                {stats.resgatesPorMes.map((item, index) => {
                  const maxCount = Math.max(...stats.resgatesPorMes.map(r => r.count), 1)
                  const percent = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                  
                  return (
                    <Col xs={24} sm={12} md={8} lg={4} key={index}>
                      <Card size="small">
                        <Statistic
                          title={item.mes}
                          value={item.count}
                          valueStyle={{ fontSize: '20px' }}
                        />
                        <Progress 
                          percent={percent} 
                          strokeColor="#fa8c16" 
                          showInfo={false}
                          style={{ marginTop: '8px' }}
                        />
                      </Card>
                    </Col>
                  )
                })}
              </Row>
            ) : (
              <Empty description="Nenhum resgate nos últimos 6 meses" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AssociadoDashboard
