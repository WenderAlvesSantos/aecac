import { useState, useEffect } from 'react'
import { Form, Input, Select, Button, Card, Typography, message, Upload, Alert, Space } from 'antd'
import { ShopOutlined, UploadOutlined, CheckCircleOutlined, HomeOutlined } from '@ant-design/icons'
import { createEmpresa, buscarCNPJ as buscarCNPJAPI, buscarCEP as buscarCEPAPI } from '../lib/api'
import { useFeatureFlags } from '../contexts/FeatureFlagsContext'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography
const { TextArea } = Input

// Função para formatar telefone
const formatPhone = (value) => {
  if (!value) return ''
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  } else {
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  }
}

// Função para formatar CNPJ
const formatCNPJ = (value) => {
  if (!value) return ''
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 14) {
    return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
      .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})$/, '$1.$2.$3/$4')
      .replace(/^(\d{2})(\d{3})(\d{3})$/, '$1.$2.$3')
      .replace(/^(\d{2})(\d{3})$/, '$1.$2')
      .replace(/^(\d{2})$/, '$1')
  }
  return value
}

// Função para formatar CEP
const formatCEP = (value) => {
  if (!value) return ''
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 8) {
    return numbers.replace(/^(\d{5})(\d{3})$/, '$1-$2')
  }
  return value
}

// Função para validar CNPJ
const validateCNPJ = (cnpj) => {
  cnpj = cnpj.replace(/[^\d]+/g, '')
  
  if (cnpj.length !== 14) return false
  
  // Elimina CNPJs conhecidos inválidos
  if (/^(\d)\1+$/.test(cnpj)) return false
  
  // Validação dos dígitos verificadores
  let length = cnpj.length - 2
  let numbers = cnpj.substring(0, length)
  let digits = cnpj.substring(length)
  let sum = 0
  let pos = length - 7
  
  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--
    if (pos < 2) pos = 9
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(0))) return false
  
  length = length + 1
  numbers = cnpj.substring(0, length)
  sum = 0
  pos = length - 7
  
  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--
    if (pos < 2) pos = 9
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(1))) return false
  
  return true
}

const CadastroEmpresa = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [buscandoCNPJ, setBuscandoCNPJ] = useState(false)
  const [buscandoCEP, setBuscandoCEP] = useState(false)
  const [cnpjValue, setCnpjValue] = useState('')
  const [cepValue, setCepValue] = useState('')
  const { flags } = useFeatureFlags()
  
  const preCadastro = flags.preCadastroMode
  const titulo = preCadastro ? 'Pré-Cadastro de Interesse' : 'Cadastro de Empresa'
  const subtitulo = preCadastro
    ? 'Manifeste seu interesse em fazer parte da AECAC. Entraremos em contato em breve!'
    : 'Preencha o formulário abaixo para se associar à AECAC'

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new window.Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            },
            file.type,
            quality
          )
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  // Buscar dados do CNPJ via API do backend
  const buscarCNPJ = async (cnpj) => {
    const cnpjLimpo = cnpj.replace(/\D/g, '')
    
    if (cnpjLimpo.length !== 14) {
      return
    }

    if (!validateCNPJ(cnpjLimpo)) {
      return
    }

    setBuscandoCNPJ(true)
    try {
      const response = await buscarCNPJAPI(cnpjLimpo)
      const data = response.data

      // Preencher campos automaticamente
      form.setFieldsValue({
        nome: data.nome || '',
        email: data.email || '',
        endereco: data.logradouro ? `${data.logradouro}${data.numero ? ', ' + data.numero : ''}${data.bairro ? ' - ' + data.bairro : ''}` : '',
        cep: data.cep ? formatCEP(data.cep) : '',
      })
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error)
    } finally {
      setBuscandoCNPJ(false)
    }
  }

  // Buscar endereço pelo CEP via API do backend
  const buscarCEP = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, '')
    
    if (cepLimpo.length !== 8) {
      return
    }

    setBuscandoCEP(true)
    try {
      const response = await buscarCEPAPI(cepLimpo)
      const data = response.data

      // Preencher campos de endereço
      const enderecoAtual = form.getFieldValue('endereco') || ''
      const enderecoCompleto = data.logradouro 
        ? `${data.logradouro}${data.complemento ? ', ' + data.complemento : ''}${enderecoAtual ? ', ' + enderecoAtual : ''} - ${data.bairro || ''}, ${data.localidade || ''} - ${data.uf || ''}`
        : enderecoAtual

      form.setFieldsValue({
        endereco: enderecoCompleto,
      })
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
    } finally {
      setBuscandoCEP(false)
    }
  }

  // Debounce para buscar CNPJ automaticamente
  useEffect(() => {
    if (!cnpjValue) return

    const cnpjLimpo = cnpjValue.replace(/\D/g, '')
    if (cnpjLimpo.length === 14) {
      const timer = setTimeout(() => {
        buscarCNPJ(cnpjValue)
      }, 500) // 500ms de debounce

      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cnpjValue])

  // Debounce para buscar CEP automaticamente
  useEffect(() => {
    if (!cepValue) return

    const cepLimpo = cepValue.replace(/\D/g, '')
    if (cepLimpo.length === 8) {
      const timer = setTimeout(() => {
        buscarCEP(cepValue)
      }, 500) // 500ms de debounce

      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cepValue])

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const formData = { ...values, preCadastro }

      // Limpar CNPJ e CEP (remover formatação)
      if (formData.cnpj) {
        formData.cnpj = formData.cnpj.replace(/\D/g, '')
      }
      if (formData.cep) {
        formData.cep = formData.cep.replace(/\D/g, '')
      }

      // Processar imagem se houver
      if (values.imagemFile && values.imagemFile.length > 0) {
        const file = values.imagemFile[0].originFileObj
        if (file) {
          const compressed = await compressImage(file)
          formData.imagem = await convertImageToBase64(compressed)
        }
      }

      delete formData.imagemFile

      await createEmpresa(formData)
      
      const mensagem = preCadastro
        ? 'Pré-cadastro realizado com sucesso! Entraremos em contato em breve.'
        : 'Cadastro realizado com sucesso! Aguarde a aprovação do administrador.'
      
      message.success(mensagem)
      form.resetFields()
      setSubmitted(true)
    } catch (error) {
      message.error(error.response?.data?.error || 'Erro ao cadastrar empresa')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    const mensagemSucesso = preCadastro
      ? 'Pré-cadastro Enviado com Sucesso!'
      : 'Cadastro Enviado com Sucesso!'
    
    const descricaoSucesso = preCadastro
      ? 'Seu pré-cadastro foi recebido. Entraremos em contato em breve para os próximos passos!'
      : 'Seu cadastro foi recebido e está aguardando aprovação do administrador. Você receberá uma notificação assim que sua empresa for aprovada.'
    
    return (
      <div style={{ padding: '64px 24px', background: '#f0f2f5', minHeight: '80vh' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '24px' }} />
              <Title level={2}>{mensagemSucesso}</Title>
              <Paragraph style={{ fontSize: '16px', marginTop: '16px' }}>
                {descricaoSucesso}
              </Paragraph>
              {!preCadastro && (
                <div style={{ 
                  marginTop: '24px', 
                  padding: '16px', 
                  background: '#f0f7ff', 
                  borderRadius: '8px',
                  textAlign: 'left'
                }}>
                  <Title level={4} style={{ fontSize: '16px', marginBottom: '8px' }}>
                    📋 Próximos Passos:
                  </Title>
                  <Paragraph style={{ fontSize: '14px', marginBottom: '8px' }}>
                    1. Aguarde a aprovação do administrador
                  </Paragraph>
                  <Paragraph style={{ fontSize: '14px', marginBottom: '8px' }}>
                    2. Após aprovação, acesse <strong>/associado/login</strong>
                  </Paragraph>
                  <Paragraph style={{ fontSize: '14px' }}>
                    3. Use o <strong>mesmo email</strong> cadastrado aqui para criar sua conta de associado
                  </Paragraph>
                </div>
              )}
              <Space size="middle" style={{ marginTop: '24px' }}>
                <Button
                  type="default"
                  size="large"
                  icon={<HomeOutlined />}
                  onClick={() => navigate('/')}
                >
                  Voltar para Home
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => setSubmitted(false)}
                >
                  Fazer Novo Cadastro
                </Button>
              </Space>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      {/* Header Section com gradiente */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a237e 0%, #1565c0 50%, #00c853 100%)',
          color: '#fff',
          padding: window.innerWidth < 768 ? '50px 16px' : '80px 24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Elementos decorativos */}
        <div
          style={{
            position: 'absolute',
            top: '-30%',
            right: '-10%',
            width: '500px',
            height: '500px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            filter: 'blur(80px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-20%',
            left: '-10%',
            width: '400px',
            height: '400px',
            background: 'rgba(0, 200, 83, 0.1)',
            borderRadius: '50%',
            filter: 'blur(80px)',
          }}
        />
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {preCadastro && (
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '8px 20px',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ShopOutlined style={{ fontSize: '18px' }} />
                <span style={{ fontSize: '14px', fontWeight: '600' }}>Pré-Lançamento</span>
              </div>
            </div>
          )}
          <ShopOutlined style={{ fontSize: '48px', color: '#fff', marginBottom: '16px' }} />
          <Title
            level={1}
            style={{
              color: '#fff',
              marginBottom: '16px',
              fontSize: window.innerWidth < 768 ? '32px' : '42px',
              fontWeight: 'bold',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}
          >
            {titulo}
          </Title>
          <Paragraph
            style={{
              color: 'rgba(255,255,255,0.95)',
              fontSize: window.innerWidth < 768 ? '16px' : '20px',
              lineHeight: '1.8',
              margin: 0,
            }}
          >
            {subtitulo}
          </Paragraph>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: window.innerWidth < 768 ? '32px 16px' : '48px 24px', maxWidth: '800px', margin: '0 auto' }}>
        {preCadastro && (
          <Alert
            message="🚀 Estamos em fase de pré-lançamento"
            description="Registre seu interesse e seja um dos primeiros a fazer parte da AECAC!"
            type="info"
            showIcon
            style={{ 
              marginBottom: '24px',
              borderRadius: '12px',
              padding: '16px 24px'
            }}
          />
        )}

        <Card
          style={{
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid #e0e0e0',
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            size="large"
          >
            <Form.Item
              name="cnpj"
              label="CNPJ"
              normalize={(value) => {
                const formatted = formatCNPJ(value)
                setCnpjValue(formatted)
                return formatted
              }}
              rules={[
                { required: true, message: 'CNPJ é obrigatório' },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve()
                    const cnpjLimpo = value.replace(/\D/g, '')
                    if (cnpjLimpo.length !== 14) {
                      return Promise.reject(new Error('CNPJ deve ter 14 dígitos'))
                    }
                    if (!validateCNPJ(cnpjLimpo)) {
                      return Promise.reject(new Error('CNPJ inválido'))
                    }
                    return Promise.resolve()
                  },
                },
              ]}
            >
              <Input
                placeholder="00.000.000/0000-00"
                maxLength={18}
              />
            </Form.Item>

            <Form.Item
              name="nome"
              label="Nome da Empresa"
              rules={[{ required: true, message: 'Campo obrigatório' }]}
            >
              <Input placeholder="Nome da sua empresa" />
            </Form.Item>

            <Form.Item
              name="responsavel"
              label="Nome do Responsável"
              rules={[{ required: true, message: 'Campo obrigatório' }]}
            >
              <Input placeholder="Nome completo do responsável pela empresa" />
            </Form.Item>

            <Form.Item
              name="categoria"
              label="Categoria"
              rules={[{ required: true, message: 'Campo obrigatório' }]}
            >
              <Select placeholder="Selecione a categoria">
                <Select.Option value="Varejo">Varejo</Select.Option>
                <Select.Option value="Alimentação">Alimentação</Select.Option>
                <Select.Option value="Tecnologia">Tecnologia</Select.Option>
                <Select.Option value="Saúde">Saúde</Select.Option>
                <Select.Option value="Serviços">Serviços</Select.Option>
                <Select.Option value="Beleza">Beleza</Select.Option>
                <Select.Option value="Construção">Construção</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="descricao"
              label="Descrição"
              rules={[{ required: true, message: 'Campo obrigatório' }]}
            >
              <TextArea rows={4} placeholder="Descreva sua empresa e seus serviços" maxLength={700} showCount />
            </Form.Item>

            <Form.Item
              name="telefone"
              label="Telefone"
              normalize={(value) => {
                if (!value) return ''
                return formatPhone(value)
              }}
            >
              <Input placeholder="(61) 99999-9999" maxLength={15} />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: 'email', message: 'Email inválido' }]}
            >
              <Input type="email" placeholder="contato@empresa.com.br" />
            </Form.Item>

            <Form.Item
              name="cep"
              label="CEP"
              normalize={(value) => {
                const formatted = formatCEP(value)
                setCepValue(formatted)
                return formatted
              }}
              rules={[
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve()
                    const cepLimpo = value.replace(/\D/g, '')
                    if (cepLimpo.length !== 8) {
                      return Promise.reject(new Error('CEP deve ter 8 dígitos'))
                    }
                    return Promise.resolve()
                  },
                },
              ]}
            >
              <Input
                placeholder="00000-000"
                maxLength={9}
              />
            </Form.Item>

            <Form.Item
              name="endereco"
              label="Endereço Completo"
            >
              <TextArea rows={2} placeholder="Endereço completo da empresa" />
            </Form.Item>

            <Form.Item
              name="site"
              label="Site"
              rules={[{ type: 'url', message: 'URL inválida' }]}
            >
              <Input placeholder="https://www.exemplo.com.br" />
            </Form.Item>

            <Form.Item
              name="facebook"
              label="Facebook"
              rules={[{ type: 'url', message: 'URL inválida' }]}
            >
              <Input placeholder="https://facebook.com/empresa" />
            </Form.Item>

            <Form.Item
              name="instagram"
              label="Instagram"
              rules={[{ type: 'url', message: 'URL inválida' }]}
            >
              <Input placeholder="https://instagram.com/empresa" />
            </Form.Item>

            <Form.Item
              name="linkedin"
              label="LinkedIn"
              rules={[{ type: 'url', message: 'URL inválida' }]}
            >
              <Input placeholder="https://linkedin.com/company/empresa" />
            </Form.Item>

            <Form.Item
              name="whatsapp"
              label="WhatsApp"
              normalize={(value) => {
                if (!value) return ''
                return formatPhone(value)
              }}
            >
              <Input placeholder="(61) 99999-9999" maxLength={15} />
            </Form.Item>

            <Form.Item
              name="imagemFile"
              label="Logomarca"
              valuePropName="fileList"
              getValueFromEvent={(e) => {
                if (Array.isArray(e)) {
                  return e.slice(0, 1)
                }
                if (e?.fileList) {
                  return e.fileList.slice(0, 1)
                }
                return []
              }}
            >
              <Upload
                listType="picture-card"
                maxCount={1}
                beforeUpload={() => false}
                accept="image/*"
              >
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading} size="large">
                Enviar Cadastro
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  )
}

export default CadastroEmpresa

