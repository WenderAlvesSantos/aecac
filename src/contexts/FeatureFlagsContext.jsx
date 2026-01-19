import { createContext, useContext, useState, useEffect } from 'react'
import { getFeatureFlags } from '../lib/api'

const FeatureFlagsContext = createContext({})

export const FeatureFlagsProvider = ({ children }) => {
  // Valores padrão conservadores: assumir pré-lançamento ativo por padrão
  // para evitar flash de conteúdo antes do carregamento
  const [flags, setFlags] = useState({
    preLancamento: true, // Assumir ativo por padrão para evitar flash
    mostrarParceiros: false,
    mostrarEmpresas: false,
    mostrarEventos: false,
    mostrarBeneficios: false,
    mostrarCapacitacoes: false,
    mostrarGaleria: false,
    preCadastroMode: true, // Assumir ativo por padrão
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeatureFlags()
  }, [])

  const loadFeatureFlags = async () => {
    try {
      const response = await getFeatureFlags()
      // Só atualiza se receber dados válidos
      if (response?.data) {
        setFlags(response.data)
      }
    } catch (error) {
      console.error('Erro ao carregar feature flags:', error)
      // Manter valores padrão conservadores em caso de erro
      // (pré-lançamento ativo por padrão para evitar mostrar conteúdo indevido)
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

