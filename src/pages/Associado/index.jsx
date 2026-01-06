import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Login from './Login'
import EditarEmpresa from './EditarEmpresa'
import LayoutAssociado from './LayoutAssociado'
import Dashboard from './Dashboard'
import BeneficiosAssociado from './BeneficiosAssociado'
import CapacitacoesAssociado from './CapacitacoesAssociado'
import EventosAssociado from './EventosAssociado'
import PerfilAssociado from './PerfilAssociado'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('associadoToken')
  return token ? children : <Navigate to="/associado/login" replace />
}

const Associado = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('associadoToken')

  useEffect(() => {
    if (token && window.location.pathname === '/associado') {
      navigate('/associado/dashboard', { replace: true })
    }
  }, [token, navigate])

  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route
        path="editar-empresa"
        element={
          <PrivateRoute>
            <EditarEmpresa />
          </PrivateRoute>
        }
      />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <LayoutAssociado />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="beneficios" element={<BeneficiosAssociado />} />
        <Route path="capacitacoes" element={<CapacitacoesAssociado />} />
        <Route path="eventos" element={<EventosAssociado />} />
        <Route path="perfil" element={<PerfilAssociado />} />
        <Route path="" element={<Navigate to="/associado/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/associado/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

export default Associado

