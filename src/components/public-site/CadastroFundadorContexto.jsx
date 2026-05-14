import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { CheckCircleOutlined } from '@ant-design/icons'
import { glassPanel } from './publicUi'

/** Alinhado a `novo-ui-aecac/src/app/pages/CadastroFundadores.tsx` (secção “Como Funciona…”). */
const PASSOS_PRE_CADASTRO = [
  {
    num: '1',
    title: 'Cadastro de Fundadores',
    desc: 'Preencha o formulário de Cadastro de Fundadores para participar da AECAC',
    isGreen: false,
  },
  {
    num: '2',
    title: 'Aguardar Contato',
    desc: 'Entraremos em contato assim que o lançamento oficial acontecer',
    isGreen: false,
  },
  {
    num: '3',
    title: 'Lançamento',
    desc: 'No lançamento oficial, você terá prioridade para se associar',
    isGreen: false,
  },
  {
    num: '✓',
    title: 'Seja um Pioneiro',
    desc: 'Seja um dos fundadores e ajude a construir a AECAC',
    isGreen: true,
  },
]

const PASSOS_NORMAL = [
  {
    num: '1',
    title: 'Envio do formulário',
    desc: 'Informe CNPJ, dados do negócio e do responsável; em seguida confirme a carta de adesão.',
    isGreen: false,
  },
  {
    num: '2',
    title: 'Análise da equipe',
    desc: 'A equipe AECAC analisa o cadastro e a documentação enviada.',
    isGreen: false,
  },
  {
    num: '3',
    title: 'Aprovação',
    desc: 'Você recebe a resposta e as orientações para concluir a associação.',
    isGreen: false,
  },
  {
    num: '✓',
    title: 'Portal do associado',
    desc: 'Use o mesmo e-mail em /associado/login para criar sua conta após a aprovação.',
    isGreen: true,
  },
]

const headingComoFunciona =
  'mb-6 text-center text-5xl font-bold leading-tight lg:text-6xl bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent !text-transparent'

/** Alinhado a `novo-ui-aecac/.../CadastroFundadores.tsx` — secção “O que você terá ao se associar”. */
const BENEFICIOS_ASSOCIAR = [
  {
    icon: '🎁',
    title: 'Benefícios Exclusivos',
    desc: 'Ofereça descontos e vantagens especiais em seus produtos e serviços para potenciais clientes através do site da AECAC.',
    gradient: 'from-[#1e4d7b] to-[#5b9bd5]',
  },
  {
    icon: '👥',
    title: 'Eventos e Networking',
    desc: 'Promova seus eventos exclusivos, workshops e oportunidades de networking para qualquer pessoa com acesso ao site.',
    gradient: 'from-[#1e4d7b] to-[#5b9bd5]',
  },
  {
    icon: '📚',
    title: 'Capacitações',
    desc: 'Divulgue e promova seus cursos, palestras e treinamentos para alcançar um público maior através da plataforma.',
    gradient: 'from-[#1e4d7b] to-[#5b9bd5]',
  },
  {
    icon: '👁️',
    title: 'Visibilidade',
    desc: 'Destaque no diretório público de fundadores da AECAC, aumentando a visibilidade do seu negócio e atraindo novos clientes.',
    gradient: 'from-[#1e4d7b] to-[#5b9bd5]',
  },
  {
    icon: '🎯',
    title: 'Representatividade',
    desc: 'Faça parte de uma organização que representa e defende os interesses do comércio em Águas Claras.',
    gradient: 'from-[#1e4d7b] to-[#5b9bd5]',
  },
  {
    icon: '⭐',
    title: 'Credibilidade',
    desc: 'Ganhe credibilidade e confiança ao fazer parte de uma associação reconhecida e respeitada.',
    gradient: 'from-[#6cb541] to-[#8fd652]',
  },
]

function StepCard({ step, index }) {
  return (
    <motion.div
      className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-10 text-center backdrop-blur-sm"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10, scale: 1.05 }}
    >
      <motion.div
        className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br font-bold text-3xl text-white shadow-lg ${
          step.isGreen ? 'from-[#6cb541] to-[#8fd652]' : 'from-[#1e4d7b] to-[#5b9bd5]'
        }`}
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
        style={{
          boxShadow: step.isGreen ? '0 10px 40px rgba(108, 181, 65, 0.3)' : '0 10px 40px rgba(91, 155, 213, 0.3)',
        }}
      >
        {step.num}
      </motion.div>
      <h4 className="mb-4 text-xl font-bold text-white">{step.title}</h4>
      <p className="leading-relaxed text-gray-400">{step.desc}</p>
    </motion.div>
  )
}

function BeneficioAssociarCard({ item, index }) {
  return (
    <motion.div
      className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-10 text-center backdrop-blur-sm"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10, scale: 1.02 }}
    >
      <motion.div
        className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl ${item.gradient}`}
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
      >
        {item.icon}
      </motion.div>
      <h4 className="mb-4 text-2xl font-bold text-[#5b9bd5]">{item.title}</h4>
      <p className="leading-relaxed text-gray-400">{item.desc}</p>
    </motion.div>
  )
}

/** Conteúdo editorial + formulário (título da zona #cadastro alinhado ao protótipo). */
export function CadastroFundadorContexto({ preCadastro, formTitle, formSubtitle, children }) {
  const passos = preCadastro ? PASSOS_PRE_CADASTRO : PASSOS_NORMAL
  const checklist = preCadastro
    ? ['CNPJ válido da empresa', 'E-mail e telefone para contato', 'Logomarca em boa resolução (opcional, mas recomendado)']
    : ['CNPJ válido e dados conferidos', 'Descrição clara da atividade do negócio', 'Mesmo e-mail que você usará depois no portal do associado']

  return (
    <div className="pb-12">
      <section className="bg-gradient-to-b from-[#1e4d7b]/5 to-transparent px-6 py-12 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={headingComoFunciona}>
              {preCadastro ? 'Como Funciona o Cadastro de Fundadores' : 'Como funciona o cadastro de fundador'}
            </h2>
            {!preCadastro && (
              <p className="mx-auto max-w-2xl text-base text-gray-400">
                Envio, confirmação da carta, análise e, após aprovação, acesso ao portal do associado com o e-mail cadastrado.
              </p>
            )}
          </motion.div>

          <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {passos.map((step, index) => (
              <StepCard key={step.title} step={step} index={index} />
            ))}
          </div>

          {preCadastro && (
            <motion.div
              className="rounded-3xl border border-[#6cb541]/20 bg-gradient-to-br from-[#6cb541]/10 to-transparent p-12 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="mb-4 text-3xl font-bold text-[#6cb541]">Seja um Pioneiro!</h3>
              <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-300">
                Garanta sua vaga como fundador e ajude a definir os rumos da AECAC
              </p>
              <motion.a
                href="#cadastro"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#6cb541] to-[#8fd652] px-10 py-5 text-lg font-semibold text-white transition-all duration-300 hover:shadow-2xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ boxShadow: '0 10px 40px rgba(108, 181, 65, 0.3)' }}
              >
                Quero ser Fundador
                <ArrowRight className="h-5 w-5" />
              </motion.a>
            </motion.div>
          )}
        </div>
      </section>

      <section className="bg-gradient-to-b from-transparent via-[#1e4d7b]/5 to-transparent px-6 py-20 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="mb-20 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className={headingComoFunciona}>O que você terá ao se associar</h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {BENEFICIOS_ASSOCIAR.map((item, index) => (
              <BeneficioAssociarCard key={item.title} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <div
        className={`mx-auto max-w-6xl space-y-12 px-6 pt-12 ${preCadastro ? '' : 'lg:grid lg:grid-cols-3 lg:items-start lg:gap-8 lg:space-y-0'}`}
      >
        {!preCadastro && (
          <aside className={`${glassPanel} p-6 lg:col-span-1`}>
            <h3 className="text-lg font-semibold text-white">Antes de enviar</h3>
            <ul className="mt-4 space-y-3 text-sm text-gray-300">
              {checklist.map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircleOutlined className="mt-0.5 shrink-0 text-[#6cb541]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-gray-500">
              Quer ver benefícios, investimento e o passo a passo completo?{' '}
              <Link to="/como-associar" className="font-medium text-[#5b9bd5] hover:text-[#7eb3e0]">
                Abrir página “Como associar”
              </Link>
              .
            </p>
          </aside>
        )}

        <section
          id="cadastro"
          className={`scroll-mt-28 px-0 ${preCadastro ? 'py-12 lg:py-24' : 'py-12 lg:col-span-2 lg:py-16'}`}
        >
          <div className="mx-auto max-w-3xl">
            <motion.div
              className="mb-16 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6 text-5xl font-bold leading-tight text-transparent bg-gradient-to-b from-white to-gray-400 bg-clip-text !text-transparent lg:text-6xl">
                {formTitle}
              </h2>
              <p className="text-xl text-gray-400">{formSubtitle}</p>
            </motion.div>

            {children}
          </div>
        </section>
      </div>
    </div>
  )
}
