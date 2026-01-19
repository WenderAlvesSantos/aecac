import { useState, useEffect } from 'react'
import { Layout as AntLayout, Button } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  HomeOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  TeamOutlined,
  ShopOutlined,
  CalendarOutlined,
  UserOutlined,
  GiftOutlined,
  BookOutlined,
} from '@ant-design/icons'
import { useFeatureFlags } from '../contexts/FeatureFlagsContext'
import Header from './Header'
import Footer from './Footer'

const { Content } = AntLayout

const Layout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false)
  const { flags } = useFeatureFlags()

  // Scroll para o topo quando a rota mudar
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      key: '/sobre',
      icon: <InfoCircleOutlined />,
      label: 'Sobre',
    },
    // Itens condicionais baseados nas feature flags
    !flags.preLancamento && flags.mostrarGaleria && {
      key: '/galeria',
      icon: <PictureOutlined />,
      label: 'Galeria',
    },
    !flags.preLancamento && flags.mostrarParceiros && {
      key: '/parceiros',
      icon: <TeamOutlined />,
      label: 'Parceiros',
    },
    !flags.preLancamento && flags.mostrarEmpresas && {
      key: '/empresas',
      icon: <ShopOutlined />,
      label: 'Empresas',
    },
    !flags.preLancamento && flags.mostrarEventos && {
      key: '/eventos',
      icon: <CalendarOutlined />,
      label: 'Eventos',
    },
    !flags.preLancamento && flags.mostrarBeneficios && {
      key: '/beneficios',
      icon: <GiftOutlined />,
      label: 'Benefícios',
    },
    !flags.preLancamento && flags.mostrarCapacitacoes && {
      key: '/capacitacoes',
      icon: <BookOutlined />,
      label: 'Capacitações',
    },
  ].filter(Boolean) // Remove itens falsy (false, undefined, null)

  const handleMenuClick = ({ key }) => {
    navigate(key)
    setMobileMenuVisible(false)
  }

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header
        menuItems={menuItems}
        currentPath={location.pathname}
        onMenuClick={handleMenuClick}
        mobileMenuVisible={mobileMenuVisible}
        onMobileMenuToggle={() => setMobileMenuVisible(!mobileMenuVisible)}
      />
      <Content style={{ padding: 0, background: '#f0f2f5' }}>
        {children}
      </Content>
      <Footer />
    </AntLayout>
  )
}

export default Layout

