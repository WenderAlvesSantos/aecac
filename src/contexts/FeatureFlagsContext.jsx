import { createContext, useContext, useState, useEffect } from 'react'
import { getFeatureFlags } from '../lib/api'

const FeatureFlagsContext = createContext({})

export const FeatureFlagsProvider = ({ children }) => {
  const [flags, setFlags] = useState({
    preLancamento: false,
    mostrarParceiros: true,
    mostrarEmpresas: true,
    mostrarEventos: true,
    mostrarBeneficios: true,
    mostrarCapacitacoes: true,
    mostrarGaleria: true,
    preCadastroMode: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeatureFlags()
  }, [])

  const loadFeatureFlags = async () => {
    try {
      const response = await getFeatureFlags()
      setFlags(response.data)
    } catch (error) {
      console.error('Erro ao carregar feature flags:', error)
      // Manter valores padrão em caso de erro
    } finally {
      setLoading(false)
    }
  }

  const isFeatureEnabled = (feature) => {
    // Se preLancamento = true, desabilita tudo exceto Home e Sobre
    if (flags.preLancamento && feature !== 'home' && feature !== 'sobre') {
      return false
    }
    return flags[feature] !== false
  }

  return (
    <FeatureFlagsContext.Provider value={{ flags, loading, isFeatureEnabled, refresh: loadFeatureFlags }}>
      {children}
    </FeatureFlagsContext.Provider>
  )
}

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagsContext)
  if (!context) {
    throw new Error('useFeatureFlags deve ser usado dentro de FeatureFlagsProvider')
  }
  return context
}

