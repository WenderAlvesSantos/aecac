import { useState, useEffect } from 'react'
import { Form, Input, Button, message, Card } from 'antd'
import { getSobre, updateSobre } from '../../lib/api'

const { TextArea } = Input

const SobreAdmin = () => {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadSobre()
  }, [])

  const loadSobre = async () => {
    setLoading(true)
    try {
      const response = await getSobre()
      form.setFieldsValue(response.data)
    } catch (error) {
      message.error('Erro ao carregar informações')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      await updateSobre(values)
      message.success('Informações atualizadas com sucesso')
    } catch (error) {
      message.error('Erro ao atualizar informações')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Gerenciar Página Sobre</h2>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="historia"
            label="História"
          >
            <TextArea rows={6} placeholder="Texto sobre a história da associação..." />
          </Form.Item>

          <Form.Item
            name="missao"
            label="Missão"
          >
            <TextArea rows={4} placeholder="Texto sobre a missão da associação..." />
          </Form.Item>

          <Form.Item
            name="visao"
            label="Visão"
          >
            <TextArea rows={4} placeholder="Texto sobre a visão da associação..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Salvar Alterações
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card style={{ marginTop: '24px' }}>
        <h3>Nota</h3>
        <p style={{ color: '#666' }}>
          Os valores e objetivos podem ser gerenciados através de edição direta no banco de dados
          ou podem ser adicionados como campos adicionais nesta interface no futuro.
        </p>
      </Card>
    </div>
  )
}

export default SobreAdmin

