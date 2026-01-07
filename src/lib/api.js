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
  // Priorizar token de admin, depois associado
  const adminToken = localStorage.getItem('authToken')
  const associadoToken = localStorage.getItem('associadoToken')
  const token = adminToken || associadoToken
  
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
      // Verificar se é admin ou associado
      const adminToken = localStorage.getItem('authToken')
      const associadoToken = localStorage.getItem('associadoToken')
      
      if (adminToken) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        window.location.href = '/admin/login'
      } else if (associadoToken) {
        localStorage.removeItem('associadoToken')
        localStorage.removeItem('associado')
        window.location.href = '/associado/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth (Admin)
export const login = (email, password) =>
  api.post('/auth/login', { email, password })

// Auth (Associado)
export const loginAssociado = (email, password) =>
  api.post('/auth/login-associado', { email, password })
export const registerAssociado = (email, password, name) =>
  api.post('/auth/register-associado', { email, password, name })

// Perfil
export const getPerfil = () => api.get('/auth/perfil')
export const updatePerfil = (data) => api.put('/auth/perfil', data)

// Usuários
export const getUsuarios = () => api.get('/usuarios')
export const createUsuario = (data) => api.post('/usuarios', data)
export const updateUsuario = (id, data) => api.put(`/usuarios/${id}`, data)
export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`)

// Eventos
export const getEventos = () => {
  const associadoToken = localStorage.getItem('associadoToken')
  const url = associadoToken ? '/eventos?area=logged' : '/eventos'
  return api.get(url)
}
// Eventos (área pública - sempre retorna todos, mesmo com token)
export const getEventosPublicos = () => api.get('/eventos')
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
export const createEmpresa = (data) => api.post('/empresas', data) // Público - cadastro
export const updateEmpresa = (id, data) => api.put(`/empresas/${id}`, data)
export const deleteEmpresa = (id) => api.delete(`/empresas/${id}`)
export const getEmpresasPendentes = (status) => api.get(`/empresas/pendentes${status ? `?status=${status}` : ''}`)
export const aprovarEmpresa = (empresaId, acao) => api.put('/empresas/aprovar', { empresaId, acao })

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

// Benefícios
export const getBeneficios = () => {
  const associadoToken = localStorage.getItem('associadoToken')
  const url = associadoToken ? '/beneficios?area=logged' : '/beneficios'
  return api.get(url)
}
// Benefícios (área pública - sempre retorna todos, mesmo com token)
export const getBeneficiosPublicos = () => api.get('/beneficios')
export const createBeneficio = (data) => api.post('/beneficios', data)
export const updateBeneficio = (id, data) => api.put(`/beneficios/${id}`, data)
export const deleteBeneficio = (id) => api.delete(`/beneficios/${id}`)
export const resgatarBeneficio = (codigo) => api.post('/beneficios/resgatar', { codigo })
export const resgatarBeneficioPublico = (codigo, nome, cpf, telefone) => 
  api.post('/beneficios/resgatar-publico', { codigo, nome, cpf, telefone })
export const getResgates = () => api.get('/beneficios/resgates')

// Capacitações
export const getCapacitacoes = () => {
  const associadoToken = localStorage.getItem('associadoToken')
  const url = associadoToken ? '/capacitacoes?area=logged' : '/capacitacoes'
  return api.get(url)
}
// Capacitações (área pública - sempre retorna todos, mesmo com token)
export const getCapacitacoesPublicas = () => api.get('/capacitacoes')
export const createCapacitacao = (data) => api.post('/capacitacoes', data)
export const updateCapacitacao = (id, data) => api.put(`/capacitacoes/${id}`, data)
export const deleteCapacitacao = (id) => api.delete(`/capacitacoes/${id}`)
export const inscreverCapacitacao = (capacitacaoId) => api.post('/capacitacoes/inscrever', { capacitacaoId })
export const inscreverCapacitacaoPublico = (capacitacaoId, nome, cpf, telefone) =>
  api.post('/capacitacoes/inscrever-publico', { capacitacaoId, nome, cpf, telefone })
export const cancelarInscricao = (capacitacaoId) => {
  // Usar POST com método DELETE no body ou criar endpoint específico
  return api.delete('/capacitacoes/inscrever', { 
    data: { capacitacaoId },
    headers: { 'Content-Type': 'application/json' }
  })
}
export const getInscritosCapacitacao = (capacitacaoId) => 
  api.get(`/capacitacoes/inscritos?capacitacaoId=${capacitacaoId}`)

// Eventos - Inscrições públicas
export const inscreverEventoPublico = (eventoId, nome, cpf, telefone) =>
  api.post('/eventos/inscrever-publico', { eventoId, nome, cpf, telefone })
export const getInscritosEvento = (eventoId) => 
  api.get(`/eventos/inscritos?eventoId=${eventoId}`)

// Notificações
export const getNotificacoes = (lida) => api.get(`/notificacoes${lida !== undefined ? `?lida=${lida}` : ''}`)
export const createNotificacao = (data) => api.post('/notificacoes', data)
export const marcarNotificacaoLida = (id, lida = true) => api.put(`/notificacoes/${id}`, { lida })
export const deletarNotificacao = (id) => api.delete(`/notificacoes/${id}`)
export const marcarTodasNotificacoesLidas = () => api.put('/notificacoes/marcar-todas')

// Relatórios
export const getRelatorios = (tipo) => api.get(`/relatorios${tipo ? `?tipo=${tipo}` : ''}`)

// Exportar
export const exportarDados = (tipo, formato = 'json') => {
  return api.get(`/exportar?tipo=${tipo}&formato=${formato}`, {
    responseType: formato === 'csv' ? 'blob' : 'json',
  })
}

// Consultas
export const buscarCNPJ = (cnpj) => api.get(`/consultas/buscar-cnpj?cnpj=${cnpj}`)
export const buscarCEP = (cep) => api.get(`/consultas/buscar-cep?cep=${cep}`)

export default api

