import { useState, useEffect, useMemo } from 'react'
import { Layout, Card, Row, Col, Typography, Button, Space, List, Tag, Empty, Modal, Form, Input, InputNumber, DatePicker, TimePicker, Select, message, Upload, Popconfirm } from 'antd'
import {
  GiftOutlined,
  BookOutlined,
  CalendarOutlined,
  LogoutOutlined,
  UserOutlined,
  PlusOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getBeneficios, getCapacitacoes, getEventos, createBeneficio, createCapacitacao, createEvento, updateBeneficio, deleteBeneficio, updateCapacitacao, deleteCapacitacao, updateEvento, deleteEvento, getResgates } from '../../lib/api'
import dayjs from 'dayjs'

const { Content } = Layout
const { Title, Paragraph, Text } = Typography
const { TextArea } = Input

const AssociadoDashboard = () => {
  const navigate = useNavigate()
  const [beneficios, setBeneficios] = useState([])
  const [capacitacoes, setCapacitacoes] = useState([])
  const [eventos, setEventos] = useState([])
  const [resgates, setResgates] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filtros para resgates
  const [filtroBeneficio, setFiltroBeneficio] = useState('')
  const [filtroNome, setFiltroNome] = useState('')
  const [filtroCPF, setFiltroCPF] = useState('')
  
  // Estados para modais
  const [beneficioModalVisible, setBeneficioModalVisible] = useState(false)
  const [capacitacaoModalVisible, setCapacitacaoModalVisible] = useState(false)
  const [eventoModalVisible, setEventoModalVisible] = useState(false)
  
  // Estados para edição
  const [editingBeneficio, setEditingBeneficio] = useState(null)
  const [editingCapacitacao, setEditingCapacitacao] = useState(null)
  const [editingEvento, setEditingEvento] = useState(null)
  
  const [beneficioForm] = Form.useForm()
  const [capacitacaoForm] = Form.useForm()
  const [eventoForm] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [beneficiosRes, capacitacoesRes, eventosRes, resgatesRes] = await Promise.all([
        getBeneficios().catch(() => ({ data: [] })),
        getCapacitacoes().catch(() => ({ data: [] })),
        getEventos().catch(() => ({ data: [] })),
        getResgates().catch(() => ({ data: [] }))
      ])

      setBeneficios(beneficiosRes.data)
      setCapacitacoes(capacitacoesRes.data.filter(c => new Date(c.data) >= new Date()))
      setEventos(eventosRes.data.filter(e => new Date(e.data) >= new Date()))
      setResgates(resgatesRes.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('associadoToken')
    localStorage.removeItem('associado')
    navigate('/associado/login')
  }

  const handleCreateBeneficio = async (values) => {
    try {
      // Converter imagem para base64 se houver
      let imagemBase64 = null
      if (values.imagemFile && values.imagemFile.length > 0) {
        const file = values.imagemFile[0]
        if (file.originFileObj) {
          imagemBase64 = await convertImageToBase64(file.originFileObj)
        } else if (file.url) {
          // Imagem existente (não alterada)
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
    
    // Preparar imagem para o Upload
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

  const handleCreateCapacitacao = async (values) => {
    try {
      // Converter imagem para base64 se houver
      let imagemBase64 = null
      if (values.imagemFile && values.imagemFile.length > 0) {
        const file = values.imagemFile[0]
        if (file.originFileObj) {
          imagemBase64 = await convertImageToBase64(file.originFileObj)
        } else if (file.url) {
          // Imagem existente (não alterada)
          imagemBase64 = file.url
        }
      }

      const data = {
        ...values,
        imagem: imagemBase64,
        data: values.data.toISOString(),
      }

      if (editingCapacitacao) {
        await updateCapacitacao(editingCapacitacao._id, data)
        message.success('Capacitação atualizada com sucesso!')
      } else {
        await createCapacitacao(data)
        message.success('Capacitação criada com sucesso!')
      }
      
      setCapacitacaoModalVisible(false)
      setEditingCapacitacao(null)
      capacitacaoForm.resetFields()
      loadData()
    } catch (error) {
      message.error(error.response?.data?.error || 'Erro ao salvar capacitação')
    }
  }

  const handleEditCapacitacao = (capacitacao) => {
    setEditingCapacitacao(capacitacao)
    
    // Preparar imagem para o Upload
    let imagemFileList = []
    if (capacitacao.imagem) {
      imagemFileList = [{
        uid: '-1',
        name: 'imagem.jpg',
        status: 'done',
        url: capacitacao.imagem,
        thumbUrl: capacitacao.imagem,
      }]
    }

    capacitacaoForm.setFieldsValue({
      ...capacitacao,
      data: capacitacao.data ? dayjs(capacitacao.data) : null,
      imagemFile: imagemFileList,
    })
    setCapacitacaoModalVisible(true)
  }

  const handleDeleteCapacitacao = async (id) => {
    try {
      await deleteCapacitacao(id)
      message.success('Capacitação excluída com sucesso!')
      loadData()
    } catch (error) {
      message.error(error.response?.data?.error || 'Erro ao excluir capacitação')
    }
  }

  const handleCreateEvento = async (values) => {
    try {
      const data = {
        ...values,
        data: values.data ? values.data.format('YYYY-MM-DD') : null,
        hora: values.hora ? values.hora.format('HH:mm') : null,
      }

      if (editingEvento) {
        await updateEvento(editingEvento._id, data)
        message.success('Evento atualizado com sucesso!')
      } else {
        await createEvento(data)
        message.success('Evento criado com sucesso!')
      }
      
      setEventoModalVisible(false)
      setEditingEvento(null)
      eventoForm.resetFields()
      loadData()
    } catch (error) {
      message.error(error.response?.data?.error || 'Erro ao salvar evento')
    }
  }

  const handleEditEvento = (evento) => {
    setEditingEvento(evento)
    
    // Preparar data e hora para o formulário
    let dataValue = null
    let horaValue = null
    
    if (evento.data) {
      dataValue = dayjs(evento.data)
    }
    
    if (evento.hora) {
      // Se hora está no formato HH:mm, criar um dayjs object
      if (typeof evento.hora === 'string') {
        horaValue = dayjs(evento.hora, 'HH:mm')
      } else {
        horaValue = dayjs(evento.hora)
      }
    }
    
    eventoForm.setFieldsValue({
      ...evento,
      data: dataValue,
      hora: horaValue,
    })
    setEventoModalVisible(true)
  }

  const handleDeleteEvento = async (id) => {
    try {
      await deleteEvento(id)
      message.success('Evento excluído com sucesso!')
      loadData()
    } catch (error) {
      message.error(error.response?.data?.error || 'Erro ao excluir evento')
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

  const associado = JSON.parse(localStorage.getItem('associado') || '{}')

  // Filtrar resgates baseado nos filtros
  const resgatesFiltrados = useMemo(() => {
    return resgates.filter(resgate => {
      // Filtro por benefício (título ou código)
      const matchBeneficio = !filtroBeneficio || 
        (resgate.beneficio?.titulo || '').toLowerCase().includes(filtroBeneficio.toLowerCase()) ||
        (resgate.beneficio?.codigo || '').toLowerCase().includes(filtroBeneficio.toLowerCase()) ||
        (resgate.codigo || '').toLowerCase().includes(filtroBeneficio.toLowerCase())
      
      // Filtro por nome
      const matchNome = !filtroNome || 
        (resgate.nome || '').toLowerCase().includes(filtroNome.toLowerCase())
      
      // Filtro por CPF (remove formatação para comparação)
      const matchCPF = !filtroCPF || 
        (resgate.cpf || '').replace(/\D/g, '').includes(filtroCPF.replace(/\D/g, ''))
      
      return matchBeneficio && matchNome && matchCPF
    })
  }, [resgates, filtroBeneficio, filtroNome, filtroCPF])

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <div style={{ background: '#fff', padding: '16px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <UserOutlined style={{ fontSize: '24px' }} />
            <div>
              <Title level={4} style={{ margin: 0 }}>Olá, {associado.name || 'Associado'}!</Title>
              <Paragraph style={{ margin: 0, color: '#8c8c8c' }}>{associado.email}</Paragraph>
            </div>
          </Space>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </div>

      <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <Title level={2} style={{ margin: 0, marginBottom: '8px' }}>Dashboard do Associado</Title>
            <Paragraph style={{ margin: 0, color: '#666' }}>
              Gerencie os benefícios, capacitações e eventos da sua empresa.
            </Paragraph>
          </div>
          <Button 
            type="default" 
            icon={<EditOutlined />} 
            onClick={() => {
              console.log('Navegando para editar empresa...')
              navigate('editar-empresa')
            }}
            size="large"
          >
            Alterar Dados da Empresa
          </Button>
        </div>

        <Row gutter={[24, 24]}>
          {/* Benefícios */}
          <Col xs={24} lg={12}>
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
                  size="small"
                  onClick={() => {
                    setEditingBeneficio(null)
                    beneficioForm.resetFields()
                    setBeneficioModalVisible(true)
                  }}
                >
                  Novo
                </Button>
              }
            >
              {beneficios.length > 0 ? (
                <List
                  dataSource={beneficios}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button
                          key="edit"
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEditBeneficio(item)}
                        />,
                        <Popconfirm
                          key="delete"
                          title="Tem certeza que deseja excluir este benefício?"
                          onConfirm={() => handleDeleteBeneficio(item._id)}
                          okText="Sim"
                          cancelText="Não"
                        >
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>,
                      ]}
                    >
                      <List.Item.Meta
                        title={item.titulo}
                        description={
                          <div>
                            <Paragraph ellipsis={{ rows: 2 }}>{item.descricao}</Paragraph>
                            <Space>
                              {item.desconto && (
                                <Tag color="green">{item.desconto}% OFF</Tag>
                              )}
                              {item.codigo && (
                                <Tag>Código: {item.codigo}</Tag>
                              )}
                              {item.quantidade !== null && (
                                <Text type="secondary">
                                  {item.quantidadeDisponivel || 0} disponíveis
                                </Text>
                              )}
                            </Space>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="Nenhum benefício cadastrado" />
              )}
            </Card>
          </Col>

          {/* Capacitações */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <BookOutlined />
                  <span>Capacitações da Minha Empresa</span>
                </Space>
              }
              extra={
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  size="small"
                  onClick={() => {
                    setEditingCapacitacao(null)
                    capacitacaoForm.resetFields()
                    setCapacitacaoModalVisible(true)
                  }}
                >
                  Nova
                </Button>
              }
            >
              {capacitacoes.length > 0 ? (
                <List
                  dataSource={capacitacoes}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button
                          key="edit"
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEditCapacitacao(item)}
                        />,
                        <Popconfirm
                          key="delete"
                          title="Tem certeza que deseja excluir esta capacitação?"
                          onConfirm={() => handleDeleteCapacitacao(item._id)}
                          okText="Sim"
                          cancelText="Não"
                        >
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>,
                      ]}
                    >
                      <List.Item.Meta
                        title={item.titulo}
                        description={
                          <div>
                            <Paragraph ellipsis={{ rows: 1 }}>{item.descricao}</Paragraph>
                            <Space>
                              <Tag>{item.tipo}</Tag>
                              <span>{dayjs(item.data).format('DD/MM/YYYY')}</span>
                            </Space>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="Nenhuma capacitação cadastrada" />
              )}
            </Card>
          </Col>

          {/* Eventos */}
          <Col xs={24}>
            <Card
              title={
                <Space>
                  <CalendarOutlined />
                  <span>Eventos da Minha Empresa</span>
                </Space>
              }
              extra={
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  size="small"
                  onClick={() => {
                    setEditingEvento(null)
                    eventoForm.resetFields()
                    setEventoModalVisible(true)
                  }}
                >
                  Novo
                </Button>
              }
            >
              {eventos.length > 0 ? (
                <List
                  dataSource={eventos}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button
                          key="edit"
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEditEvento(item)}
                        />,
                        <Popconfirm
                          key="delete"
                          title="Tem certeza que deseja excluir este evento?"
                          onConfirm={() => handleDeleteEvento(item._id)}
                          okText="Sim"
                          cancelText="Não"
                        >
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>,
                      ]}
                    >
                      <List.Item.Meta
                        title={item.titulo}
                        description={
                          <div>
                            <Paragraph ellipsis={{ rows: 1 }}>{item.descricao}</Paragraph>
                            <Space>
                              <span>{dayjs(item.data).format('DD/MM/YYYY HH:mm')}</span>
                              {item.local && <span>• {item.local}</span>}
                            </Space>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="Nenhum evento cadastrado" />
              )}
            </Card>
          </Col>

          {/* Resgates */}
          <Col xs={24}>
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
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <Input
                      placeholder="Filtrar por Benefício ou Código"
                      prefix={<GiftOutlined />}
                      value={filtroBeneficio}
                      onChange={(e) => setFiltroBeneficio(e.target.value)}
                      allowClear
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <Input
                      placeholder="Filtrar por Nome"
                      prefix={<UserOutlined />}
                      value={filtroNome}
                      onChange={(e) => setFiltroNome(e.target.value)}
                      allowClear
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <Input
                      placeholder="Filtrar por CPF"
                      value={filtroCPF}
                      onChange={(e) => setFiltroCPF(e.target.value.replace(/\D/g, ''))}
                      maxLength={11}
                      allowClear
                    />
                  </Col>
                </Row>
                {resgates.length > 0 && (
                  <Text type="secondary">
                    Mostrando {resgatesFiltrados.length} de {resgates.length} resgate(s)
                  </Text>
                )}
              </Space>

              {resgatesFiltrados.length > 0 ? (
                <List
                  dataSource={resgatesFiltrados}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Space>
                            <span>{item.beneficio?.titulo || 'Benefício não encontrado'}</span>
                            <Tag color={item.tipo === 'publico' ? 'blue' : 'green'}>
                              {item.tipo === 'publico' ? 'Público' : 'Associado'}
                            </Tag>
                          </Space>
                        }
                        description={
                          <div>
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                              {item.tipo === 'publico' ? (
                                <>
                                  {item.nome && (
                                    <div>
                                      <Text strong>Nome:</Text> {item.nome}
                                    </div>
                                  )}
                                  {item.cpf && (
                                    <div>
                                      <Text strong>CPF:</Text> {item.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                                    </div>
                                  )}
                                  {item.telefone && (
                                    <div>
                                      <Text strong>Telefone:</Text> {item.telefone}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div>
                                  <Text type="secondary">Resgatado por associado logado</Text>
                                </div>
                              )}
                              <div>
                                <Text strong>Código:</Text> {item.codigo || item.beneficio?.codigo || 'N/A'}
                              </div>
                              <div>
                                <Text type="secondary">
                                  Resgatado em: {dayjs(item.dataResgate).format('DD/MM/YYYY HH:mm')}
                                </Text>
                              </div>
                            </Space>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : resgates.length > 0 ? (
                <Empty description="Nenhum resgate encontrado com os filtros aplicados" />
              ) : (
                <Empty description="Nenhum resgate realizado ainda" />
              )}
            </Card>
          </Col>
        </Row>
      </Content>

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
            label="Código do Benefício"
            rules={[{ required: true, message: 'Código é obrigatório' }]}
          >
            <Input placeholder="Ex: DESCONTO10" />
          </Form.Item>
          <Form.Item
            name="desconto"
            label="Desconto (%)"
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="condicoes"
            label="Condições"
          >
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="validade"
            label="Data de Validade"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="quantidade"
            label="Quantidade Disponível (deixe vazio para ilimitado)"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="imagemFile"
            label="Imagem"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) return e.slice(0, 1)
              if (e?.fileList) return e.fileList.slice(0, 1)
              return []
            }}
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
              accept="image/*"
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingBeneficio ? 'Salvar' : 'Criar'}
              </Button>
              <Button onClick={() => {
                setBeneficioModalVisible(false)
                setEditingBeneficio(null)
                beneficioForm.resetFields()
              }}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Criar/Editar Capacitação */}
      <Modal
        title={editingCapacitacao ? 'Editar Capacitação' : 'Nova Capacitação'}
        open={capacitacaoModalVisible}
        onCancel={() => {
          setCapacitacaoModalVisible(false)
          setEditingCapacitacao(null)
          capacitacaoForm.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form
          form={capacitacaoForm}
          layout="vertical"
          onFinish={handleCreateCapacitacao}
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
            name="tipo"
            label="Tipo"
            rules={[{ required: true, message: 'Tipo é obrigatório' }]}
          >
            <Select>
              <Select.Option value="palestra">Palestra</Select.Option>
              <Select.Option value="curso">Curso</Select.Option>
              <Select.Option value="workshop">Workshop</Select.Option>
              <Select.Option value="treinamento">Treinamento</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="data"
            label="Data"
            rules={[{ required: true, message: 'Data é obrigatória' }]}
          >
            <DatePicker style={{ width: '100%' }} showTime />
          </Form.Item>
          <Form.Item
            name="local"
            label="Local"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="link"
            label="Link"
          >
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item
            name="vagas"
            label="Vagas (deixe vazio para ilimitado)"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="valor"
            label="Valor (R$)"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="imagemFile"
            label="Imagem"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) return e.slice(0, 1)
              if (e?.fileList) return e.fileList.slice(0, 1)
              return []
            }}
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
              accept="image/*"
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCapacitacao ? 'Salvar' : 'Criar'}
              </Button>
              <Button onClick={() => {
                setCapacitacaoModalVisible(false)
                setEditingCapacitacao(null)
                capacitacaoForm.resetFields()
              }}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Criar/Editar Evento */}
      <Modal
        title={editingEvento ? 'Editar Evento' : 'Novo Evento'}
        open={eventoModalVisible}
        onCancel={() => {
          setEventoModalVisible(false)
          setEditingEvento(null)
          eventoForm.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form
          form={eventoForm}
          layout="vertical"
          onFinish={handleCreateEvento}
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
            name="data"
            label="Data"
            rules={[{ required: true, message: 'Data é obrigatória' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="hora"
            label="Hora"
            rules={[{ required: true, message: 'Hora é obrigatória' }]}
          >
            <TimePicker style={{ width: '100%' }} format="HH:mm" />
          </Form.Item>
          <Form.Item
            name="local"
            label="Local"
            rules={[{ required: true, message: 'Local é obrigatório' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="categoria"
            label="Categoria"
            rules={[{ required: true, message: 'Categoria é obrigatória' }]}
          >
            <Select>
              <Select.Option value="networking">Networking</Select.Option>
              <Select.Option value="palestra">Palestra</Select.Option>
              <Select.Option value="workshop">Workshop</Select.Option>
              <Select.Option value="feira">Feira</Select.Option>
              <Select.Option value="outro">Outro</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="palestrante"
            label="Palestrante"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="vagas"
            label="Vagas"
            rules={[{ required: true, message: 'Vagas é obrigatório' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingEvento ? 'Salvar' : 'Criar'}
              </Button>
              <Button onClick={() => {
                setEventoModalVisible(false)
                setEditingEvento(null)
                eventoForm.resetFields()
              }}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}

export default AssociadoDashboard
