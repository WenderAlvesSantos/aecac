import { useState, useEffect } from 'react'
import { Layout, Row, Col, Typography, Space } from 'antd'
import {
  FacebookOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import Logo from './Logo'
import { getConfiguracoes } from '../lib/api'

const { Footer: AntFooter } = Layout
const { Title, Text } = Typography

// Função para formatar telefone
const formatPhone = (value) => {
  if (!value) return ''
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '')
  
  // Aplica máscara: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  } else {
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  }
}

const Footer = () => {
  const [configuracoes, setConfiguracoes] = useState({
    contato: {},
    redesSociais: {},
  })

  useEffect(() => {
    loadConfiguracoes()
  }, [])

  const loadConfiguracoes = async () => {
    try {
      const response = await getConfiguracoes()
      setConfiguracoes(response.data || { contato: {}, redesSociais: {} })
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  const contato = configuracoes.contato || {}
  const redesSociais = configuracoes.redesSociais || {}
  
  const hasContato = contato.telefone || contato.email || contato.endereco
  const hasRedesSociais = redesSociais.facebook || redesSociais.instagram || redesSociais.linkedin
  return (
    <AntFooter
      style={{
        background: '#001529',
        color: '#fff',
        padding: '48px 24px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={12} md={hasContato ? 8 : hasRedesSociais ? 12 : 24}>
            <Logo 
              height="60px" 
              invert={false}
              textColor="#fff"
              style={{ marginBottom: '16px', background: 'transparent' }}
            />
            <Text style={{ color: 'rgba(255,255,255,0.85)', display: 'block', marginTop: '8px' }}>
              Associação Empresarial e Comercial de Águas Claras - DF
            </Text>
            {hasRedesSociais && (
              <div style={{ marginTop: '16px' }}>
                <Space size="middle">
                  {redesSociais.facebook && (
                    <a
                      href={redesSociais.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FacebookOutlined
                        style={{ fontSize: '24px', color: '#fff', cursor: 'pointer' }}
                      />
                    </a>
                  )}
                  {redesSociais.instagram && (
                    <a
                      href={redesSociais.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <InstagramOutlined
                        style={{ fontSize: '24px', color: '#fff', cursor: 'pointer' }}
                      />
                    </a>
                  )}
                  {redesSociais.linkedin && (
                    <a
                      href={redesSociais.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <LinkedinOutlined
                        style={{ fontSize: '24px', color: '#fff', cursor: 'pointer' }}
                      />
                    </a>
                  )}
                </Space>
              </div>
            )}
          </Col>

          {hasContato && (
            <Col xs={24} sm={12} md={hasRedesSociais ? 8 : 12}>
              <Title level={4} style={{ color: '#fff', marginBottom: '16px' }}>
                Contato
              </Title>
              <Space direction="vertical" size="small">
                {contato.telefone && (
                  <Space>
                    <PhoneOutlined style={{ color: '#1890ff' }} />
                    <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
                      {formatPhone(contato.telefone)}
                    </Text>
                  </Space>
                )}
                {contato.email && (
                  <Space>
                    <MailOutlined style={{ color: '#1890ff' }} />
                    <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
                      {contato.email}
                    </Text>
                  </Space>
                )}
                {contato.endereco && (
                  <Space>
                    <EnvironmentOutlined style={{ color: '#1890ff' }} />
                    <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
                      {contato.endereco}
                    </Text>
                  </Space>
                )}
              </Space>
            </Col>
          )}

          <Col xs={24} sm={12} md={hasContato && hasRedesSociais ? 8 : hasContato || hasRedesSociais ? 12 : 24}>
            <Title level={4} style={{ color: '#fff', marginBottom: '16px' }}>
              Links Rápidos
            </Title>
            <Space direction="vertical" size="small">
              <a
                href="/sobre"
                style={{ color: 'rgba(255,255,255,0.85)', display: 'block' }}
              >
                Sobre Nós
              </a>
              <a
                href="/parceiros"
                style={{ color: 'rgba(255,255,255,0.85)', display: 'block' }}
              >
                Parceiros
              </a>
              <a
                href="/empresas"
                style={{ color: 'rgba(255,255,255,0.85)', display: 'block' }}
              >
                Empresas
              </a>
              <a
                href="/galeria"
                style={{ color: 'rgba(255,255,255,0.85)', display: 'block' }}
              >
                Galeria
              </a>
            </Space>
          </Col>
        </Row>

        <div
          style={{
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
          }}
        >
          <Text style={{ color: 'rgba(255,255,255,0.65)' }}>
            © {new Date().getFullYear()} AECAC - Associação Empresarial e
            Comercial de Águas Claras. Todos os direitos reservados.
          </Text>
        </div>
      </div>
    </AntFooter>
  )
}

export default Footer

