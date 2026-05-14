import { Mail, Phone, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { useMemo } from 'react'
import { useFeatureFlags } from '../../contexts/FeatureFlagsContext'
const LOGO_SRC = '/assets/logo-aecac.png'

export function PublicFooter() {
  const { flags } = useFeatureFlags()

  const navLinks = useMemo(() => {
    const links = [
      { path: '/sobre', label: 'Sobre' },
      { path: '/como-associar', label: 'Como associar' },
    ]
    if (!flags.preLancamento && flags.mostrarGaleria) links.push({ path: '/galeria', label: 'Galeria' })
    if (!flags.preLancamento && flags.mostrarParceiros) links.push({ path: '/parceiros', label: 'Parceiros' })
    if (!flags.preLancamento && flags.mostrarEmpresas) links.push({ path: '/empresas', label: 'Fundadores' })
    if (!flags.preLancamento && flags.mostrarEventos) links.push({ path: '/eventos', label: 'Eventos' })
    if (!flags.preLancamento && flags.mostrarBeneficios) links.push({ path: '/beneficios', label: 'Benefícios' })
    if (!flags.preLancamento && flags.mostrarCapacitacoes) links.push({ path: '/capacitacoes', label: 'Capacitações' })
    links.push({ path: '/cadastro-empresa', label: 'Ser Fundador' })
    return links
  }, [flags])

  return (
    <footer className="border-t border-white/5 py-20 px-6 lg:px-12 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-16 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6">
              <img src={LOGO_SRC} alt="AECAC" className="h-10 w-auto object-contain" />
            </div>
            <p className="text-gray-400 leading-relaxed">
              Associação Empresarial e Comercial de Águas Claras
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="font-bold mb-6 text-lg text-white">Contato</h4>
            <div className="space-y-4 text-gray-400">
              <motion.a
                href="mailto:contato@aecac.com.br"
                className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer"
                whileHover={{ x: 5 }}
              >
                <Mail className="w-5 h-5 shrink-0" />
                <span>contato@aecac.com.br</span>
              </motion.a>
              <motion.a
                href="tel:+556133334444"
                className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer"
                whileHover={{ x: 5 }}
              >
                <Phone className="w-5 h-5 shrink-0" />
                <span>(61) 3333-4444</span>
              </motion.a>
              <motion.div
                className="flex items-center gap-3 text-gray-400"
                whileHover={{ x: 5 }}
              >
                <MapPin className="w-5 h-5 shrink-0" />
                <span>Águas Claras - DF</span>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="font-bold mb-6 text-lg text-white">Navegação</h4>
            <div className="space-y-4 text-gray-400">
              {navLinks.map((item) => (
                <motion.div key={item.path} whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                  <Link to={item.path} className="block hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          className="border-t border-white/5 pt-8 text-center text-gray-500"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p>&copy; {new Date().getFullYear()} AECAC - Todos os direitos reservados</p>
        </motion.div>
      </div>
    </footer>
  )
}
