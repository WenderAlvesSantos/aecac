import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Dashboard from './Dashboard'
import Login from './Login'
import EventosAdmin from './EventosAdmin'
import ParceirosAdmin from './ParceirosAdmin'
import EmpresasAdmin from './EmpresasAdmin'
import GaleriaAdmin from './GaleriaAdmin'
import DiretoriaAdmin from './DiretoriaAdmin'
import SobreAdmin from './SobreAdmin'
import ConfiguracoesAdmin from './ConfiguracoesAdmin'
import PerfilAdmin from './PerfilAdmin'
import UsuariosAdmin from './UsuariosAdmin'
import BeneficiosAdmin from './BeneficiosAdmin'
import CapacitacoesAdmin from './CapacitacoesAdmin'
import RelatoriosAdmin from './RelatoriosAdmin'
import DocumentosAdmin from './DocumentosAdmin'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('authToken')
  return token ? children : <Navigate to="/admin/login" replace />
}

const Admin = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('authToken')

  useEffect(() => {
    if (token && window.location.pathname === '/admin') {
      navigate('/admin', { replace: true })
    }
  }, [token, navigate])

  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      >
        <Route path="eventos" element={<EventosAdmin />} />
        <Route path="parceiros" element={<ParceirosAdmin />} />
        <Route path="empresas" element={<EmpresasAdmin />} />
        <Route path="galeria" element={<GaleriaAdmin />} />
        <Route path="diretoria" element={<DiretoriaAdmin />} />
        <Route path="sobre" element={<SobreAdmin />} />
        <Route path="configuracoes" element={<ConfiguracoesAdmin />} />
        <Route path="perfil" element={<PerfilAdmin />} />
        <Route path="usuarios" element={<UsuariosAdmin />} />
        <Route path="beneficios" element={<BeneficiosAdmin />} />
        <Route path="capacitacoes" element={<CapacitacoesAdmin />} />
        <Route path="relatorios" element={<RelatoriosAdmin />} />
        <Route path="documentos" element={<DocumentosAdmin />} />
      </Route>
    </Routes>
  )
}

export default Admin

