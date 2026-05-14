import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Maximize2 } from 'lucide-react'
import { getGaleria } from '../lib/api'
import { ImageWithFallback } from '../components/public-site/ImageWithFallback'
import { PublicLoading } from '../components/public-site/PublicLoading'
import { PublicInnerHero } from '../components/public-site/PublicInnerHero'
import { glassPanel } from '../components/public-site/publicUi'

const Galeria = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      try {
        const response = await getGaleria()
        const sorted = [...response.data].sort((a, b) => (a.order || 0) - (b.order || 0))
        setImages(sorted)
      } catch (e) {
        console.error('Erro ao carregar imagens:', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <PublicLoading />

  const open = (img) => {
    setSelectedImage(img)
    setIsModalOpen(true)
  }

  const close = () => {
    setIsModalOpen(false)
    setSelectedImage(null)
  }

  return (
    <div className="pb-24">
      <PublicInnerHero title="Galeria" subtitle="Momentos marcantes da AECAC" />

      <section className="px-6 py-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          {images.length === 0 ? (
            <div className={`${glassPanel} py-20 text-center text-gray-400`}>Nenhuma imagem disponível no momento.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {images.map((image, index) => (
                <motion.button
                  key={image._id || image.id}
                  type="button"
                  className={`group relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 text-left transition hover:border-[#5b9bd5]/40`}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(index * 0.06, 0.4) }}
                  onClick={() => open(image)}
                >
                  <ImageWithFallback
                    src={image.url}
                    alt={image.title || 'Imagem'}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <p className="text-base font-semibold">{image.title}</p>
                    {image.description && <p className="mt-1 line-clamp-2 text-xs text-white/80">{image.description}</p>}
                  </div>
                  <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#1e4d7b] shadow">
                    <Maximize2 className="h-4 w-4" />
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {isModalOpen && selectedImage && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              className={`${glassPanel} relative max-h-[90vh] max-w-4xl overflow-auto p-4 sm:p-6`}
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute right-3 top-3 rounded-full p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
                onClick={close}
                aria-label="Fechar"
              >
                <X className="h-6 w-6" />
              </button>
              <img
                src={selectedImage.url}
                alt={selectedImage.title || ''}
                className="mb-4 max-h-[65vh] w-full rounded-2xl object-contain"
              />
              <h2 className="pr-10 text-2xl font-bold text-white">{selectedImage.title}</h2>
              {selectedImage.description && <p className="mt-3 text-gray-400">{selectedImage.description}</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Galeria
