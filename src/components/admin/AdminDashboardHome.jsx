import { useState, useEffect, useCallback } from 'react'
import { Button, Skeleton } from 'antd'
import {
  CalendarOutlined,
  TeamOutlined,
  ShopOutlined,
  PictureOutlined,
  UserOutlined,
  GiftOutlined,
  BookOutlined,
  FolderOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import {
  getEventosAdmin,
  getParceiros,
  getEmpresas,
  getGaleria,
  getDiretoria,
  getBeneficiosAdmin,
  getCapacitacoesAdmin,
  getEmpresasPendentes,
  getDocumentos,
} from '../../lib/api'
import { glassPanel, pageSubtitleLeft, pageTitle } from '../public-site/publicUi'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

function formatToday() {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
}

function StatCard({ card, index, onNavigate }) {
  const Icon = card.icon
  return (
    <motion.button
      type="button"
      onClick={() => onNavigate(card.path)}
      className={`${glassPanel} group w-full p-5 text-left transition hover:border-white/25 hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5b9bd5]`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileHover={{ y: -3 }}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}>
          <Icon className="text-base" />
        </div>
        <div className="flex items-center gap-2">
          {card.badge != null && card.badge > 0 && (
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
              {card.badge} pendente{card.badge !== 1 ? 's' : ''}
            </span>
          )}
          <ArrowRightOutlined className="text-gray-600 transition group-hover:translate-x-0.5 group-hover:text-[#5b9bd5]" />
        </div>
      </div>
      <p className="m-0 text-sm font-medium text-white">{card.title}</p>
      {card.description && (
        <p className="m-0 mt-1 line-clamp-2 text-xs text-gray-500">{card.description}</p>
      )}
      <p
        className={`m-0 mt-3 bg-gradient-to-r ${card.accent} bg-clip-text text-2xl font-bold text-transparent`}
      >
        {card.value}
      </p>
    </motion.button>
  )
}

function SectionBlock({ title, description, children, delay = 0 }) {
  return (
    <motion.section
      className="mb-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      <div className="mb-4">
        <h2 className="m-0 text-lg font-semibold text-white">{title}</h2>
        <p className="m-0 mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </motion.section>
  )
}

export function AdminDashboardHome({ userName = 'Admin' }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    eventos: 0,
    parceiros: 0,
    fundadoresAprovados: 0,
    fundadoresPendentes: 0,
    galeria: 0,
    diretoria: 0,
    beneficios: 0,
    capacitacoes: 0,
    documentos: 0,
  })

  const loadStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const [
        eventos,
        parceiros,
        fundadoresAprovados,
        fundadoresPendentes,
        galeria,
        diretoria,
        beneficios,
        capacitacoes,
        documentos,
      ] = await Promise.all([
        getEventosAdmin(),
        getParceiros(),
        getEmpresas(),
        getEmpresasPendentes('pendente'),
        getGaleria(),
        getDiretoria(),
        getBeneficiosAdmin().catch(() => ({ data: [] })),
        getCapacitacoesAdmin().catch(() => ({ data: [] })),
        getDocumentos().catch(() => ({ data: [] })),
      ])

      setStats({
        eventos: eventos.data.length,
        parceiros: parceiros.data.length,
        fundadoresAprovados: fundadoresAprovados.data.length,
        fundadoresPendentes: fundadoresPendentes.data.length,
        galeria: galeria.data.length,
        diretoria: diretoria.data.length,
        beneficios: beneficios.data.length,
        capacitacoes: capacitacoes.data.length,
        documentos: documentos.data?.length ?? 0,
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const totalConteudo =
    stats.parceiros + stats.galeria + stats.eventos + stats.beneficios + stats.capacitacoes

  const cadastrosSection = [
    {
      key: 'fundadores',
      title: 'Fundadores',
      description: 'Cadastros recebidos e aprovados no site',
      value: stats.fundadoresAprovados,
      badge: stats.fundadoresPendentes,
      path: '/admin/fundadores',
      icon: ShopOutlined,
      accent: 'from-[#1e4d7b] to-[#6cb541]',
      iconBg: 'bg-[#1e4d7b]/30 text-[#5b9bd5]',
    },
    {
      key: 'diretoria',
      title: 'Diretoria',
      description: 'Membros exibidos na página Sobre',
      value: stats.diretoria,
      path: '/admin/diretoria',
      icon: UserOutlined,
      accent: 'from-[#1e4d7b] to-[#5b9bd5]',
      iconBg: 'bg-white/10 text-white',
    },
    {
      key: 'documentos',
      title: 'Documentos',
      description: 'Atas, arquivos e categorias internas',
      value: stats.documentos,
      path: '/admin/documentos',
      icon: FolderOutlined,
      accent: 'from-[#1e4d7b] to-[#5b9bd5]',
      iconBg: 'bg-[#5b9bd5]/20 text-[#5b9bd5]',
    },
  ]

  const conteudoSection = [
    {
      key: 'parceiros',
      title: 'Parceiros',
      description: 'Empresas parceiras no site público',
      value: stats.parceiros,
      path: '/admin/parceiros',
      icon: TeamOutlined,
      accent: 'from-[#6cb541] to-[#8fd652]',
      iconBg: 'bg-[#6cb541]/20 text-[#6cb541]',
    },
    {
      key: 'galeria',
      title: 'Galeria',
      description: 'Fotos e imagens da associação',
      value: stats.galeria,
      path: '/admin/galeria',
      icon: PictureOutlined,
      accent: 'from-[#1e4d7b] to-[#5b9bd5]',
      iconBg: 'bg-[#5b9bd5]/20 text-[#5b9bd5]',
    },
    {
      key: 'sobre',
      title: 'Página Sobre',
      description: 'Textos institucionais da AECAC',
      value: '—',
      path: '/admin/sobre',
      icon: FileTextOutlined,
      accent: 'from-[#1e4d7b] to-[#5b9bd5]',
      iconBg: 'bg-white/10 text-white',
    },
  ]

  const associadoSection = [
    {
      key: 'eventos',
      title: 'Eventos',
      description: 'Agenda e inscrições de associados',
      value: stats.eventos,
      path: '/admin/eventos',
      icon: CalendarOutlined,
      accent: 'from-[#1e4d7b] to-[#5b9bd5]',
      iconBg: 'bg-[#5b9bd5]/20 text-[#5b9bd5]',
    },
    {
      key: 'beneficios',
      title: 'Benefícios',
      description: 'Vantagens oferecidas aos associados',
      value: stats.beneficios,
      path: '/admin/beneficios',
      icon: GiftOutlined,
      accent: 'from-[#6cb541] to-[#8fd652]',
      iconBg: 'bg-[#6cb541]/20 text-[#6cb541]',
    },
    {
      key: 'capacitacoes',
      title: 'Capacitações',
      description: 'Cursos e treinamentos disponíveis',
      value: stats.capacitacoes,
      path: '/admin/capacitacoes',
      icon: BookOutlined,
      accent: 'from-[#1e4d7b] to-[#5b9bd5]',
      iconBg: 'bg-[#5b9bd5]/20 text-[#5b9bd5]',
    },
  ]

  const quickActions = [
    {
      label: 'Revisar fundadores',
      desc: 'Aprovar ou rejeitar cadastros',
      path: '/admin/fundadores',
      icon: ShopOutlined,
      highlight: stats.fundadoresPendentes > 0,
    },
    {
      label: 'Documentos',
      desc: 'Gerenciar atas e arquivos',
      path: '/admin/documentos',
      icon: FolderOutlined,
    },
    {
      label: 'Configurações',
      desc: 'Flags e dados da associação',
      path: '/admin/configuracoes',
      icon: SettingOutlined,
    },
    {
      label: 'Diretoria',
      desc: 'Ordem e fotos dos membros',
      path: '/admin/diretoria',
      icon: UserOutlined,
    },
  ]

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <Skeleton active paragraph={{ rows: 2 }} className="admin-dashboard-skeleton" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} active paragraph={{ rows: 3 }} />
          ))}
        </div>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Boas-vindas */}
      <motion.div
        className={`${glassPanel} mb-8 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div>
          <p className="m-0 text-sm capitalize text-gray-500">{formatToday()}</p>
          <h1 className={`${pageTitle} !mb-2 !mt-2 !text-left !text-2xl sm:!text-3xl lg:!text-4xl`}>
            {getGreeting()}, {userName}
          </h1>
          <p className={`${pageSubtitleLeft} !mx-0 !max-w-xl !text-base`}>
            Aqui está o resumo do painel. Use os cards para ir direto a cada área.
          </p>
        </div>
        <Button
          icon={<ReloadOutlined spin={refreshing} />}
          onClick={() => loadStats(true)}
          loading={refreshing}
          className="!shrink-0 !self-start !border-white/15 !bg-white/5 !text-gray-200 hover:!border-[#5b9bd5]/40 hover:!text-white sm:!self-center"
        >
          Atualizar
        </Button>
      </motion.div>

      {/* Alerta de pendências */}
      {stats.fundadoresPendentes > 0 && (
        <motion.div
          className="mb-8 flex flex-col gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
              <WarningOutlined className="text-lg" />
            </div>
            <div>
              <p className="m-0 font-semibold text-amber-100">
                {stats.fundadoresPendentes} fundador{stats.fundadoresPendentes !== 1 ? 'es' : ''}{' '}
                aguardando análise
              </p>
              <p className="m-0 mt-1 text-sm text-amber-200/70">
                Revise os cadastros pendentes para aprovar ou rejeitar.
              </p>
            </div>
          </div>
          <Button
            type="primary"
            onClick={() => navigate('/admin/fundadores')}
            className="!shrink-0 !border-0 !bg-amber-500 !text-black hover:!bg-amber-400"
          >
            Revisar agora
          </Button>
        </motion.div>
      )}

      {/* KPIs resumidos */}
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {[
          {
            label: 'Pendentes',
            value: stats.fundadoresPendentes,
            color: stats.fundadoresPendentes > 0 ? 'text-amber-300' : 'text-gray-400',
            icon: WarningOutlined,
          },
          {
            label: 'Fundadores ativos',
            value: stats.fundadoresAprovados,
            color: 'text-[#6cb541]',
            icon: CheckCircleOutlined,
          },
          {
            label: 'Itens no site',
            value: totalConteudo,
            color: 'text-[#5b9bd5]',
            icon: PictureOutlined,
          },
          {
            label: 'Documentos',
            value: stats.documentos,
            color: 'text-white',
            icon: FolderOutlined,
          },
        ].map((kpi, i) => {
          const KpiIcon = kpi.icon
          return (
            <motion.div
              key={kpi.label}
              className={`${glassPanel} p-4 sm:p-5`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="mb-2 flex items-center gap-2 text-gray-500">
                <KpiIcon className="text-sm" />
                <span className="text-xs sm:text-sm">{kpi.label}</span>
              </div>
              <p className={`m-0 text-2xl font-bold sm:text-3xl ${kpi.color}`}>{kpi.value}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Seções por contexto */}
      <SectionBlock
        title="Cadastros e institucional"
        description="Fundadores, diretoria e documentos internos"
        delay={0.1}
      >
        {cadastrosSection.map((card, index) => (
          <StatCard key={card.key} card={card} index={index} onNavigate={navigate} />
        ))}
      </SectionBlock>

      <SectionBlock
        title="Conteúdo público"
        description="O que visitantes veem no site da AECAC"
        delay={0.15}
      >
        {conteudoSection.map((card, index) => (
          <StatCard key={card.key} card={card} index={index} onNavigate={navigate} />
        ))}
      </SectionBlock>

      <SectionBlock
        title="Área do associado"
        description="Eventos, benefícios e capacitações"
        delay={0.2}
      >
        {associadoSection.map((card, index) => (
          <StatCard key={card.key} card={card} index={index} onNavigate={navigate} />
        ))}
      </SectionBlock>

      {/* Acesso rápido */}
      <motion.div
        className={`${glassPanel} p-6 sm:p-8`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
      >
        <h2 className="m-0 text-lg font-semibold text-white">Acesso rápido</h2>
        <p className="mt-2 mb-6 text-sm text-gray-500">
          Atalhos para as tarefas mais comuns do dia a dia.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const ActionIcon = action.icon
            return (
              <button
                key={action.path}
                type="button"
                onClick={() => navigate(action.path)}
                className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5b9bd5] ${
                  action.highlight
                    ? 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    action.highlight ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-[#5b9bd5]'
                  }`}
                >
                  <ActionIcon />
                </div>
                <div className="min-w-0">
                  <p className="m-0 text-sm font-medium text-white">{action.label}</p>
                  <p className="m-0 mt-0.5 text-xs text-gray-500">{action.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
