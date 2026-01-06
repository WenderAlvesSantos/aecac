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
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end', minWidth: 0 }}>
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
            <Space style={{ marginLeft: '16px', flexShrink: 0 }}>
              <Notificacoes />
              <Button
                type="link"
                icon={<UserOutlined />}
                onClick={() => navigate('/associado')}
                style={{ whiteSpace: 'nowrap', padding: '0 8px' }}
                className="associado-button"
              >
                <span className="associado-text-full">Área do Associado</span>
                <span className="associado-text-short">Associado</span>
              </Button>
            </Space>
          ) : (
            <Button
              type="primary"
              icon={<UserOutlined />}
              onClick={() => navigate('/associado/login')}
              style={{ marginLeft: '16px', flexShrink: 0 }}
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
          /* Reduzir padding dos itens do menu para caber mais itens */
          .desktop-menu .ant-menu-item {
            padding: 0 10px !important;
            font-size: 14px !important;
            margin: 0 2px !important;
          }
          /* Garantir que o último item (Capacitações) sempre fique visível */
          .desktop-menu .ant-menu-item:last-child {
            margin-right: 0 !important;
          }
        }
        /* Texto completo do botão Associado */
        .associado-text-short {
          display: none;
        }
        .associado-text-full {
          display: inline;
        }
        /* Em telas menores, usar texto curto */
        @media (min-width: 769px) and (max-width: 1200px) {
          .associado-text-full {
            display: none;
          }
          .associado-text-short {
            display: inline;
          }
        }
        /* Ajustar o overflow do menu para não esconder itens importantes */
        .desktop-menu .ant-menu-overflow-item-rest {
          display: none !important;
        }
        .desktop-menu .ant-menu-overflow {
          display: none !important;
        }
      `}</style>
    </AntHeader>
  )
}

export default Header

