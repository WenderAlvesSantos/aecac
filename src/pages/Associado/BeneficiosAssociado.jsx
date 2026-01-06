import { useState, useEffect, useMemo } from 'react'
import { Card, Row, Col, Typography, Button, Space, Tag, Empty, Modal, Form, Input, InputNumber, DatePicker, message, Upload, Popconfirm, Table, Pagination, Spin, Select, Image, Progress } from 'antd'
import {
  GiftOutlined,
  PlusOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  ClearOutlined,
  ShoppingOutlined,
  DownloadOutlined,
  SearchOutlined,
  FileExcelOutlined,
  PrinterOutlined,
  MailOutlined,
} from '@ant-design/icons'
import * as XLSX from 'xlsx'
import { getBeneficios, createBeneficio, updateBeneficio, deleteBeneficio, getResgates } from '../../lib/api'
import dayjs from 'dayjs'

const { Text } = Typography
const { TextArea } = Input
const { RangePicker } = DatePicker

const BeneficiosAssociado = () => {
  const [beneficios, setBeneficios] = useState([])
  const [loading, setLoading] = useState(true)
  const [beneficioModalVisible, setBeneficioModalVisible] = useState(false)
  const [editingBeneficio, setEditingBeneficio] = useState(null)
  const [beneficioForm] = Form.useForm()
  const [imagemRemovida, setImagemRemovida] = useState(false)
  const [resgatesModalVisible, setResgatesModalVisible] = useState(false)
  const [resgates, setResgates] = useState([])
  const [resgatesFiltrados, setResgatesFiltrados] = useState([])
  const [loadingResgates, setLoadingResgates] = useState(false)
  const [beneficioSelecionado, setBeneficioSelecionado] = useState(null)
  // Filtros do modal de resgates
  const [filtroResgatesTipo, setFiltroResgatesTipo] = useState('')
  const [filtroResgatesNome, setFiltroResgatesNome] = useState('')
  const [filtroResgatesCPF, setFiltroResgatesCPF] = useState('')
  const [filtroResgatesData, setFiltroResgatesData] = useState(null)
  // Estados para loading e progresso das exportações
  const [exportandoCSV, setExportandoCSV] = useState(false)
  const [exportandoExcel, setExportandoExcel] = useState(false)
  const [imprimindo, setImprimindo] = useState(false)
  const [compartilhandoEmail, setCompartilhandoEmail] = useState(false)
  const [progressoExportacao, setProgressoExportacao] = useState(0)
  
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
    setLoading(true)
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
      } else if (editingBeneficio && editingBeneficio.imagem && !imagemRemovida) {
        // Manter imagem existente se não foi removida e não há novo arquivo
        imagemBase64 = editingBeneficio.imagem
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
      setImagemRemovida(false)
      beneficioForm.resetFields()
      loadData()
    } catch (error) {
      message.error(error.response?.data?.error || 'Erro ao salvar benefício')
    }
  }

  const handleEditBeneficio = (beneficio) => {
    setEditingBeneficio(beneficio)
    setImagemRemovida(false)

    beneficioForm.setFieldsValue({
      ...beneficio,
      validade: beneficio.validade ? dayjs(beneficio.validade) : null,
      imagemFile: [],
    })
    setBeneficioModalVisible(true)
  }

  const handleRemoverImagem = () => {
    setImagemRemovida(true)
    beneficioForm.setFieldValue('imagemFile', [])
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

  const handleVerResgates = async (beneficio) => {
    setBeneficioSelecionado(beneficio)
    setLoadingResgates(true)
    setResgatesModalVisible(true)
    // Limpar filtros ao abrir
    setFiltroResgatesTipo('')
    setFiltroResgatesNome('')
    setFiltroResgatesCPF('')
    setFiltroResgatesData(null)
    try {
      const response = await getResgates()
      // Filtrar resgates pelo beneficioId
      const beneficioId = beneficio._id.toString()
      const resgatesDoBeneficio = (response.data || []).filter(r => {
        const resgateBeneficioId = r.beneficioId || r.beneficio?._id?.toString()
        return resgateBeneficioId === beneficioId
      })
      setResgates(resgatesDoBeneficio)
      setResgatesFiltrados(resgatesDoBeneficio)
    } catch (error) {
      message.error(error.response?.data?.error || 'Erro ao buscar resgates')
      setResgates([])
      setResgatesFiltrados([])
    } finally {
      setLoadingResgates(false)
    }
  }

  // Filtrar resgates
  useEffect(() => {
    if (!resgates.length) {
      setResgatesFiltrados([])
      return
    }

    const filtrados = resgates.filter(resgate => {
      // Filtro por tipo
      const matchTipo = !filtroResgatesTipo || resgate.tipo === filtroResgatesTipo
      
      // Filtro por nome
      const matchNome = !filtroResgatesNome || 
        (resgate.nome || '').toLowerCase().includes(filtroResgatesNome.toLowerCase())
      
      // Filtro por CPF
      const matchCPF = !filtroResgatesCPF || 
        (resgate.cpf || '').replace(/\D/g, '').includes(filtroResgatesCPF.replace(/\D/g, ''))
      
      // Filtro por data
      const matchData = !filtroResgatesData || (() => {
        if (!resgate.dataResgate) return false
        const dataResgate = dayjs(resgate.dataResgate)
        const [startDate, endDate] = filtroResgatesData
        
        if (startDate && endDate) {
          return dataResgate.isAfter(startDate.subtract(1, 'day'), 'day') && 
                 dataResgate.isBefore(endDate.add(1, 'day'), 'day')
        }
        if (startDate) {
          return dataResgate.isAfter(startDate.subtract(1, 'day'), 'day')
        }
        if (endDate) {
          return dataResgate.isBefore(endDate.add(1, 'day'), 'day')
        }
        return true
      })()

      return matchTipo && matchNome && matchCPF && matchData
    })

    setResgatesFiltrados(filtrados)
  }, [resgates, filtroResgatesTipo, filtroResgatesNome, filtroResgatesCPF, filtroResgatesData])

  // Cache de dados preparados para exportação
  const dadosPreparadosCache = useMemo(() => {
    if (!resgatesFiltrados || resgatesFiltrados.length === 0) {
      return []
    }
    
    return resgatesFiltrados.map(resgate => ({
      'Tipo': resgate.tipo === 'publico' ? 'Público' : 'Associado',
      'Nome': resgate.nome || 'Usuário Associado',
      'CPF': resgate.cpf ? resgate.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '',
      'Telefone': resgate.telefone || '',
      'Código': resgate.codigo || resgate.beneficio?.codigo || '',
      'Data de Resgate': resgate.dataResgate ? dayjs(resgate.dataResgate).format('DD/MM/YYYY HH:mm') : '',
    }))
  }, [resgatesFiltrados])

  // Função para preparar dados para exportação
  const prepararDadosExportacao = () => {
    return dadosPreparadosCache
  }

  // Função auxiliar para atualizar progresso de forma assíncrona
  const atualizarProgresso = (callback, setLoading, setProgresso) => {
    return new Promise((resolve) => {
      setLoading(true)
      setProgresso(0)
      
      const totalChunks = 10
      let chunkAtual = 0
      
      const processarChunk = () => {
        if (chunkAtual < totalChunks) {
          chunkAtual++
          setProgresso((chunkAtual / totalChunks) * 100)
          setTimeout(processarChunk, 50)
        } else {
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

  // Função para exportar CSV
  const handleExportarCSV = async () => {
    if (!resgatesFiltrados || resgatesFiltrados.length === 0) {
      message.warning('Não há dados para exportar. Aplique filtros ou verifique se existem resgates.')
      return
    }

    await atualizarProgresso(() => {
      try {
        const dados = prepararDadosExportacao()
        
        if (!dados || dados.length === 0) {
          message.error('Erro ao preparar dados para exportação')
          return
        }

        const headers = Object.keys(dados[0])
        let csvRows = [headers.join(',')]

        dados.forEach(row => {
          csvRows.push(
            headers.map(header => {
              const value = row[header] || ''
              const stringValue = String(value).replace(/"/g, '""')
              return `"${stringValue}"`
            }).join(',')
          )
        })

        const csv = csvRows.join('\n')
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `resgates_${beneficioSelecionado?.titulo?.replace(/[^a-z0-9]/gi, '_') || 'beneficio'}_${dayjs().format('YYYY-MM-DD')}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        message.success(`Arquivo CSV exportado com sucesso! (${resgatesFiltrados.length} registro(s))`)
      } catch (error) {
        console.error('Erro ao exportar CSV:', error)
        message.error('Erro ao exportar arquivo CSV. Tente novamente.')
      }
    }, setExportandoCSV, setProgressoExportacao)
  }

  // Função para exportar Excel
  const handleExportarExcel = async () => {
    if (!resgatesFiltrados || resgatesFiltrados.length === 0) {
      message.warning('Não há dados para exportar. Aplique filtros ou verifique se existem resgates.')
      return
    }

    await atualizarProgresso(() => {
      try {
        const dados = prepararDadosExportacao()
        
        if (!dados || dados.length === 0) {
          message.error('Erro ao preparar dados para exportação')
          return
        }
        
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.json_to_sheet(dados)
        
        const colWidths = [
          { wch: 12 }, // Tipo
          { wch: 30 }, // Nome
          { wch: 15 }, // CPF
          { wch: 15 }, // Telefone
          { wch: 15 }, // Código
          { wch: 20 }, // Data de Resgate
        ]
        ws['!cols'] = colWidths
        
        XLSX.utils.book_append_sheet(wb, ws, 'Resgates')
        
        const fileName = `resgates_${beneficioSelecionado?.titulo?.replace(/[^a-z0-9]/gi, '_') || 'beneficio'}_${dayjs().format('YYYY-MM-DD')}.xlsx`
        XLSX.writeFile(wb, fileName)
        
        message.success(`Arquivo Excel exportado com sucesso! (${resgatesFiltrados.length} registro(s))`)
      } catch (error) {
        console.error('Erro ao exportar Excel:', error)
        message.error('Erro ao exportar arquivo Excel. Verifique se a biblioteca xlsx está instalada.')
      }
    }, setExportandoExcel, setProgressoExportacao)
  }

  // Função para imprimir
  const handleImprimir = async () => {
    if (!resgatesFiltrados || resgatesFiltrados.length === 0) {
      message.warning('Não há dados para imprimir. Aplique filtros ou verifique se existem resgates.')
      return
    }

    setImprimindo(true)
    
    setTimeout(() => {
      try {
        const dados = prepararDadosExportacao()
        
        if (!dados || dados.length === 0) {
          message.error('Erro ao preparar dados para impressão')
          setImprimindo(false)
          return
        }

        const titulo = `Resgates - ${beneficioSelecionado?.titulo || 'Benefício'}`
        const dataExportacao = dayjs().format('DD/MM/YYYY HH:mm')
        
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
            <div class="info">Total de resgates: ${resgatesFiltrados.length}</div>
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Telefone</th>
                  <th>Código</th>
                  <th>Data de Resgate</th>
                </tr>
              </thead>
              <tbody>
        `
        
        dados.forEach(row => {
          htmlContent += `
            <tr>
              <td>${row['Tipo']}</td>
              <td>${row['Nome']}</td>
              <td>${row['CPF']}</td>
              <td>${row['Telefone']}</td>
              <td>${row['Código']}</td>
              <td>${row['Data de Resgate']}</td>
            </tr>
          `
        })
        
        htmlContent += `
              </tbody>
            </table>
          </body>
          </html>
        `
        
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

  // Função para compartilhar por email
  const handleCompartilharEmail = async () => {
    if (!resgatesFiltrados || resgatesFiltrados.length === 0) {
      message.warning('Não há dados para compartilhar. Aplique filtros ou verifique se existem resgates.')
      return
    }

    setCompartilhandoEmail(true)
    
    setTimeout(() => {
      try {
        const dados = prepararDadosExportacao()
        
        if (!dados || dados.length === 0) {
          message.error('Erro ao preparar dados para compartilhamento')
          setCompartilhandoEmail(false)
          return
        }

        const titulo = beneficioSelecionado?.titulo || 'Benefício'
        const totalResgates = resgatesFiltrados.length
        const dataExportacao = dayjs().format('DD/MM/YYYY HH:mm')
        
        let tabelaHTML = `
          <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th>Tipo</th>
                <th>Nome</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th>Código</th>
                <th>Data de Resgate</th>
              </tr>
            </thead>
            <tbody>
        `
        
        dados.forEach(row => {
          tabelaHTML += `
            <tr>
              <td>${row['Tipo']}</td>
              <td>${row['Nome']}</td>
              <td>${row['CPF']}</td>
              <td>${row['Telefone']}</td>
              <td>${row['Código']}</td>
              <td>${row['Data de Resgate']}</td>
            </tr>
          `
        })
        
        tabelaHTML += `
            </tbody>
          </table>
        `
        
        const assunto = encodeURIComponent(`Lista de Resgates - ${titulo}`)
        const corpo = encodeURIComponent(`
          Segue a lista de resgates do benefício "${titulo}":
          
          Total de resgates: ${totalResgates}
          Data de exportação: ${dataExportacao}
          
          ${tabelaHTML}
          
          ---
          Este email foi gerado automaticamente pelo sistema AECAC.
        `)
        
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
            icon={<ShoppingOutlined />}
            onClick={() => handleVerResgates(record)}
            title="Ver Resgates"
          />
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

        <Table
          dataSource={beneficiosPaginados}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={false}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: !loading ? <Empty description="Nenhum benefício encontrado" /> : undefined
          }}
        />
        {!loading && beneficiosFiltrados.length > 0 && (
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
        )}
      </Card>

      {/* Modal de Criar/Editar Benefício */}
      <Modal
        title={editingBeneficio ? 'Editar Benefício' : 'Novo Benefício'}
        open={beneficioModalVisible}
        onCancel={() => {
          setBeneficioModalVisible(false)
          setEditingBeneficio(null)
          setImagemRemovida(false)
          beneficioForm.resetFields()
        }}
        footer={null}
        width={window.innerWidth < 768 ? '95%' : 600}
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
            rules={[
              {
                required: true,
                validator: (_, value) => {
                  const temImagemExistente = editingBeneficio && editingBeneficio.imagem && !imagemRemovida
                  const temArquivo = value && value.length > 0
                  if (temImagemExistente || temArquivo) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Imagem é obrigatória'))
                }
              }
            ]}
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e.slice(0, 1)
              }
              if (e?.fileList) {
                return e.fileList.slice(0, 1)
              }
              return []
            }}
          >
            {(!editingBeneficio || !editingBeneficio.imagem || imagemRemovida) ? (
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
            ) : null}
          </Form.Item>

          {editingBeneficio && editingBeneficio.imagem && !imagemRemovida && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '8px' }}>Imagem atual:</div>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Image src={editingBeneficio.imagem} width={200} />
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={handleRemoverImagem}
                  style={{ position: 'absolute', top: '8px', right: '8px' }}
                >
                  Remover
                </Button>
              </div>
            </div>
          )}
          <Form.Item>
            <Space>
              <Button onClick={() => {
                setBeneficioModalVisible(false)
                setEditingBeneficio(null)
                setImagemRemovida(false)
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

      {/* Modal de Resgates */}
      <Modal
        title={
          <Space>
            <ShoppingOutlined />
            <span>Resgates - {beneficioSelecionado?.titulo || ''}</span>
          </Space>
        }
        open={resgatesModalVisible}
        onCancel={() => {
          setResgatesModalVisible(false)
          setResgates([])
          setResgatesFiltrados([])
          setBeneficioSelecionado(null)
          setFiltroResgatesTipo('')
          setFiltroResgatesNome('')
          setFiltroResgatesCPF('')
          setFiltroResgatesData(null)
        }}
        footer={null}
        width={window.innerWidth < 768 ? '95%' : 1000}
      >
        <Spin spinning={loadingResgates}>
          {/* Filtros e Exportação */}
          <Space direction="vertical" style={{ width: '100%', marginBottom: '16px' }} size="middle">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={6}>
                <Select
                  placeholder="Filtrar por Tipo"
                  style={{ width: '100%' }}
                  value={filtroResgatesTipo || undefined}
                  onChange={(value) => setFiltroResgatesTipo(value)}
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
                  value={filtroResgatesNome}
                  onChange={(e) => setFiltroResgatesNome(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={6}>
                <Input
                  placeholder="Buscar por CPF"
                  value={filtroResgatesCPF}
                  onChange={(e) => setFiltroResgatesCPF(e.target.value.replace(/\D/g, ''))}
                  maxLength={11}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={6}>
                <RangePicker
                  placeholder={['Data inicial', 'Data final']}
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  value={filtroResgatesData}
                  onChange={(dates) => setFiltroResgatesData(dates)}
                  allowClear
                />
              </Col>
            </Row>
            <Row justify="space-between" align="middle">
              <Col>
                <Text type="secondary">
                  Mostrando {resgatesFiltrados.length} de {resgates.length} resgate(s)
                </Text>
              </Col>
              <Col>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <Space wrap>
                    <Button
                      icon={<ClearOutlined />}
                      onClick={() => {
                        setFiltroResgatesTipo('')
                        setFiltroResgatesNome('')
                        setFiltroResgatesCPF('')
                        setFiltroResgatesData(null)
                      }}
                      size="small"
                    >
                      Limpar Filtros
                    </Button>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={handleExportarCSV}
                      disabled={resgatesFiltrados.length === 0 || exportandoCSV}
                      loading={exportandoCSV}
                    >
                      CSV
                    </Button>
                    <Button
                      icon={<FileExcelOutlined />}
                      onClick={handleExportarExcel}
                      disabled={resgatesFiltrados.length === 0 || exportandoExcel}
                      loading={exportandoExcel}
                      style={{ color: '#52c41a', borderColor: '#52c41a' }}
                    >
                      Excel
                    </Button>
                    <Button
                      icon={<PrinterOutlined />}
                      onClick={handleImprimir}
                      disabled={resgatesFiltrados.length === 0 || imprimindo}
                      loading={imprimindo}
                    >
                      Imprimir
                    </Button>
                    <Button
                      icon={<MailOutlined />}
                      onClick={handleCompartilharEmail}
                      disabled={resgatesFiltrados.length === 0 || compartilhandoEmail}
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

          {/* Tabela de Resgates */}
          {resgatesFiltrados.length > 0 ? (
            <Table
              dataSource={resgatesFiltrados}
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
                  render: (nome) => nome || 'Usuário Associado',
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
                  title: 'Código',
                  dataIndex: 'codigo',
                  key: 'codigo',
                  render: (codigo, record) => codigo || record.beneficio?.codigo || '-',
                },
                {
                  title: 'Data de Resgate',
                  dataIndex: 'dataResgate',
                  key: 'dataResgate',
                  render: (data) => data ? dayjs(data).format('DD/MM/YYYY HH:mm') : '-',
                  sorter: (a, b) => {
                    if (!a.dataResgate && !b.dataResgate) return 0
                    if (!a.dataResgate) return 1
                    if (!b.dataResgate) return -1
                    return new Date(a.dataResgate) - new Date(b.dataResgate)
                  },
                },
              ]}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total: ${total} resgate(s)`,
              }}
            />
          ) : resgates.length > 0 ? (
            <Empty description="Nenhum resgate encontrado com os filtros aplicados" />
          ) : (
            !loadingResgates && <Empty description="Nenhum resgate encontrado" />
          )}
        </Spin>
      </Modal>
    </div>
  )
}

export default BeneficiosAssociado

