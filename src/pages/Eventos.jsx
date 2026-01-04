import { useState, useEffect } from 'react'
import { Row, Col, Typography, Card, Tag, Space, Button, Calendar, Badge, Spin, Empty, Modal, Form, Input, message, Statistic, Select, Pagination } from 'antd'
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { getEventos, inscreverEventoPublico, getEmpresas } from '../lib/api'

const { Title, Paragraph } = Typography

// Função para formatar CPF
const formatCPF = (value) => {
  if (!value) return ''
  const numbers = value.replace(/\D/g, '').slice(0, 11)
  if (numbers.length <= 11) {
    return numbers.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
      .replace(/^(\d{3})(\d{3})(\d{3})$/, '$1.$2.$3')
      .replace(/^(\d{3})(\d{3})$/, '$1.$2')
      .replace(/^(\d{3})$/, '$1')
  }
  return value
}

// Função para formatar telefone
const formatPhone = (value) => {
  if (!value) return ''
  const numbers = value.replace(/\D/g, '').slice(0, 11)
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  } else {
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  }
}

const Eventos = () => {
  const [viewMode, setViewMode] = useState('list') // 'list' ou 'calendar'
  const [eventos, setEventos] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalInscricaoPublica, setModalInscricaoPublica] = useState(false)
  const [eventoSelecionado, setEventoSelecionado] = useState(null)
  const [inscricaoLoading, setInscricaoLoading] = useState(false)
  const [formInscricaoPublica] = Form.useForm()
  const [filtroEmpresa, setFiltroEmpresa] = useState(null)
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [itensPorPagina] = useState(6)

  useEffect(() => {
    loadEventos()
    loadEmpresas()
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

  const loadEmpresas = async () => {
    try {
      const response = await getEmpresas()
      const empresasAprovadas = response.data.filter(emp => emp.status === 'aprovado')
      setEmpresas(empresasAprovadas)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    }
  }

  const handleInscricaoPublica = async (values) => {
    if (!eventoSelecionado) return

    setInscricaoLoading(true)
    try {
      const cpfLimpo = values.cpf.replace(/\D/g, '')
      const telefoneLimpo = values.telefone.replace(/\D/g, '')
      
      await inscreverEventoPublico(
        eventoSelecionado._id,
        values.nome,
        cpfLimpo,
        telefoneLimpo
      )
      message.success('Inscrição realizada com sucesso!')
      setModalInscricaoPublica(false)
      formInscricaoPublica.resetFields()
      setEventoSelecionado(null)
      loadEventos()
    } catch (error) {
      message.error(error.response?.data?.error || 'Erro ao realizar inscrição')
    } finally {
      setInscricaoLoading(false)
    }
  }

  const abrirModalInscricaoPublica = (evento) => {
    setEventoSelecionado(evento)
    setModalInscricaoPublica(true)
  }

  if (loading) {
    return (
      <div style={{ padding: '100px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    )
  }

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
              {/* Filtros */}
              <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Select
                  showSearch
                  placeholder="Filtrar por Empresa"
                  optionFilterProp="children"
                  style={{ minWidth: '250px' }}
                  allowClear
                  value={filtroEmpresa}
                  onChange={(value) => {
                    setFiltroEmpresa(value)
                    setPaginaAtual(1)
                  }}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={empresas.map(empresa => ({
                    value: empresa._id,
                    label: empresa.nome
                  }))}
                />
              </div>

              {/* Eventos filtrados e paginados */}
              {(() => {
                // Filtrar por empresa
                const eventosFiltrados = filtroEmpresa
                  ? eventos.filter(e => {
                      const empresaId = e.empresaId?.toString()
                      const filtroId = filtroEmpresa.toString()
                      return empresaId === filtroId
                    })
                  : eventos

                const eventosFuturosFiltrados = eventosFiltrados.filter((evento) => 
                  dayjs(evento.data).isAfter(dayjs(), 'day') || dayjs(evento.data).isSame(dayjs(), 'day')
                )
                const eventosPassadosFiltrados = eventosFiltrados.filter((evento) => 
                  dayjs(evento.data).isBefore(dayjs(), 'day')
                )

                // Calcular paginação para eventos futuros
                const totalFuturos = eventosFuturosFiltrados.length
                const inicioFuturos = (paginaAtual - 1) * itensPorPagina
                const fimFuturos = inicioFuturos + itensPorPagina
                const eventosFuturosPaginados = eventosFuturosFiltrados.slice(inicioFuturos, fimFuturos)

                return (
                  <>
                    {/* Eventos Futuros */}
                    {eventosFuturosFiltrados.length === 0 && eventosPassadosFiltrados.length === 0 ? (
                      <Empty description={filtroEmpresa ? "Nenhum evento encontrado para esta empresa" : "Nenhum evento cadastrado"} />
                    ) : eventosFuturosPaginados.length > 0 && (
                      <div style={{ marginBottom: '48px' }}>
                        <Title level={2} style={{ marginBottom: '24px' }}>
                          Próximos Eventos
                        </Title>
                        <Row gutter={[24, 24]}>
                          {eventosFuturosPaginados.map((evento) => (
                      <Col xs={24} md={12} key={evento._id}>
                        <Card
                          hoverable
                          style={{
                            height: '100%',
                            borderRadius: '8px',
                          }}
                          cover={
                            evento.empresa?.imagem ? (
                              <img
                                alt={evento.empresa.nome}
                                src={evento.empresa.imagem}
                                style={{
                                  height: '200px',
                                  objectFit: 'cover',
                                }}
                              />
                            ) : null
                          }
                        >
                          <div style={{ marginBottom: '16px' }}>
                            <Space>
                              <Tag color={getCategoryColor(evento.categoria)}>
                                {evento.categoria}
                              </Tag>
                              {evento.vagasDisponiveis !== undefined && evento.vagasDisponiveis > 0 ? (
                                <Tag color="green">
                                  {evento.vagasDisponiveis} vagas disponíveis
                                </Tag>
                              ) : evento.vagas ? (
                                <Tag color="red">Esgotado</Tag>
                              ) : null}
                            </Space>
                          </div>
                          <Title level={4} style={{ marginBottom: '12px' }}>
                            {evento.titulo}
                          </Title>
                          {evento.empresa?.nome && (
                            <div style={{ marginBottom: '12px', color: '#666', fontSize: '14px' }}>
                              <strong>{evento.empresa.nome}</strong>
                            </div>
                          )}
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
                          <div style={{ marginTop: '16px' }}>
                            <Button
                              type="primary"
                              block
                              onClick={() => abrirModalInscricaoPublica(evento)}
                              disabled={evento.vagas && (evento.vagasDisponiveis !== undefined ? evento.vagasDisponiveis : evento.vagas) <= 0}
                            >
                              Inscrever-se
                            </Button>
                          </div>
                        </Card>
                      </Col>
                          ))}
                        </Row>
                        {totalFuturos > itensPorPagina && (
                          <div style={{ marginTop: '32px', textAlign: 'center' }}>
                            <Pagination
                              current={paginaAtual}
                              total={totalFuturos}
                              pageSize={itensPorPagina}
                              onChange={(page) => setPaginaAtual(page)}
                              showSizeChanger={false}
                              showTotal={(total, range) => `${range[0]}-${range[1]} de ${total} eventos`}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Eventos Passados - não paginados, apenas filtrados */}
                    {eventosPassadosFiltrados.length > 0 && (
                      <div>
                        <Title level={2} style={{ marginBottom: '24px' }}>
                          Eventos Realizados
                        </Title>
                        <Row gutter={[24, 24]}>
                          {eventosPassadosFiltrados.map((evento) => (
                            <Col xs={24} md={12} key={evento._id}>
                              <Card
                                style={{
                                  height: '100%',
                                  borderRadius: '8px',
                                  opacity: 0.7,
                                }}
                                cover={
                                  evento.empresa?.imagem ? (
                                    <img
                                      alt={evento.empresa.nome}
                                      src={evento.empresa.imagem}
                                      style={{
                                        height: '200px',
                                        objectFit: 'cover',
                                      }}
                                    />
                                  ) : null
                                }
                              >
                                <Tag color="default" style={{ marginBottom: '16px' }}>
                                  Realizado
                                </Tag>
                                <Title level={4} style={{ marginBottom: '12px' }}>
                                  {evento.titulo}
                                </Title>
                                {evento.empresa?.nome && (
                                  <div style={{ marginBottom: '12px', color: '#666', fontSize: '14px' }}>
                                    <strong>{evento.empresa.nome}</strong>
                                  </div>
                                )}
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
                )
              })()}
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

      {/* Modal de Inscrição Pública */}
      <Modal
        title={
          <div>
            <div>Inscrever-se no Evento</div>
            {eventoSelecionado && (
              <div style={{ fontSize: '14px', fontWeight: 'normal', marginTop: '4px', color: '#666' }}>
                {eventoSelecionado.titulo}
              </div>
            )}
          </div>
        }
        open={modalInscricaoPublica}
        onCancel={() => {
          setModalInscricaoPublica(false)
          formInscricaoPublica.resetFields()
          setEventoSelecionado(null)
        }}
        footer={null}
      >
        {eventoSelecionado && (
          <div style={{ marginBottom: '16px' }}>
            {eventoSelecionado.vagas && (
              <Statistic
                title="Vagas Disponíveis"
                value={eventoSelecionado.vagasDisponiveis !== undefined ? eventoSelecionado.vagasDisponiveis : eventoSelecionado.vagas}
                suffix={`/ ${eventoSelecionado.vagas}`}
                valueStyle={{ fontSize: '18px' }}
              />
            )}
          </div>
        )}
        <Form
          form={formInscricaoPublica}
          layout="vertical"
          onFinish={handleInscricaoPublica}
        >
          <Form.Item
            name="nome"
            label="Nome Completo"
            rules={[{ required: true, message: 'Por favor, informe seu nome completo' }]}
          >
            <Input placeholder="Digite seu nome completo" size="large" />
          </Form.Item>
          <Form.Item
            name="cpf"
            label="CPF"
            normalize={(value) => formatCPF(value)}
            rules={[
              { required: true, message: 'Por favor, informe seu CPF' },
              {
                pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                message: 'CPF inválido',
              },
            ]}
          >
            <Input placeholder="000.000.000-00" maxLength={14} size="large" />
          </Form.Item>
          <Form.Item
            name="telefone"
            label="Telefone"
            normalize={(value) => formatPhone(value)}
            rules={[
              { required: true, message: 'Por favor, informe seu telefone' },
              {
                pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
                message: 'Telefone inválido',
              },
            ]}
          >
            <Input placeholder="(00) 00000-0000" maxLength={15} size="large" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setModalInscricaoPublica(false)
                formInscricaoPublica.resetFields()
                setEventoSelecionado(null)
              }}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={inscricaoLoading}>
                Inscrever-se
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Eventos

