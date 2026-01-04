import { useState, useEffect, useMemo } from 'react'
import { Card, Row, Col, Typography, Button, Space, List, Tag, Empty, Modal, Form, Input, InputNumber, DatePicker, message, Upload, Popconfirm, Table, Pagination, Spin, Select } from 'antd'
import {
  GiftOutlined,
  PlusOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  ClearOutlined,
} from '@ant-design/icons'
import { getBeneficios, createBeneficio, updateBeneficio, deleteBeneficio } from '../../lib/api'
import dayjs from 'dayjs'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input
const { RangePicker } = DatePicker

const BeneficiosAssociado = () => {
  const [beneficios, setBeneficios] = useState([])
  const [loading, setLoading] = useState(true)
  const [beneficioModalVisible, setBeneficioModalVisible] = useState(false)
  const [editingBeneficio, setEditingBeneficio] = useState(null)
  const [beneficioForm] = Form.useForm()
  
  // Filtros e paginação
  const [filtroTitulo, setFiltroTitulo] = useState('')
  const [filtroCodigo, setFiltroCodigo] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('ativo')
  const [filtroValidade, setFiltroValidade] = useState(null) // RangePicker retorna [startDate, endDate]
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await getBeneficios()
      setBeneficios(response.data || [])
    } catch (error) {
      console.error('Erro ao carregar benefícios:', error)
      message.error('Erro ao carregar benefícios')
    } finally {
      setLoading(false)
    }
  }

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleCreateBeneficio = async (values) => {
    try {
      let imagemBase64 = null
      if (values.imagemFile && values.imagemFile.length > 0) {
        const file = values.imagemFile[0]
        if (file.originFileObj) {
          imagemBase64 = await convertImageToBase64(file.originFileObj)
        } else if (file.url) {
          imagemBase64 = file.url
        }
      }

      const data = {
        ...values,
        imagem: imagemBase64,
        validade: values.validade ? values.validade.toISOString() : null,
      }

      if (editingBeneficio) {
        await updateBeneficio(editingBeneficio._id, data)
        message.success('Benefício atualizado com sucesso!')
      } else {
        await createBeneficio(data)
        message.success('Benefício criado com sucesso!')
      }
      
      setBeneficioModalVisible(false)
      setEditingBeneficio(null)
      beneficioForm.resetFields()
      loadData()
    } catch (error) {
      message.error(error.response?.data?.error || 'Erro ao salvar benefício')
    }
  }

  const handleEditBeneficio = (beneficio) => {
    setEditingBeneficio(beneficio)
    
    let imagemFileList = []
    if (beneficio.imagem) {
      imagemFileList = [{
        uid: '-1',
        name: 'imagem.jpg',
        status: 'done',
        url: beneficio.imagem,
        thumbUrl: beneficio.imagem,
      }]
    }

    beneficioForm.setFieldsValue({
      ...beneficio,
      validade: beneficio.validade ? dayjs(beneficio.validade) : null,
      imagemFile: imagemFileList,
    })
    setBeneficioModalVisible(true)
  }

  const handleDeleteBeneficio = async (id) => {
    try {
      await deleteBeneficio(id)
      message.success('Benefício excluído com sucesso!')
      loadData()
    } catch (error) {
      message.error(error.response?.data?.error || 'Erro ao excluir benefício')
    }
  }

  const handleLimparFiltros = () => {
    setFiltroTitulo('')
    setFiltroCodigo('')
    setFiltroStatus('ativo') // Voltar para o padrão
    setFiltroValidade(null)
    setCurrentPage(1)
  }

  // Filtrar benefícios
  const beneficiosFiltrados = useMemo(() => {
    return beneficios.filter(beneficio => {
      const matchTitulo = !filtroTitulo || 
        (beneficio.titulo || '').toLowerCase().includes(filtroTitulo.toLowerCase())
      const matchCodigo = !filtroCodigo || 
        (beneficio.codigo || '').toLowerCase().includes(filtroCodigo.toLowerCase())
      
      // Filtro por status
      const matchStatus = !filtroStatus || (() => {
        if (filtroStatus === 'ativo') return beneficio.ativo === true
        if (filtroStatus === 'inativo') return beneficio.ativo === false
        return true
      })()
      
      // Filtro por data de validade (range)
      const matchValidade = !filtroValidade || (() => {
        if (!beneficio.validade) return false // Se não tem validade, não mostra no filtro de data
        const validadeDate = dayjs(beneficio.validade)
        const [startDate, endDate] = filtroValidade
        if (startDate && endDate) {
          return validadeDate.isAfter(startDate.subtract(1, 'day'), 'day') && 
                 validadeDate.isBefore(endDate.add(1, 'day'), 'day')
        }
        if (startDate) {
          return validadeDate.isAfter(startDate.subtract(1, 'day'), 'day')
        }
        if (endDate) {
          return validadeDate.isBefore(endDate.add(1, 'day'), 'day')
        }
        return true
      })()
      
      return matchTitulo && matchCodigo && matchStatus && matchValidade
    })
  }, [beneficios, filtroTitulo, filtroCodigo, filtroStatus, filtroValidade])

  // Paginar benefícios filtrados
  const beneficiosPaginados = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return beneficiosFiltrados.slice(start, end)
  }, [beneficiosFiltrados, currentPage, pageSize])

  const columns = [
    {
      title: 'Título',
      dataIndex: 'titulo',
      key: 'titulo',
      sorter: (a, b) => (a.titulo || '').localeCompare(b.titulo || ''),
    },
    {
      title: 'Código',
      dataIndex: 'codigo',
      key: 'codigo',
      sorter: (a, b) => (a.codigo || '').localeCompare(b.codigo || ''),
    },
    {
      title: 'Desconto',
      dataIndex: 'desconto',
      key: 'desconto',
      render: (desconto) => desconto ? `${desconto}%` : '-',
    },
    {
      title: 'Quantidade',
      dataIndex: 'quantidade',
      key: 'quantidade',
      render: (quantidade, record) => {
        if (quantidade === null) return 'Ilimitado'
        return `${record.quantidadeDisponivel || 0} / ${quantidade}`
      },
    },
    {
      title: 'Validade',
      dataIndex: 'validade',
      key: 'validade',
      render: (validade) => {
        if (!validade) return '-'
        const validadeDate = dayjs(validade)
        const hoje = dayjs()
        const isExpirado = validadeDate.isBefore(hoje, 'day')
        return (
          <span style={{ color: isExpirado ? '#ff4d4f' : 'inherit' }}>
            {validadeDate.format('DD/MM/YYYY')}
            {isExpirado && <Tag color="red" style={{ marginLeft: '8px' }}>Expirado</Tag>}
          </span>
        )
      },
      sorter: (a, b) => {
        if (!a.validade && !b.validade) return 0
        if (!a.validade) return 1
        if (!b.validade) return -1
        return new Date(a.validade) - new Date(b.validade)
      },
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
      title: 'Ações',
      key: 'acoes',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditBeneficio(record)}
          />
          <Popconfirm
            title="Tem certeza que deseja excluir este benefício?"
            onConfirm={() => handleDeleteBeneficio(record._id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card
        title={
          <Space>
            <GiftOutlined />
            <span>Benefícios da Minha Empresa</span>
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
              setEditingBeneficio(null)
              beneficioForm.resetFields()
              setBeneficioModalVisible(true)
            }}
          >
            Novo Benefício
          </Button>
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
            <Col xs={24} sm={8}>
              <Input
                placeholder="Filtrar por Título"
                prefix={<GiftOutlined />}
                value={filtroTitulo}
                onChange={(e) => {
                  setFiltroTitulo(e.target.value)
                  setCurrentPage(1)
                }}
                allowClear
              />
            </Col>
            <Col xs={24} sm={8}>
              <Input
                placeholder="Filtrar por Código"
                value={filtroCodigo}
                onChange={(e) => {
                  setFiltroCodigo(e.target.value)
                  setCurrentPage(1)
                }}
                allowClear
              />
            </Col>
            <Col xs={24} sm={8}>
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
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <RangePicker
                placeholder={['Data inicial', 'Data final']}
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                value={filtroValidade}
                onChange={(dates) => {
                  setFiltroValidade(dates)
                  setCurrentPage(1)
                }}
                allowClear
              />
              <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                Filtrar por período de validade
              </Text>
            </Col>
          </Row>
          {beneficios.length > 0 && (
            <Text type="secondary">
              Mostrando {beneficiosPaginados.length} de {beneficiosFiltrados.length} benefício(s)
            </Text>
          )}
        </Space>

        <Spin spinning={loading} tip="Carregando benefícios...">
          {beneficiosFiltrados.length > 0 ? (
            <>
              <Table
                dataSource={beneficiosPaginados}
                columns={columns}
                rowKey="_id"
                loading={loading}
                pagination={false}
              />
              <div style={{ marginTop: '16px', textAlign: 'right' }}>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={beneficiosFiltrados.length}
                  onChange={(page, size) => {
                    setCurrentPage(page)
                    setPageSize(size)
                  }}
                  showSizeChanger
                  showTotal={(total) => `Total: ${total} benefícios`}
                />
              </div>
            </>
          ) : !loading ? (
            <Empty description="Nenhum benefício encontrado" />
          ) : null}
        </Spin>
      </Card>

      {/* Modal de Criar/Editar Benefício */}
      <Modal
        title={editingBeneficio ? 'Editar Benefício' : 'Novo Benefício'}
        open={beneficioModalVisible}
        onCancel={() => {
          setBeneficioModalVisible(false)
          setEditingBeneficio(null)
          beneficioForm.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form
          form={beneficioForm}
          layout="vertical"
          onFinish={handleCreateBeneficio}
        >
          <Form.Item
            name="titulo"
            label="Título"
            rules={[{ required: true, message: 'Título é obrigatório' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="descricao"
            label="Descrição"
            rules={[{ required: true, message: 'Descrição é obrigatória' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="codigo"
            label="Código"
            rules={[{ required: true, message: 'Código é obrigatório' }]}
          >
            <Input placeholder="Ex: DESCONTO10" style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="desconto"
                label="Desconto (%)"
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="quantidade"
                label="Quantidade"
                tooltip="Deixe vazio para ilimitado"
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="condicoes"
            label="Condições"
          >
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="validade"
            label="Validade"
          >
            <DatePicker 
              style={{ width: '100%' }} 
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
          <Form.Item
            name="imagemFile"
            label="Imagem"
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => {
                setBeneficioModalVisible(false)
                setEditingBeneficio(null)
                beneficioForm.resetFields()
              }}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                {editingBeneficio ? 'Atualizar' : 'Criar'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default BeneficiosAssociado

