import { useState, useEffect } from 'react'
import { Layout, Menu, ConfigProvider, theme, Drawer, Button } from 'antd'
import {
  DashboardOutlined,
  CalendarOutlined,
  TeamOutlined,
  ShopOutlined,
  PictureOutlined,
  UserOutlined,
  FileTextOutlined,
  SettingOutlined,
  IdcardOutlined,
  UsergroupAddOutlined,
  GiftOutlined,
  BookOutlined,
  MenuOutlined,
  FolderOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Logo from '../../components/Logo'
import { AdminDashboardHome } from '../../components/admin/AdminDashboardHome'

const { Content } = Layout
const SIDER_WIDTH = 240

const adminDarkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorBgBase: '#000000',
    colorBgContainer: 'rgba(255, 255, 255, 0.06)',
    colorBorder: 'rgba(255, 255, 255, 0.12)',
    colorBorderSecondary: 'rgba(255, 255, 255, 0.08)',
    colorText: 'rgba(255, 255, 255, 0.92)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.55)',
    colorPrimary: '#5b9bd5',
    colorBgElevated: '#18181b',
    borderRadiusLG: 16,
  },
  components: {
    Modal: {
      contentBg: '#18181b',
      headerBg: 'rgba(255, 255, 255, 0.04)',
      titleColor: 'rgba(255, 255, 255, 0.95)',
      colorIcon: 'rgba(255, 255, 255, 0.55)',
      colorIconHover: 'rgba(255, 255, 255, 0.9)',
    },
    Select: {
      optionSelectedBg: 'rgba(91, 155, 213, 0.28)',
      optionActiveBg: 'rgba(91, 155, 213, 0.2)',
    },
  },
}

const menuItems = [
  { key: '/admin', icon: <DashboardOutlined />, label: 'Dashboard' },
  { type: 'divider' },
  {
    type: 'group',
    label: 'Cadastros',
    children: [
      { key: '/admin/fundadores', icon: <ShopOutlined />, label: 'Fundadores' },
      { key: '/admin/diretoria', icon: <UserOutlined />, label: 'Diretoria' },
      { key: '/admin/documentos', icon: <FolderOutlined />, label: 'Documentos' },
    ],
  },
  {
    type: 'group',
    label: 'Conteúdo',
    children: [
      { key: '/admin/parceiros', icon: <TeamOutlined />, label: 'Parceiros' },
      { key: '/admin/galeria', icon: <PictureOutlined />, label: 'Galeria' },
      { key: '/admin/sobre', icon: <FileTextOutlined />, label: 'Sobre' },
      { key: '/admin/eventos', icon: <CalendarOutlined />, label: 'Eventos' },
      { key: '/admin/beneficios', icon: <GiftOutlined />, label: 'Benefícios' },
      { key: '/admin/capacitacoes', icon: <BookOutlined />, label: 'Capacitações' },
    ],
  },
  {
    type: 'group',
    label: 'Sistema',
    children: [
      { key: '/admin/perfil', icon: <IdcardOutlined />, label: 'Meu Perfil' },
      { key: '/admin/usuarios', icon: <UsergroupAddOutlined />, label: 'Usuários' },
      { key: '/admin/configuracoes', icon: <SettingOutlined />, label: 'Configurações' },
    ],
  },
]

const Dashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

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

  const handleMenuClick = ({ key }) => {
    navigate(key)
    if (isMobile) {
      setMobileMenuVisible(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    navigate('/admin/login')
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isDashboardHome = location.pathname === '/admin'

  const menuContent = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={handleMenuClick}
      className="admin-sidebar-menu !border-none !bg-transparent"
    />
  )

  const sidebar = (
    <div className="flex h-full flex-col border-r border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5">
        <Logo height="36px" invert showText={false} />
        <div>
          <p className="m-0 text-sm font-semibold text-white">AECAC</p>
          <p className="m-0 text-xs text-gray-500">Painel Admin</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-3">{menuContent}</div>
    </div>
  )

  return (
    <ConfigProvider
      theme={adminDarkTheme}
      select={{ popupClassName: 'admin-managed-select-dropdown' }}
      modal={{ rootClassName: 'admin-managed-modal' }}
    >
      <div className="admin-shell relative min-h-screen bg-black text-white">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-black" aria-hidden />
        <div
          className="pointer-events-none fixed inset-0 -z-10 opacity-50"
          style={{
            background:
              'radial-gradient(ellipse 70% 45% at 10% 0%, rgba(91, 155, 213, 0.22), transparent), radial-gradient(ellipse 50% 40% at 100% 30%, rgba(30, 77, 123, 0.18), transparent), radial-gradient(ellipse 40% 40% at 50% 100%, rgba(108, 181, 65, 0.1), transparent)',
          }}
          aria-hidden
        />

        {!isMobile && (
          <aside className="fixed left-0 top-0 z-40 h-screen" style={{ width: SIDER_WIDTH }}>
            {sidebar}
          </aside>
        )}

        <Drawer
          title={<span className="text-white">Menu</span>}
          placement="left"
          onClose={() => setMobileMenuVisible(false)}
          open={mobileMenuVisible}
          styles={{
            body: { padding: 0, background: '#000' },
            header: { background: '#000', borderBottom: '1px solid rgba(255,255,255,0.1)' },
          }}
          width={260}
        >
          {sidebar}
        </Drawer>

        <div style={{ marginLeft: isMobile ? 0 : SIDER_WIDTH }} className="min-h-screen">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-black/70 px-4 backdrop-blur-xl sm:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {isMobile && (
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  onClick={() => setMobileMenuVisible(true)}
                  className="!text-white"
                />
              )}
              <div className="min-w-0">
                <p className="m-0 truncate text-sm font-semibold text-white sm:text-base">
                  {isDashboardHome
                    ? 'Dashboard'
                    : menuItems
                        .flatMap((item) => {
                          if (item.type === 'group') return item.children
                          if (item.key) return [item]
                          return []
                        })
                        .find((item) => item.key === location.pathname)?.label || 'Painel'}
                </p>
                {!isMobile && (
                  <p className="m-0 truncate text-xs text-gray-500">
                    {isDashboardHome
                      ? 'Visão geral do painel administrativo'
                      : 'Gerencie conteúdos e cadastros da AECAC'}
                  </p>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              {!isMobile && (
                <span className="hidden text-sm text-gray-400 sm:inline">
                  <span className="text-white">{user.name || 'Admin'}</span>
                </span>
              )}
              <Button
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                className="!border-white/15 !bg-white/5 !text-white hover:!border-white/25 hover:!bg-white/10"
                size={isMobile ? 'small' : 'middle'}
              >
                Sair
              </Button>
            </div>
          </header>

          <Content className="p-4 sm:p-6 lg:p-8">
            {isDashboardHome ? (
              <AdminDashboardHome userName={user.name || 'Admin'} />
            ) : (
              <Outlet />
            )}
          </Content>
        </div>
      </div>
    </ConfigProvider>
  )
}

export default Dashboard
