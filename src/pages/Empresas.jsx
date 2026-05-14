import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Search, MapPin, Phone, Globe, Mail } from 'lucide-react'
import { FacebookOutlined, InstagramOutlined, LinkedinOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getEmpresas } from '../lib/api'
import { ImageWithFallback } from '../components/public-site/ImageWithFallback'
import { PublicLoading } from '../components/public-site/PublicLoading'
import { PublicInnerHero } from '../components/public-site/PublicInnerHero'
import { glassPanel, inputDark, selectDark, ctaBlue } from '../components/public-site/publicUi'

const formatPhone = (value) => {
  if (!value) return ''
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  }
  return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
}

const getWhatsAppLink = (whatsapp) => {
  if (!whatsapp) return null
  const numbers = whatsapp.replace(/\D/g, '')
  if (numbers.length >= 10) {
    const phoneNumber = numbers.startsWith('55') ? numbers : `55${numbers}`
    return `https://wa.me/${phoneNumber}`
  }
  return null
}

const categorias = ['all', 'Varejo', 'Alimentação', 'Tecnologia', 'Saúde', 'Serviços', 'Beleza', 'Construção']

const Empresas = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      try {
        const response = await getEmpresas()
        setEmpresas(response.data)
      } catch (e) {
        console.error('Erro ao carregar fundadores:', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <PublicLoading />

  const filteredEmpresas = empresas.filter((empresa) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      !searchTerm ||
      empresa.nome?.toLowerCase().includes(searchLower) ||
      empresa.descricao?.toLowerCase().includes(searchLower) ||
      empresa.telefone?.includes(searchTerm) ||
      empresa.email?.toLowerCase().includes(searchLower) ||
      empresa.endereco?.toLowerCase().includes(searchLower) ||
      empresa.categoria?.toLowerCase().includes(searchLower)
    const matchesCategory = selectedCategory === 'all' || empresa.categoria === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="pb-24">
      <PublicInnerHero
        title="Fundadores associados"
        subtitle="Conheça os fundadores que fazem parte da AECAC e fortalecem o comércio em Águas Claras"
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mx-auto max-w-4xl">
            <div className={`${glassPanel} p-6 sm:p-8`}>
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1">
                  <label className="mb-2 block text-sm text-gray-400">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Nome, descrição, telefone, e-mail, endereço ou categoria..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`${inputDark} pl-12`}
                    />
                  </div>
                </div>
                <div className="w-full sm:w-56">
                  <label className="mb-2 block text-sm text-gray-400">Categoria</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={selectDark}
                  >
                    <option value="all">Todas</option>
                    {categorias
                      .filter((c) => c !== 'all')
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <p className="text-sm text-gray-500">Dica: combine busca e categoria para refinar o diretório.</p>
            </div>
          </div>
        </div>

      <section className="px-6 py-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          {filteredEmpresas.length === 0 ? (
            <div className={`${glassPanel} py-16 text-center`}>
              <p className="text-lg text-gray-300">Nenhum fundador encontrado</p>
              <p className="mt-2 text-gray-500">
                {empresas.length === 0 ? 'Nenhum fundador cadastrado ainda.' : 'Ajuste os filtros ou a busca.'}
              </p>
            </div>
          ) : (
            <>
              <p className="mb-8 text-center text-gray-400">
                Mostrando {filteredEmpresas.length} de {empresas.length} fundadores
              </p>
              <div className="grid gap-8 md:grid-cols-2">
                {filteredEmpresas.map((empresa, index) => (
                  <motion.article
                    key={empresa._id}
                    className={`${glassPanel} overflow-hidden`}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(index * 0.05, 0.35) }}
                    whileHover={{ y: -8, borderColor: 'rgba(91, 155, 213, 0.35)' }}
                  >
                    <div className="relative h-52 overflow-hidden bg-gradient-to-br from-[#1e4d7b] to-[#5b9bd5]">
                      {empresa.imagem ? (
                        <ImageWithFallback src={empresa.imagem} alt={empresa.nome} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-5xl text-white/40">AECAC</div>
                      )}
                    </div>
                    <div className="p-8 sm:p-10">
                      <div className="mb-4 text-center">
                        <h3 className="mb-3 text-2xl font-bold text-white">{empresa.nome}</h3>
                        {empresa.categoria && (
                          <span className="inline-block rounded-full bg-[#5b9bd5]/20 px-4 py-1 text-sm font-medium text-[#5b9bd5]">
                            {empresa.categoria}
                          </span>
                        )}
                      </div>
                      {empresa.descricao && (
                        <p className="mb-6 line-clamp-5 text-center text-sm leading-relaxed text-gray-400">
                          {empresa.descricao.length > 280 ? `${empresa.descricao.slice(0, 280)}…` : empresa.descricao}
                        </p>
                      )}
                      <div className="space-y-3 border-t border-white/10 pt-6 text-sm text-gray-400">
                        {empresa.telefone && (
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 shrink-0 text-[#5b9bd5]" />
                            <span>{formatPhone(empresa.telefone)}</span>
                          </div>
                        )}
                        {empresa.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 shrink-0 text-[#5b9bd5]" />
                            <span className="truncate">{empresa.email}</span>
                          </div>
                        )}
                        {empresa.endereco && (
                          <div className="flex items-start gap-3">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#5b9bd5]" />
                            <span>{empresa.endereco}</span>
                          </div>
                        )}
                        {empresa.site && (
                          <div className="flex items-center gap-3">
                            <Globe className="h-4 w-4 shrink-0 text-[#5b9bd5]" />
                            <a href={empresa.site} target="_blank" rel="noopener noreferrer" className="text-[#5b9bd5] hover:underline">
                              Site
                            </a>
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          {empresa.whatsapp && getWhatsAppLink(empresa.whatsapp) && (
                            <a
                              href={getWhatsAppLink(empresa.whatsapp)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-[#25D366] hover:underline"
                            >
                              WhatsApp
                            </a>
                          )}
                          {empresa.facebook && (
                            <a href={empresa.facebook} target="_blank" rel="noopener noreferrer" className="text-[#1877f2] hover:opacity-80">
                              <FacebookOutlined className="text-lg" />
                            </a>
                          )}
                          {empresa.instagram && (
                            <a href={empresa.instagram} target="_blank" rel="noopener noreferrer" className="text-[#e4405f] hover:opacity-80">
                              <InstagramOutlined className="text-lg" />
                            </a>
                          )}
                          {empresa.linkedin && (
                            <a href={empresa.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#0077b5] hover:opacity-80">
                              <LinkedinOutlined className="text-lg" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden px-6 py-20 lg:px-12">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e4d7b] to-[#5b9bd5]" />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">Sua empresa também pode ser fundadora</h2>
          <p className="mb-8 text-lg text-white/90">
            Associe-se à AECAC e faça parte da rede que fortalece o comércio em Águas Claras.
          </p>
          <button type="button" onClick={() => navigate('/como-associar')} className={ctaBlue}>
            Como associar
          </button>
        </div>
      </section>
    </div>
  )
}

export default Empresas
