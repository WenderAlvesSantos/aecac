import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ImageWithFallback } from '../components/public-site/ImageWithFallback'
import { glassPanel } from '../components/public-site/publicUi'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

/** Hero — mesma imagem do protótipo novo-ui-aecac (Home.tsx). */
const HERO_IMAGE_SRC =
  'https://images.unsplash.com/photo-1774186184398-1cc2da3d029e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxleGVjdXRpdmUlMjBidXNpbmVzcyUyMG1lZXRpbmclMjBwcm9mZXNzaW9uYWwlMjBvZmZpY2V8ZW58MXx8fHwxNzc4NzYyMDE5fDA&ixlib=rb-4.1.0&q=80&w=1080'

/**
 * Home alinhada ao protótipo `novo-ui-aecac/src/app/pages/Home.tsx`
 * (rotas do app real: `/cadastro-fundadores` redireciona para `/cadastro-empresa`).
 */
export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e4d7b]/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#5b9bd5]/5 rounded-full blur-3xl pointer-events-none" />
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-[#6cb541]/5 rounded-full blur-3xl pointer-events-none"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <motion.div
                className="inline-flex items-center gap-2 bg-[#6cb541]/10 border border-[#6cb541]/20 rounded-full px-4 py-2 mb-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="w-4 h-4 text-[#6cb541]" />
                <span className="text-sm text-[#6cb541] font-medium">Associação Premium de Águas Claras</span>
              </motion.div>

              <motion.h1
                className="text-6xl lg:text-7xl font-bold mb-8 leading-[1.1] bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent !text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Eleve seu negócio a outro nível
              </motion.h1>

              <motion.p
                className="text-xl text-gray-400 mb-12 leading-relaxed max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Conecte-se com os principais empresários da região, acesse conhecimento exclusivo e amplifique sua influência no mercado
                de Águas Claras.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/cadastro-fundadores"
                    className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#1e4d7b] to-[#5b9bd5] text-white px-10 py-5 rounded-full hover:shadow-2xl hover:shadow-[#5b9bd5]/50 transition-all duration-300 font-semibold text-lg"
                  >
                    Quero ser Fundador
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/sobre"
                    className="inline-flex items-center justify-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 text-white px-10 py-5 rounded-full hover:bg-white/10 transition-all duration-300 font-semibold text-lg"
                  >
                    Saiba mais
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-[#1e4d7b]/20 to-[#6cb541]/20 rounded-3xl blur-3xl"
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div whileHover={{ scale: 1.02, rotate: 1 }} transition={{ duration: 0.3 }}>
                <ImageWithFallback
                  src={HERO_IMAGE_SRC}
                  alt="Empresários em reunião executiva"
                  className="relative w-full h-auto rounded-3xl shadow-2xl border border-white/10"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pilares Section */}
      <section id="pilares" className="py-32 px-6 lg:px-12 bg-gradient-to-b from-transparent to-[#1e4d7b]/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent !text-transparent">
              Nossos Pilares
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Três fundamentos que sustentam nossa excelência</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: '👥',
                title: 'Conexão Premium',
                description:
                  'Acesse uma rede exclusiva de empresários de alto nível, facilitando parcerias estratégicas e oportunidades de negócios valiosas.',
                gradient: 'from-[#1e4d7b] to-[#5b9bd5]',
                shadowColor: '#5b9bd5',
              },
              {
                icon: '📈',
                title: 'Desenvolvimento',
                description:
                  'Capacitações, masterclasses e mentorias com os melhores especialistas para acelerar o crescimento do seu negócio.',
                gradient: 'from-[#6cb541] to-[#8fd652]',
                shadowColor: '#6cb541',
              },
              {
                icon: '🎯',
                title: 'Representatividade',
                description:
                  'Defesa institucional de alto impacto junto aos órgãos públicos e privados, garantindo voz ativa nas decisões estratégicas.',
                gradient: 'from-[#1e4d7b] to-[#5b9bd5]',
                shadowColor: '#5b9bd5',
              },
            ].map((pilar, index) => (
              <motion.div
                key={index}
                className={`${glassPanel} group relative p-10 hover:border-[#5b9bd5]/50 transition-all duration-500 cursor-pointer`}
                variants={fadeInUp}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(to bottom right, ${pilar.shadowColor}10, transparent)`,
                  }}
                />
                <div className="relative">
                  <motion.div
                    className={`w-16 h-16 bg-gradient-to-br ${pilar.gradient} rounded-2xl flex items-center justify-center mb-8 text-3xl`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    {pilar.icon}
                  </motion.div>
                  <h3 className="text-3xl font-bold mb-6 text-white">{pilar.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-lg">{pilar.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Por que se associar */}
      <section className="py-32 px-6 lg:px-12 bg-gradient-to-b from-transparent via-[#1e4d7b]/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent !text-transparent">
              Por que se associar?
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Networking',
                desc: 'Conecte-se com outros empresários e expanda sua rede de contatos profissionais.',
                color: '#5b9bd5',
                hoverBorder: 'rgba(91, 155, 213, 0.5)',
              },
              {
                title: 'Visibilidade',
                desc: 'Aumente a visibilidade do seu negócio como fundador na região de Águas Claras.',
                color: '#6cb541',
                hoverBorder: 'rgba(108, 181, 65, 0.5)',
              },
              {
                title: 'Eventos',
                desc: 'Participe de eventos exclusivos, palestras e workshops para desenvolvimento empresarial.',
                color: '#5b9bd5',
                hoverBorder: 'rgba(91, 155, 213, 0.5)',
              },
              {
                title: 'Representação',
                desc: 'Tenha voz ativa nas decisões que impactam o comércio local.',
                color: '#5b9bd5',
                hoverBorder: 'rgba(91, 155, 213, 0.5)',
              },
              {
                title: 'Descontos',
                desc: 'Aproveite descontos especiais em produtos e serviços de parceiros.',
                color: '#5b9bd5',
                hoverBorder: 'rgba(91, 155, 213, 0.5)',
              },
              {
                title: 'Suporte',
                desc: 'Receba orientação e suporte para o crescimento do seu negócio.',
                color: '#6cb541',
                hoverBorder: 'rgba(108, 181, 65, 0.5)',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className={`${glassPanel} p-10 text-center`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, borderColor: item.hoverBorder, scale: 1.02 }}
              >
                <h4 className="text-2xl font-bold mb-4" style={{ color: item.color }}>
                  {item.title}
                </h4>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Cadastro de Fundadores */}
      <section className="py-32 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e4d7b] to-[#5b9bd5]" />
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          }}
          style={{
            backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        <motion.div
          className="max-w-5xl mx-auto relative z-10 text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-5xl lg:text-6xl font-bold mb-6 text-white"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Cadastro de Fundadores
          </motion.h2>
          <motion.p
            className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Fundadores não entram depois. Eles definem as regras do jogo. A AECAC está nascendo agora e poucas empresas terão o título de
            fundador. Garanta sua posição.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/cadastro-fundadores"
                className="inline-flex items-center justify-center gap-3 bg-[#6cb541] text-white px-10 py-5 rounded-full hover:bg-[#5da537] hover:shadow-2xl transition-all duration-300 font-semibold text-lg"
              >
                Quero ser Fundador
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/sobre"
                className="inline-flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-10 py-5 rounded-full hover:bg-white/20 transition-all duration-300 font-semibold text-lg"
              >
                Saiba Mais
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </>
  )
}
