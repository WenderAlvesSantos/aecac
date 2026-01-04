import { useState } from 'react'
import { Layout, Menu, Typography, Button, Space, Avatar } from 'antd'
import {
  GiftOutlined,
  BookOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  UserOutlined,
  LogoutOutlined,
  ShopOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'

const { Header, Sider, Content } = Layout
const { Title, Text } = Typography

const LayoutAssociado = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const associado = JSON.parse(localStorage.getItem('associado') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('associadoToken')
    localStorage.removeItem('associado')
    navigate('/associado/login')
  }

  const menuItems = [
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
      key: '/associado/resgates',
      icon: <ShoppingOutlined />,
      label: 'Resgates Realizados',
    },
    {
      key: '/associado/perfil',
      icon: <UserOutlined />,
      label: 'Perfil e Dados da Empresa',
    },
  ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  // Determinar item selecionado baseado na rota atual
  const selectedKey = menuItems.find(item => location.pathname.startsWith(item.key))?.key || '/associado/beneficios'

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={250}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <Avatar size={collapsed ? 40 : 64} icon={<UserOutlined />} style={{ marginBottom: collapsed ? 0 : '8px' }} />
          {!collapsed && (
            <>
              <Title level={5} style={{ margin: '8px 0 4px 0', color: '#fff' }}>
                {associado.name || 'Associado'}
              </Title>
              <Text type="secondary" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px' }}>
                {associado.email}
              </Text>
            </>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Área do Associado
          </Title>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>
            Sair
          </Button>
        </Header>
        <Content style={{ margin: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 112px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default LayoutAssociado

