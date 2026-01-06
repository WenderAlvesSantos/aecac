import { useState, useEffect, useMemo } from 'react'
import { Card, Row, Col, Typography, Button, Space, Tag, Empty, Modal, Form, Input, InputNumber, DatePicker, TimePicker, Select, message, Popconfirm, Table, Pagination, Spin, Progress } from 'antd'

const { RangePicker } = DatePicker
import {
  CalendarOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClearOutlined,
  TeamOutlined,
  DownloadOutlined,
  SearchOutlined,
  FileExcelOutlined,
  PrinterOutlined,
  MailOutlined,
} from '@ant-design/icons'
import * as XLSX from 'xlsx'
import { getEventos, createEvento, updateEvento, deleteEvento, getInscritosEvento } from '../../lib/api'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { TextArea } = Input

const EventosAssociado = () => {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [eventoModalVisible, setEventoModalVisible] = useState(false)
  const [editingEvento, setEditingEvento] = useState(null)
  const [eventoForm] = Form.useForm()
  const [inscritosModalVisible, setInscritosModalVisible] = useState(false)
  const [inscritos, setInscritos] = useState([])
  const [inscritosFiltrados, setInscritosFiltrados] = useState([])
  const [loadingInscritos, setLoadingInscritos] = useState(false)
  const [eventoSelecionado, setEventoSelecionado] = useState(null)
  // Filtros do modal de inscritos
  const [filtroInscritosTipo, setFiltroInscritosTipo] = useState('')
  const [filtroInscritosNome, setFiltroInscritosNome] = useState('')
  const [filtroInscritosCPF, setFiltroInscritosCPF] = useState('')
  const [filtroInscritosData, setFiltroInscritosData] = useState(null)
  // Estados para loading e progresso das exportações
  const [exportandoCSV, setExportandoCSV] = useState(false)
  const [exportandoExcel, setExportandoExcel] = useState(false)
  const [imprimindo, setImprimindo] = useState(false)
  const [compartilhandoEmail, setCompartilhandoEmail] = useState(false)
  const [progressoExportacao, setProgressoExportacao] = useState(0)
  
  // Filtros e paginação
  const [filtroTitulo, setFiltroTitulo] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await getEventos()
      setEventos(response.data || [])
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
      message.error('Erro ao carregar eventos')
    } finally {
      setLoading(false)
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
    
    let dataValue = null
    let horaValue = null
    
    if (evento.data) {
      dataValue = dayjs(evento.data)
    }
    
    if (evento.hora) {
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

  const handleVerInscritos = async (evento) => {
    setEventoSelecionado(evento)
    setLoadingInscritos(true)
    setInscritosModalVisible(true)
    // Limpar filtros ao abrir
    setFiltroInscritosTipo('')
    setFiltroInscritosNome('')
    setFiltroInscritosCPF('')
    setFiltroInscritosData(null)
    try {
      const response = await getInscritosEvento(evento._id)
      setInscritos(response.data || [])
      setInscritosFiltrados(response.data || [])
    } catch (error) {
      message.error(error.response?.data?.error || 'Erro ao buscar inscritos')
      setInscritos([])
      setInscritosFiltrados([])
    } finally {
      setLoadingInscritos(false)
    }
  }

  // Filtrar inscritos
  useEffect(() => {
    if (!inscritos.length) {
      setInscritosFiltrados([])
      return
    }

    const filtrados = inscritos.filter(inscrito => {
      // Filtro por tipo
      const matchTipo = !filtroInscritosTipo || inscrito.tipo === filtroInscritosTipo
      
      // Filtro por nome
      const matchNome = !filtroInscritosNome || 
        (inscrito.nome || '').toLowerCase().includes(filtroInscritosNome.toLowerCase())
      
      // Filtro por CPF
      const matchCPF = !filtroInscritosCPF || 
        (inscrito.cpf || '').replace(/\D/g, '').includes(filtroInscritosCPF.replace(/\D/g, ''))
      
      // Filtro por data
      const matchData = !filtroInscritosData || (() => {
        if (!inscrito.dataInscricao) return false
        const dataInscricao = dayjs(inscrito.dataInscricao)
        const [startDate, endDate] = filtroInscritosData
        
        if (startDate && endDate) {
          return dataInscricao.isAfter(startDate.subtract(1, 'day'), 'day') && 
                 dataInscricao.isBefore(endDate.add(1, 'day'), 'day')
        }
        if (startDate) {
          return dataInscricao.isAfter(startDate.subtract(1, 'day'), 'day')
        }
        if (endDate) {
          return dataInscricao.isBefore(endDate.add(1, 'day'), 'day')
        }
        return true
      })()

      return matchTipo && matchNome && matchCPF && matchData
    })

    setInscritosFiltrados(filtrados)
  }, [inscritos, filtroInscritosTipo, filtroInscritosNome, filtroInscritosCPF, filtroInscritosData])

  // Função para preparar dados para exportação (reutilizável)
  const prepararDadosExportacao = () => {
    if (!inscritosFiltrados || inscritosFiltrados.length === 0) {
      return []
    }
    
    return inscritosFiltrados.map(inscrito => ({
      'Tipo': inscrito.tipo === 'publico' ? 'Público' : 'Associado',
      'Nome': inscrito.nome || '',
      'Email': inscrito.email || '',
      'CPF': inscrito.cpf ? inscrito.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '',
      'Telefone': inscrito.telefone || '',
      'Data de Inscrição': inscrito.dataInscricao ? dayjs(inscrito.dataInscricao).format('DD/MM/YYYY HH:mm') : '',
    }))
  }

  // Função para exportar CSV (assíncrona com loading e progresso)
  const handleExportarCSV = async () => {
    // Validação: verificar se há dados para exportar
    if (!inscritosFiltrados || inscritosFiltrados.length === 0) {
      message.warning('Não há dados para exportar. Aplique filtros ou verifique se existem inscritos.')
      return
    }

    await atualizarProgresso(() => {
      try {
        const dados = prepararDadosExportacao()
        
        // Validação adicional: verificar se os dados foram preparados corretamente
        if (!dados || dados.length === 0) {
          message.error('Erro ao preparar dados para exportação')
          return
        }

        // Processar em chunks para não bloquear UI em grandes volumes
        const processarEmChunks = (items, chunkSize = 1000) => {
          const chunks = []
          for (let i = 0; i < items.length; i += chunkSize) {
            chunks.push(items.slice(i, i + chunkSize))
          }
          return chunks
        }

        const headers = Object.keys(dados[0])
        const chunks = processarEmChunks(dados)
        let csvRows = [headers.join(',')]

        // Processar cada chunk de forma assíncrona
        for (const chunk of chunks) {
          const chunkRows = chunk.map(row => 
            headers.map(header => {
              const value = row[header] || ''
              const stringValue = String(value).replace(/"/g, '""')
              return `"${stringValue}"`
            }).join(',')
          )
          csvRows = csvRows.concat(chunkRows)
        }

        const csv = csvRows.join('\n')
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }) // BOM para Excel
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `inscritos_${eventoSelecionado?.titulo?.replace(/[^a-z0-9]/gi, '_') || 'evento'}_${dayjs().format('YYYY-MM-DD')}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url) // Limpar URL do objeto
        message.success(`Arquivo CSV exportado com sucesso! (${inscritosFiltrados.length} registro(s))`)
      } catch (error) {
        console.error('Erro ao exportar CSV:', error)
        message.error('Erro ao exportar arquivo CSV. Tente novamente.')
      }
    }, setExportandoCSV, setProgressoExportacao)
  }

  // Função para exportar Excel (assíncrona com loading e progresso)
  const handleExportarExcel = async () => {
    // Validação: verificar se há dados para exportar
    if (!inscritosFiltrados || inscritosFiltrados.length === 0) {
      message.warning('Não há dados para exportar. Aplique filtros ou verifique se existem inscritos.')
      return
    }

    await atualizarProgresso(() => {
      try {
        const dados = prepararDadosExportacao()
        
        // Validação adicional: verificar se os dados foram preparados corretamente
        if (!dados || dados.length === 0) {
          message.error('Erro ao preparar dados para exportação')
          return
        }
        
        // Criar workbook e worksheet
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.json_to_sheet(dados)
        
        // Ajustar largura das colunas
        const colWidths = [
          { wch: 12 }, // Tipo
          { wch: 30 }, // Nome
          { wch: 30 }, // Email
          { wch: 15 }, // CPF
          { wch: 15 }, // Telefone
          { wch: 20 }, // Data de Inscrição
        ]
        ws['!cols'] = colWidths
        
        // Adicionar worksheet ao workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Inscritos')
        
        // Gerar arquivo Excel
        const fileName = `inscritos_${eventoSelecionado?.titulo?.replace(/[^a-z0-9]/gi, '_') || 'evento'}_${dayjs().format('YYYY-MM-DD')}.xlsx`
        XLSX.writeFile(wb, fileName)
        
        message.success(`Arquivo Excel exportado com sucesso! (${inscritosFiltrados.length} registro(s))`)
      } catch (error) {
        console.error('Erro ao exportar Excel:', error)
        message.error('Erro ao exportar arquivo Excel. Verifique se a biblioteca xlsx está instalada.')
      }
    }, setExportandoExcel, setProgressoExportacao)
  }

  // Função para imprimir (assíncrona com loading)
  const handleImprimir = async () => {
    // Validação: verificar se há dados para imprimir
    if (!inscritosFiltrados || inscritosFiltrados.length === 0) {
      message.warning('Não há dados para imprimir. Aplique filtros ou verifique se existem inscritos.')
      return
    }

    setImprimindo(true)
    
    // Usar setTimeout para não bloquear UI
    setTimeout(() => {
      try {
        const dados = prepararDadosExportacao()
        
        // Validação adicional: verificar se os dados foram preparados corretamente
        if (!dados || dados.length === 0) {
          message.error('Erro ao preparar dados para impressão')
          setImprimindo(false)
          return
        }

        const titulo = `Inscritos - ${eventoSelecionado?.titulo || 'Evento'}`
        const dataExportacao = dayjs().format('DD/MM/YYYY HH:mm')
        
        // Criar conteúdo HTML para impressão
        let htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${titulo}</title>
            <style>
              @media print {
                @page { margin: 1cm; }
                body { font-family: Arial, sans-serif; font-size: 12px; }
                h1 { font-size: 18px; margin-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                .info { margin-bottom: 10px; color: #666; }
              }
            </style>
          </head>
          <body>
            <h1>${titulo}</h1>
            <div class="info">Data de exportação: ${dataExportacao}</div>
            <div class="info">Total de inscritos: ${inscritosFiltrados.length}</div>
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>CPF</th>
                  <th>Telefone</th>
                  <th>Data de Inscrição</th>
                </tr>
              </thead>
              <tbody>
        `
        
        dados.forEach(row => {
          htmlContent += `
            <tr>
              <td>${row['Tipo']}</td>
              <td>${row['Nome']}</td>
              <td>${row['Email']}</td>
              <td>${row['CPF']}</td>
              <td>${row['Telefone']}</td>
              <td>${row['Data de Inscrição']}</td>
            </tr>
          `
        })
        
        htmlContent += `
              </tbody>
            </table>
          </body>
          </html>
        `
        
        // Abrir janela de impressão
        const printWindow = window.open('', '_blank')
        if (!printWindow) {
          message.error('Não foi possível abrir a janela de impressão. Verifique se o bloqueador de pop-ups está desativado.')
          setImprimindo(false)
          return
        }
        
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        printWindow.onload = () => {
          printWindow.print()
          message.success('Diálogo de impressão aberto com sucesso!')
          setImprimindo(false)
        }
      } catch (error) {
        console.error('Erro ao imprimir:', error)
        message.error('Erro ao abrir diálogo de impressão. Tente novamente.')
        setImprimindo(false)
      }
    }, 100)
  }

  // Função para compartilhar por email (assíncrona com loading)
  const handleCompartilharEmail = async () => {
    // Validação: verificar se há dados para compartilhar
    if (!inscritosFiltrados || inscritosFiltrados.length === 0) {
      message.warning('Não há dados para compartilhar. Aplique filtros ou verifique se existem inscritos.')
      return
    }

    setCompartilhandoEmail(true)
    
    // Usar setTimeout para não bloquear UI
    setTimeout(() => {
      try {
        const dados = prepararDadosExportacao()
        
        // Validação adicional: verificar se os dados foram preparados corretamente
        if (!dados || dados.length === 0) {
          message.error('Erro ao preparar dados para compartilhamento')
          setCompartilhandoEmail(false)
          return
        }

        const titulo = eventoSelecionado?.titulo || 'Evento'
        const totalInscritos = inscritosFiltrados.length
        const dataExportacao = dayjs().format('DD/MM/YYYY HH:mm')
        
        // Preparar corpo do email com dados em formato de tabela
        let tabelaHTML = `
          <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th>Tipo</th>
                <th>Nome</th>
                <th>Email</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th>Data de Inscrição</th>
              </tr>
            </thead>
            <tbody>
        `
        
        dados.forEach(row => {
          tabelaHTML += `
            <tr>
              <td>${row['Tipo']}</td>
              <td>${row['Nome']}</td>
              <td>${row['Email']}</td>
              <td>${row['CPF']}</td>
              <td>${row['Telefone']}</td>
              <td>${row['Data de Inscrição']}</td>
            </tr>
          `
        })
        
        tabelaHTML += `
            </tbody>
          </table>
        `
        
        const assunto = encodeURIComponent(`Lista de Inscritos - ${titulo}`)
        const corpo = encodeURIComponent(`
          Segue a lista de inscritos do evento "${titulo}":
          
          Total de inscritos: ${totalInscritos}
          Data de exportação: ${dataExportacao}
          
          ${tabelaHTML}
          
          ---
          Este email foi gerado automaticamente pelo sistema AECAC.
        `)
        
        // Abrir cliente de email
        window.location.href = `mailto:?subject=${assunto}&body=${corpo}`
        message.success('Cliente de email aberto com sucesso!')
        setCompartilhandoEmail(false)
      } catch (error) {
        console.error('Erro ao compartilhar por email:', error)
        message.error('Erro ao abrir cliente de email. Verifique se há um cliente de email configurado.')
        setCompartilhandoEmail(false)
      }
    }, 100)
  }

  const handleLimparFiltros = () => {
    setFiltroTitulo('')
    setFiltroCategoria('')
    setCurrentPage(1)
  }

  // Filtrar eventos
  const eventosFiltrados = useMemo(() => {
    return eventos.filter(evento => {
      const matchTitulo = !filtroTitulo || 
        (evento.titulo || '').toLowerCase().includes(filtroTitulo.toLowerCase())
      const matchCategoria = !filtroCategoria || 
        (evento.categoria || '').toLowerCase().includes(filtroCategoria.toLowerCase())
      return matchTitulo && matchCategoria
    })
  }, [eventos, filtroTitulo, filtroCategoria])

  // Paginar eventos filtrados
  const eventosPaginados = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return eventosFiltrados.slice(start, end)
  }, [eventosFiltrados, currentPage, pageSize])

  const columns = [
    {
      title: 'Título',
      dataIndex: 'titulo',
      key: 'titulo',
      sorter: (a, b) => (a.titulo || '').localeCompare(b.titulo || ''),
    },
    {
      title: 'Categoria',
      dataIndex: 'categoria',
      key: 'categoria',
      render: (categoria) => <Tag>{categoria}</Tag>,
    },
    {
      title: 'Data',
      dataIndex: 'data',
      key: 'data',
      render: (data) => data ? dayjs(data).format('DD/MM/YYYY') : '-',
      sorter: (a, b) => new Date(a.data) - new Date(b.data),
    },
    {
      title: 'Hora',
      dataIndex: 'hora',
      key: 'hora',
    },
    {
      title: 'Local',
      dataIndex: 'local',
      key: 'local',
    },
    {
      title: 'Vagas',
      dataIndex: 'vagas',
      key: 'vagas',
      render: (vagas, record) => {
        if (!vagas) return 'Ilimitado'
        return `${record.vagasDisponiveis || vagas} / ${vagas}`
      },
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<TeamOutlined />}
            onClick={() => handleVerInscritos(record)}
            title="Ver Inscritos"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditEvento(record)}
          />
          <Popconfirm
            title="Tem certeza que deseja excluir este evento?"
            onConfirm={() => handleDeleteEvento(record._id)}
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
            <CalendarOutlined />
            <span>Eventos da Minha Empresa</span>
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
              setEditingEvento(null)
              eventoForm.resetFields()
              setEventoModalVisible(true)
            }}
          >
            Novo Evento
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
            <Col xs={24} sm={12}>
              <Input
                placeholder="Filtrar por Título"
                prefix={<CalendarOutlined />}
                value={filtroTitulo}
                onChange={(e) => {
                  setFiltroTitulo(e.target.value)
                  setCurrentPage(1)
                }}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12}>
              <Input
                placeholder="Filtrar por Categoria"
                value={filtroCategoria}
                onChange={(e) => {
                  setFiltroCategoria(e.target.value)
                  setCurrentPage(1)
                }}
                allowClear
              />
            </Col>
          </Row>
          {eventos.length > 0 && (
            <Text type="secondary">
              Mostrando {eventosPaginados.length} de {eventosFiltrados.length} evento(s)
            </Text>
          )}
        </Space>

        <Table
          dataSource={eventosPaginados}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={false}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: !loading ? <Empty description="Nenhum evento encontrado" /> : undefined
          }}
        />
        {!loading && eventosFiltrados.length > 0 && (
          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={eventosFiltrados.length}
              onChange={(page, size) => {
                setCurrentPage(page)
                setPageSize(size)
              }}
              showSizeChanger
              showTotal={(total) => `Total: ${total} eventos`}
            />
          </div>
        )}
      </Card>

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
        width={window.innerWidth < 768 ? '95%' : 600}
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="data"
                label="Data"
                rules={[{ required: true, message: 'Data é obrigatória' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="DD/MM/YYYY"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="hora"
                label="Hora"
                rules={[{ required: true, message: 'Hora é obrigatória' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="local"
            label="Local"
            rules={[{ required: true, message: 'Local é obrigatório' }]}
          >
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="categoria"
                label="Categoria"
                rules={[{ required: true, message: 'Categoria é obrigatória' }]}
              >
                <Select>
                  <Select.Option value="Workshop">Workshop</Select.Option>
                  <Select.Option value="Networking">Networking</Select.Option>
                  <Select.Option value="Palestra">Palestra</Select.Option>
                  <Select.Option value="Feira">Feira</Select.Option>
                  <Select.Option value="Reunião">Reunião</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="vagas"
                label="Vagas"
                rules={[{ required: true, message: 'Vagas é obrigatório' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="palestrante"
            label="Palestrante"
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => {
                setEventoModalVisible(false)
                setEditingEvento(null)
                eventoForm.resetFields()
              }}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                {editingEvento ? 'Atualizar' : 'Criar'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Inscritos */}
      <Modal
        title={
          <Space>
            <TeamOutlined />
            <span>Inscritos - {eventoSelecionado?.titulo || ''}</span>
          </Space>
        }
        open={inscritosModalVisible}
        onCancel={() => {
          setInscritosModalVisible(false)
          setInscritos([])
          setInscritosFiltrados([])
          setEventoSelecionado(null)
          setFiltroInscritosTipo('')
          setFiltroInscritosNome('')
          setFiltroInscritosCPF('')
          setFiltroInscritosData(null)
        }}
        footer={null}
        width={window.innerWidth < 768 ? '95%' : 1000}
      >
        <Spin spinning={loadingInscritos}>
          {/* Filtros e Exportação */}
          <Space direction="vertical" style={{ width: '100%', marginBottom: '16px' }} size="middle">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={6}>
                <Select
                  placeholder="Filtrar por Tipo"
                  style={{ width: '100%' }}
                  value={filtroInscritosTipo || undefined}
                  onChange={(value) => setFiltroInscritosTipo(value)}
                  allowClear
                >
                  <Select.Option value="publico">Público</Select.Option>
                  <Select.Option value="privado">Associado</Select.Option>
                </Select>
              </Col>
              <Col xs={24} sm={6}>
                <Input
                  placeholder="Buscar por Nome"
                  prefix={<SearchOutlined />}
                  value={filtroInscritosNome}
                  onChange={(e) => setFiltroInscritosNome(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={6}>
                <Input
                  placeholder="Buscar por CPF"
                  value={filtroInscritosCPF}
                  onChange={(e) => setFiltroInscritosCPF(e.target.value.replace(/\D/g, ''))}
                  maxLength={11}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={6}>
                <RangePicker
                  placeholder={['Data inicial', 'Data final']}
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  value={filtroInscritosData}
                  onChange={(dates) => setFiltroInscritosData(dates)}
                  allowClear
                />
              </Col>
            </Row>
            <Row justify="space-between" align="middle">
              <Col>
                <Text type="secondary">
                  Mostrando {inscritosFiltrados.length} de {inscritos.length} inscrito(s)
                </Text>
              </Col>
              <Col>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <Space wrap>
                    <Button
                      icon={<ClearOutlined />}
                      onClick={() => {
                        setFiltroInscritosTipo('')
                        setFiltroInscritosNome('')
                        setFiltroInscritosCPF('')
                        setFiltroInscritosData(null)
                      }}
                      size="small"
                    >
                      Limpar Filtros
                    </Button>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={handleExportarCSV}
                      disabled={inscritosFiltrados.length === 0 || exportandoCSV}
                      loading={exportandoCSV}
                    >
                      CSV
                    </Button>
                    <Button
                      icon={<FileExcelOutlined />}
                      onClick={handleExportarExcel}
                      disabled={inscritosFiltrados.length === 0 || exportandoExcel}
                      loading={exportandoExcel}
                      style={{ color: '#52c41a', borderColor: '#52c41a' }}
                    >
                      Excel
                    </Button>
                    <Button
                      icon={<PrinterOutlined />}
                      onClick={handleImprimir}
                      disabled={inscritosFiltrados.length === 0 || imprimindo}
                      loading={imprimindo}
                    >
                      Imprimir
                    </Button>
                    <Button
                      icon={<MailOutlined />}
                      onClick={handleCompartilharEmail}
                      disabled={inscritosFiltrados.length === 0 || compartilhandoEmail}
                      loading={compartilhandoEmail}
                    >
                      Email
                    </Button>
                  </Space>
                  {/* Barra de progresso para exportações grandes */}
                  {(exportandoCSV || exportandoExcel) && progressoExportacao > 0 && (
                    <Progress 
                      percent={Math.round(progressoExportacao)} 
                      status="active"
                      showInfo
                      style={{ marginTop: '8px' }}
                    />
                  )}
                </Space>
              </Col>
            </Row>
          </Space>

          {/* Tabela de Inscritos */}
          {inscritosFiltrados.length > 0 ? (
            <Table
              dataSource={inscritosFiltrados}
              rowKey={(record, index) => `${record.tipo}-${index}`}
              scroll={{ x: 'max-content' }}
              columns={[
                {
                  title: 'Tipo',
                  dataIndex: 'tipo',
                  key: 'tipo',
                  render: (tipo) => (
                    <Tag color={tipo === 'publico' ? 'blue' : 'green'}>
                      {tipo === 'publico' ? 'Público' : 'Associado'}
                    </Tag>
                  ),
                },
                {
                  title: 'Nome',
                  dataIndex: 'nome',
                  key: 'nome',
                  sorter: (a, b) => {
                    const nomeA = (a.nome || '').toLowerCase()
                    const nomeB = (b.nome || '').toLowerCase()
                    return nomeA.localeCompare(nomeB, 'pt-BR')
                  },
                  sortDirections: ['ascend', 'descend'],
                },
                {
                  title: 'Email',
                  dataIndex: 'email',
                  key: 'email',
                  render: (email) => email || '-',
                  sorter: (a, b) => {
                    const emailA = (a.email || '').toLowerCase()
                    const emailB = (b.email || '').toLowerCase()
                    return emailA.localeCompare(emailB, 'pt-BR')
                  },
                  sortDirections: ['ascend', 'descend'],
                },
                {
                  title: 'CPF',
                  dataIndex: 'cpf',
                  key: 'cpf',
                  render: (cpf) => {
                    if (!cpf) return '-'
                    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
                  },
                  sorter: (a, b) => {
                    const cpfA = (a.cpf || '').replace(/\D/g, '')
                    const cpfB = (b.cpf || '').replace(/\D/g, '')
                    return cpfA.localeCompare(cpfB)
                  },
                  sortDirections: ['ascend', 'descend'],
                },
                {
                  title: 'Telefone',
                  dataIndex: 'telefone',
                  key: 'telefone',
                  render: (telefone) => telefone || '-',
                  sorter: (a, b) => {
                    const telA = (a.telefone || '').replace(/\D/g, '')
                    const telB = (b.telefone || '').replace(/\D/g, '')
                    return telA.localeCompare(telB)
                  },
                  sortDirections: ['ascend', 'descend'],
                },
                {
                  title: 'Data de Inscrição',
                  dataIndex: 'dataInscricao',
                  key: 'dataInscricao',
                  render: (data) => data ? dayjs(data).format('DD/MM/YYYY HH:mm') : '-',
                  sorter: (a, b) => {
                    if (!a.dataInscricao && !b.dataInscricao) return 0
                    if (!a.dataInscricao) return 1
                    if (!b.dataInscricao) return -1
                    return new Date(a.dataInscricao) - new Date(b.dataInscricao)
                  },
                  sortDirections: ['ascend', 'descend'],
                  defaultSortOrder: 'descend',
                },
              ]}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total: ${total} inscrito(s)`,
              }}
            />
          ) : inscritos.length > 0 ? (
            <Empty description="Nenhum inscrito encontrado com os filtros aplicados" />
          ) : (
            !loadingInscritos && <Empty description="Nenhum inscrito encontrado" />
          )}
        </Spin>
      </Modal>
    </div>
  )
}

export default EventosAssociado

