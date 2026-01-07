import { useState, useEffect } from 'react'
import { Row, Col, Card, Typography, Tag, Button, Space, Spin, Empty, Modal, message, Form, Input, Statistic, Select, Pagination } from 'antd'
import { CalendarOutlined, UserOutlined, CheckCircleOutlined, EnvironmentOutlined, BankOutlined, ShopOutlined, FilterOutlined } from '@ant-design/icons'
import { getCapacitacoesPublicas, inscreverCapacitacao, cancelarInscricao, inscreverCapacitacaoPublico, getEmpresas } from '../lib/api'
import dayjs from 'dayjs'

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

const Capacitacoes = () => {
  const [capacitacoes, setCapacitacoes] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalInscricaoPublica, setModalInscricaoPublica] = useState(false)
  const [selectedCapacitacao, setSelectedCapacitacao] = useState(null)
  const [inscricaoLoading, setInscricaoLoading] = useState(false)
  const [formInscricaoPublica] = Form.useForm()
  const [filtroEmpresa, setFiltroEmpresa] = useState(null)
  const [filtroCategoria, setFiltroCategoria] = useState('all')
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [itensPorPagina] = useState(9)
  const associadoToken = localStorage.getItem('associadoToken')

  useEffect(() => {
    loadData()
    loadEmpresas()
  }, [])

  const loadData = async () => {
    try {
      const response = await getCapacitacoesPublicas()
      setCapacitacoes(response.data)
    } catch (error) {
      console.error('Erro ao carregar capacitações:', error)
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

  const categorias = [
    'all',
    'Varejo',
    'Alimentação',
    'Tecnologia',
    'Saúde',
    'Serviços',
    'Beleza',
    'Construção',
  ]

  // Criar mapa de empresas para acesso rápido à categoria
  const empresasMap = empresas.reduce((acc, empresa) => {
    acc[empresa._id] = empresa
    return acc
  }, {})

  const handleOpenModal = (capacitacao) => {
    setSelectedCapacitacao(capacitacao)
    setModalVisible(true)
  }

  const handleInscricao = async () => {
    if (!associadoToken) {
      message.warning('Você precisa estar logado para se inscrever')
      return
    }

    setInscricaoLoading(true)
    try {
      await inscreverCapacitacao(selectedCapacitacao._id)
      message.success('Inscrição realizada com sucesso!')
      setModalVisible(false)
      loadData()
    } catch (error) {
      message.error(error.response?.data?.error || 'Erro ao realizar inscrição')
    } finally {
      setInscricaoLoading(false)
    }
  }

  const handleInscricaoPublica = async (values) => {
    if (!selectedCapacitacao) return

    setInscricaoLoading(true)
    try {
      const cpfLimpo = values.cpf.replace(/\D/g, '')
      const telefoneLimpo = values.telefone.replace(/\D/g, '')
      
      await inscreverCapacitacaoPublico(
        selectedCapacitacao._id,
        values.nome,
        cpfLimpo,
        telefoneLimpo
      )
      message.success('Inscrição realizada com sucesso!')
      setModalInscricaoPublica(false)
      formInscricaoPublica.resetFields()
      setSelectedCapacitacao(null)
      loadData()
    } catch (error) {
      message.error(error.response?.data?.error || 'Erro ao realizar inscrição')
    } finally {
      setInscricaoLoading(false)
    }
  }

  const abrirModalInscricaoPublica = (capacitacao) => {
    setSelectedCapacitacao(capacitacao)
    setModalInscricaoPublica(true)
  }

  const handleCancelarInscricao = async (capacitacaoId) => {
    setInscricaoLoading(true)
    try {
      await cancelarInscricao(capacitacaoId)
      message.success('Inscrição cancelada com sucesso!')
      loadData()
    } catch (error) {
      message.error(error.response?.data?.error || 'Erro ao cancelar inscrição')
    } finally {
      setInscricaoLoading(false)
    }
  }

  const isInscrito = () => {
    // Nota: A verificação de inscrição privada agora é feita via API
    // Como não temos mais o campo inscritos na capacitação, sempre retorna false
    // A verificação real será feita no backend ao tentar inscrever
    return false
  }

  const isPassado = (data) => {
    return new Date(data) < new Date()
  }

  if (loading) {
    return (
      <div style={{ padding: '64px', textAlign: 'center' }}>
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
          <Title level={1} style={{ color: '#fff', marginBottom: '16px', fontSize: window.innerWidth < 768 ? '32px' : '42px', fontWeight: 'bold', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            Capacitações
          </Title>
          <Paragraph
            style={{
              color: 'rgba(255,255,255,0.95)',
              fontSize: window.innerWidth < 768 ? '16px' : '20px',
              lineHeight: '1.8',
            }}
          >
            Palestras, cursos, workshops e treinamentos para associados
          </Paragraph>
        </div>
      </div>

      <div style={{ padding: window.innerWidth < 768 ? '0 16px 32px' : '0 24px 64px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Filtros */}
          <div 
            style={{ 
              marginBottom: '32px', 
              marginTop: '24px',
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #e8e8e8'
            }}
          >
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FilterOutlined style={{ fontSize: '18px', color: '#1a237e' }} />
              <Title level={5} style={{ margin: 0, color: '#1a237e', fontWeight: 600 }}>
                Filtros
              </Title>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <div style={{ marginBottom: '8px', fontSize: '14px', color: '#666', fontWeight: 500 }}>
                  <ShopOutlined style={{ marginRight: '6px' }} />
                  Empresa
                </div>
                <Select
                  showSearch
                  placeholder="Selecione uma empresa"
                  optionFilterProp="children"
                  style={{ width: '100%' }}
                  allowClear
                  size="large"
                  value={filtroEmpresa}
                  onChange={(value) => {
                    setFiltroEmpresa(value)
                    setPaginaAtual(1)
                  }}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={[
                    {
                      value: 'aecac',
                      label: (
                        <Space>
                          <BankOutlined />
                          AECAC - Associação Empresarial e Comercial de Águas Claras
                        </Space>
                      )
                    },
                    ...empresas.map(empresa => ({
                      value: empresa._id,
                      label: (
                        <Space>
                          <ShopOutlined />
                          {empresa.nome}
                        </Space>
                      )
                    }))
                  ]}
                />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ marginBottom: '8px', fontSize: '14px', color: '#666', fontWeight: 500 }}>
                  Categoria
                </div>
                <Select
                  placeholder="Selecione uma categoria"
                  style={{ width: '100%' }}
                  size="large"
                  value={filtroCategoria}
                  onChange={(value) => {
                    setFiltroCategoria(value)
                    setPaginaAtual(1)
                  }}
                >
                  <Select.Option value="all">Todas as categorias</Select.Option>
                  {categorias
                    .filter((cat) => cat !== 'all')
                    .map((categoria) => (
                      <Select.Option key={categoria} value={categoria}>
                        {categoria}
                      </Select.Option>
                    ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Capacitações filtradas e paginadas */}
          {(() => {
            // Filtrar por empresa e categoria
            const capacitacoesFiltradas = capacitacoes.filter(c => {
              // Filtro por empresa
              if (filtroEmpresa) {
                if (filtroEmpresa === 'aecac') {
                  // Filtrar itens sem empresaId (AECAC)
                  if (c.empresaId) return false
                } else {
                  // Filtrar por empresa específica
                  const empresaId = c.empresaId?.toString()
                  const filtroId = filtroEmpresa.toString()
                  if (empresaId !== filtroId) return false
                }
              }
              
              // Filtro por categoria
              if (filtroCategoria !== 'all') {
                if (filtroEmpresa === 'aecac') {
                  // Itens AECAC não têm categoria de empresa
                  return false
                }
                const empresa = empresasMap[c.empresaId]
                if (!empresa || empresa.categoria !== filtroCategoria) return false
              }
              
              return true
            })

            const proximasFiltradas = capacitacoesFiltradas.filter(c => !isPassado(c.data))
            const passadasFiltradas = capacitacoesFiltradas.filter(c => isPassado(c.data))

            // Calcular paginação para próximas capacitações
            const totalProximas = proximasFiltradas.length
            const inicio = (paginaAtual - 1) * itensPorPagina
            const fim = inicio + itensPorPagina
            const proximasPaginadas = proximasFiltradas.slice(inicio, fim)

            return (
              <>
                {capacitacoesFiltradas.length === 0 ? (
                  <Empty
                    description={filtroEmpresa ? "Nenhuma capacitação encontrada para esta empresa" : "Nenhuma capacitação disponível no momento"}
                    style={{ padding: '64px 0' }}
                  />
                ) : (
                  <>
                    {/* Próximas Capacitações */}
                    {proximasPaginadas.length > 0 && (
                      <div style={{ marginBottom: '48px' }}>
                        <Title level={2} style={{ marginBottom: '24px' }}>Próximas Capacitações</Title>
                        <Row gutter={[24, 24]}>
                          {proximasPaginadas.map((capacitacao, index) => {
                    const inscrito = isInscrito(capacitacao)
                    return (
                      <Col xs={24} sm={12} lg={8} key={capacitacao._id}>
                        <Card
                          hoverable
                          style={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            border: '1px solid #e0e0e0',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            overflow: 'hidden',
                            background: '#fff',
                            opacity: 0,
                            transform: 'translateY(30px)',
                            animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`,
                          }}
                          bodyStyle={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px', position: 'relative', zIndex: 1 }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-8px)'
                            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)'
                            const cover = e.currentTarget.querySelector('.ant-card-cover')
                            if (cover) {
                              const img = cover.querySelector('img')
                              if (img) img.style.transform = 'scale(1.05)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                            const cover = e.currentTarget.querySelector('.ant-card-cover')
                            if (cover) {
                              const img = cover.querySelector('img')
                              if (img) img.style.transform = 'scale(1)'
                            }
                          }}
                          cover={
                            capacitacao.imagem ? (
                              <img
                                alt={capacitacao.titulo}
                                src={capacitacao.imagem}
                                style={{
                                  height: '200px',
                                  objectFit: 'cover',
                                }}
                              />
                            ) : null
                          }
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{ marginBottom: '16px' }}>
                              <Title level={4} style={{ marginBottom: '8px' }}>
                                {capacitacao.titulo}
                              </Title>
                              <div style={{ marginBottom: '8px', color: '#666', fontSize: '14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <BankOutlined />
                                <strong>{capacitacao.empresa?.nome || 'AECAC - Associação Empresarial e Comercial de Águas Claras'}</strong>
                              </div>
                              <Space>
                                <Tag color="blue">{capacitacao.tipo}</Tag>
                                {inscrito && (
                                  <Tag color="green" icon={<CheckCircleOutlined />}>
                                    Inscrito
                                  </Tag>
                                )}
                              </Space>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                              <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: '16px' }}>
                                {capacitacao.descricao}
                              </Paragraph>
                              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                <div>
                                  <CalendarOutlined /> {dayjs(capacitacao.data).format('DD/MM/YYYY HH:mm')}
                                </div>
                                {capacitacao.local && (
                                  <div>
                                    <EnvironmentOutlined /> {capacitacao.local}
                                  </div>
                                )}
                                {capacitacao.vagas && (
                                  <div>
                                    <UserOutlined /> {capacitacao.vagasDisponiveis !== undefined ? capacitacao.vagasDisponiveis : capacitacao.vagas} vagas disponíveis
                                  </div>
                                )}
                                {capacitacao.valor && (
                                  <div>
                                    <strong>Valor: R$ {capacitacao.valor}</strong>
                                  </div>
                                )}
                              </Space>
                            </div>
                            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
                              <Space style={{ width: '100%', justifyContent: 'space-between' }} size="small">
                                <Button
                                  type="default"
                                  onClick={() => handleOpenModal(capacitacao)}
                                  style={{
                                    borderRadius: '8px',
                                    fontWeight: '500',
                                  }}
                                >
                                  Ver Detalhes
                                </Button>
                                {associadoToken && (
                                  inscrito ? (
                                    <Button
                                      danger
                                      onClick={() => handleCancelarInscricao(capacitacao._id)}
                                      loading={inscricaoLoading}
                                      style={{
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                      }}
                                    >
                                      Cancelar Inscrição
                                    </Button>
                                  ) : (
                                    <Button
                                      type="primary"
                                      onClick={() => handleOpenModal(capacitacao)}
                                      style={{
                                        background: 'linear-gradient(135deg, #1565c0 0%, #00c853 100%)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        boxShadow: '0 2px 8px rgba(21, 101, 192, 0.3)',
                                      }}
                                    >
                                      Inscrever-se
                                    </Button>
                                  )
                                )}
                                {!associadoToken && (
                                  <Button
                                    type="primary"
                                    onClick={() => abrirModalInscricaoPublica(capacitacao)}
                                    disabled={capacitacao.vagas && (capacitacao.vagasDisponiveis !== undefined ? capacitacao.vagasDisponiveis : capacitacao.vagas) <= 0}
                                    style={{
                                      background: capacitacao.vagas && (capacitacao.vagasDisponiveis !== undefined ? capacitacao.vagasDisponiveis : capacitacao.vagas) <= 0 ? '#ccc' : 'linear-gradient(135deg, #1565c0 0%, #00c853 100%)',
                                      border: 'none',
                                      borderRadius: '8px',
                                      fontWeight: '600',
                                      boxShadow: capacitacao.vagas && (capacitacao.vagasDisponiveis !== undefined ? capacitacao.vagasDisponiveis : capacitacao.vagas) <= 0 ? 'none' : '0 2px 8px rgba(21, 101, 192, 0.3)',
                                    }}
                                  >
                                    Inscrever-se
                                  </Button>
                                )}
                              </Space>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    )
                          })}
                        </Row>
                        {totalProximas > itensPorPagina && (
                          <div style={{ marginTop: '32px', textAlign: 'center' }}>
                            <Pagination
                              current={paginaAtual}
                              total={totalProximas}
                              pageSize={itensPorPagina}
                              onChange={(page) => setPaginaAtual(page)}
                              showSizeChanger={false}
                              showTotal={(total, range) => `${range[0]}-${range[1]} de ${total} capacitações`}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Capacitações Passadas - não paginadas, apenas filtradas */}
                    {passadasFiltradas.length > 0 && (
                      <div>
                        <Title level={2} style={{ marginBottom: '24px' }}>Capacitações Realizadas</Title>
                        <Row gutter={[24, 24]}>
                          {passadasFiltradas.map((capacitacao) => (
                            <Col xs={24} sm={12} lg={8} key={capacitacao._id}>
                              <Card
                                style={{ height: '100%', opacity: 0.7 }}
                                cover={
                                  capacitacao.imagem ? (
                                    <img
                                      alt={capacitacao.titulo}
                                      src={capacitacao.imagem}
                                      style={{
                                        height: '200px',
                                        objectFit: 'cover',
                                      }}
                                    />
                                  ) : null
                                }
                              >
                                <Card.Meta
                                  title={
                                    <div>
                                      <Title level={4} style={{ marginBottom: '8px' }}>
                                        {capacitacao.titulo}
                                      </Title>
                                      {capacitacao.empresa?.nome && (
                                        <div style={{ marginBottom: '8px', color: '#666', fontSize: '14px' }}>
                                          <strong>{capacitacao.empresa.nome}</strong>
                                        </div>
                                      )}
                                      <Tag>{capacitacao.tipo}</Tag>
                                    </div>
                                  }
                                  description={
                                    <div>
                                      <Paragraph ellipsis={{ rows: 2 }}>
                                        {capacitacao.descricao}
                                      </Paragraph>
                                      <div style={{ marginTop: '12px' }}>
                                        <CalendarOutlined /> {dayjs(capacitacao.data).format('DD/MM/YYYY')}
                                      </div>
                                    </div>
                                  }
                                />
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )}
                  </>
                )}
              </>
            )
          })()}
        </div>
      </div>

      {/* Modal de Detalhes (Associado logado) */}
      <Modal
        title={selectedCapacitacao?.titulo}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Fechar
          </Button>,
          associadoToken && selectedCapacitacao && !isInscrito(selectedCapacitacao) && (
            <Button
              key="inscrever"
              type="primary"
              onClick={handleInscricao}
              loading={inscricaoLoading}
            >
              Inscrever-se
            </Button>
          ),
        ].filter(Boolean)}
        width={window.innerWidth < 768 ? '95%' : 600}
      >
        {selectedCapacitacao && (
          <div>
            <Paragraph>{selectedCapacitacao.descricao}</Paragraph>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <strong>Tipo:</strong> {selectedCapacitacao.tipo}
              </div>
              <div>
                <strong>Data:</strong> {dayjs(selectedCapacitacao.data).format('DD/MM/YYYY HH:mm')}
              </div>
              {selectedCapacitacao.local && (
                <div>
                  <EnvironmentOutlined style={{ marginRight: '8px' }} />
                  <strong>Local:</strong> {selectedCapacitacao.local}
                </div>
              )}
              {selectedCapacitacao.vagas && (
                <div>
                  <strong>Vagas:</strong> {selectedCapacitacao.vagasDisponiveis !== undefined ? selectedCapacitacao.vagasDisponiveis : selectedCapacitacao.vagas} disponíveis de {selectedCapacitacao.vagas}
                </div>
              )}
              {selectedCapacitacao.valor && (
                <div>
                  <strong>Valor:</strong> R$ {selectedCapacitacao.valor}
                </div>
              )}
              {selectedCapacitacao.link && (
                <div>
                  <strong>Link:</strong>{' '}
                  <a href={selectedCapacitacao.link} target="_blank" rel="noopener noreferrer">
                    {selectedCapacitacao.link}
                  </a>
                </div>
              )}
            </Space>
          </div>
        )}
      </Modal>

      {/* Modal de Inscrição Pública */}
      <Modal
        title={
          <div>
            <div>Inscrever-se na Capacitação</div>
            {selectedCapacitacao && (
              <div style={{ fontSize: '14px', fontWeight: 'normal', marginTop: '4px', color: '#666' }}>
                {selectedCapacitacao.titulo}
              </div>
            )}
          </div>
        }
        open={modalInscricaoPublica}
        onCancel={() => {
          setModalInscricaoPublica(false)
          formInscricaoPublica.resetFields()
          setSelectedCapacitacao(null)
        }}
        footer={null}
        width={window.innerWidth < 768 ? '95%' : 600}
      >
        {selectedCapacitacao && (
          <div style={{ marginBottom: '16px' }}>
            {selectedCapacitacao.vagas && (
              <Statistic
                title="Vagas Disponíveis"
                value={selectedCapacitacao.vagasDisponiveis !== undefined ? selectedCapacitacao.vagasDisponiveis : selectedCapacitacao.vagas}
                suffix={`/ ${selectedCapacitacao.vagas}`}
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
                setSelectedCapacitacao(null)
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
    </>
  )
}

export default Capacitacoes

