import { useState, useEffect } from 'react'
import { Layout, Menu, Card, Statistic, Row, Col } from 'antd'
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
  BarChartOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { getEventos, getParceiros, getEmpresas, getGaleria, getDiretoria, getBeneficios, getCapacitacoes } from '../../lib/api'
import Logo from '../../components/Logo'

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

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [eventos, parceiros, empresas, galeria, diretoria, beneficios, capacitacoes] = await Promise.all([
        getEventos(),
        getParceiros(),
        getEmpresas(),
        getGaleria(),
        getDiretoria(),
        getBeneficios().catch(() => ({ data: [] })),
        getCapacitacoes().catch(() => ({ data: [] })),
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
      key: '/admin/eventos',
      icon: <CalendarOutlined />,
      label: 'Eventos',
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
      key: '/admin/sobre',
      icon: <FileTextOutlined />,
      label: 'Sobre',
    },
    {
      key: '/admin/configuracoes',
      icon: <SettingOutlined />,
      label: 'Configurações',
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
      key: '/admin/relatorios',
      icon: <BarChartOutlined />,
      label: 'Relatórios',
    },
  ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    navigate('/admin/login')
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          background: '#001529',
        }}
      >
        <div
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px',
            borderBottom: '1px solid #1f1f1f',
          }}
        >
          <span style={{ color: '#fff', marginLeft: '12px', fontSize: '18px', fontWeight: 'bold' }}>
            Admin
          </span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <AntHeader
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            Painel Administrativo
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>Olá, {user.name || 'Admin'}</span>
            <a onClick={handleLogout} style={{ cursor: 'pointer', color: '#1890ff' }}>
              Sair
            </a>
          </div>
        </AntHeader>
        <Content style={{ margin: '24px', background: '#f0f2f5' }}>
          {location.pathname === '/admin' ? (
            <div>
              <h2 style={{ marginBottom: '24px' }}>Dashboard</h2>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Card>
                    <Statistic
                      title="Eventos"
                      value={stats.eventos}
                      prefix={<CalendarOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card>
                    <Statistic
                      title="Parceiros"
                      value={stats.parceiros}
                      prefix={<TeamOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card>
                    <Statistic
                      title="Empresas"
                      value={stats.empresas}
                      prefix={<ShopOutlined />}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card>
                    <Statistic
                      title="Imagens na Galeria"
                      value={stats.galeria}
                      prefix={<PictureOutlined />}
                      valueStyle={{ color: '#fa8c16' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card>
                    <Statistic
                      title="Membros da Diretoria"
                      value={stats.diretoria}
                      prefix={<UserOutlined />}
                      valueStyle={{ color: '#eb2f96' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card>
                    <Statistic
                      title="Benefícios Ativos"
                      value={stats.beneficios}
                      prefix={<GiftOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card>
                    <Statistic
                      title="Capacitações"
                      value={stats.capacitacoes}
                      prefix={<BookOutlined />}
                      valueStyle={{ color: '#faad14' }}
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

