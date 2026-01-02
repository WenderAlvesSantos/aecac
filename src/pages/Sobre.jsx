import { useState, useEffect } from 'react'
import { Row, Col, Typography, Card, Timeline, Divider, Spin } from 'antd'
import {
  CheckCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
  HeartOutlined,
} from '@ant-design/icons'
import { getSobre, getDiretoria } from '../lib/api'

const { Title, Paragraph } = Typography

const Sobre = () => {
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
            Sobre a AECAC
          </Title>
          <Paragraph
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '18px',
            }}
          >
            Conheça nossa história, valores e o trabalho que desenvolvemos para
            fortalecer o comércio em Águas Claras
          </Paragraph>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div style={{ padding: '64px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* História */}
          <Row gutter={[32, 32]} style={{ marginBottom: '64px' }}>
            <Col xs={24} md={12}>
              <Card>
                <Title level={2}>Nossa História</Title>
                <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                  {sobre?.historia || 'A Associação Empresarial e Comercial de Águas Claras (AECAC) foi fundada com o objetivo de unir empresários e comerciantes da região, criando uma rede sólida de apoio mútuo e desenvolvimento conjunto.'}
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card>
                <Title level={2}>Nossos Valores</Title>
                {sobre?.valores && sobre.valores.length > 0 ? (
                  <Timeline
                    items={sobre.valores.map((valor, index) => ({
                      color: ['blue', 'green', 'red', 'orange'][index % 4],
                      children: (
                        <div>
                          <Title level={5}>
                            {typeof valor === 'string' ? valor : (valor.titulo || valor)}
                          </Title>
                          {typeof valor === 'object' && valor.descricao && (
                            <Paragraph>{valor.descricao}</Paragraph>
                          )}
                        </div>
                      ),
                    }))}
                  />
                ) : (
                  <Timeline
                    items={[
                      {
                        color: 'blue',
                        children: (
                          <div>
                            <Title level={5}>
                              <TeamOutlined /> União
                            </Title>
                            <Paragraph>
                              Acreditamos no poder da união e da colaboração entre
                              empresários.
                            </Paragraph>
                          </div>
                        ),
                      },
                      {
                        color: 'green',
                        children: (
                          <div>
                            <Title level={5}>
                              <TrophyOutlined /> Excelência
                            </Title>
                            <Paragraph>
                              Buscamos sempre a excelência em tudo que fazemos.
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
            <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
              Nossos Objetivos
            </Title>
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} md={8}>
                <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
                  <Title level={4}>Fortalecer o Comércio Local</Title>
                  <Paragraph>
                    Promover o crescimento e desenvolvimento das empresas
                    associadas através de ações estratégicas e parcerias.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
                  <Title level={4}>Facilitar Networking</Title>
                  <Paragraph>
                    Criar oportunidades para que empresários se conectem e
                    desenvolvam relacionamentos comerciais duradouros.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
                  <Title level={4}>Representar Interesses</Title>
                  <Paragraph>
                    Representar os interesses dos associados junto a órgãos
                    públicos e privados, defendendo políticas favoráveis ao
                    comércio.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
                  <Title level={4}>Promover Eventos</Title>
                  <Paragraph>
                    Organizar eventos, palestras e workshops para capacitação e
                    desenvolvimento dos associados.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
                  <Title level={4}>Desenvolver Parcerias</Title>
                  <Paragraph>
                    Estabelecer parcerias estratégicas que beneficiem os
                    associados e a comunidade local.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
                  <Title level={4}>Incentivar Inovação</Title>
                  <Paragraph>
                    Fomentar a inovação e modernização dos negócios locais
                    através de conhecimento e recursos compartilhados.
                  </Paragraph>
                </Card>
              </Col>
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
                  <Col xs={24} sm={12} md={8} key={membro._id}>
                    <Card hoverable style={{ textAlign: 'center' }}>
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
                          }}
                        >
                          <img
                            src={membro.foto}
                            alt={membro.nome}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              objectPosition: 'center',
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
                          }}
                        >
                          <TeamOutlined />
                        </div>
                      )}
                      <Title level={4}>{membro.cargo}</Title>
                      <Paragraph>{membro.nome}</Paragraph>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sobre

