import { useState, useEffect } from 'react'
import { Layout, Card, Form, Input, Select, Button, Upload, message, Typography, Space, Spin } from 'antd'
import {
  ShopOutlined,
  UploadOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { updateEmpresa, buscarCNPJ, buscarCEP } from '../../lib/api'
import api from '../../lib/api'

const { Content } = Layout
const { Title } = Typography
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

const EditarEmpresa = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [empresa, setEmpresa] = useState(null)
  const [buscandoCNPJ, setBuscandoCNPJ] = useState(false)
  const [buscandoCEP, setBuscandoCEP] = useState(false)

  const associado = JSON.parse(localStorage.getItem('associado') || '{}')

  useEffect(() => {
    loadEmpresa()
  }, [])

  const loadEmpresa = async () => {
    try {
      setLoading(true)
      if (!associado.empresaId) {
        message.error('Você não está vinculado a uma empresa')
        navigate('/associado')
        return
      }

      // Buscar empresa pelo ID diretamente
      const response = await api.get(`/empresas/${associado.empresaId}`)
      const minhaEmpresa = response.data
      
      if (!minhaEmpresa) {
        message.error('Empresa não encontrada')
        navigate('/associado')
        return
      }

      setEmpresa(minhaEmpresa)

      // Preparar imagem para o Upload
      let imagemFileList = []
      if (minhaEmpresa.imagem) {
        imagemFileList = [{
          uid: '-1',
          name: 'imagem.jpg',
          status: 'done',
          url: minhaEmpresa.imagem,
          thumbUrl: minhaEmpresa.imagem,
        }]
      }

      // Formatar campos ao carregar
      const empresaData = { ...minhaEmpresa }
      if (empresaData.telefone) {
        empresaData.telefone = formatPhone(empresaData.telefone)
      }
      if (empresaData.whatsapp) {
        empresaData.whatsapp = formatPhone(empresaData.whatsapp)
      }
      if (empresaData.cnpj) {
        empresaData.cnpj = formatCNPJ(empresaData.cnpj)
      }
      if (empresaData.cep) {
        empresaData.cep = formatCEP(empresaData.cep)
      }

      form.setFieldsValue({
        ...empresaData,
        imagemFile: imagemFileList,
      })
    } catch (error) {
      console.error('Erro ao carregar empresa:', error)
      message.error('Erro ao carregar dados da empresa')
    } finally {
      setLoading(false)
    }
  }

  const compressImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.75) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new window.Image()
        img.src = event.target.result
        
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width = width * ratio
            height = height * ratio
          }
          
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
          resolve(compressedBase64)
        }
        
        img.onerror = reject
      }
      reader.onerror = reject
    })
  }

  const convertImageToBase64 = (file) => {
    if (file.type === 'image/png' || file.size > 500000) {
      return compressImage(file, 1200, 1200, 0.75)
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
    })
  }

  const handleSubmit = async (values) => {
    try {
      setSaving(true)

      const formData = { ...values }

      // Processar imagem se houver upload
      if (values.imagemFile && values.imagemFile.length > 0) {
        const file = values.imagemFile[0]
        
        if (file.originFileObj) {
          // Nova imagem enviada
          const base64 = await convertImageToBase64(file.originFileObj)
          formData.imagem = base64
        } else if (file.url) {
          // Imagem existente (não alterada)
          formData.imagem = file.url
        }
      } else {
        // Sem imagem no formulário - manter a existente ou remover
        formData.imagem = empresa?.imagem || null
      }

      delete formData.imagemFile

      // Limpar formatação de CNPJ e CEP
      if (formData.cnpj) {
        formData.cnpj = formData.cnpj.replace(/\D/g, '')
      }
      if (formData.cep) {
        formData.cep = formData.cep.replace(/\D/g, '')
      }

      await updateEmpresa(associado.empresaId, formData)
      message.success('Dados da empresa atualizados com sucesso!')
      navigate('/associado')
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error)
      message.error(error.response?.data?.error || 'Erro ao atualizar dados da empresa')
    } finally {
      setSaving(false)
    }
  }

  const buscarDadosCNPJ = async (cnpj) => {
    const cnpjLimpo = cnpj.replace(/\D/g, '')
    if (cnpjLimpo.length !== 14) return

    setBuscandoCNPJ(true)
    try {
      const response = await buscarCNPJ(cnpjLimpo)
      const data = response.data

      form.setFieldsValue({
        nome: data.nome || form.getFieldValue('nome'),
        email: data.email || form.getFieldValue('email'),
        endereco: data.logradouro 
          ? `${data.logradouro}${data.numero ? ', ' + data.numero : ''}${data.bairro ? ' - ' + data.bairro : ''}`
          : form.getFieldValue('endereco'),
        cep: data.cep ? formatCEP(data.cep) : form.getFieldValue('cep'),
      })
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error)
    } finally {
      setBuscandoCNPJ(false)
    }
  }

  const buscarDadosCEP = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return

    setBuscandoCEP(true)
    try {
      const response = await buscarCEP(cepLimpo)
      const data = response.data

      if (data.erro) return

      const enderecoAtual = form.getFieldValue('endereco') || ''
      const enderecoCompleto = data.logradouro 
        ? `${data.logradouro}${enderecoAtual ? ', ' + enderecoAtual : ''} - ${data.bairro || ''}, ${data.localidade || ''} - ${data.uf || ''}`
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

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Content style={{ padding: '100px', textAlign: 'center' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    )
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <Card>
          <Space style={{ marginBottom: '24px' }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/associado')}>
              Voltar
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              <ShopOutlined /> Alteração Cadastral
            </Title>
          </Space>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
          >
            <Form.Item
              name="cnpj"
              label="CNPJ"
              normalize={(value) => formatCNPJ(value)}
            >
              <Input
                placeholder="00.000.000/0000-00"
                maxLength={18}
                disabled
                style={{ background: '#f5f5f5' }}
              />
            </Form.Item>

            <Form.Item
              name="nome"
              label="Nome da Empresa"
            >
              <Input disabled style={{ background: '#f5f5f5' }} />
            </Form.Item>

            <Form.Item
              name="categoria"
              label="Categoria"
            >
              <Select disabled style={{ background: '#f5f5f5' }}>
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
              name="responsavel"
              label="Nome do Responsável"
              rules={[{ required: true, message: 'Campo obrigatório' }]}
            >
              <Input placeholder="Nome completo do responsável" />
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
              normalize={(value) => formatPhone(value)}
            >
              <Input placeholder="(61) 99999-9999" maxLength={15} />
            </Form.Item>

            <Form.Item
              name="whatsapp"
              label="WhatsApp"
              normalize={(value) => formatPhone(value)}
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
                if (formatted.replace(/\D/g, '').length === 8) {
                  buscarDadosCEP(formatted)
                }
                return formatted
              }}
            >
              <Input
                placeholder="00000-000"
                maxLength={9}
                loading={buscandoCEP}
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
              name="imagemFile"
              label="Imagem da Fachada"
              valuePropName="fileList"
              getValueFromEvent={(e) => {
                if (Array.isArray(e)) return e.slice(0, 1)
                if (e?.fileList) return e.fileList.slice(0, 1)
                return []
              }}
            >
              <Upload
                listType="picture-card"
                maxCount={1}
                beforeUpload={() => false}
                accept="image/*"
              >
                {(form.getFieldValue('imagemFile')?.length || 0) >= 1 ? null : (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
            <div style={{ marginTop: -16, marginBottom: 16, fontSize: '12px', color: '#666' }}>
              Tamanho máximo: 5MB. Formatos: JPG, PNG, GIF, WebP. Apenas 1 imagem.
            </div>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving} size="large">
                  Salvar Alterações
                </Button>
                <Button onClick={() => navigate('/associado')} size="large">
                  Cancelar
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  )
}

export default EditarEmpresa

