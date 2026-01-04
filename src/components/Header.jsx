import { Layout, Menu, Button, Drawer, Space } from 'antd'
import { MenuOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import Logo from './Logo'
import Notificacoes from './Notificacoes'

const { Header: AntHeader } = Layout

const Header = ({
  menuItems,
  currentPath,
  onMenuClick,
  mobileMenuVisible,
  onMobileMenuToggle,
}) => {
  const navigate = useNavigate()
  const associadoToken = localStorage.getItem('associadoToken')
  const associado = associadoToken ? JSON.parse(localStorage.getItem('associado') || '{}') : null
  return (
    <AntHeader
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '0 24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
          onClick={() => onMenuClick({ key: '/' })}
        >
          <Logo height="50px" />
        </div>

        {/* Menu Desktop */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
          <Menu
            mode="horizontal"
            selectedKeys={[currentPath]}
            items={menuItems}
            onClick={onMenuClick}
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              borderBottom: 'none',
              minWidth: 0,
            }}
            className="desktop-menu"
          />
          {associado ? (
            <Space style={{ marginLeft: '16px' }}>
              <Notificacoes />
              <Button
                type="link"
                icon={<UserOutlined />}
                onClick={() => navigate('/associado')}
              >
                Área do Associado
              </Button>
            </Space>
          ) : (
            <Button
              type="primary"
              icon={<UserOutlined />}
              onClick={() => navigate('/associado/login')}
              style={{ marginLeft: '16px' }}
            >
              Entrar
            </Button>
          )}
        </div>

        {/* Botão Mobile */}
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={onMobileMenuToggle}
          style={{
            display: 'none',
            fontSize: '18px',
          }}
          className="mobile-menu-button"
        />
      </div>

      {/* Drawer Mobile */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={onMobileMenuToggle}
        open={mobileMenuVisible}
        styles={{ body: { padding: 0 } }}
      >
        <Menu
          mode="vertical"
          selectedKeys={[currentPath]}
          items={menuItems}
          onClick={onMenuClick}
          style={{ borderRight: 'none' }}
        />
      </Drawer>

      <style>{`
        @media (max-width: 768px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-menu-button {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .desktop-menu {
            display: flex !important;
          }
          .mobile-menu-button {
            display: none !important;
          }
        }
      `}</style>
    </AntHeader>
  )
}

export default Header

