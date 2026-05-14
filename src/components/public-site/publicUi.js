/** Classes reutilizadas — alinhadas ao protótipo novo-ui-aecac (Figma Make) */

/** Painel vidro — contraste visível em fundo preto (protótipo Figma Make). */
export const glassPanel =
  'bg-gradient-to-b from-white/[0.12] to-white/[0.03] backdrop-blur-xl border border-white/15 rounded-3xl shadow-[0_8px_40px_-8px_rgba(0,0,0,0.55)] ring-1 ring-inset ring-white/[0.06]'

export const pageTitle =
  'text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent'

export const pageSubtitle = 'text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed'

/** Subtítulo alinhado à esquerda (ex.: Empresas com filtros abaixo). */
export const pageSubtitleLeft = 'text-lg sm:text-xl text-gray-400 max-w-3xl leading-relaxed'

/**
 * Shell do hero das páginas internas — mesma linguagem da Home (gradiente + orbs).
 * Use com PublicInnerHero ou copie as classes do wrapper.
 */
export const innerHeroSection =
  'relative overflow-hidden px-6 pt-28 pb-12 sm:pt-36 sm:pb-16 lg:px-12'

export const innerHeroGradient =
  'pointer-events-none absolute inset-0 bg-gradient-to-b from-[#1e4d7b]/10 via-transparent to-transparent'

export const innerHeroOrbRight =
  'pointer-events-none absolute top-0 right-0 h-[min(800px,95vw)] w-[min(800px,95vw)] rounded-full bg-[#5b9bd5]/5 blur-3xl'

export const innerHeroOrbLeft =
  'pointer-events-none absolute top-20 left-4 h-72 w-72 rounded-full bg-[#6cb541]/5 blur-3xl sm:left-10'

export const inputDark =
  'w-full px-5 py-3.5 bg-black/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b9bd5] focus:border-transparent placeholder:text-gray-500'

export const selectDark =
  'w-full px-5 py-3.5 bg-black/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b9bd5]'

export const pillActive = 'bg-gradient-to-r from-[#1e4d7b] to-[#5b9bd5] text-white shadow-lg border border-transparent'

export const pillIdle =
  'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10 hover:border-white/20'

export const ctaGreen =
  'inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#6cb541] to-[#8fd652] px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95'

export const ctaBlue =
  'inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1e4d7b] to-[#5b9bd5] px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95'
