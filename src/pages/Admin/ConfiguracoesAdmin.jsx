import { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Space,
  InputNumber,
  Divider,
  Switch,
  Alert,
} from 'antd'
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  DollarOutlined,
  FlagOutlined,
} from '@ant-design/icons'
import { getConfiguracoes, updateConfiguracoes } from '../../lib/api'

const { TextArea } = Input

// Função para formatar telefone
const formatPhone = (value) => {
  if (!value) return ''
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '')
  
  // Limita a 11 dígitos (DDD + 9 dígitos)
  const limitedNumbers = numbers.slice(0, 11)
  
  // Aplica máscara: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (limitedNumbers.length <= 10) {
    return limitedNumbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  } else {
    return limitedNumbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  }
}

// Função para remover máscara do telefone
const removePhoneMask = (value) => {
  if (!value) return ''
  return value.replace(/\D/g, '')
}

const ConfiguracoesAdmin = () => {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    loadConfiguracoes()
  }, [])

  const loadConfiguracoes = async () => {
    setLoading(true)
    try {
      const response = await getConfiguracoes()
      const data = response.data
      
      form.setFieldsValue({
        telefone: data.contato?.telefone ? formatPhone(data.contato.telefone) : '',
        email: data.contato?.email || '',
        endereco: data.contato?.endereco || '',
        facebook: data.redesSociais?.facebook || '',
        instagram: data.redesSociais?.instagram || '',
        linkedin: data.redesSociais?.linkedin || '',
        valorMensalidade: data.valorMensalidade || 100.00,
        featureFlags: data.featureFlags || {
          preLancamento: false,
          mostrarParceiros: true,
          mostrarEmpresas: true,
          mostrarEventos: true,
          mostrarBeneficios: true,
          mostrarCapacitacoes: true,
          mostrarGaleria: true,
          preCadastroMode: false,
        },
      })
    } catch (error) {
      message.error('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values) => {
    try {
      setLoading(true)
      
      const data = {
        contato: {
          telefone: values.telefone ? removePhoneMask(values.telefone) : '',
          email: values.email || '',
          endereco: values.endereco || '',
        },
        redesSociais: {
          facebook: values.facebook || '',
          instagram: values.instagram || '',
          linkedin: values.linkedin || '',
        },
        valorMensalidade: values.valorMensalidade || 100.00,
        featureFlags: values.featureFlags || {
          preLancamento: false,
          mostrarParceiros: true,
          mostrarEmpresas: true,
          mostrarEventos: true,
          mostrarBeneficios: true,
          mostrarCapacitacoes: true,
          mostrarGaleria: true,
          preCadastroMode: false,
        },
      }

      await updateConfiguracoes(data)
      message.success('Configurações atualizadas com sucesso! Recarregue a página para ver as alterações.')
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      message.error('Erro ao salvar configurações: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: '24px', fontSize: isMobile ? '20px' : '28px' }}>Configurações</h2>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        loading={loading}
      >
        <Card
          title={
            <Space>
              <PhoneOutlined />
              <span style={{ fontSize: isMobile ? '14px' : '16px' }}>Informações de Contato</span>
            </Space>
          }
          style={{ marginBottom: '24px' }}
        >
          <Form.Item
            name="telefone"
            label="Telefone"
            normalize={(value) => {
              if (!value) return ''
              return formatPhone(value)
            }}
            rules={[
              {
                pattern: /^[\d\s()+-]+$/,
                message: 'Telefone inválido',
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="(61) 99999-9999"
              maxLength={15}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                type: 'email',
                message: 'Email inválido',
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="contato@aecac.org.br"
            />
          </Form.Item>

          <Form.Item
            name="endereco"
            label="Endereço"
          >
            <TextArea
              rows={2}
              prefix={<EnvironmentOutlined />}
              placeholder="Águas Claras - DF"
            />
          </Form.Item>
        </Card>

        <Card
          title={
            <Space>
              <DollarOutlined />
              <span style={{ fontSize: isMobile ? '14px' : '16px' }}>Configurações Financeiras</span>
            </Space>
          }
          style={{ marginBottom: '24px' }}
        >
          <Form.Item
            name="valorMensalidade"
            label="Valor da Mensalidade (R$)"
            rules={[
              { required: true, message: 'Por favor, informe o valor da mensalidade' },
              { type: 'number', min: 0, message: 'O valor deve ser maior ou igual a zero' },
            ]}
          >
            <InputNumber
              prefix="R$"
              style={{ width: '100%' }}
              placeholder="100.00"
              min={0}
              step={0.01}
              precision={2}
              formatter={(value) => {
                if (!value) return ''
                return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }}
              parser={(value) => {
                if (!value) return ''
                return value.replace(/\$\s?|(,*)/g, '')
              }}
            />
          </Form.Item>
        </Card>

        <Card
          title={
            <Space>
              <FacebookOutlined />
              <span style={{ fontSize: isMobile ? '14px' : '16px' }}>Redes Sociais</span>
            </Space>
          }
          style={{ marginBottom: '24px' }}
        >
          <Form.Item
            name="facebook"
            label="Facebook"
            rules={[
              {
                type: 'url',
                message: 'URL inválida',
              },
            ]}
          >
            <Input
              prefix={<FacebookOutlined />}
              placeholder="https://facebook.com/aecac"
            />
          </Form.Item>

          <Form.Item
            name="instagram"
            label="Instagram"
            rules={[
              {
                type: 'url',
                message: 'URL inválida',
              },
            ]}
          >
            <Input
              prefix={<InstagramOutlined />}
              placeholder="https://instagram.com/aecac"
            />
          </Form.Item>

          <Form.Item
            name="linkedin"
            label="LinkedIn"
            rules={[
              {
                type: 'url',
                message: 'URL inválida',
              },
            ]}
          >
            <Input
              prefix={<LinkedinOutlined />}
              placeholder="https://linkedin.com/company/aecac"
            />
          </Form.Item>
        </Card>

        <Card
          title={
            <Space>
              <FlagOutlined />
              <span style={{ fontSize: isMobile ? '14px' : '16px' }}>
                {isMobile ? 'Feature Flags' : 'Feature Flags (Controle de Funcionalidades)'}
              </span>
            </Space>
          }
          style={{ marginBottom: '24px' }}
        >
          <Alert
            message="Modo Pré-Lançamento"
            description="Ative para ocultar todas as funcionalidades públicas (exceto Home e Sobre). Útil durante a fase de pré-lançamento da associação."
            type="warning"
            showIcon
            style={{ marginBottom: '24px' }}
          />

          <Form.Item
            name={['featureFlags', 'preLancamento']}
            label="Modo Pré-Lançamento"
            valuePropName="checked"
            tooltip="Quando ativo, oculta todos os menus exceto Home e Sobre"
          >
            <Switch 
              checkedChildren="Ativo" 
              unCheckedChildren="Inativo"
            />
          </Form.Item>

          <Form.Item
            name={['featureFlags', 'preCadastroMode']}
            label="Modo Pré-Cadastro"
            valuePropName="checked"
            tooltip="Cadastro de empresa vira pré-cadastro de interesse (altera textos e status)"
          >
            <Switch 
              checkedChildren="Ativo" 
              unCheckedChildren="Inativo"
            />
          </Form.Item>

          <Divider style={{ fontSize: isMobile ? '12px' : '14px' }}>
            {isMobile ? 'Visibilidade Individual' : 'Visibilidade Individual (sobrescritas pelo Pré-Lançamento)'}
          </Divider>
          
          <Alert
            message="Nota"
            description="Se o Modo Pré-Lançamento estiver ATIVO, estas configurações serão ignoradas."
            type="info"
            style={{ marginBottom: '16px' }}
          />

          <Form.Item
            name={['featureFlags', 'mostrarParceiros']}
            label="Mostrar Parceiros"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Visível" 
              unCheckedChildren="Oculto"
            />
          </Form.Item>

          <Form.Item
            name={['featureFlags', 'mostrarEmpresas']}
            label="Mostrar Empresas"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Visível" 
              unCheckedChildren="Oculto"
            />
          </Form.Item>

          <Form.Item
            name={['featureFlags', 'mostrarEventos']}
            label="Mostrar Eventos"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Visível" 
              unCheckedChildren="Oculto"
            />
          </Form.Item>

          <Form.Item
            name={['featureFlags', 'mostrarBeneficios']}
            label="Mostrar Benefícios"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Visível" 
              unCheckedChildren="Oculto"
            />
          </Form.Item>

          <Form.Item
            name={['featureFlags', 'mostrarCapacitacoes']}
            label="Mostrar Capacitações"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Visível" 
              unCheckedChildren="Oculto"
            />
          </Form.Item>

          <Form.Item
            name={['featureFlags', 'mostrarGaleria']}
            label="Mostrar Galeria"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Visível" 
              unCheckedChildren="Oculto"
            />
          </Form.Item>
        </Card>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Salvar Configurações
            </Button>
            <Button onClick={() => loadConfiguracoes()}>
              Cancelar
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  )
}

export default ConfiguracoesAdmin

