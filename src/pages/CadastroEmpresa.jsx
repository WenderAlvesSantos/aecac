import { useState, useEffect } from 'react'
import { Form, Input, Select, Button, Typography, message, Upload, Space } from 'antd'
import { UploadOutlined, CheckCircleOutlined, HomeOutlined } from '@ant-design/icons'
import { motion } from 'motion/react'
import { createEmpresa, buscarCNPJ as buscarCNPJAPI, buscarCEP as buscarCEPAPI } from '../lib/api'
import { instagramHandleToStoredUrl, normalizeInstagramInput } from '../lib/instagram'
import { useFeatureFlags } from '../contexts/FeatureFlagsContext'
import { useNavigate } from 'react-router-dom'
import { CartaAdesaoModal } from '../components/public-site/CartaAdesaoModal'
import { CadastroFundadorContexto } from '../components/public-site/CadastroFundadorContexto'

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

// Formatar CPF (000.000.000-00)
const formatCPF = (value) => {
  if (!value) return ''
  const numbers = value.replace(/\D/g, '').slice(0, 11)
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 6) return numbers.replace(/^(\d{3})(\d+)/, '$1.$2')
  if (numbers.length <= 9) return numbers.replace(/^(\d{3})(\d{3})(\d+)/, '$1.$2.$3')
  return numbers.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4')
}

// Validar dígitos verificadores do CPF
const validateCPF = (cpfDigits) => {
  const cpf = String(cpfDigits || '').replace(/\D/g, '')
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i), 10) * (10 - i)
  let d1 = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (d1 !== parseInt(cpf.charAt(9), 10)) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i), 10) * (11 - i)
  let d2 = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  return d2 === parseInt(cpf.charAt(10), 10)
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

function CadastroFieldMotion({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ delay, duration: 0.38 }}
    >
      {children}
    </motion.div>
  )
}

const CadastroEmpresa = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [cnpjValue, setCnpjValue] = useState('')
  const [cepValue, setCepValue] = useState('')
  const [showCarta, setShowCarta] = useState(false)
  const [cartaSnapshot, setCartaSnapshot] = useState(null)
  const [pendingCadastro, setPendingCadastro] = useState(null)
  const [cartSubmitLoading, setCartSubmitLoading] = useState(false)
  const { flags } = useFeatureFlags()
  const preCadastro = flags.preCadastroMode
  const titulo = preCadastro ? 'Cadastro de fundadores' : 'Cadastro de fundador'
  const subtitulo = preCadastro
    ? 'Fundadores não entram depois. Eles definem as regras do jogo. A AECAC está nascendo agora e há poucas vagas de fundador. Garanta a sua.'
    : 'Preencha o formulário abaixo para se cadastrar como fundador da AECAC'

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
    }
  }

  // Buscar endereço pelo CEP via API do backend
  const buscarCEP = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, '')
    
    if (cepLimpo.length !== 8) {
      return
    }

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

  const finalizeCadastroSucesso = () => {
    form.resetFields()
    setCnpjValue('')
    setCepValue('')
    setShowCarta(false)
    setCartaSnapshot(null)
    setPendingCadastro(null)
    setSubmitted(true)
  }

  const handleDismissCarta = () => {
    setShowCarta(false)
    setCartaSnapshot(null)
    setPendingCadastro(null)
  }

  const handleConfirmCarta = async ({ cartaAdesao, assinaturaDataUrl }) => {
    if (!pendingCadastro) {
      throw new Error('Dados do cadastro não encontrados. Envie o formulário novamente.')
    }
    setCartSubmitLoading(true)
    try {
      const body = {
        ...pendingCadastro,
        cartaAdesao,
        assinaturaCarta: assinaturaDataUrl,
        cadastroPublicoFundador: true,
      }
      await createEmpresa(body)
      message.success(
        preCadastro
          ? 'Cadastro concluído com a carta de adesão assinada. Você receberá o PDF por e-mail.'
          : 'Cadastro enviado com a carta de adesão assinada. Você receberá o PDF por e-mail.'
      )
      finalizeCadastroSucesso()
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'Erro ao enviar cadastro de fundador'
      message.error(msg)
      throw new Error(msg)
    } finally {
      setCartSubmitLoading(false)
    }
  }

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const formData = { ...values, preCadastro }

      if (formData.cnpj) {
        formData.cnpj = formData.cnpj.replace(/\D/g, '')
      }
      if (formData.cep) {
        formData.cep = formData.cep.replace(/\D/g, '')
      }
      if (formData.cpf) {
        formData.cpf = formData.cpf.replace(/\D/g, '')
      }
      if (formData.rg) {
        formData.rg = String(formData.rg).trim()
      }

      formData.instagram = instagramHandleToStoredUrl(values.instagram)

      if (values.imagemFile && values.imagemFile.length > 0) {
        const file = values.imagemFile[0].originFileObj
        if (file) {
          const compressed = await compressImage(file)
          formData.imagem = await convertImageToBase64(compressed)
        }
      }

      delete formData.imagemFile

      setPendingCadastro(formData)
      setCartaSnapshot({
        responsavel: values.responsavel,
        empresa: values.nome,
        cnpj: values.cnpj || '',
        rg: values.rg ? String(values.rg).trim() : '',
        cpf: values.cpf ? String(values.cpf).replace(/\D/g, '') : '',
        telefone: values.telefone || '',
        email: values.email || '',
        endereco: values.endereco || '',
        cep: values.cep || '',
      })
      setShowCarta(true)
      message.info(
        'Revise a carta de adesão, confira a data no topo, assine no campo indicado e clique em «Confirmar e concluir» para enviar o cadastro.'
      )
    } catch (error) {
      message.error(error.response?.data?.error || 'Erro ao preparar o cadastro')
    } finally {
      setLoading(false)
    }
  }

  const mensagemSucesso = preCadastro
    ? 'Cadastro de fundador enviado com sucesso!'
    : 'Cadastro de fundador enviado com sucesso!'

  const descricaoSucesso = preCadastro
    ? 'Seu cadastro de fundador foi recebido. Enviamos uma cópia da carta de adesão em PDF para o seu e-mail. Entraremos em contato em breve para os próximos passos!'
    : 'Seu cadastro de fundador foi recebido e está aguardando aprovação. Uma cópia da carta de adesão em PDF foi enviada para o seu e-mail. Você receberá uma notificação quando for aprovado.'

  return (
    <>
      <CartaAdesaoModal
        open={showCarta}
        dados={cartaSnapshot}
        onDismiss={handleDismissCarta}
        submitting={cartSubmitLoading}
        onConfirmAndSubmit={handleConfirmCarta}
      />
      {submitted ? (
        <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
          <div className="max-w-lg w-full bg-gradient-to-b from-white/10 to-white/[0.02] border border-white/10 rounded-3xl p-10 text-center">
            <CheckCircleOutlined className="text-6xl text-[#6cb541] mb-6" />
            <Title level={2} className="!text-white !mb-4">
              {mensagemSucesso}
            </Title>
            <Paragraph className="!text-gray-300 text-base">{descricaoSucesso}</Paragraph>
            {!preCadastro && (
              <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 text-left">
                <Title level={4} className="!text-white !text-base !mb-2">
                  Próximos passos
                </Title>
                <Paragraph className="!text-gray-400 !text-sm !mb-1">1. Aguarde a aprovação do administrador</Paragraph>
                <Paragraph className="!text-gray-400 !text-sm !mb-1">
                  2. Após a aprovação, acesse <strong className="text-white">/associado/login</strong>
                </Paragraph>
                <Paragraph className="!text-gray-400 !text-sm">
                  3. Use o <strong className="text-white">mesmo e-mail</strong> cadastrado aqui para criar sua conta de associado
                </Paragraph>
              </div>
            )}
            <Space size="middle" className="mt-8 justify-center flex-wrap">
              <Button type="default" size="large" icon={<HomeOutlined />} onClick={() => navigate('/')}>
                Voltar para Home
              </Button>
              <Button type="primary" size="large" onClick={() => setSubmitted(false)}>
                Fazer novo cadastro
              </Button>
            </Space>
          </div>
        </div>
      ) : (
        <div className="pb-24 text-white">
          <CadastroFundadorContexto preCadastro={preCadastro} formTitle={titulo} formSubtitle={subtitulo}>
            <motion.div
              className="space-y-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-10 shadow-2xl backdrop-blur-xl lg:p-14"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.08 }}
              transition={{ duration: 0.45 }}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                size="large"
                className="cadastro-fundador-form"
                requiredMark
              >
                <CadastroFieldMotion delay={0}>
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
                    <Input placeholder="00.000.000/0000-00" maxLength={18} />
                  </Form.Item>
                </CadastroFieldMotion>

                <CadastroFieldMotion delay={0.1}>
                  <Form.Item
                    name="nome"
                    label="Nome da empresa (fundador)"
                    rules={[{ required: true, message: 'Campo obrigatório' }]}
                  >
                    <Input placeholder="Razão social ou nome fantasia" />
                  </Form.Item>
                </CadastroFieldMotion>

                <CadastroFieldMotion delay={0.2}>
                  <Form.Item
                    name="responsavel"
                    label="Nome do Responsável"
                    rules={[{ required: true, message: 'Campo obrigatório' }]}
                  >
                    <Input placeholder="Nome completo do responsável pelo cadastro de fundador" />
                  </Form.Item>
                </CadastroFieldMotion>

                <CadastroFieldMotion delay={0.22}>
                  <Form.Item
                    name="rg"
                    label="RG do responsável"
                    rules={[
                      { required: true, message: 'RG é obrigatório' },
                      { min: 3, message: 'Informe um RG válido' },
                    ]}
                  >
                    <Input placeholder="Número do documento de identidade" maxLength={24} />
                  </Form.Item>
                </CadastroFieldMotion>

                <CadastroFieldMotion delay={0.24}>
                  <Form.Item
                    name="cpf"
                    label="CPF do responsável"
                    normalize={(value) => formatCPF(value || '')}
                    rules={[
                      { required: true, message: 'CPF é obrigatório' },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve()
                          const d = value.replace(/\D/g, '')
                          if (d.length !== 11) {
                            return Promise.reject(new Error('CPF deve ter 11 dígitos'))
                          }
                          if (!validateCPF(d)) {
                            return Promise.reject(new Error('CPF inválido'))
                          }
                          return Promise.resolve()
                        },
                      },
                    ]}
                  >
                    <Input placeholder="000.000.000-00" maxLength={14} inputMode="numeric" />
                  </Form.Item>
                </CadastroFieldMotion>

                <CadastroFieldMotion delay={0.3}>
                  <Form.Item
                    name="categoria"
                    label="Categoria"
                    rules={[{ required: true, message: 'Campo obrigatório' }]}
                  >
                    <Select placeholder="Selecione a categoria" popupClassName="cadastro-fundador-select-dropdown">
                      <Select.Option value="Varejo">Varejo</Select.Option>
                      <Select.Option value="Alimentação">Alimentação</Select.Option>
                      <Select.Option value="Tecnologia">Tecnologia</Select.Option>
                      <Select.Option value="Saúde">Saúde</Select.Option>
                      <Select.Option value="Serviços">Serviços</Select.Option>
                      <Select.Option value="Beleza">Beleza</Select.Option>
                      <Select.Option value="Construção">Construção</Select.Option>
                    </Select>
                  </Form.Item>
                </CadastroFieldMotion>

                <CadastroFieldMotion delay={0.4}>
                  <Form.Item
                    name="descricao"
                    label="Descrição"
                    rules={[{ required: true, message: 'Campo obrigatório' }]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Descreva a empresa fundadora e seus serviços"
                      maxLength={700}
                      showCount
                      className="!resize-none"
                    />
                  </Form.Item>
                </CadastroFieldMotion>

                <CadastroFieldMotion delay={0.5}>
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
                </CadastroFieldMotion>

                <CadastroFieldMotion delay={0.55}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'E-mail é obrigatório para receber a carta de adesão em PDF' },
                      { type: 'email', message: 'Email inválido' },
                    ]}
                  >
                    <Input type="email" placeholder="contato@empresa.com.br" />
                  </Form.Item>
                </CadastroFieldMotion>

                <CadastroFieldMotion delay={0.6}>
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
                    <Input placeholder="00000-000" maxLength={9} />
                  </Form.Item>
                </CadastroFieldMotion>

                <CadastroFieldMotion delay={0.7}>
                  <Form.Item name="site" label="Site" rules={[{ type: 'url', message: 'URL inválida' }]}>
                    <Input placeholder="https://www.exemplo.com.br" />
                  </Form.Item>
                </CadastroFieldMotion>

                <CadastroFieldMotion delay={0.8}>
                  <Form.Item name="endereco" label="Endereço Completo">
                    <TextArea rows={3} placeholder="Endereço completo do negócio" className="!resize-none" />
                  </Form.Item>
                </CadastroFieldMotion>

                <CadastroFieldMotion delay={1.0}>
                  <h3 className="mb-4 text-xl font-semibold text-gray-300">Redes Sociais e Contato</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <Form.Item name="facebook" label="Facebook" rules={[{ type: 'url', message: 'URL inválida' }]}>
                      <Input placeholder="https://facebook.com/empresa" />
                    </Form.Item>
                    <Form.Item
                      name="instagram"
                      label="Instagram"
                      normalize={(v) => normalizeInstagramInput(v)}
                      rules={[{ max: 50, message: 'No máximo 50 caracteres' }]}
                    >
                      <Input prefix="@" placeholder="usuario" allowClear />
                    </Form.Item>
                    <Form.Item name="linkedin" label="LinkedIn" rules={[{ type: 'url', message: 'URL inválida' }]}>
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
                  </div>
                </CadastroFieldMotion>

                <CadastroFieldMotion delay={1.1}>
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
                      rootClassName="cadastro-fundador-upload"
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
                </CadastroFieldMotion>

                <CadastroFieldMotion delay={1.15}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="default"
                      htmlType="submit"
                      block
                      loading={loading}
                      className="!h-auto !min-h-[52px] !rounded-xl !border-0 !bg-gradient-to-r !from-[#1e4d7b] !to-[#5b9bd5] !px-4 !py-5 !text-lg !font-semibold !text-white hover:!brightness-110"
                      style={{ boxShadow: '0 10px 40px rgba(91, 155, 213, 0.25)' }}
                    >
                      {preCadastro ? 'Enviar Cadastro de Fundador' : 'Enviar cadastro'}
                    </Button>
                  </motion.div>
                </CadastroFieldMotion>

                <p className="text-center text-sm text-gray-500">
                  Os campos marcados com <span className="text-red-400">*</span> são obrigatórios
                </p>
              </Form>
            </motion.div>
          </CadastroFundadorContexto>
        </div>
      )}
    </>
  )
}

export default CadastroEmpresa