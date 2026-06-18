import { useState, useEffect, useMemo } from 'react'
import {
  Modal,
  Table,
  Input,
  Button,
  Space,
  Row,
  Col,
  Spin,
  Empty,
  message,
  DatePicker,
} from 'antd'
import {
  TeamOutlined,
  SearchOutlined,
  ClearOutlined,
  FileExcelOutlined,
} from '@ant-design/icons'
import * as XLSX from 'xlsx'
import dayjs from 'dayjs'
import { getInscritosEvento } from '../../lib/api'

const { RangePicker } = DatePicker

const formatCPF = (cpf) => {
  if (!cpf) return '-'
  const digits = String(cpf).replace(/\D/g, '')
  if (digits.length !== 11) return cpf
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

const inscritosColumns = [
  {
    title: 'Nome',
    dataIndex: 'nome',
    key: 'nome',
    sorter: (a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'),
  },
  {
    title: 'E-mail',
    dataIndex: 'email',
    key: 'email',
    render: (email) => email || '—',
  },
  {
    title: 'CPF',
    dataIndex: 'cpf',
    key: 'cpf',
    render: formatCPF,
  },
  {
    title: 'Telefone',
    dataIndex: 'telefone',
    key: 'telefone',
    render: (telefone) => telefone || '—',
  },
  {
    title: 'Data de inscrição',
    dataIndex: 'dataInscricao',
    key: 'dataInscricao',
    render: (data) => (data ? dayjs(data).format('DD/MM/YYYY HH:mm') : '—'),
    defaultSortOrder: 'descend',
    sorter: (a, b) => new Date(a.dataInscricao || 0) - new Date(b.dataInscricao || 0),
  },
]

export function EventoInscritosModal({ evento, open, onClose, rootClassName = 'admin-managed-modal' }) {
  const [inscritos, setInscritos] = useState([])
  const [loading, setLoading] = useState(false)
  const [exportandoExcel, setExportandoExcel] = useState(false)
  const [filtroNome, setFiltroNome] = useState('')
  const [filtroCpf, setFiltroCpf] = useState('')
  const [filtroData, setFiltroData] = useState(null)

  useEffect(() => {
    if (!open || !evento?._id) return

    let cancelled = false
    setFiltroNome('')
    setFiltroCpf('')
    setFiltroData(null)

    ;(async () => {
      setLoading(true)
      try {
        const response = await getInscritosEvento(evento._id)
        if (!cancelled) setInscritos(response.data || [])
      } catch (error) {
        if (!cancelled) {
          message.error(error.response?.data?.error || 'Erro ao buscar inscritos')
          setInscritos([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, evento?._id])

  const inscritosFiltrados = useMemo(() => {
    return inscritos.filter((inscrito) => {
      if (filtroNome && !(inscrito.nome || '').toLowerCase().includes(filtroNome.toLowerCase())) {
        return false
      }
      if (
        filtroCpf &&
        !(inscrito.cpf || '').replace(/\D/g, '').includes(filtroCpf.replace(/\D/g, ''))
      ) {
        return false
      }
      if (filtroData && inscrito.dataInscricao) {
        const dataInscricao = dayjs(inscrito.dataInscricao)
        const [startDate, endDate] = filtroData
        if (startDate && endDate) {
          if (
            !dataInscricao.isAfter(startDate.subtract(1, 'day'), 'day') ||
            !dataInscricao.isBefore(endDate.add(1, 'day'), 'day')
          ) {
            return false
          }
        }
      } else if (filtroData && !inscrito.dataInscricao) {
        return false
      }
      return true
    })
  }, [inscritos, filtroNome, filtroCpf, filtroData])

  const handleExportarExcel = () => {
    if (!inscritosFiltrados.length) {
      message.warning('Não há inscritos para exportar.')
      return
    }

    setExportandoExcel(true)
    try {
      const dados = inscritosFiltrados.map((inscrito) => ({
        Nome: inscrito.nome || '',
        'E-mail': inscrito.email || '',
        CPF: formatCPF(inscrito.cpf),
        Telefone: inscrito.telefone || '',
        'Data de inscrição': inscrito.dataInscricao
          ? dayjs(inscrito.dataInscricao).format('DD/MM/YYYY HH:mm')
          : '',
      }))

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(dados)
      ws['!cols'] = [{ wch: 30 }, { wch: 30 }, { wch: 16 }, { wch: 16 }, { wch: 20 }]
      XLSX.utils.book_append_sheet(wb, ws, 'Inscritos')

      const slug = (evento?.titulo || 'evento').replace(/[^a-z0-9]/gi, '_')
      XLSX.writeFile(wb, `inscritos_${slug}_${dayjs().format('YYYY-MM-DD')}.xlsx`)
      message.success(`Excel exportado (${inscritosFiltrados.length} registro(s))`)
    } catch (error) {
      console.error('Erro ao exportar Excel:', error)
      message.error('Erro ao exportar Excel.')
    } finally {
      setExportandoExcel(false)
    }
  }

  const limparFiltros = () => {
    setFiltroNome('')
    setFiltroCpf('')
    setFiltroData(null)
  }

  return (
    <Modal
      title={
        <Space>
          <TeamOutlined />
          <span>Inscritos — {evento?.titulo || ''}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={window.innerWidth < 768 ? '95%' : 1000}
      rootClassName={rootClassName}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }} size="middle">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Input
                placeholder="Buscar por nome"
                prefix={<SearchOutlined />}
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                allowClear
                className="!rounded-xl"
              />
            </Col>
            <Col xs={24} sm={8}>
              <Input
                placeholder="Buscar por CPF"
                value={filtroCpf}
                onChange={(e) => setFiltroCpf(e.target.value.replace(/\D/g, ''))}
                maxLength={11}
                allowClear
                className="!rounded-xl"
              />
            </Col>
            <Col xs={24} sm={8}>
              <RangePicker
                placeholder={['Data inicial', 'Data final']}
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                value={filtroData}
                onChange={setFiltroData}
                allowClear
                popupClassName="admin-managed-picker-dropdown"
              />
            </Col>
          </Row>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-gray-500">
              Mostrando {inscritosFiltrados.length} de {inscritos.length} inscrito(s)
            </span>
            <Space wrap>
              <Button icon={<ClearOutlined />} onClick={limparFiltros} size="small">
                Limpar filtros
              </Button>
              <Button
                icon={<FileExcelOutlined />}
                onClick={handleExportarExcel}
                disabled={!inscritosFiltrados.length}
                loading={exportandoExcel}
              >
                Exportar Excel
              </Button>
            </Space>
          </div>
        </Space>

        {inscritosFiltrados.length > 0 ? (
          <Table
            dataSource={inscritosFiltrados}
            columns={inscritosColumns}
            rowKey={(record, index) => `${record.cpf || record.nome}-${index}`}
            scroll={{ x: 'max-content' }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `${total} inscrito(s)`,
            }}
          />
        ) : inscritos.length > 0 ? (
          <Empty description="Nenhum inscrito encontrado com os filtros aplicados" />
        ) : (
          !loading && <Empty description="Nenhum inscrito neste evento ainda" />
        )}
      </Spin>
    </Modal>
  )
}
