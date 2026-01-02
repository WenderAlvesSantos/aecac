import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Layout from './components/Layout'
import Home from './pages/Home'
import Sobre from './pages/Sobre'
import Galeria from './pages/Galeria'
import Parceiros from './pages/Parceiros'
import Empresas from './pages/Empresas'
import Eventos from './pages/Eventos'
import Admin from './pages/Admin'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/*" element={<Admin />} />
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/sobre" element={<Sobre />} />
                <Route path="/galeria" element={<Galeria />} />
                <Route path="/parceiros" element={<Parceiros />} />
                <Route path="/empresas" element={<Empresas />} />
                <Route path="/eventos" element={<Eventos />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
      <Analytics />
    </Router>
  )
}

export default App

