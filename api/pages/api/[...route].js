// Rota unificada para todas as APIs - resolve o limite de 12 funções serverless
import { corsHeaders, handleOptions } from '../../middleware/cors'

// Importar handlers estáticos
import eventosIndex from '../_handlers/eventos/index'
import eventosId from '../_handlers/eventos/[id]'
import parceirosIndex from '../_handlers/parceiros/index'
import parceirosId from '../_handlers/parceiros/[id]'
import empresasIndex from '../_handlers/empresas/index'
import empresasId from '../_handlers/empresas/[id]'
import galeriaIndex from '../_handlers/galeria/index'
import galeriaId from '../_handlers/galeria/[id]'
import galeriaOrdem from '../_handlers/galeria/ordem'
import diretoriaIndex from '../_handlers/diretoria/index'
import diretoriaId from '../_handlers/diretoria/[id]'
import sobreIndex from '../_handlers/sobre/index'
import configuracoesIndex from '../_handlers/configuracoes/index'
import usuariosIndex from '../_handlers/usuarios/index'
import usuariosId from '../_handlers/usuarios/[id]'
import authLogin from '../_handlers/auth/login'
import authRegister from '../_handlers/auth/register'
import authPerfil from '../_handlers/auth/perfil'

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleOptions(req, res)) {
    return
  }

  // Set CORS headers
  corsHeaders(res)

  // Extrair rota da query
  const route = req.query.route || []
  const routePath = Array.isArray(route) ? route.join('/') : route
  const id = route[route.length - 1] // Último segmento pode ser um ID

  // Roteamento baseado no caminho
  try {
    let handler = null

    // Auth routes
    if (routePath === 'auth/login') {
      handler = authLogin
    } else if (routePath === 'auth/register') {
      handler = authRegister
    } else if (routePath === 'auth/perfil') {
      handler = authPerfil
    }
    // Eventos
    else if (routePath === 'eventos') {
      handler = eventosIndex
    } else if (routePath.startsWith('eventos/') && id && id !== 'eventos') {
      req.query.id = id
      handler = eventosId
    }
    // Parceiros
    else if (routePath === 'parceiros') {
      handler = parceirosIndex
    } else if (routePath.startsWith('parceiros/') && id && id !== 'parceiros') {
      req.query.id = id
      handler = parceirosId
    }
    // Empresas
    else if (routePath === 'empresas') {
      handler = empresasIndex
    } else if (routePath.startsWith('empresas/') && id && id !== 'empresas') {
      req.query.id = id
      handler = empresasId
    }
    // Galeria
    else if (routePath === 'galeria') {
      handler = galeriaIndex
    } else if (routePath === 'galeria/ordem') {
      handler = galeriaOrdem
    } else if (routePath.startsWith('galeria/') && id && id !== 'galeria' && id !== 'ordem') {
      req.query.id = id
      handler = galeriaId
    }
    // Diretoria
    else if (routePath === 'diretoria') {
      handler = diretoriaIndex
    } else if (routePath.startsWith('diretoria/') && id && id !== 'diretoria') {
      req.query.id = id
      handler = diretoriaId
    }
    // Sobre
    else if (routePath === 'sobre') {
      handler = sobreIndex
    }
    // Configurações
    else if (routePath === 'configuracoes') {
      handler = configuracoesIndex
    }
    // Usuários
    else if (routePath === 'usuarios') {
      handler = usuariosIndex
    } else if (routePath.startsWith('usuarios/') && id && id !== 'usuarios') {
      req.query.id = id
      handler = usuariosId
    }

    if (handler) {
      return handler(req, res)
    }

    // Rota não encontrada
    res.status(404).json({ error: 'Rota não encontrada' })
  } catch (error) {
    console.error('Erro no roteamento:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

// Configurar bodyParser para aceitar até 10MB
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

