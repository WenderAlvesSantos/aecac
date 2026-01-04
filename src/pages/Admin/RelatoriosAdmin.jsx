import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, Typography, Button, Space, Select, Tag, Spin } from 'antd'
import { 
  CalendarOutlined, 
  GiftOutlined, 
  ShopOutlined, 
  UserOutlined,
  DownloadOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { getRelatorios, exportarDados } from '../../lib/api'
import dayjs from 'dayjs'

const { Title } = Typography

const RelatoriosAdmin = () => {
  const [loading, setLoading] = useState(false)
  const [relatorio, setRelatorio] = useState(null)
  const [tipoRelatorio, setTipoRelatorio] = useState('todos')

  useEffect(() => {
    loadRelatorio()
  }, [tipoRelatorio])

  const loadRelatorio = async () => {
    setLoading(true)
    try {
      const response = await getRelatorios(tipoRelatorio === 'todos' ? null : tipoRelatorio)
      setRelatorio(response.data)
    } catch (error) {
      console.error('Erro ao carregar relatório:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportar = async (tipo, formato) => {
    try {
      const response = await exportarDados(tipo, formato)
      
      if (formato === 'csv') {
        // Criar blob e fazer download
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `${tipo}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // JSON
        const dataStr = JSON.stringify(response.data, null, 2)
        const blob = new Blob([dataStr], { type: 'application/json' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `${tipo}.json`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Erro ao exportar:', error)
    }
  }

  const inscricoesColumns = [
    {
      title: 'Título',
      dataIndex: 'titulo',
      key: 'titulo',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      render: (tipo) => <Tag color="blue">{tipo}</Tag>,
    },
    {
      title: 'Data',
      dataIndex: 'data',
      key: 'data',
      render: (data) => data ? dayjs(data).format('DD/MM/YYYY HH:mm') : '-',
    },
    {
      title: 'Vagas',
      dataIndex: 'vagas',
      key: 'vagas',
      render: (vagas) => vagas || 'Ilimitadas',
    },
    {
      title: 'Inscritos',
      dataIndex: 'inscritos',
      key: 'inscritos',
    },
    {
      title: 'Taxa de Ocupação',
      dataIndex: 'taxaOcupacao',
      key: 'taxaOcupacao',
    },
  ]

  const beneficiosColumns = [
    {
      title: 'Título',
      dataIndex: 'titulo',
      key: 'titulo',
    },
    {
      title: 'Desconto',
      dataIndex: 'desconto',
      key: 'desconto',
      render: (desconto) => desconto ? `${desconto}%` : '-',
    },
    {
      title: 'Status',
      dataIndex: 'ativo',
      key: 'ativo',
      render: (ativo) => (
        <Tag color={ativo ? 'green' : 'red'}>
          {ativo ? 'Ativo' : 'Inativo'}
        </Tag>
      ),
    },
    {
      title: 'Validade',
      dataIndex: 'validade',
      key: 'validade',
      render: (validade) => validade ? dayjs(validade).format('DD/MM/YYYY') : '-',
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Relatórios</Title>
        <Space>
          <Select
            value={tipoRelatorio}
            onChange={setTipoRelatorio}
            style={{ width: 200 }}
          >
            <Select.Option value="todos">Todos</Select.Option>
            <Select.Option value="inscricoes">Inscrições</Select.Option>
            <Select.Option value="beneficios">Benefícios</Select.Option>
            <Select.Option value="empresas">Empresas</Select.Option>
            <Select.Option value="usuarios">Usuários</Select.Option>
          </Select>
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Estatísticas Gerais */}
          {relatorio && (
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              {relatorio.inscricoes && (
                <>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Total de Capacitações"
                        value={relatorio.inscricoes.total}
                        prefix={<CalendarOutlined />}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Total de Inscritos"
                        value={relatorio.inscricoes.totalInscritos}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                </>
              )}
              {relatorio.beneficios && (
                <>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Total de Benefícios"
                        value={relatorio.beneficios.total}
                        prefix={<GiftOutlined />}
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Benefícios Ativos"
                        value={relatorio.beneficios.ativos}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                </>
              )}
              {relatorio.empresas && (
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Total de Empresas"
                      value={relatorio.empresas.total}
                      prefix={<ShopOutlined />}
                      valueStyle={{ color: '#fa8c16' }}
                    />
                  </Card>
                </Col>
              )}
            </Row>
          )}

          {/* Relatório de Inscrições */}
          {relatorio?.inscricoes && (tipoRelatorio === 'todos' || tipoRelatorio === 'inscricoes') && (
            <Card
              title="Relatório de Inscrições em Capacitações"
              extra={
                <Space>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => handleExportar('capacitacoes', 'json')}
                  >
                    Exportar JSON
                  </Button>
                  <Button
                    icon={<FileTextOutlined />}
                    onClick={() => handleExportar('capacitacoes', 'csv')}
                  >
                    Exportar CSV
                  </Button>
                </Space>
              }
              style={{ marginBottom: '24px' }}
            >
              <Table
                columns={inscricoesColumns}
                dataSource={relatorio.inscricoes.detalhes}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          )}

          {/* Relatório de Benefícios */}
          {relatorio?.beneficios && (tipoRelatorio === 'todos' || tipoRelatorio === 'beneficios') && (
            <Card
              title="Relatório de Benefícios"
              extra={
                <Space>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => handleExportar('beneficios', 'json')}
                  >
                    Exportar JSON
                  </Button>
                  <Button
                    icon={<FileTextOutlined />}
                    onClick={() => handleExportar('beneficios', 'csv')}
                  >
                    Exportar CSV
                  </Button>
                </Space>
              }
              style={{ marginBottom: '24px' }}
            >
              <Table
                columns={beneficiosColumns}
                dataSource={relatorio.beneficios.detalhes}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          )}

          {/* Relatório de Empresas */}
          {relatorio?.empresas && (tipoRelatorio === 'todos' || tipoRelatorio === 'empresas') && (
            <Card
              title="Relatório de Empresas"
              extra={
                <Space>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => handleExportar('empresas', 'json')}
                  >
                    Exportar JSON
                  </Button>
                  <Button
                    icon={<FileTextOutlined />}
                    onClick={() => handleExportar('empresas', 'csv')}
                  >
                    Exportar CSV
                  </Button>
                </Space>
              }
              style={{ marginBottom: '24px' }}
            >
              <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Statistic title="Total" value={relatorio.empresas.total} />
                </Col>
                <Col span={8}>
                  <Statistic title="Com Imagem" value={relatorio.empresas.comImagem} />
                </Col>
                <Col span={8}>
                  <Statistic title="Sem Imagem" value={relatorio.empresas.semImagem} />
                </Col>
              </Row>
              <div>
                <Title level={4}>Empresas por Categoria</Title>
                {Object.entries(relatorio.empresas.porCategoria).map(([categoria, count]) => (
                  <div key={categoria} style={{ marginBottom: '8px' }}>
                    <strong>{categoria}:</strong> {count} empresa(s)
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

export default RelatoriosAdmin

