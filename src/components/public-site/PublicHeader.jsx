import { Menu, X } from 'lucide-react'
import { useState, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useFeatureFlags } from '../../contexts/FeatureFlagsContext'

/** Logo com fundo transparente (evita caixa branca do PNG antigo em `src/assets`). */
const LOGO_SRC = '/assets/logo-aecac.png'

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { flags, isSectionVisible } = useFeatureFlags()

  const isActive = (path) => location.pathname === path

  const menuItems = useMemo(() => {
    const items = [{ path: '/sobre', label: 'Sobre' }]
    if (isSectionVisible('mostrarGaleria')) {
      items.push({ path: '/galeria', label: 'Galeria' })
    }
    if (isSectionVisible('mostrarParceiros')) {
      items.push({ path: '/parceiros', label: 'Parceiros' })
    }
    if (isSectionVisible('mostrarEmpresas')) {
      items.push({ path: '/empresas', label: 'Fundadores' })
    }
    if (isSectionVisible('mostrarEventos')) {
      items.push({ path: '/eventos', label: 'Eventos' })
    }
    if (isSectionVisible('mostrarBeneficios')) {
      items.push({ path: '/beneficios', label: 'Benefícios' })
    }
    if (isSectionVisible('mostrarCapacitacoes')) {
      items.push({ path: '/capacitacoes', label: 'Capacitações' })
    }
    return items
  }, [flags, isSectionVisible])

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-b border-white/5 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-24">
          <Link to="/" className="flex items-center">
            <motion.img
              src={LOGO_SRC}
              alt="AECAC"
              className="h-12 w-auto object-contain"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <Link
              to="/"
              className="relative text-gray-400 hover:text-white transition-all duration-300 text-sm font-medium group"
            >
              Home
              <motion.div
                className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-[#1e4d7b] to-[#5b9bd5]"
                initial={{ width: 0 }}
                animate={{ width: isActive('/') ? '100%' : '0%' }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.3 }}
              />
            </Link>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative text-gray-400 hover:text-white transition-all duration-300 text-sm font-medium group"
              >
                {item.label}
                <motion.div
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-[#1e4d7b] to-[#5b9bd5]"
                  initial={{ width: 0 }}
                  animate={{ width: isActive(item.path) ? '100%' : '0%' }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            ))}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/cadastro-empresa"
                className="relative group bg-gradient-to-r from-[#1e4d7b] to-[#5b9bd5] text-white px-7 py-3 rounded-full hover:shadow-lg hover:shadow-[#5b9bd5]/50 transition-all duration-300 text-sm font-semibold"
              >
                Ser Fundador
              </Link>
            </motion.div>
          </nav>

          <button
            type="button"
            className="lg:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="lg:hidden py-8 border-t border-white/5"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <nav className="flex flex-col gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0 }}
                >
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                </motion.div>
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index + 1) * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (menuItems.length + 1) * 0.05 }}
                >
                  <Link
                    to="/cadastro-empresa"
                    className="bg-gradient-to-r from-[#1e4d7b] to-[#5b9bd5] text-white px-7 py-3 rounded-full text-sm font-semibold text-center block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Ser Fundador
                  </Link>
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
