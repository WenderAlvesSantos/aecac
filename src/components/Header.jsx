import { Layout, Menu, Button, Drawer } from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import Logo from './Logo'

const { Header: AntHeader } = Layout

const Header = ({
  menuItems,
  currentPath,
  onMenuClick,
  mobileMenuVisible,
  onMobileMenuToggle,
}) => {
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
        bodyStyle={{ padding: 0 }}
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

