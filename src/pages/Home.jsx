import { useState, useEffect } from 'react'
import { Row, Col, Typography, Button, Card, Statistic, Space } from 'antd'
import {
  TeamOutlined,
  ShopOutlined,
  TrophyOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getSobre, getEmpresas, getParceiros } from '../lib/api'

const { Title, Paragraph } = Typography

const Home = () => {
  const navigate = useNavigate()
  const [sobre, setSobre] = useState(null)
  const [stats, setStats] = useState({
    empresas: 0,
    parceiros: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [sobreRes, empresasRes, parceirosRes] = await Promise.all([
        getSobre(),
        getEmpresas(),
        getParceiros(),
      ])
      setSobre(sobreRes.data)
      setStats({
        empresas: empresasRes.data.length,
        parceiros: parceirosRes.data.length,
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          padding: '120px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Title
            level={1}
            style={{ color: '#fff', fontSize: '48px', marginBottom: '24px' }}
          >
            AECAC
          </Title>
          <Title
            level={2}
            style={{ color: '#fff', fontWeight: 'normal', marginBottom: '16px' }}
          >
            Associação Empresarial e Comercial de Águas Claras
          </Title>
          <Paragraph
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '18px',
              marginBottom: '32px',
            }}
          >
            Conectando empresários e fortalecendo o comércio em Águas Claras -
            DF. Juntos construímos um futuro próspero para nossa região.
          </Paragraph>
          <Space size="large">
            <Button
              type="primary"
              size="large"
              onClick={() => navigate('/sobre')}
            >
              Conheça Mais
            </Button>
            <Button
              size="large"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
              onClick={() => navigate('/empresas')}
            >
              Ver Empresas
            </Button>
          </Space>
        </div>
      </div>

      {/* Estatísticas */}
      <div style={{ padding: '64px 24px', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row gutter={[32, 32]}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Empresas Associadas"
                  value={stats.empresas}
                  prefix={<ShopOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Parceiros Estratégicos"
                  value={stats.parceiros}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Anos de Atuação"
                  value={10}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Eventos Realizados"
                  value={50}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Missão e Visão */}
      <div style={{ padding: '64px 24px', background: '#f0f2f5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
            Nossa Missão
          </Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <Card
                hoverable
                style={{ height: '100%', textAlign: 'center' }}
              >
                <Title level={3}>Missão</Title>
                <Paragraph style={{ fontSize: '16px', whiteSpace: 'pre-line' }}>
                  {sobre?.missao || 'Promover o desenvolvimento econômico e social de Águas Claras, fortalecendo os laços entre empresários e criando um ambiente propício para o crescimento dos negócios locais.'}
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                hoverable
                style={{ height: '100%', textAlign: 'center' }}
              >
                <Title level={3}>Visão</Title>
                <Paragraph style={{ fontSize: '16px', whiteSpace: 'pre-line' }}>
                  {sobre?.visao || 'Ser a principal referência em associação empresarial na região de Águas Claras, reconhecida pela excelência em representar e fortalecer o setor comercial local.'}
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Benefícios */}
      <div style={{ padding: '64px 24px', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
            Por que se associar?
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable>
                <Title level={4}>Networking</Title>
                <Paragraph>
                  Conecte-se com outros empresários e expanda sua rede de
                  contatos profissionais.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable>
                <Title level={4}>Visibilidade</Title>
                <Paragraph>
                  Aumente a visibilidade da sua empresa na região de Águas
                  Claras.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable>
                <Title level={4}>Eventos</Title>
                <Paragraph>
                  Participe de eventos exclusivos, palestras e workshops para
                  desenvolvimento empresarial.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable>
                <Title level={4}>Representação</Title>
                <Paragraph>
                  Tenha voz ativa nas decisões que impactam o comércio local.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable>
                <Title level={4}>Descontos</Title>
                <Paragraph>
                  Aproveite descontos especiais em produtos e serviços de
                  parceiros.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable>
                <Title level={4}>Suporte</Title>
                <Paragraph>
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
          background: '#1890ff',
          color: '#fff',
          padding: '64px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Title level={2} style={{ color: '#fff', marginBottom: '16px' }}>
            Faça parte da AECAC
          </Title>
          <Paragraph
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '18px',
              marginBottom: '32px',
            }}
          >
            Junte-se a nós e fortaleça seu negócio junto com outros empresários
            de Águas Claras.
          </Paragraph>
          <Button
            type="default"
            size="large"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate('/sobre')}
            style={{ background: '#fff', color: '#1890ff' }}
          >
            Saiba Como Associar-se
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Home

