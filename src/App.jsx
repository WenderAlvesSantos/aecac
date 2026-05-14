import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { FeatureFlagsProvider } from './contexts/FeatureFlagsContext'
import PublicLayout from './components/public-site/PublicLayout'
import Home from './pages/Home'
import Sobre from './pages/Sobre'
import Galeria from './pages/Galeria'
import Parceiros from './pages/Parceiros'
import Empresas from './pages/Empresas'
import Eventos from './pages/Eventos'
import Beneficios from './pages/Beneficios'
import Capacitacoes from './pages/Capacitacoes'
import CadastroEmpresa from './pages/CadastroEmpresa'
import ComoAssociar from './pages/ComoAssociar'
import Admin from './pages/Admin'
import Associado from './pages/Associado'

function App() {
  return (
    <FeatureFlagsProvider>
      <Router>
        <Routes>
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/associado/*" element={<Associado />} />
          <Route
            path="/*"
            element={
              <PublicLayout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/sobre" element={<Sobre />} />
                  <Route path="/galeria" element={<Galeria />} />
                  <Route path="/parceiros" element={<Parceiros />} />
                  <Route path="/empresas" element={<Empresas />} />
                  <Route path="/eventos" element={<Eventos />} />
                  <Route path="/beneficios" element={<Beneficios />} />
                  <Route path="/capacitacoes" element={<Capacitacoes />} />
                  <Route path="/cadastro-empresa" element={<CadastroEmpresa />} />
                  <Route path="/cadastro-fundadores" element={<Navigate to="/cadastro-empresa" replace />} />
                  <Route path="/como-associar" element={<ComoAssociar />} />
                </Routes>
              </PublicLayout>
            }
          />
        </Routes>
        <Analytics />
      </Router>
    </FeatureFlagsProvider>
  )
}

export default App

