import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Users, Award, TrendingUp, Shield, Rocket } from 'lucide-react'
import { getSobre, getDiretoria } from '../lib/api'
import { useFeatureFlags } from '../contexts/FeatureFlagsContext'
import { PublicLoading } from '../components/public-site/PublicLoading'
import { PublicInnerHero } from '../components/public-site/PublicInnerHero'
import { glassPanel, pageTitle } from '../components/public-site/publicUi'

const fadeBlock = {
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55 },
}

const DEFAULT_VALORES = [
  { titulo: 'União', desc: 'Acreditamos no poder da união e da colaboração entre empresários.' },
  { titulo: 'Excelência', desc: 'Buscamos sempre a excelência em tudo que fazemos.' },
  { titulo: 'Comprometimento', desc: 'Dedicamo-nos integralmente ao desenvolvimento do comércio local.' },
  { titulo: 'Transparência', desc: 'Agimos com transparência e ética em todas as nossas ações.' },
]

const VALOR_ICONS = [Users, Award, TrendingUp, Shield]
const VALOR_COLORS = ['#5b9bd5', '#6cb541', '#5b9bd5', '#6cb541']

const OBJETIVOS = [
  { title: 'Fortalecer o Comércio Local', desc: 'Promover o crescimento e desenvolvimento das empresas associadas através de ações estratégicas e parcerias.', color: '#1e4d7b', hoverBorder: 'rgba(30, 77, 123, 0.5)' },
  { title: 'Facilitar Networking', desc: 'Criar oportunidades para que empresários se conectem e desenvolvam relacionamentos comerciais duradouros.', color: '#5b9bd5', hoverBorder: 'rgba(91, 155, 213, 0.5)' },
  { title: 'Representar Interesses', desc: 'Representar os interesses dos associados junto a órgãos públicos e privados, defendendo políticas favoráveis ao comércio.', color: '#6cb541', hoverBorder: 'rgba(108, 181, 65, 0.5)' },
  { title: 'Promover Eventos', desc: 'Organizar eventos, palestras e workshops para capacitação e desenvolvimento dos associados.', color: '#5b9bd5', hoverBorder: 'rgba(91, 155, 213, 0.5)' },
  { title: 'Desenvolver Parcerias', desc: 'Estabelecer parcerias estratégicas que beneficiem os associados e a comunidade local.', color: '#1e4d7b', hoverBorder: 'rgba(30, 77, 123, 0.5)' },
  { title: 'Incentivar Inovação', desc: 'Fomentar a inovação e modernização dos negócios locais através de conhecimento e recursos compartilhados.', color: '#6cb541', hoverBorder: 'rgba(108, 181, 65, 0.5)' },
]

function normalizeValores(valores) {
  if (!valores || !valores.length) return DEFAULT_VALORES
  return valores.map((v) => {
    if (typeof v === 'string') return { titulo: v, desc: '' }
    return { titulo: v.titulo || v.nome || 'Valor', desc: v.descricao || '' }
  })
}

const Sobre = () => {
  const { flags } = useFeatureFlags()
  const [sobre, setSobre] = useState(null)
  const [diretoria, setDiretoria] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      try {
        const [sobreRes, diretoriaRes] = await Promise.all([getSobre(), getDiretoria()])
        setSobre(sobreRes.data)
        setDiretoria(diretoriaRes.data || [])
      } catch (e) {
        console.error('Erro ao carregar dados:', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <PublicLoading />

  const historia =
    sobre?.historia ||
    'A Associação Empresarial e Comercial de Águas Claras (AECAC) foi fundada com o objetivo de ser a voz unificada, organizada e influente dos empresários de Águas Claras.'
  const missao =
    sobre?.missao ||
    'Promover o desenvolvimento econômico e social de Águas Claras, fortalecendo os laços entre empresários e criando um ambiente propício para o crescimento dos negócios locais.'
  const visao =
    sobre?.visao ||
    'Ser a principal referência em associação empresarial na região de Águas Claras, reconhecida pela excelência em representar e fortalecer o setor comercial local.'
  const valores = normalizeValores(sobre?.valores)

  return (
    <div className="pb-24">
      <PublicInnerHero
        badge={
          flags.preCadastroMode ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#6cb541]/30 bg-[#6cb541]/10 px-4 py-2"
            >
              <Rocket className="h-4 w-4 text-[#6cb541]" />
              <span className="text-sm font-semibold text-[#6cb541]">Em breve</span>
            </motion.div>
          ) : null
        }
        title="Sobre a AECAC"
        subtitle="Conheça nossa história, valores e o trabalho que desenvolvemos para fortalecer o comércio em Águas Claras"
      />

      <section className="px-6 py-12 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-24 grid gap-10 lg:grid-cols-2 lg:gap-16">
            <motion.div className={`${glassPanel} p-10 sm:p-12`} {...fadeBlock} whileHover={{ y: -4, borderColor: 'rgba(91, 155, 213, 0.35)' }}>
              <h2 className="mb-6 text-3xl font-bold text-white">Nossa história</h2>
              <p className="text-lg leading-relaxed text-gray-400 whitespace-pre-line">{historia}</p>
            </motion.div>

            <motion.div
              className={`${glassPanel} p-10 sm:p-12`}
              {...fadeBlock}
              transition={{ delay: 0.08 }}
              whileHover={{ y: -4, borderColor: 'rgba(108, 181, 65, 0.35)' }}
            >
              <h2 className="mb-8 text-3xl font-bold text-white">Nossos valores</h2>
              <div className="space-y-6">
                {valores.map((valor, index) => {
                  const Icon = VALOR_ICONS[index % VALOR_ICONS.length]
                  const color = VALOR_COLORS[index % VALOR_COLORS.length]
                  return (
                    <motion.div
                      key={`${valor.titulo}-${index}`}
                      className="flex gap-4"
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.06 }}
                    >
                      <Icon className="mt-1 h-6 w-6 shrink-0" style={{ color }} />
                      <div>
                        <h4 className="mb-1 text-lg font-bold text-white">{valor.titulo}</h4>
                        {valor.desc ? <p className="text-gray-400">{valor.desc}</p> : null}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          <motion.div {...fadeBlock} className="mb-16 text-center">
            <h2 className={pageTitle}>Missão e visão</h2>
          </motion.div>

          <div className="mb-28 grid gap-10 lg:grid-cols-2">
            <motion.div className={`${glassPanel} p-10 text-center sm:p-12`} {...fadeBlock} whileHover={{ y: -6, scale: 1.01 }}>
              <h3 className="mb-6 text-2xl font-bold text-white">Missão</h3>
              <p className="text-lg leading-relaxed text-gray-400 whitespace-pre-line">{missao}</p>
            </motion.div>
            <motion.div
              className={`${glassPanel} p-10 text-center sm:p-12`}
              {...fadeBlock}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -6, scale: 1.01 }}
            >
              <h3 className="mb-6 text-2xl font-bold text-white">Visão</h3>
              <p className="text-lg leading-relaxed text-gray-400 whitespace-pre-line">{visao}</p>
            </motion.div>
          </div>

          <motion.div {...fadeBlock} className="mb-16 text-center">
            <h2 className={pageTitle}>Nossos objetivos</h2>
          </motion.div>

          <div className="mb-28 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {OBJETIVOS.map((obj, index) => (
              <motion.div
                key={obj.title}
                className={`${glassPanel} p-10 text-center`}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                whileHover={{ y: -8, borderColor: obj.hoverBorder }}
              >
                <h4 className="mb-4 text-xl font-bold" style={{ color: obj.color }}>
                  {obj.title}
                </h4>
                <p className="leading-relaxed text-gray-400">{obj.desc}</p>
              </motion.div>
            ))}
          </div>

          {diretoria.length > 0 && (
            <>
              <motion.div {...fadeBlock} className="mb-16 text-center">
                <h2 className={pageTitle}>Nossa diretoria</h2>
              </motion.div>
              <div className="flex flex-wrap justify-center gap-8">
                {diretoria.map((membro) => (
                  <motion.div
                    key={membro._id}
                    className={`${glassPanel} flex w-full max-w-sm flex-col items-center p-8 text-center`}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -6, borderColor: 'rgba(91, 155, 213, 0.35)' }}
                  >
                    {membro.foto ? (
                      <div className="mb-4 h-44 w-44 overflow-hidden rounded-full border border-white/10 bg-black/30">
                        <img src={membro.foto} alt={membro.nome} className="h-full w-full object-contain" />
                      </div>
                    ) : (
                      <div className="mb-4 flex h-44 w-44 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-[#1e4d7b] to-[#5b9bd5] text-4xl text-white">
                        <Users className="h-16 w-16 opacity-90" />
                      </div>
                    )}
                    <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-[#5b9bd5]">{membro.cargo}</p>
                    <p className="text-lg font-medium text-white">{membro.nome}</p>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default Sobre
