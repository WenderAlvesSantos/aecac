import { motion } from 'motion/react'

export function PublicPageTitle({ title, subtitle, className = '' }) {
  return (
    <motion.div
      className={`text-center mb-12 sm:mb-16 ${className}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
    >
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 sm:mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
        {title}
      </h1>
      {subtitle && <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">{subtitle}</p>}
    </motion.div>
  )
}
