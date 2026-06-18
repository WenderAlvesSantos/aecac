import { useState, useEffect, useMemo } from 'react'
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { useFeatureFlags } from '../../contexts/FeatureFlagsContext'
import { getConfiguracoes } from '../../lib/api'

const LOGO_SRC = '/assets/logo-aecac.png'

function formatPhone(value) {
  if (!value) return ''
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  }
  return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
}

function instagramLabelFromUrl(url) {
  const m = String(url || '').match(/instagram\.com\/([^/?#]+)/i)
  return m ? `@${m[1]}` : 'Instagram'
}

/** Lucide 1.16 não exporta Instagram; SVG alinhado aos outros ícones 24px. */
function InstagramGlyph({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

export function PublicFooter() {
  const { flags, isSectionVisible } = useFeatureFlags()
  const [configuracoes, setConfiguracoes] = useState({
    contato: {},
    redesSociais: {},
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await getConfiguracoes()
        if (!cancelled) setConfiguracoes(data || { contato: {}, redesSociais: {} })
      } catch (e) {
        console.error('Erro ao carregar configurações (rodapé público):', e)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const contato = configuracoes.contato || {}
  const redes = configuracoes.redesSociais || {}
  const hasContato = !!(contato.telefone || contato.email || contato.endereco)
  const hasRedes = !!(redes.facebook || redes.instagram || redes.linkedin)
  const showContatoCol = hasContato || hasRedes

  const navLinks = useMemo(() => {
    const links = [
      { path: '/sobre', label: 'Sobre' },
      { path: '/como-associar', label: 'Como associar' },
    ]
    if (isSectionVisible('mostrarGaleria')) links.push({ path: '/galeria', label: 'Galeria' })
    if (isSectionVisible('mostrarParceiros')) links.push({ path: '/parceiros', label: 'Parceiros' })
    if (isSectionVisible('mostrarEmpresas')) links.push({ path: '/empresas', label: 'Fundadores' })
    if (isSectionVisible('mostrarEventos')) links.push({ path: '/eventos', label: 'Eventos' })
    if (isSectionVisible('mostrarBeneficios')) links.push({ path: '/beneficios', label: 'Benefícios' })
    if (isSectionVisible('mostrarCapacitacoes')) links.push({ path: '/capacitacoes', label: 'Capacitações' })
    links.push({ path: '/cadastro-empresa', label: 'Ser Fundador' })
    return links
  }, [flags, isSectionVisible])

  const gridClass = showContatoCol ? 'grid md:grid-cols-3 gap-16 mb-16' : 'grid md:grid-cols-2 gap-16 mb-16'

  return (
    <footer className="border-t border-white/5 py-20 px-6 lg:px-12 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className={gridClass}>
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

          {showContatoCol ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h4 className="font-bold mb-6 text-lg text-white">Contato</h4>
              <div className="space-y-4 text-gray-400">
                {contato.email ? (
                  <motion.a
                    href={`mailto:${contato.email}`}
                    className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer"
                    whileHover={{ x: 5 }}
                  >
                    <Mail className="w-5 h-5 shrink-0" />
                    <span>{contato.email}</span>
                  </motion.a>
                ) : null}
                {contato.telefone ? (
                  <motion.a
                    href={`tel:${String(contato.telefone).replace(/\D/g, '')}`}
                    className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer"
                    whileHover={{ x: 5 }}
                  >
                    <Phone className="w-5 h-5 shrink-0" />
                    <span>{formatPhone(contato.telefone)}</span>
                  </motion.a>
                ) : null}
                {contato.endereco ? (
                  <motion.div className="flex items-center gap-3 text-gray-400" whileHover={{ x: 5 }}>
                    <MapPin className="w-5 h-5 shrink-0" />
                    <span>{contato.endereco}</span>
                  </motion.div>
                ) : null}
                {redes.instagram ? (
                  <motion.a
                    href={redes.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer"
                    whileHover={{ x: 5 }}
                    aria-label="Instagram"
                  >
                    <InstagramGlyph className="w-5 h-5 shrink-0" />
                    <span>{instagramLabelFromUrl(redes.instagram)}</span>
                  </motion.a>
                ) : null}
                {redes.facebook ? (
                  <motion.a
                    href={redes.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer"
                    whileHover={{ x: 5 }}
                  >
                    <ExternalLink className="w-5 h-5 shrink-0" />
                    <span>Facebook</span>
                  </motion.a>
                ) : null}
                {redes.linkedin ? (
                  <motion.a
                    href={redes.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer"
                    whileHover={{ x: 5 }}
                  >
                    <ExternalLink className="w-5 h-5 shrink-0" />
                    <span>LinkedIn</span>
                  </motion.a>
                ) : null}
              </div>
            </motion.div>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: showContatoCol ? 0.2 : 0.1 }}
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
