import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Space,
  Popconfirm,
  Upload,
  Image,
  Select,
  DatePicker,
  Tag,
  Statistic,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import {
  getBeneficiosAdmin,
  createBeneficio,
  updateBeneficio,
  deleteBeneficio,
  createNotificacao,
} from '../../lib/api'
import dayjs from 'dayjs'

const { TextArea } = Input

const BeneficiosAdmin = () => {
  const [beneficios, setBeneficios] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingBeneficio, setEditingBeneficio] = useState(null)
  const [imagemRemovida, setImagemRemovida] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadBeneficios()
  }, [])

  const loadBeneficios = async () => {
    setLoading(true)
    try {
      const response = await getBeneficiosAdmin()
      setBeneficios(response.data)
    } catch (error) {
      message.error('Erro ao carregar benefícios')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingBeneficio(null)
    setImagemRemovida(false)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (beneficio) => {
    setEditingBeneficio(beneficio)
    setImagemRemovida(false)
    form.setFieldsValue({
      ...beneficio,
      validade: beneficio.validade ? dayjs(beneficio.validade) : null,
    })
    setModalVisible(true)
  }

  const handleRemoverImagem = () => {
    setImagemRemovida(true)
    form.setFieldValue('imagemFile', [])
  }

  const handleDelete = async (id) => {
    try {
      await deleteBeneficio(id)
      message.success('Benefício deletado com sucesso')
      loadBeneficios()
    } catch (error) {
      message.error('Erro ao deletar benefício')
    }
  }

  const handleSubmit = async (values) => {
    try {
      const formData = {
        ...values,
        codigo: values.codigo?.toUpperCase().trim(),
        validade: values.validade ? values.validade.toISOString() : null,
      }

      // Processar imagem se houver
      if (values.imagemFile && values.imagemFile.length > 0) {
        const file = values.imagemFile[0]
        if (file.originFileObj) {
          formData.imagem = await convertImageToBase64(file.originFileObj)
        } else if (file.url || file.thumbUrl) {
          formData.imagem = file.url || file.thumbUrl
        }
      } else if (editingBeneficio && editingBeneficio.imagem && !imagemRemovida) {
        formData.imagem = editingBeneficio.imagem
      }

      delete formData.imagemFile

      if (editingBeneficio) {
        await updateBeneficio(editingBeneficio._id, formData)
        message.success('Benefício atualizado com sucesso')
      } else {
        await createBeneficio(formData)
        message.success('Benefício criado com sucesso')
        
        // Criar notificação para todos os associados
        try {
          await createNotificacao({
            tipo: 'beneficio',
            titulo: 'Novo Benefício Disponível!',
            mensagem: `Um novo benefício foi adicionado: ${formData.titulo}`,
            link: '/beneficios',
          })
        } catch (error) {
          console.error('Erro ao criar notificação:', error)
          // Não falhar o cadastro se a notificação falhar
        }
      }

      setModalVisible(false)
      form.resetFields()
      setImagemRemovida(false)
      loadBeneficios()
    } catch (error) {
      message.error('Erro ao salvar benefício: ' + (error.response?.data?.error || error.message))
    }
  }

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const columns = [
    {
      title: 'Imagem',
      dataIndex: 'imagem',
      key: 'imagem',
      width: 100,
      render: (imagem) =>
        imagem ? (
          <Image src={imagem} alt="Benefício" width={60} height={60} style={{ objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 60, height: 60, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Sem imagem
          </div>
        ),
    },
    {
      title: 'Título',
      dataIndex: 'titulo',
      key: 'titulo',
    },
    {
      title: 'Desconto',
      dataIndex: 'desconto',
      key: 'desconto',
      render: (desconto) => desconto ? `${desconto}%` : '-',
    },
    {
      title: 'Validade',
      dataIndex: 'validade',
      key: 'validade',
      render: (validade) => validade ? new Date(validade).toLocaleDateString('pt-BR') : '-',
    },
    {
      title: 'Status',
      dataIndex: 'ativo',
      key: 'ativo',
      render: (ativo) => (
        <span style={{ color: ativo ? '#52c41a' : '#ff4d4f' }}>
          {ativo ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Editar
          </Button>
          <Popconfirm
            title="Tem certeza que deseja deletar este benefício?"
            onConfirm={() => handleDelete(record._id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Deletar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Gerenciar Benefícios</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Novo Benefício
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={beneficios}
        loading={loading}
        rowKey="_id"
        scroll={{ x: 'max-content' }}
      />

      <Modal
        title={editingBeneficio ? 'Editar Benefício' : 'Novo Benefício'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setEditingBeneficio(null)
        }}
        footer={null}
        width={window.innerWidth < 768 ? '95%' : 600}
        destroyOnHidden={true}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="titulo"
            label="Título"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="descricao"
            label="Descrição"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="codigo"
            label="Código do Benefício"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Input placeholder="Ex: BENEFICIO2024" style={{ textTransform: 'uppercase' }} />
          </Form.Item>

          <Form.Item
            name="quantidade"
            label="Quantidade Disponível"
            tooltip="Deixe vazio para benefício ilimitado"
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Quantidade total" />
          </Form.Item>

          <Form.Item
            name="desconto"
            label="Desconto (%)"
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="condicoes"
            label="Condições"
          >
            <TextArea rows={2} placeholder="Condições para usar o benefício" />
          </Form.Item>

          <Form.Item
            name="validade"
            label="Validade"
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="ativo"
            label="Status"
            initialValue={true}
          >
            <Select>
              <Select.Option value={true}>Ativo</Select.Option>
              <Select.Option value={false}>Inativo</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="imagemFile"
            label="Imagem"
            rules={[
              {
                required: true,
                validator: (_, value) => {
                  const temImagemExistente = editingBeneficio && editingBeneficio.imagem && !imagemRemovida
                  const temArquivo = value && value.length > 0
                  if (temImagemExistente || temArquivo) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Imagem é obrigatória'))
                }
              }
            ]}
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
            {(!editingBeneficio || !editingBeneficio.imagem || imagemRemovida) ? (
              <Upload
                listType="picture-card"
                maxCount={1}
                beforeUpload={() => false}
              >
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            ) : null}
          </Form.Item>

          {editingBeneficio && editingBeneficio.imagem && !imagemRemovida && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '8px' }}>Imagem atual:</div>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Image src={editingBeneficio.imagem} width={200} />
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={handleRemoverImagem}
                  style={{ position: 'absolute', top: '8px', right: '8px' }}
                >
                  Remover
                </Button>
              </div>
            </div>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingBeneficio ? 'Atualizar' : 'Criar'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false)
                form.resetFields()
                setEditingBeneficio(null)
                setImagemRemovida(false)
              }}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default BeneficiosAdmin

