import { useState, useEffect } from 'react'
import { Row, Col, Card, Typography, Tag, Spin, Empty, Image, Button, Input, Space, Modal, message, Statistic, Form, Select, Pagination } from 'antd'
import { GiftOutlined, ShopOutlined, QrcodeOutlined } from '@ant-design/icons'
import { getBeneficios, getEmpresas, resgatarBeneficio, resgatarBeneficioPublico } from '../lib/api'

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
  const [empresasMap, setEmpresasMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [modalResgate, setModalResgate] = useState(false)
  const [modalResgatePublico, setModalResgatePublico] = useState(false)
  const [beneficioSelecionado, setBeneficioSelecionado] = useState(null)
  const [codigoResgate, setCodigoResgate] = useState('')
  const [resgatando, setResgatando] = useState(false)
  const [formResgatePublico] = Form.useForm()
  const [filtroEmpresa, setFiltroEmpresa] = useState(null)
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [itensPorPagina] = useState(9)
  const associadoToken = localStorage.getItem('associadoToken')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [beneficiosRes, empresasRes] = await Promise.all([
        getBeneficios(),
        getEmpresas(),
      ])

      setBeneficios(beneficiosRes.data)
      
      // Filtrar apenas empresas aprovadas
      const empresasAprovadas = empresasRes.data.filter(emp => emp.status === 'aprovado')
      setEmpresas(empresasAprovadas)
      
      // Criar mapa de empresas para buscar nomes
      const empresasMapObj = {}
      empresasAprovadas.forEach(emp => {
        empresasMapObj[emp._id] = emp
      })
      setEmpresasMap(empresasMapObj)
    } catch (error) {
      console.error('Erro ao carregar benefícios:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEmpresaNome = (empresaId) => {
    return empresasMap[empresaId]?.nome || 'Empresa Associada'
  }

  const handleResgatar = async () => {
    if (!codigoResgate.trim()) {
      message.warning('Por favor, digite o código do benefício')
      return
    }

    setResgatando(true)
    try {
      await resgatarBeneficio(codigoResgate.trim().toUpperCase())
      message.success('Benefício resgatado com sucesso!')
      setModalResgate(false)
      setCodigoResgate('')
      loadData()
    } catch (error) {
      message.error(error.response?.data?.error || 'Erro ao resgatar benefício')
    } finally {
      setResgatando(false)
    }
  }

  const handleResgatarPublico = async (values) => {
    if (!beneficioSelecionado) return

    setResgatando(true)
    try {
      const cpfLimpo = values.cpf.replace(/\D/g, '')
      const telefoneLimpo = values.telefone.replace(/\D/g, '')
      
      await resgatarBeneficioPublico(
        beneficioSelecionado.codigo,
        values.nome,
        cpfLimpo,
        telefoneLimpo
      )
      message.success('Benefício resgatado com sucesso!')
      setModalResgatePublico(false)
      formResgatePublico.resetFields()
      setBeneficioSelecionado(null)
      loadData()
    } catch (error) {
      message.error(error.response?.data?.error || 'Erro ao resgatar benefício')
    } finally {
      setResgatando(false)
    }
  }

  const abrirModalResgatePublico = (beneficio) => {
    setBeneficioSelecionado(beneficio)
    setModalResgatePublico(true)
  }

  if (loading) {
    return (
      <div style={{ padding: '64px', textAlign: 'center' }}>
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
            Benefícios Exclusivos
          </Title>
          <Paragraph
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '18px',
            }}
          >
            Descontos e condições especiais para associados da AECAC
          </Paragraph>
          {associadoToken && (
            <Button
              type="default"
              size="large"
              icon={<QrcodeOutlined />}
              onClick={() => setModalResgate(true)}
              style={{ 
                marginTop: '16px',
                background: '#fff',
                color: '#1890ff'
              }}
            >
              Resgatar Benefício
            </Button>
          )}
        </div>
      </div>

      <div style={{ padding: '0 24px 64px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Filtros */}
          <div style={{ marginBottom: '24px', paddingTop: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
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

          {/* Benefícios filtrados e paginados */}
          {(() => {
            // Filtrar por empresa
            const beneficiosFiltrados = filtroEmpresa
              ? beneficios.filter(b => {
                  const empresaId = b.empresaId?.toString()
                  const filtroId = filtroEmpresa.toString()
                  return empresaId === filtroId
                })
              : beneficios

            // Calcular paginação
            const totalItens = beneficiosFiltrados.length
            const inicio = (paginaAtual - 1) * itensPorPagina
            const fim = inicio + itensPorPagina
            const beneficiosPaginados = beneficiosFiltrados.slice(inicio, fim)

            return (
              <>
                {beneficiosPaginados.length === 0 ? (
                  <Empty
                    description={filtroEmpresa ? "Nenhum benefício encontrado para esta empresa" : "Nenhum benefício disponível no momento"}
                    style={{ padding: '64px 0' }}
                  />
                ) : (
                  <Row gutter={[24, 24]}>
                    {beneficiosPaginados.map((beneficio) => (
                      <Col xs={24} sm={12} lg={8} key={beneficio._id}>
                <Card
                  hoverable
                  style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                  bodyStyle={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px' }}
                  cover={
                    beneficio.imagem ? (
                      <div style={{ height: '200px', overflow: 'hidden', background: '#f0f0f0' }}>
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
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                      <Paragraph ellipsis={{ rows: 3 }}>
                        {beneficio.descricao}
                      </Paragraph>
                      {beneficio.condicoes && (
                        <Paragraph type="secondary" style={{ fontSize: '12px', marginTop: '8px' }}>
                          <strong>Condições:</strong> {beneficio.condicoes}
                        </Paragraph>
                      )}
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
                        <div style={{ marginBottom: '8px' }}>
                          <ShopOutlined /> {getEmpresaNome(beneficio.empresaId)}
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
                          onClick={() => abrirModalResgatePublico(beneficio)}
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
      </div>

      {/* Modal de Resgate (Associado logado) */}
      {associadoToken && (
        <Modal
          title="Resgatar Benefício"
          open={modalResgate}
          onCancel={() => {
            setModalResgate(false)
            setCodigoResgate('')
          }}
          footer={[
            <Button key="cancel" onClick={() => {
              setModalResgate(false)
              setCodigoResgate('')
            }}>
              Cancelar
            </Button>,
            <Button key="resgatar" type="primary" onClick={handleResgatar} loading={resgatando}>
              Resgatar
            </Button>,
          ]}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Typography.Text strong>Digite o código do benefício:</Typography.Text>
              <Input
                placeholder="Ex: BENEFICIO2024"
                value={codigoResgate}
                onChange={(e) => setCodigoResgate(e.target.value.toUpperCase())}
                size="large"
                style={{ marginTop: '8px' }}
                onPressEnter={handleResgatar}
              />
            </div>
            <Typography.Text type="secondary">
              O código pode ser encontrado na descrição de cada benefício.
            </Typography.Text>
          </Space>
        </Modal>
      )}

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
        open={modalResgatePublico}
        onCancel={() => {
          setModalResgatePublico(false)
          formResgatePublico.resetFields()
          setBeneficioSelecionado(null)
        }}
        footer={null}
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
          form={formResgatePublico}
          layout="vertical"
          onFinish={handleResgatarPublico}
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
                setModalResgatePublico(false)
                formResgatePublico.resetFields()
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
  )
}

export default Beneficios

