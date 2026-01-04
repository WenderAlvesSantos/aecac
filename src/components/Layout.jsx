import { useState } from 'react'
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
import Header from './Header'
import Footer from './Footer'

const { Content } = AntLayout

const Layout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false)

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
    {
      key: '/galeria',
      icon: <PictureOutlined />,
      label: 'Galeria',
    },
    {
      key: '/parceiros',
      icon: <TeamOutlined />,
      label: 'Parceiros',
    },
    {
      key: '/empresas',
      icon: <ShopOutlined />,
      label: 'Empresas',
    },
    {
      key: '/eventos',
      icon: <CalendarOutlined />,
      label: 'Eventos',
    },
    {
      key: '/beneficios',
      icon: <GiftOutlined />,
      label: 'Benefícios',
    },
    {
      key: '/capacitacoes',
      icon: <BookOutlined />,
      label: 'Capacitações',
    },
  ]

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

