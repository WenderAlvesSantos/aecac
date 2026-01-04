import { useState, useEffect, useMemo } from 'react'
import { Card, Row, Col, Typography, Input, Space, Tag, Empty, Table, Pagination, Select, Spin, Button } from 'antd'
import {
  ShoppingOutlined,
  GiftOutlined,
  UserOutlined,
  ClearOutlined,
} from '@ant-design/icons'
import { getResgates } from '../../lib/api'
import dayjs from 'dayjs'

const { Text } = Typography

const ResgatesAssociado = () => {
  const [resgates, setResgates] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filtros e paginação
  const [filtroBeneficio, setFiltroBeneficio] = useState('')
  const [filtroNome, setFiltroNome] = useState('')
  const [filtroCPF, setFiltroCPF] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('ativo')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Função para determinar se o benefício está ativo
  const isBeneficioAtivo = (beneficio) => {
    if (!beneficio) return false
    if (!beneficio.ativo) return false
    if (beneficio.validade) {
      const validadeDate = new Date(beneficio.validade)
      const hoje = new Date()
      if (validadeDate < hoje) return false
    }
    return true
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await getResgates()
      setResgates(response.data || [])
    } catch (error) {
      console.error('Erro ao carregar resgates:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar resgates
  const resgatesFiltrados = useMemo(() => {
    return resgates.filter(resgate => {
      const matchBeneficio = !filtroBeneficio || 
        (resgate.beneficio?.titulo || '').toLowerCase().includes(filtroBeneficio.toLowerCase()) ||
        (resgate.beneficio?.codigo || '').toLowerCase().includes(filtroBeneficio.toLowerCase()) ||
        (resgate.codigo || '').toLowerCase().includes(filtroBeneficio.toLowerCase())
      
      const matchNome = !filtroNome || 
        (resgate.nome || '').toLowerCase().includes(filtroNome.toLowerCase())
      
      const matchCPF = !filtroCPF || 
        (resgate.cpf || '').replace(/\D/g, '').includes(filtroCPF.replace(/\D/g, ''))
      
      const matchStatus = !filtroStatus || (() => {
        const ativo = isBeneficioAtivo(resgate.beneficio)
        if (filtroStatus === 'ativo') return ativo
        if (filtroStatus === 'inativo') return !ativo
        return true
      })()
      
      return matchBeneficio && matchNome && matchCPF && matchStatus
    })
  }, [resgates, filtroBeneficio, filtroNome, filtroCPF, filtroStatus])

  // Paginar resgates filtrados
  const resgatesPaginados = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return resgatesFiltrados.slice(start, end)
  }, [resgatesFiltrados, currentPage, pageSize])

  const handleLimparFiltros = () => {
    setFiltroBeneficio('')
    setFiltroNome('')
    setFiltroCPF('')
    setFiltroStatus('ativo') // Voltar para o padrão
    setCurrentPage(1)
  }

  const columns = [
    {
      title: 'Benefício',
      dataIndex: 'beneficio',
      key: 'beneficio',
      render: (beneficio, record) => (
        <div>
          <div>{beneficio?.titulo || 'Benefício não encontrado'}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Código: {record.codigo || beneficio?.codigo || 'N/A'}
          </Text>
        </div>
      ),
      sorter: (a, b) => (a.beneficio?.titulo || '').localeCompare(b.beneficio?.titulo || ''),
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      render: (tipo) => (
        <Tag color={tipo === 'publico' ? 'blue' : 'green'}>
          {tipo === 'publico' ? 'Público' : 'Associado'}
        </Tag>
      ),
      filters: [
        { text: 'Público', value: 'publico' },
        { text: 'Associado', value: 'privado' },
      ],
      onFilter: (value, record) => record.tipo === value,
    },
    {
      title: 'Status do Benefício',
      key: 'statusBeneficio',
      render: (_, record) => {
        const ativo = isBeneficioAtivo(record.beneficio)
        const beneficio = record.beneficio
        let motivo = ''
        
        if (!beneficio) {
          motivo = 'Benefício não encontrado'
        } else if (!beneficio.ativo) {
          motivo = 'Benefício desativado'
        } else if (beneficio.validade && new Date(beneficio.validade) < new Date()) {
          motivo = `Expirado em ${dayjs(beneficio.validade).format('DD/MM/YYYY')}`
        }
        
        return (
          <div>
            <Tag color={ativo ? 'green' : 'red'}>
              {ativo ? 'Ativo' : 'Inativo'}
            </Tag>
            {!ativo && motivo && (
              <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                {motivo}
              </div>
            )}
            {ativo && beneficio?.validade && (
              <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                Válido até {dayjs(beneficio.validade).format('DD/MM/YYYY')}
              </div>
            )}
          </div>
        )
      },
      filters: [
        { text: 'Ativo', value: 'ativo' },
        { text: 'Inativo', value: 'inativo' },
      ],
      onFilter: (value, record) => {
        const ativo = isBeneficioAtivo(record.beneficio)
        if (value === 'ativo') return ativo
        if (value === 'inativo') return !ativo
        return true
      },
    },
    {
      title: 'Nome',
      dataIndex: 'nome',
      key: 'nome',
      render: (nome, record) => {
        if (record.tipo === 'publico') {
          return nome || '-'
        }
        return <Text type="secondary">Usuário Associado</Text>
      },
    },
    {
      title: 'CPF',
      dataIndex: 'cpf',
      key: 'cpf',
      render: (cpf, record) => {
        if (record.tipo === 'publico' && cpf) {
          return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
        }
        return '-'
      },
    },
    {
      title: 'Telefone',
      dataIndex: 'telefone',
      key: 'telefone',
      render: (telefone, record) => {
        if (record.tipo === 'publico' && telefone) {
          return telefone
        }
        return '-'
      },
    },
    {
      title: 'Data do Resgate',
      dataIndex: 'dataResgate',
      key: 'dataResgate',
      render: (dataResgate) => dataResgate ? dayjs(dataResgate).format('DD/MM/YYYY HH:mm') : '-',
      sorter: (a, b) => new Date(a.dataResgate) - new Date(b.dataResgate),
    },
  ]

  return (
    <div>
      <Card
        title={
          <Space>
            <ShoppingOutlined />
            <span>Resgates Realizados</span>
          </Space>
        }
      >
        {/* Filtros */}
        <Space direction="vertical" style={{ width: '100%', marginBottom: '16px' }} size="middle">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <Button 
              icon={<ClearOutlined />} 
              onClick={handleLimparFiltros}
              size="small"
            >
              Limpar Filtros
            </Button>
          </div>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={6}>
              <Input
                placeholder="Filtrar por Benefício ou Código"
                prefix={<GiftOutlined />}
                value={filtroBeneficio}
                onChange={(e) => {
                  setFiltroBeneficio(e.target.value)
                  setCurrentPage(1)
                }}
                allowClear
              />
            </Col>
            <Col xs={24} sm={6}>
              <Input
                placeholder="Filtrar por Nome"
                prefix={<UserOutlined />}
                value={filtroNome}
                onChange={(e) => {
                  setFiltroNome(e.target.value)
                  setCurrentPage(1)
                }}
                allowClear
              />
            </Col>
            <Col xs={24} sm={6}>
              <Input
                placeholder="Filtrar por CPF"
                value={filtroCPF}
                onChange={(e) => {
                  setFiltroCPF(e.target.value.replace(/\D/g, ''))
                  setCurrentPage(1)
                }}
                maxLength={11}
                allowClear
              />
            </Col>
            <Col xs={24} sm={6}>
              <Select
                placeholder="Filtrar por Status"
                style={{ width: '100%' }}
                value={filtroStatus}
                onChange={(value) => {
                  setFiltroStatus(value)
                  setCurrentPage(1)
                }}
                allowClear
              >
                <Select.Option value="ativo">Ativo</Select.Option>
                <Select.Option value="inativo">Inativo</Select.Option>
              </Select>
            </Col>
          </Row>
          {resgates.length > 0 && (
            <Text type="secondary">
              Mostrando {resgatesPaginados.length} de {resgatesFiltrados.length} resgate(s)
            </Text>
          )}
        </Space>

        {resgatesFiltrados.length > 0 ? (
          <>
            <Table
              dataSource={resgatesPaginados}
              columns={columns}
              rowKey="_id"
              loading={loading}
              pagination={false}
            />
            <div style={{ marginTop: '16px', textAlign: 'right' }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={resgatesFiltrados.length}
                onChange={(page, size) => {
                  setCurrentPage(page)
                  setPageSize(size)
                }}
                showSizeChanger
                showTotal={(total) => `Total: ${total} resgates`}
              />
            </div>
          </>
        ) : resgates.length > 0 ? (
          <Empty description="Nenhum resgate encontrado com os filtros aplicados" />
        ) : (
          <Empty description="Nenhum resgate realizado ainda" />
        )}
      </Card>
    </div>
  )
}

export default ResgatesAssociado

