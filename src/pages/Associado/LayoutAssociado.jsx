import { useState, useEffect } from 'react'
import { Layout, Menu, Typography, Button, Space, Avatar, Drawer } from 'antd'
import {
  DashboardOutlined,
  GiftOutlined,
  BookOutlined,
  CalendarOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'

const { Header, Sider, Content } = Layout
const { Title, Text } = Typography

const LayoutAssociado = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const associado = JSON.parse(localStorage.getItem('associado') || '{}')

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setMobileMenuVisible(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('associadoToken')
    localStorage.removeItem('associado')
    navigate('/associado/login')
  }

  const menuItems = [
    {
      key: '/associado/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/associado/beneficios',
      icon: <GiftOutlined />,
      label: 'Benefícios',
    },
    {
      key: '/associado/capacitacoes',
      icon: <BookOutlined />,
      label: 'Capacitações',
    },
    {
      key: '/associado/eventos',
      icon: <CalendarOutlined />,
      label: 'Eventos',
    },
    {
      key: '/associado/perfil',
      icon: <UserOutlined />,
      label: 'Perfil e Dados da Empresa',
    },
  ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
    if (isMobile) {
      setMobileMenuVisible(false)
    }
  }

  // Determinar item selecionado baseado na rota atual
  const selectedKey = menuItems.find(item => location.pathname.startsWith(item.key))?.key || '/associado/dashboard'

  const menuContent = (
    <>
      <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
        <Avatar size={64} icon={<UserOutlined />} style={{ marginBottom: '8px' }} />
        <Title level={5} style={{ margin: '8px 0 4px 0', color: isMobile ? '#000' : '#fff' }}>
          {associado.name || 'Associado'}
        </Title>
        <Text type="secondary" style={{ color: isMobile ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.65)', fontSize: '12px' }}>
          {associado.email}
        </Text>
      </div>
      <Menu
        theme={isMobile ? 'light' : 'dark'}
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0 }}
      />
    </>
  )

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={250}
          breakpoint="lg"
          collapsedWidth={80}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
          }}
        >
          {menuContent}
        </Sider>
      )}

      <Drawer
        title="Menu"
        placement="left"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        bodyStyle={{ padding: 0 }}
        width={250}
      >
        {menuContent}
      </Drawer>

      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 250), transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            background: '#fff',
            padding: isMobile ? '0 16px' : '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <Space>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileMenuVisible(true)}
                style={{ fontSize: '18px' }}
              />
            )}
            <Title level={4} style={{ margin: 0, fontSize: isMobile ? '16px' : '20px' }}>
              Área do Associado
            </Title>
          </Space>
          <Button 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            size={isMobile ? 'small' : 'middle'}
          >
            {isMobile ? '' : 'Sair'}
          </Button>
        </Header>
        <Content style={{ margin: isMobile ? '16px' : '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default LayoutAssociado

