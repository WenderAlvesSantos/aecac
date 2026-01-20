import { useState, useEffect } from 'react'
import { Layout, Menu, Card, Statistic, Row, Col, Drawer, Button } from 'antd'
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
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { getEventosAdmin, getParceiros, getEmpresas, getGaleria, getDiretoria, getBeneficiosAdmin, getCapacitacoesAdmin } from '../../lib/api'

const { Header: AntHeader, Content, Sider } = Layout

const Dashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [stats, setStats] = useState({
    eventos: 0,
    parceiros: 0,
    empresas: 0,
    galeria: 0,
    diretoria: 0,
    beneficios: 0,
    capacitacoes: 0,
  })
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    loadStats()
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

  const loadStats = async () => {
    try {
      const [eventos, parceiros, empresas, galeria, diretoria, beneficios, capacitacoes] = await Promise.all([
        getEventosAdmin(),
        getParceiros(),
        getEmpresas(),
        getGaleria(),
        getDiretoria(),
        getBeneficiosAdmin().catch(() => ({ data: [] })),
        getCapacitacoesAdmin().catch(() => ({ data: [] })),
      ])

      setStats({
        eventos: eventos.data.length,
        parceiros: parceiros.data.length,
        empresas: empresas.data.length,
        galeria: galeria.data.length,
        diretoria: diretoria.data.length,
        beneficios: beneficios.data.length,
        capacitacoes: capacitacoes.data.length,
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/admin/parceiros',
      icon: <TeamOutlined />,
      label: 'Parceiros',
    },
    {
      key: '/admin/empresas',
      icon: <ShopOutlined />,
      label: 'Empresas',
    },
    {
      key: '/admin/galeria',
      icon: <PictureOutlined />,
      label: 'Galeria',
    },
    {
      key: '/admin/diretoria',
      icon: <UserOutlined />,
      label: 'Diretoria',
    },
    {
      key: '/admin/eventos',
      icon: <CalendarOutlined />,
      label: 'Eventos',
    },
    {
      key: '/admin/beneficios',
      icon: <GiftOutlined />,
      label: 'Benefícios',
    },
    {
      key: '/admin/capacitacoes',
      icon: <BookOutlined />,
      label: 'Capacitações',
    },
    {
      key: '/admin/documentos',
      icon: <FolderOutlined />,
      label: 'Documentos',
    },
    // {
    //   key: '/admin/relatorios',
    //   icon: <BarChartOutlined />,
    //   label: 'Relatórios',
    // },
    {
      key: '/admin/sobre',
      icon: <FileTextOutlined />,
      label: 'Sobre',
    },
    {
      key: '/admin/perfil',
      icon: <IdcardOutlined />,
      label: 'Meu Perfil',
    },
    {
      key: '/admin/usuarios',
      icon: <UsergroupAddOutlined />,
      label: 'Usuários',
    },
    {
      key: '/admin/configuracoes',
      icon: <SettingOutlined />,
      label: 'Configurações',
    },
  ]

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

  const menuContent = (
    <>
      <div
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(135deg, #1a237e 0%, #1565c0 50%, #00c853 100%)',
        }}
      >
        <span style={{ color: '#fff', marginLeft: '12px', fontSize: '18px', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          Admin
        </span>
      </div>
      <Menu
        theme={isMobile ? 'light' : 'dark'}
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </>
  )

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider
          breakpoint="lg"
          collapsedWidth={80}
          style={{
            background: 'linear-gradient(180deg, #1a237e 0%, #1565c0 100%)',
            boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
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

      <Layout style={{ marginLeft: isMobile ? 0 : 200 }}>
        <AntHeader
          style={{
            background: 'linear-gradient(135deg, #1a237e 0%, #1565c0 50%, #00c853 100%)',
            padding: isMobile ? '0 8px' : '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            height: '64px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px', flex: 1, minWidth: 0 }}>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileMenuVisible(true)}
                style={{ fontSize: '18px', color: '#fff', flexShrink: 0 }}
              />
            )}
            <div style={{ 
              fontSize: isMobile ? '14px' : '18px', 
              fontWeight: 'bold', 
              color: '#fff', 
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {isMobile ? 'Admin' : 'Painel Administrativo'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '16px', flexShrink: 0 }}>
            {!isMobile && (
              <span style={{ fontSize: '16px', color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }}>
                Olá, {user.name || 'Admin'}
              </span>
            )}
            <Button 
              onClick={handleLogout} 
              type="default"
              size={isMobile ? 'small' : 'middle'}
              style={{ 
                background: 'rgba(255,255,255,0.2)',
                borderColor: 'rgba(255,255,255,0.3)',
                color: '#fff',
                flexShrink: 0,
              }}
            >
              Sair
            </Button>
          </div>
        </AntHeader>
        <Content style={{ margin: isMobile ? '16px' : '24px', background: '#f0f2f5' }}>
          {location.pathname === '/admin' ? (
            <div>
              <h2 style={{ marginBottom: '24px', color: '#1a237e', fontSize: '28px', fontWeight: 'bold' }}>Dashboard</h2>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Card
                    style={{
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      border: '1px solid #e0e0e0',
                      transition: 'all 0.3s ease',
                    }}
                    hoverable
                  >
                    <Statistic
                      title="Eventos"
                      value={stats.eventos}
                      prefix={<CalendarOutlined />}
                      valueStyle={{ color: '#1565c0' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card
                    style={{
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      border: '1px solid #e0e0e0',
                      transition: 'all 0.3s ease',
                    }}
                    hoverable
                  >
                    <Statistic
                      title="Parceiros"
                      value={stats.parceiros}
                      prefix={<TeamOutlined />}
                      valueStyle={{ color: '#00c853' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card
                    style={{
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      border: '1px solid #e0e0e0',
                      transition: 'all 0.3s ease',
                    }}
                    hoverable
                  >
                    <Statistic
                      title="Empresas"
                      value={stats.empresas}
                      prefix={<ShopOutlined />}
                      valueStyle={{ color: '#1a237e' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card
                    style={{
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      border: '1px solid #e0e0e0',
                      transition: 'all 0.3s ease',
                    }}
                    hoverable
                  >
                    <Statistic
                      title="Imagens na Galeria"
                      value={stats.galeria}
                      prefix={<PictureOutlined />}
                      valueStyle={{ color: '#1565c0' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card
                    style={{
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      border: '1px solid #e0e0e0',
                      transition: 'all 0.3s ease',
                    }}
                    hoverable
                  >
                    <Statistic
                      title="Membros da Diretoria"
                      value={stats.diretoria}
                      prefix={<UserOutlined />}
                      valueStyle={{ color: '#1a237e' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card
                    style={{
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      border: '1px solid #e0e0e0',
                      transition: 'all 0.3s ease',
                    }}
                    hoverable
                  >
                    <Statistic
                      title="Benefícios Ativos"
                      value={stats.beneficios}
                      prefix={<GiftOutlined />}
                      valueStyle={{ color: '#00c853' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card
                    style={{
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      border: '1px solid #e0e0e0',
                      transition: 'all 0.3s ease',
                    }}
                    hoverable
                  >
                    <Statistic
                      title="Capacitações"
                      value={stats.capacitacoes}
                      prefix={<BookOutlined />}
                      valueStyle={{ color: '#1565c0' }}
                    />
                  </Card>
                </Col>
              </Row>
            </div>
          ) : (
            <Outlet />
          )}
        </Content>
      </Layout>
    </Layout>
  )
}

export default Dashboard

