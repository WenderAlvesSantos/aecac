import { useState, useEffect } from 'react'
import { Row, Col, Card, Typography, Tag, Empty, Image, Button, Input, Space, Modal, message, Statistic, Form, Select, Pagination, Tooltip } from 'antd'
import { GiftOutlined, BankOutlined, ShopOutlined, FilterOutlined } from '@ant-design/icons'
import { getBeneficiosPublicos, getEmpresas, resgatarBeneficio } from '../lib/api'
import { PublicLoading } from '../components/public-site/PublicLoading'
import { PublicInnerHero } from '../components/public-site/PublicInnerHero'
import { glassPanel } from '../components/public-site/publicUi'

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

const Beneficios = () => {
  const [beneficios, setBeneficios] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalResgate, setModalResgate] = useState(false)
  const [beneficioSelecionado, setBeneficioSelecionado] = useState(null)
  const [resgatando, setResgatando] = useState(false)
  const [formResgate] = Form.useForm()
  const [filtroEmpresa, setFiltroEmpresa] = useState(null)
  const [filtroCategoria, setFiltroCategoria] = useState('all')
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [itensPorPagina] = useState(9)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [beneficiosRes, empresasRes] = await Promise.all([
        getBeneficiosPublicos(),
        getEmpresas(),
      ])

      setBeneficios(beneficiosRes.data)
      
      // Filtrar apenas empresas aprovadas
      const empresasAprovadas = empresasRes.data.filter(emp => emp.status === 'aprovado')
      setEmpresas(empresasAprovadas)
    } catch (error) {
      console.error('Erro ao carregar benefícios:', error)
    } finally {
      setLoading(false)
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

  const handleResgatar = async (values) => {
    if (!beneficioSelecionado) return

    setResgatando(true)
    try {
      const cpfLimpo = values.cpf.replace(/\D/g, '')
      const telefoneLimpo = values.telefone.replace(/\D/g, '')
      
      await resgatarBeneficio(
        beneficioSelecionado.codigo,
        values.nome,
        cpfLimpo,
        telefoneLimpo
      )
      message.success('Benefício resgatado com sucesso!')
      setModalResgate(false)
      formResgate.resetFields()
      setBeneficioSelecionado(null)
      loadData()
    } catch (error) {
      message.error(error.response?.data?.error || 'Erro ao resgatar benefício')
    } finally {
      setResgatando(false)
    }
  }

  const abrirModalResgate = (beneficio) => {
    setBeneficioSelecionado(beneficio)
    setModalResgate(true)
  }

  if (loading) {
    return <PublicLoading label="Carregando benefícios…" />
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
      <div className="pb-24 text-white">
        <PublicInnerHero
          title="Benefícios"
          subtitle="Descontos e vantagens exclusivas para associados"
        />

        <div className="mx-auto max-w-6xl px-6 pb-8 lg:px-12">
          {/* Filtros */}
          <div className={`${glassPanel} mb-8 mt-2 p-6`}>
            <div className="mb-4 flex items-center gap-2">
              <FilterOutlined className="text-lg text-sky-400" />
              <Title level={5} className="!m-0 !font-semibold !text-white/90">
                Filtros
              </Title>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <div className="mb-2 text-sm font-medium text-zinc-400">
                  <ShopOutlined className="mr-1.5" />
                  Fundador
                </div>
                <Select
                  showSearch
                  placeholder="Selecione um fundador"
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
                <div className="mb-2 text-sm font-medium text-zinc-400">
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

          {/* Benefícios filtrados e paginados */}
          {(() => {
            // Filtrar por empresa e categoria
            const beneficiosFiltrados = beneficios.filter(b => {
              // Filtro por empresa
              if (filtroEmpresa) {
                if (filtroEmpresa === 'aecac') {
                  // Filtrar itens sem empresaId (AECAC)
                  if (b.empresaId) return false
                } else {
                  // Filtrar por empresa específica
                  const empresaId = b.empresaId?.toString()
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
                const empresa = empresasMap[b.empresaId]
                if (!empresa || empresa.categoria !== filtroCategoria) return false
              }
              
              return true
            })

            // Calcular paginação
            const totalItens = beneficiosFiltrados.length
            const inicio = (paginaAtual - 1) * itensPorPagina
            const fim = inicio + itensPorPagina
            const beneficiosPaginados = beneficiosFiltrados.slice(inicio, fim)

            return (
              <>
                {beneficiosPaginados.length === 0 ? (
                  <Empty
                    description={filtroEmpresa ? "Nenhum benefício encontrado para este fundador" : "Nenhum benefício disponível no momento"}
                    style={{ padding: '64px 0' }}
                  />
                ) : (
                  <Row gutter={[24, 24]}>
                    {beneficiosPaginados.map((beneficio, index) => (
                      <Col xs={24} sm={12} lg={8} key={beneficio._id}>
                <Card
                  hoverable
                  className="!border-white/10 !bg-white/[0.04]"
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '16px',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                    opacity: 0,
                    transform: 'translateY(30px)',
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`,
                  }}
                  bodyStyle={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px', position: 'relative', zIndex: 1 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)'
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.35)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  cover={
                    beneficio.imagem ? (
                      <div className="h-[200px] overflow-hidden bg-zinc-900">
                        <Image
                          src={beneficio.imagem}
                          alt={beneficio.titulo}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          preview={false}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          height: '200px',
                          background: 'linear-gradient(135deg, #1a237e 0%, #1565c0 50%, #00c853 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <GiftOutlined style={{ fontSize: '64px', color: '#fff' }} />
                      </div>
                    )
                  }
                >
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ marginBottom: '16px' }}>
                      <Title level={4} style={{ marginBottom: '8px' }}>
                        {beneficio.titulo}
                      </Title>
                      {beneficio.desconto && (
                        <Tag color="green" style={{ fontSize: '16px', padding: '4px 12px' }}>
                          {beneficio.desconto}% OFF
                        </Tag>
                      )}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Tooltip 
                        title={beneficio.descricao && beneficio.descricao.length > 150 ? (
                          <div style={{ whiteSpace: 'pre-line', maxWidth: '400px' }}>
                            {beneficio.descricao}
                          </div>
                        ) : null}
                        placement="top"
                      >
                        <Paragraph 
                          ellipsis={{ rows: 3 }}
                          style={{ 
                            cursor: beneficio.descricao && beneficio.descricao.length > 150 ? 'help' : 'default'
                          }}
                        >
                          {beneficio.descricao}
                        </Paragraph>
                      </Tooltip>
                      {beneficio.condicoes && (
                        <Paragraph type="secondary" style={{ fontSize: '12px', marginTop: '8px' }}>
                          <strong>Condições:</strong> {beneficio.condicoes}
                        </Paragraph>
                      )}
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
                        <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <BankOutlined />
                          {beneficio.empresa?.nome || 'AECAC - Associação Empresarial e Comercial de Águas Claras'}
                        </div>
                        {beneficio.codigo && (
                          <div style={{ marginBottom: '8px' }}>
                            <strong>Código:</strong> <Tag color="blue" style={{ fontSize: '14px', fontWeight: 'bold' }}>{beneficio.codigo}</Tag>
                          </div>
                        )}
                        {beneficio.quantidadeDisponivel !== null && (
                          <div style={{ marginBottom: '8px' }}>
                            <Statistic
                              title="Disponíveis"
                              value={beneficio.quantidadeDisponivel}
                              suffix={`/ ${beneficio.quantidade}`}
                              valueStyle={{ fontSize: '16px' }}
                            />
                          </div>
                        )}
                        {beneficio.quantidadeDisponivel === 0 && (
                          <Tag color="red">Esgotado</Tag>
                        )}
                      </div>
                      {beneficio.validade && (
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#8c8c8c' }}>
                          Válido até: {new Date(beneficio.validade).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                      <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                        <Button
                          type="primary"
                          block
                          icon={<GiftOutlined />}
                          onClick={() => abrirModalResgate(beneficio)}
                          disabled={beneficio.quantidadeDisponivel === 0}
                        >
                          Resgatar Benefício
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
                      ))}
                    </Row>
                  )}
                  {totalItens > itensPorPagina && (
                    <div style={{ marginTop: '32px', textAlign: 'center' }}>
                      <Pagination
                        current={paginaAtual}
                        total={totalItens}
                        pageSize={itensPorPagina}
                        onChange={(page) => setPaginaAtual(page)}
                        showSizeChanger={false}
                        showTotal={(total, range) => `${range[0]}-${range[1]} de ${total} benefícios`}
                      />
                    </div>
                  )}
                </>
              )
            })()}
        </div>

      {/* Modal de Resgate Público */}
      <Modal
        title={
          <div>
            <div>Resgatar Benefício</div>
            {beneficioSelecionado && (
              <div style={{ fontSize: '14px', fontWeight: 'normal', marginTop: '4px', color: '#666' }}>
                {beneficioSelecionado.titulo}
              </div>
            )}
          </div>
        }
        open={modalResgate}
        onCancel={() => {
          setModalResgate(false)
          formResgate.resetFields()
          setBeneficioSelecionado(null)
        }}
        footer={null}
        width={window.innerWidth < 768 ? '95%' : 600}
      >
        {beneficioSelecionado && (
          <div style={{ marginBottom: '16px' }}>
            {beneficioSelecionado.quantidadeDisponivel !== null && (
              <Statistic
                title="Disponíveis"
                value={beneficioSelecionado.quantidadeDisponivel}
                suffix={`/ ${beneficioSelecionado.quantidade}`}
                valueStyle={{ fontSize: '18px' }}
              />
            )}
          </div>
        )}
        <Form
          form={formResgate}
          layout="vertical"
          onFinish={handleResgatar}
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
                setModalResgate(false)
                formResgate.resetFields()
                setBeneficioSelecionado(null)
              }}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={resgatando}>
                Resgatar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      </div>
    </>
  )
}

export default Beneficios

