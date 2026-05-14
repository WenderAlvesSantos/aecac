import { motion } from 'motion/react'
import {
  innerHeroGradient,
  innerHeroOrbLeft,
  innerHeroOrbRight,
  innerHeroSection,
  pageSubtitle,
  pageSubtitleLeft,
  pageTitle,
} from './publicUi'

/**
 * Hero padrão das páginas públicas (alinhado à Home: orbs, gradiente, tipografia).
 */
export function PublicInnerHero({
  badge = null,
  title,
  subtitle = null,
  align = 'center',
  maxWidthClass = 'max-w-7xl',
  children = null,
}) {
  const isCenter = align === 'center'
  const textAlign = isCenter ? 'text-center' : 'text-left'
  const subCls = isCenter ? pageSubtitle : pageSubtitleLeft

  return (
    <section className={`${innerHeroSection} ${textAlign}`}>
      <div className={innerHeroGradient} aria-hidden />
      <div className={innerHeroOrbRight} aria-hidden />
      <motion.div
        className={innerHeroOrbLeft}
        aria-hidden
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className={`relative z-10 mx-auto ${maxWidthClass}`}>
        {badge}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {typeof title === 'string' ? <h1 className={pageTitle}>{title}</h1> : title}
        </motion.div>
        {subtitle != null && subtitle !== '' && (
          <motion.div
            className={isCenter ? `${subCls} mt-2` : `${subCls} mt-2`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
          >
            {typeof subtitle === 'string' ? <p className="m-0">{subtitle}</p> : subtitle}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  )
}
