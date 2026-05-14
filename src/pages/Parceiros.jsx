import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import {
  Building2,
  Store,
  Cpu,
  GraduationCap,
  Truck,
  Megaphone,
  Sparkles,
  Headphones,
  Wallet,
  PartyPopper,
} from 'lucide-react'
import { getParceiros, getConfiguracoes } from '../lib/api'
import { PublicLoading } from '../components/public-site/PublicLoading'
import { PublicInnerHero } from '../components/public-site/PublicInnerHero'
import { glassPanel, pillActive, pillIdle, ctaBlue, pageTitle } from '../components/public-site/publicUi'

function categoryKey(cat) {
  if (!cat) return ''
  return String(cat)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

function iconFor(cat) {
  const k = categoryKey(cat)
  if (k.includes('finance')) return Building2
  if (k.includes('varejo')) return Store
  if (k.includes('tecnolog')) return Cpu
  if (k.includes('educa')) return GraduationCap
  if (k.includes('logist')) return Truck
  if (k.includes('market')) return Megaphone
  return Sparkles
}

const Parceiros = () => {
  const [parceiros, setParceiros] = useState([])
  const [loading, setLoading] = useState(true)
  const [emailContato, setEmailContato] = useState('contato@aecac.org.br')
  const [activeFilter, setActiveFilter] = useState('todos')

  useEffect(() => {
    void (async () => {
      try {
        const [parceirosRes, configuracoesRes] = await Promise.all([getParceiros(), getConfiguracoes()])
        setParceiros(parceirosRes.data)
        if (configuracoesRes.data?.contato?.email) {
          setEmailContato(configuracoesRes.data.contato.email)
        }
      } catch (e) {
        console.error('Erro ao carregar dados:', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <PublicLoading />

  const uniqueCats = [...new Set(parceiros.map((p) => categoryKey(p.categoria)).filter(Boolean))]
  const filterButtons = [
    { id: 'todos', label: 'Todos' },
    ...uniqueCats.map((id) => ({
      id,
      label: parceiros.find((p) => categoryKey(p.categoria) === id)?.categoria || id,
    })),
  ]

  const filtered =
    activeFilter === 'todos'
      ? parceiros
      : parceiros.filter((p) => categoryKey(p.categoria) === activeFilter)

  return (
    <div className="pb-24">
      <PublicInnerHero
        title="Nossos parceiros"
        subtitle="Conheça parceiros estratégicos que oferecem benefícios exclusivos para associados e fundadores"
      >
        <motion.div
          className="mt-12 flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {filterButtons.map((cat, index) => (
            <motion.button
              key={cat.id}
              type="button"
              onClick={() => setActiveFilter(cat.id)}
              className={`rounded-full px-6 py-3 text-sm font-medium transition ${activeFilter === cat.id ? pillActive : pillIdle}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              {cat.label}
            </motion.button>
          ))}
        </motion.div>
      </PublicInnerHero>

      <section className="px-6 py-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          {filtered.length === 0 ? (
            <div className={`${glassPanel} py-16 text-center text-gray-400`}>Nenhum parceiro nesta categoria.</div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((parceiro, index) => {
                const Icon = iconFor(parceiro.categoria)
                return (
                  <motion.div
                    key={parceiro._id}
                    className={`${glassPanel} flex flex-col p-8 text-center`}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(index * 0.06, 0.35) }}
                    whileHover={{ y: -8, borderColor: 'rgba(91, 155, 213, 0.35)' }}
                  >
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e4d7b] to-[#5b9bd5] text-white shadow-lg">
                      <Icon className="h-9 w-9" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-white">{parceiro.nome}</h3>
                    {parceiro.categoria && (
                      <span className="mb-4 inline-block rounded-full bg-[#5b9bd5]/20 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-[#5b9bd5]">
                        {parceiro.categoria}
                      </span>
                    )}
                    <p className="flex-1 text-left text-sm leading-relaxed text-gray-400">{parceiro.descricao}</p>
                  </motion.div>
                )
              })}
            </div>
          )}

          <motion.h2
            className={`${pageTitle} mt-24`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Benefícios para associados
          </motion.h2>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {[
              {
                title: 'Descontos exclusivos',
                desc: 'Descontos em produtos e serviços dos parceiros para quem é associado.',
                icon: Wallet,
                accent: '#5b9bd5',
              },
              {
                title: 'Prioridade no atendimento',
                desc: 'Atendimento prioritário e personalizado ao seu negócio.',
                icon: Headphones,
                accent: '#6cb541',
              },
              {
                title: 'Condições especiais',
                desc: 'Condições diferenciadas de pagamento e financiamento com parceiros financeiros.',
                icon: Building2,
                accent: '#5b9bd5',
              },
              {
                title: 'Eventos exclusivos',
                desc: 'Workshops e encontros organizados com parceiros estratégicos.',
                icon: PartyPopper,
                accent: '#6cb541',
              },
            ].map((b, i) => (
              <motion.div
                key={b.title}
                className={`${glassPanel} p-8`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <b.icon className="mb-4 h-8 w-8" style={{ color: b.accent }} />
                <h4 className="mb-3 text-lg font-bold text-white">{b.title}</h4>
                <p className="text-sm leading-relaxed text-gray-400">{b.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className={`${glassPanel} mt-16 p-10 text-center sm:p-12`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="mb-4 text-2xl font-bold text-white">Torne-se um parceiro</h3>
            <p className="mx-auto mb-6 max-w-2xl text-gray-400">
              Sua empresa pode se tornar parceira da AECAC e oferecer benefícios aos nossos associados.
            </p>
            <a href={`mailto:${emailContato}`} className={ctaBlue}>
              {emailContato}
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Parceiros
