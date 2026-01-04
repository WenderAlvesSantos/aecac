import { useState, useEffect, useMemo } from 'react'
import { Card, Row, Col, Typography, Button, Space, Tag, Empty, Modal, Form, Input, InputNumber, DatePicker, Select, message, Upload, Popconfirm, Table, Pagination, Spin, Progress } from 'antd'
import {
  BookOutlined,
  PlusOutlined,
  UploadOutlined,
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
import { getCapacitacoes, createCapacitacao, updateCapacitacao, deleteCapacitacao, getInscritosCapacitacao } from '../../lib/api'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

const { Text } = Typography
const { TextArea } = Input

const CapacitacoesAssociado = () => {
  const [capacitacoes, setCapacitacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [capacitacaoModalVisible, setCapacitacaoModalVisible] = useState(false)
  const [editingCapacitacao, setEditingCapacitacao] = useState(null)
  const [capacitacaoForm] = Form.useForm()
  const [inscritosModalVisible, setInscritosModalVisible] = useState(false)
  const [inscritos, setInscritos] = useState([])
  const [inscritosFiltrados, setInscritosFiltrados] = useState([])
  const [loadingInscritos, setLoadingInscritos] = useState(false)
  const [capacitacaoSelecionada, setCapacitacaoSelecionada] = useState(null)
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
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroData, setFiltroData] = useState([dayjs().startOf('day'), null]) // Default: data atual em diante
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await getCapacitacoes()
      setCapacitacoes(response.data || [])
    } catch (error) {
      console.error('Erro ao carregar capacitações:', error)
      message.error('Erro ao carregar capacitações')
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

  const handleCreateCapacitacao = async (values) => {
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

  const handleVerInscritos = async (capacitacao) => {
    setCapacitacaoSelecionada(capacitacao)
    setLoadingInscritos(true)
    setInscritosModalVisible(true)
    // Limpar filtros ao abrir
    setFiltroInscritosTipo('')
    setFiltroInscritosNome('')
    setFiltroInscritosCPF('')
    setFiltroInscritosData(null)
    try {
      const response = await getInscritosCapacitacao(capacitacao._id)
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

  // Cache de dados preparados para exportação (melhora performance)
  const dadosPreparadosCache = useMemo(() => {
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
  }, [inscritosFiltrados])

  // Função para preparar dados para exportação (reutilizável) - agora usa cache
  const prepararDadosExportacao = () => {
    return dadosPreparadosCache
  }

  // Função auxiliar para atualizar progresso de forma assíncrona
  const atualizarProgresso = (callback, setLoading, setProgresso) => {
    return new Promise((resolve) => {
      setLoading(true)
      setProgresso(0)
      
      // Simular progresso em chunks para não bloquear UI
      const totalChunks = 10
      let chunkAtual = 0
      
      const processarChunk = () => {
        if (chunkAtual < totalChunks) {
          chunkAtual++
          setProgresso((chunkAtual / totalChunks) * 100)
          
          // Usar setTimeout para não bloquear a UI
          setTimeout(processarChunk, 50)
        } else {
          // Executar callback quando progresso chegar a 100%
          setTimeout(() => {
            callback()
            setProgresso(100)
            setTimeout(() => {
              setLoading(false)
              setProgresso(0)
              resolve()
            }, 300)
          }, 100)
        }
      }
      
      processarChunk()
    })
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
        link.setAttribute('download', `inscritos_${capacitacaoSelecionada?.titulo?.replace(/[^a-z0-9]/gi, '_') || 'capacitacao'}_${dayjs().format('YYYY-MM-DD')}.csv`)
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
        const fileName = `inscritos_${capacitacaoSelecionada?.titulo?.replace(/[^a-z0-9]/gi, '_') || 'capacitacao'}_${dayjs().format('YYYY-MM-DD')}.xlsx`
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

        const titulo = `Inscritos - ${capacitacaoSelecionada?.titulo || 'Capacitação'}`
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

        const titulo = capacitacaoSelecionada?.titulo || 'Capacitação'
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
          Segue a lista de inscritos da capacitação "${titulo}":
          
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
    setFiltroTipo('')
    setFiltroData([dayjs().startOf('day'), null]) // Voltar para o padrão (hoje em diante)
    setCurrentPage(1)
  }

  // Filtrar capacitações
  const capacitacoesFiltradas = useMemo(() => {
    return capacitacoes.filter(capacitacao => {
      const matchTitulo = !filtroTitulo || 
        (capacitacao.titulo || '').toLowerCase().includes(filtroTitulo.toLowerCase())
      const matchTipo = !filtroTipo || 
        (capacitacao.tipo || '').toLowerCase().includes(filtroTipo.toLowerCase())
      
      // Filtro por data (range)
      const matchData = !filtroData || (() => {
        if (!capacitacao.data) return false // Se não tem data, não mostra no filtro
        const dataCapacitacao = dayjs(capacitacao.data)
        const [startDate, endDate] = filtroData
        if (startDate && endDate) {
          return dataCapacitacao.isAfter(startDate.subtract(1, 'day'), 'day') && 
                 dataCapacitacao.isBefore(endDate.add(1, 'day'), 'day')
        }
        if (startDate) {
          return dataCapacitacao.isAfter(startDate.subtract(1, 'day'), 'day') || 
                 dataCapacitacao.isSame(startDate, 'day')
        }
        if (endDate) {
          return dataCapacitacao.isBefore(endDate.add(1, 'day'), 'day') || 
                 dataCapacitacao.isSame(endDate, 'day')
        }
        return true
      })()
      
      return matchTitulo && matchTipo && matchData
    })
  }, [capacitacoes, filtroTitulo, filtroTipo, filtroData])

  // Paginar capacitações filtradas
  const capacitacoesPaginadas = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return capacitacoesFiltradas.slice(start, end)
  }, [capacitacoesFiltradas, currentPage, pageSize])

  const columns = [
    {
      title: 'Título',
      dataIndex: 'titulo',
      key: 'titulo',
      sorter: (a, b) => (a.titulo || '').localeCompare(b.titulo || ''),
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      render: (tipo) => <Tag>{tipo}</Tag>,
      filters: [
        { text: 'Palestra', value: 'palestra' },
        { text: 'Curso', value: 'curso' },
        { text: 'Workshop', value: 'workshop' },
        { text: 'Treinamento', value: 'treinamento' },
      ],
      onFilter: (value, record) => record.tipo === value,
    },
    {
      title: 'Data',
      dataIndex: 'data',
      key: 'data',
      render: (data) => data ? dayjs(data).format('DD/MM/YYYY HH:mm') : '-',
      sorter: (a, b) => new Date(a.data) - new Date(b.data),
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
        // Usar vagasDisponiveis calculado no backend
        const disponiveis = record.vagasDisponiveis !== undefined ? record.vagasDisponiveis : vagas
        return `${disponiveis} / ${vagas}`
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
            onClick={() => handleEditCapacitacao(record)}
          />
          <Popconfirm
            title="Tem certeza que deseja excluir esta capacitação?"
            onConfirm={() => handleDeleteCapacitacao(record._id)}
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
            <BookOutlined />
            <span>Capacitações da Minha Empresa</span>
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
              setEditingCapacitacao(null)
              capacitacaoForm.resetFields()
              setCapacitacaoModalVisible(true)
            }}
          >
            Nova Capacitação
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
                prefix={<BookOutlined />}
                value={filtroTitulo}
                onChange={(e) => {
                  setFiltroTitulo(e.target.value)
                  setCurrentPage(1)
                }}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12}>
              <Select
                placeholder="Filtrar por Tipo"
                style={{ width: '100%' }}
                value={filtroTipo || undefined}
                onChange={(value) => {
                  setFiltroTipo(value)
                  setCurrentPage(1)
                }}
                allowClear
              >
                <Select.Option value="palestra">Palestra</Select.Option>
                <Select.Option value="curso">Curso</Select.Option>
                <Select.Option value="workshop">Workshop</Select.Option>
                <Select.Option value="treinamento">Treinamento</Select.Option>
              </Select>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <RangePicker
                placeholder={['Data inicial', 'Data final']}
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                value={filtroData}
                onChange={(dates) => {
                  setFiltroData(dates)
                  setCurrentPage(1)
                }}
                allowClear
              />
              <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                Filtrar por período da capacitação
              </Text>
            </Col>
          </Row>
          {capacitacoes.length > 0 && (
            <Text type="secondary">
              Mostrando {capacitacoesPaginadas.length} de {capacitacoesFiltradas.length} capacitação(ões)
            </Text>
          )}
        </Space>

        {capacitacoesFiltradas.length > 0 ? (
          <>
            <Table
              dataSource={capacitacoesPaginadas}
              columns={columns}
              rowKey="_id"
              loading={loading}
              pagination={false}
            />
            <div style={{ marginTop: '16px', textAlign: 'right' }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={capacitacoesFiltradas.length}
                onChange={(page, size) => {
                  setCurrentPage(page)
                  setPageSize(size)
                }}
                showSizeChanger
                showTotal={(total) => `Total: ${total} capacitações`}
              />
            </div>
          </>
        ) : (
          <Empty description="Nenhuma capacitação encontrada" />
        )}
      </Card>

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
          <Row gutter={16}>
            <Col span={12}>
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
            </Col>
            <Col span={12}>
              <Form.Item
                name="data"
                label="Data e Hora"
                rules={[{ required: true, message: 'Data é obrigatória' }]}
              >
                <DatePicker 
                  showTime 
                  style={{ width: '100%' }} 
                  format="DD/MM/YYYY HH:mm"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="local"
            label="Local"
          >
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="vagas"
                label="Vagas"
                tooltip="Deixe vazio para ilimitado"
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="valor"
                label="Valor (R$)"
              >
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="link"
            label="Link"
          >
            <Input placeholder="https://..." />
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
                setCapacitacaoModalVisible(false)
                setEditingCapacitacao(null)
                capacitacaoForm.resetFields()
              }}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                {editingCapacitacao ? 'Atualizar' : 'Criar'}
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
              <span>Inscritos - {capacitacaoSelecionada?.titulo || ''}</span>
            </Space>
          }
          open={inscritosModalVisible}
          onCancel={() => {
            setInscritosModalVisible(false)
            setInscritos([])
            setInscritosFiltrados([])
            setCapacitacaoSelecionada(null)
            setFiltroInscritosTipo('')
            setFiltroInscritosNome('')
            setFiltroInscritosCPF('')
            setFiltroInscritosData(null)
          }}
          footer={null}
          width={1000}
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
                  },
                  {
                    title: 'Email',
                    dataIndex: 'email',
                    key: 'email',
                    render: (email) => email || '-',
                  },
                  {
                    title: 'CPF',
                    dataIndex: 'cpf',
                    key: 'cpf',
                    render: (cpf) => {
                      if (!cpf) return '-'
                      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
                    },
                  },
                  {
                    title: 'Telefone',
                    dataIndex: 'telefone',
                    key: 'telefone',
                    render: (telefone) => telefone || '-',
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
  
  export default CapacitacoesAssociado

