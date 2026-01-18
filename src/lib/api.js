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
  const adminToken = localStorage.getItem('authToken')
  const associadoToken = localStorage.getItem('associadoToken')
  
  const url = config.url || ''
  
  // ============================================
  // ROTAS EXCLUSIVAS DO ADMIN (sempre usar authToken)
  // ============================================
  const adminRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/perfil-admin',
    '/usuarios',
    '/parceiros',
    '/empresas',
    '/empresas/pendentes',
    '/empresas/aprovar',
    '/galeria',
    '/galeria/ordem',
    '/diretoria',
    '/sobre',
    '/configuracoes',
    '/relatorios',
    '/exportar',
    '/notificacoes',
    // CRUD de Eventos, Benefícios e Capacitações (sem area=logged)
    // Essas rotas são detectadas pela ausência de area=logged
  ]
  
  // ============================================
  // ROTAS EXCLUSIVAS DO ASSOCIADO (sempre usar associadoToken)
  // ============================================
  const associadoRoutes = [
    '/auth/login-associado',
    '/auth/register-associado',
    '/auth/perfil-associado',
    '/beneficios/resgates',
    '/eventos/inscritos',
    '/capacitacoes/inscritos',
    '/capacitacoes/inscrever',
    // CRUD de Eventos, Benefícios e Capacitações (com area=logged)
    // Essas rotas são detectadas pela presença de area=logged
  ]
  
  // ============================================
  // ROTAS PÚBLICAS (não usar token)
  // ============================================
  const publicRoutes = [
    '/beneficios/resgatar',
    '/eventos/inscrever-publico',
    '/capacitacoes/inscrever-publico',
    '/consultas/buscar-cnpj',
    '/consultas/buscar-cep',
  ]
  
  // Verificar se é rota de área logada (com ?area=logged)
  const isLoggedArea = url.includes('area=logged')
  
  // Verificar se é rota exclusiva de admin
  const isAdminRoute = adminRoutes.some(route => url.startsWith(route))
  
  // Verificar se é rota exclusiva de associado
  const isAssociadoRoute = associadoRoutes.some(route => url.startsWith(route))
  
  // Verificar se é rota pública
  const isPublicRoute = publicRoutes.some(route => url.startsWith(route))
  
  // Rotas GET de Eventos, Benefícios e Capacitações (podem ser Admin, Associado ou Público)
  const isEventosBeneficiosCapacitacoesGet = 
    config.method === 'get' && (
      (url === '/eventos' || url.startsWith('/eventos?')) ||
      (url === '/beneficios' || url.startsWith('/beneficios?')) ||
      (url === '/capacitacoes' || url.startsWith('/capacitacoes?'))
    )
  
  // Rotas GET públicas (listagem sem autenticação - exceto Eventos, Benefícios e Capacitações)
  const isPublicGetRoute = 
    (config.method === 'get' && (
      (url === '/empresas' || url.startsWith('/empresas?')) ||
      (url === '/parceiros' || url.startsWith('/parceiros?')) ||
      (url === '/galeria' || url.startsWith('/galeria?')) ||
      (url === '/diretoria' || url.startsWith('/diretoria?')) ||
      (url === '/sobre' || url.startsWith('/sobre?')) ||
      (url === '/configuracoes' || url.startsWith('/configuracoes?'))
    ))
  
  // Rotas CRUD de Eventos, Benefícios e Capacitações (POST, PUT, DELETE)
  const isCRUDRoute = 
    (config.method === 'post' && url.match(/^\/(eventos|beneficios|capacitacoes)$/)) ||
    (config.method === 'put' && url.match(/^\/(eventos|beneficios|capacitacoes)\/[^/]+$/)) ||
    (config.method === 'delete' && url.match(/^\/(eventos|beneficios|capacitacoes)\/[^/]+$/))
  
  let token = null
  
  // ============================================
  // LÓGICA DE SELEÇÃO DE TOKEN (SEM ROTAS COMPARTILHADAS)
  // ============================================
  if (isAdminRoute) {
    // Rotas exclusivas de admin: SEMPRE usar authToken
    token = adminToken || null
  } else if (isAssociadoRoute || (isLoggedArea && associadoToken)) {
    // Rotas exclusivas de associado ou área logada: SEMPRE usar associadoToken
    token = associadoToken || null
  } else if (isEventosBeneficiosCapacitacoesGet) {
    // GET de Eventos, Benefícios ou Capacitações:
    // - Se tem area=logged → usar associadoToken
    // - Se não tem area=logged mas tem adminToken → usar adminToken (Admin)
    // - Se não tem nenhum token → não usar token (Público)
    if (isLoggedArea) {
      token = associadoToken || null
    } else if (adminToken) {
      token = adminToken
    } else {
      token = null
    }
  } else if (isCRUDRoute) {
    // Rotas CRUD: 
    // - Se tem area=logged → usar associadoToken
    // - Se não tem area=logged → usar adminToken (admin gerencia CRUD)
    if (isLoggedArea) {
      token = associadoToken || null
    } else {
      token = adminToken || null
    }
  } else if (isPublicRoute || isPublicGetRoute) {
    // Rotas públicas: não usar token
    token = null
  } else {
    // Fallback: não usar token (evitar conflitos)
    token = null
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    // Debug: log apenas para rotas de Eventos, Benefícios e Capacitações
    if (isEventosBeneficiosCapacitacoesGet || isCRUDRoute) {
      console.log('🔑 [API] Token enviado:', {
        url: config.url,
        method: config.method,
        tokenType: token === adminToken ? 'adminToken' : 'associadoToken',
        isLoggedArea,
        hasAdminToken: !!adminToken,
        hasAssociadoToken: !!associadoToken
      })
    }
  } else if (isEventosBeneficiosCapacitacoesGet || isCRUDRoute) {
    console.log('⚠️ [API] Nenhum token enviado:', {
      url: config.url,
      method: config.method,
      isLoggedArea,
      hasAdminToken: !!adminToken,
      hasAssociadoToken: !!associadoToken
    })
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

// Perfil (Admin)
export const getPerfilAdmin = () => api.get('/auth/perfil-admin')
export const updatePerfilAdmin = (data) => api.put('/auth/perfil-admin', data)

// Perfil (Associado)
export const getPerfilAssociado = () => api.get('/auth/perfil-associado')
export const updatePerfilAssociado = (data) => api.put('/auth/perfil-associado', data)

// Usuários
export const getUsuarios = () => api.get('/usuarios')
export const createUsuario = (data) => api.post('/usuarios', data)
export const updateUsuario = (id, data) => api.put(`/usuarios/${id}`, data)
export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`)

// Eventos (Admin)
export const getEventosAdmin = () => api.get('/eventos')
export const createEvento = (data) => api.post('/eventos', data)
export const updateEvento = (id, data) => api.put(`/eventos/${id}`, data)
export const deleteEvento = (id) => api.delete(`/eventos/${id}`)

// Eventos (Associado)
export const getEventosAssociado = () => api.get('/eventos?area=logged')

// Eventos (Público - sempre retorna todos, mesmo com token)
export const getEventosPublicos = () => api.get('/eventos')
export const getEventos = () => {
  // Função legada - usar getEventosAdmin ou getEventosAssociado conforme contexto
  const associadoToken = localStorage.getItem('associadoToken')
  return associadoToken ? getEventosAssociado() : getEventosAdmin()
}

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

// Benefícios (Admin)
export const getBeneficiosAdmin = () => api.get('/beneficios')
export const createBeneficio = (data) => api.post('/beneficios', data)
export const updateBeneficio = (id, data) => api.put(`/beneficios/${id}`, data)
export const deleteBeneficio = (id) => api.delete(`/beneficios/${id}`)

// Benefícios (Associado)
export const getBeneficiosAssociado = () => api.get('/beneficios?area=logged')
export const getResgates = () => api.get('/beneficios/resgates')

// Benefícios (Público - sempre retorna todos, mesmo com token)
export const getBeneficiosPublicos = () => api.get('/beneficios')
export const getBeneficios = () => {
  // Função legada - usar getBeneficiosAdmin ou getBeneficiosAssociado conforme contexto
  const associadoToken = localStorage.getItem('associadoToken')
  return associadoToken ? getBeneficiosAssociado() : getBeneficiosAdmin()
}

// Benefícios (Público - resgate)
export const resgatarBeneficio = (codigo, nome, cpf, telefone) => 
  api.post('/beneficios/resgatar', { codigo, nome, cpf, telefone })

// Capacitações (Admin)
export const getCapacitacoesAdmin = () => api.get('/capacitacoes')
export const createCapacitacao = (data) => api.post('/capacitacoes', data)
export const updateCapacitacao = (id, data) => api.put(`/capacitacoes/${id}`, data)
export const deleteCapacitacao = (id) => api.delete(`/capacitacoes/${id}`)

// Capacitações (Associado)
export const getCapacitacoesAssociado = () => api.get('/capacitacoes?area=logged')
export const getInscritosCapacitacao = (capacitacaoId) => 
  api.get(`/capacitacoes/inscritos?capacitacaoId=${capacitacaoId}`)

// Capacitações (Público - sempre retorna todos, mesmo com token)
export const getCapacitacoesPublicas = () => api.get('/capacitacoes')
export const getCapacitacoes = () => {
  // Função legada - usar getCapacitacoesAdmin ou getCapacitacoesAssociado conforme contexto
  const associadoToken = localStorage.getItem('associadoToken')
  return associadoToken ? getCapacitacoesAssociado() : getCapacitacoesAdmin()
}

// Capacitações (Público - inscrição)
export const inscreverCapacitacao = (capacitacaoId, nome, cpf, telefone) => 
  api.post('/capacitacoes/inscrever', { capacitacaoId, nome, cpf, telefone })
export const cancelarInscricao = (capacitacaoId, cpf) => {
  // Usar POST com método DELETE no body ou criar endpoint específico
  return api.delete('/capacitacoes/inscrever', { 
    data: { capacitacaoId, cpf },
    headers: { 'Content-Type': 'application/json' }
  })
}

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

