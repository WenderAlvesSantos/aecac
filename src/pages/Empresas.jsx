import { useState, useEffect } from 'react'
import {
  Row,
  Col,
  Typography,
  Card,
  Input,
  Select,
  Tag,
  Space,
  Button,
  Spin,
  Tooltip,
} from 'antd'
import { SearchOutlined, ShopOutlined, PhoneOutlined, MailOutlined, GlobalOutlined, FacebookOutlined, InstagramOutlined, LinkedinOutlined } from '@ant-design/icons'
import { getEmpresas } from '../lib/api'

const { Title, Paragraph } = Typography
const { Search } = Input
const { Option } = Select

// Função para formatar telefone
const formatPhone = (value) => {
  if (!value) return ''
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '')
  
  // Aplica máscara: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  } else {
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  }
}

const Empresas = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEmpresas()
  }, [])

  const loadEmpresas = async () => {
    try {
      const response = await getEmpresas()
      setEmpresas(response.data)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
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

  const getCategoryColor = (categoria) => {
    const colors = {
      Varejo: 'blue',
      Alimentação: 'orange',
      Tecnologia: 'purple',
      Saúde: 'green',
      Serviços: 'cyan',
      Beleza: 'pink',
      Construção: 'geekblue',
    }
    return colors[categoria] || 'default'
  }

  const filteredEmpresas = empresas.filter((empresa) => {
    const matchesSearch =
      empresa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empresa.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' || empresa.categoria === selectedCategory
    return matchesSearch && matchesCategory
  })

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
            Empresas Associadas
          </Title>
          <Paragraph
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '18px',
            }}
          >
            Conheça as empresas que fazem parte da AECAC e fortalecem o
            comércio em Águas Claras
          </Paragraph>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div style={{ padding: '32px 24px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={16}>
              <Search
                placeholder="Buscar empresas..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Filtrar por categoria"
                size="large"
                style={{ width: '100%' }}
                value={selectedCategory}
                onChange={setSelectedCategory}
              >
                <Option value="all">Todas as categorias</Option>
                {categorias
                  .filter((cat) => cat !== 'all')
                  .map((categoria) => (
                    <Option key={categoria} value={categoria}>
                      {categoria}
                    </Option>
                  ))}
              </Select>
            </Col>
          </Row>
        </div>
      </div>

      {/* Lista de Empresas */}
      <div style={{ padding: '32px 24px 64px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {filteredEmpresas.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '48px' }}>
              <Title level={4}>Nenhuma empresa encontrada</Title>
              <Paragraph>
                {empresas.length === 0
                  ? 'Nenhuma empresa cadastrada ainda.'
                  : 'Tente ajustar os filtros de busca ou categoria.'}
              </Paragraph>
            </Card>
          ) : (
            <>
              <div style={{ marginBottom: '16px' }}>
                <Paragraph>
                  Mostrando {filteredEmpresas.length} de {empresas.length}{' '}
                  empresas
                </Paragraph>
              </div>
              <Row gutter={[24, 24]}>
                {filteredEmpresas.map((empresa) => (
                  <Col xs={24} sm={12} md={8} key={empresa._id}>
                    <Card
                      hoverable
                      style={{
                        height: '100%',
                        borderRadius: '8px',
                      }}
                      cover={
                        empresa.imagem ? (
                          <img
                            alt={empresa.nome}
                            src={empresa.imagem}
                            style={{
                              height: '200px',
                              objectFit: 'cover',
                              width: '100%',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              height: '200px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#f0f0f0',
                            }}
                          >
                            <ShopOutlined
                              style={{
                                fontSize: '64px',
                                color: '#1890ff',
                              }}
                            />
                          </div>
                        )
                      }
                    >
                      <div style={{ textAlign: 'center', marginTop: '16px' }}>
                        <Title level={4} style={{ marginBottom: '8px' }}>
                          {empresa.nome}
                        </Title>
                        <Tag color={getCategoryColor(empresa.categoria)}>
                          {empresa.categoria}
                        </Tag>
                      </div>
                      {empresa.descricao && (
                        <Tooltip 
                          title={empresa.descricao.length > 250 ? (
                            <div style={{ whiteSpace: 'pre-line', maxWidth: '400px' }}>
                              {empresa.descricao}
                            </div>
                          ) : null}
                          placement="top"
                        >
                          <Paragraph 
                            style={{ 
                              marginBottom: '16px',
                              whiteSpace: 'pre-line',
                              cursor: empresa.descricao.length > 250 ? 'help' : 'default'
                            }}
                          >
                            {empresa.descricao.length > 250
                              ? empresa.descricao.substring(0, 250) + '...'
                              : empresa.descricao}
                          </Paragraph>
                        </Tooltip>
                      )}
                      <div
                        style={{
                          borderTop: '1px solid #f0f0f0',
                          paddingTop: '16px',
                        }}
                      >
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          {empresa.telefone && (
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              <PhoneOutlined style={{ marginRight: '8px' }} />
                              <span>{formatPhone(empresa.telefone)}</span>
                            </div>
                          )}
                          {empresa.email && (
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              <MailOutlined style={{ marginRight: '8px' }} />
                              <span>{empresa.email}</span>
                            </div>
                          )}
                          {empresa.endereco && (
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {empresa.endereco}
                            </div>
                          )}
                          {empresa.site && (
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              <GlobalOutlined style={{ marginRight: '8px' }} />
                              <a 
                                href={empresa.site} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ color: '#1890ff' }}
                              >
                                Site
                              </a>
                            </div>
                          )}
                          {(empresa.facebook || empresa.instagram || empresa.linkedin) && (
                            <div style={{ fontSize: '12px', color: '#666', display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {empresa.facebook && (
                                <a
                                  href={empresa.facebook}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: '#1877f2' }}
                                >
                                  <FacebookOutlined style={{ fontSize: '16px' }} />
                                </a>
                              )}
                              {empresa.instagram && (
                                <a
                                  href={empresa.instagram}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: '#e4405f' }}
                                >
                                  <InstagramOutlined style={{ fontSize: '16px' }} />
                                </a>
                              )}
                              {empresa.linkedin && (
                                <a
                                  href={empresa.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: '#0077b5' }}
                                >
                                  <LinkedinOutlined style={{ fontSize: '16px' }} />
                                </a>
                              )}
                            </div>
                          )}
                        </Space>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </>
          )}
        </div>
      </div>

      {/* CTA para Associar-se */}
      <div
        style={{
          padding: '64px 24px',
          background: '#1890ff',
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Title level={2} style={{ color: '#fff', marginBottom: '16px' }}>
            Sua empresa também pode fazer parte
          </Title>
          <Paragraph
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '18px',
              marginBottom: '32px',
            }}
          >
            Associe-se à AECAC e faça parte dessa rede de empresas que está
            fortalecendo o comércio em Águas Claras.
          </Paragraph>
          <Button
            type="default"
            size="large"
            style={{ background: '#fff', color: '#1890ff' }}
          >
            Saiba Como Associar-se
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Empresas

