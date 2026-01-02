import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const login = (email, password) =>
  api.post('/auth/login', { email, password })

// Perfil
export const getPerfil = () => api.get('/auth/perfil')
export const updatePerfil = (data) => api.put('/auth/perfil', data)

// Usuários
export const getUsuarios = () => api.get('/usuarios')
export const createUsuario = (data) => api.post('/usuarios', data)
export const updateUsuario = (id, data) => api.put(`/usuarios/${id}`, data)
export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`)

// Eventos
export const getEventos = () => api.get('/eventos')
export const createEvento = (data) => api.post('/eventos', data)
export const updateEvento = (id, data) => api.put(`/eventos/${id}`, data)
export const deleteEvento = (id) => api.delete(`/eventos/${id}`)

// Parceiros
export const getParceiros = () => api.get('/parceiros')
export const createParceiro = (data) => api.post('/parceiros', data)
export const updateParceiro = (id, data) => api.put(`/parceiros/${id}`, data)
export const deleteParceiro = (id) => api.delete(`/parceiros/${id}`)

// Empresas
export const getEmpresas = () => api.get('/empresas')
export const createEmpresa = (data) => api.post('/empresas', data)
export const updateEmpresa = (id, data) => api.put(`/empresas/${id}`, data)
export const deleteEmpresa = (id) => api.delete(`/empresas/${id}`)

// Galeria
export const getGaleria = () => api.get('/galeria')
export const createImagem = (data) => api.post('/galeria', data)
export const updateImagem = (id, data) => api.put(`/galeria/${id}`, data)
export const deleteImagem = (id) => api.delete(`/galeria/${id}`)
export const updateOrdemGaleria = (data) => api.put('/galeria/ordem', { imagens: data })

// Diretoria
export const getDiretoria = () => api.get('/diretoria')
export const createMembro = (data) => api.post('/diretoria', data)
export const updateMembro = (id, data) => api.put(`/diretoria/${id}`, data)
export const deleteMembro = (id) => api.delete(`/diretoria/${id}`)

// Sobre
export const getSobre = () => api.get('/sobre')
export const updateSobre = (data) => api.put('/sobre', data)

// Configurações
export const getConfiguracoes = () => api.get('/configuracoes')
export const updateConfiguracoes = (data) => api.put('/configuracoes', data)

export default api

