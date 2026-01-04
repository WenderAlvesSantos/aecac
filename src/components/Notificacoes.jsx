import { useState, useEffect } from 'react'
import { Badge, Popover, List, Button, Space, Typography, Empty } from 'antd'
import { BellOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons'
import { getNotificacoes, marcarNotificacaoLida, deletarNotificacao, marcarTodasNotificacoesLidas } from '../lib/api'
import dayjs from 'dayjs'

const { Text } = Typography

const Notificacoes = () => {
  const [notificacoes, setNotificacoes] = useState([])
  const [loading, setLoading] = useState(false)
  const associadoToken = localStorage.getItem('associadoToken')

  useEffect(() => {
    if (associadoToken) {
      loadNotificacoes()
      // Atualizar notificações a cada 30 segundos
      const interval = setInterval(loadNotificacoes, 30000)
      return () => clearInterval(interval)
    }
  }, [associadoToken])

  const loadNotificacoes = async () => {
    if (!associadoToken) return
    
    setLoading(true)
    try {
      const response = await getNotificacoes()
      setNotificacoes(response.data)
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarcarLida = async (id) => {
    try {
      await marcarNotificacaoLida(id, true)
      loadNotificacoes()
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
    }
  }

  const handleDeletar = async (id) => {
    try {
      await deletarNotificacao(id)
      loadNotificacoes()
    } catch (error) {
      console.error('Erro ao deletar notificação:', error)
    }
  }

  const handleMarcarTodasLidas = async () => {
    try {
      await marcarTodasNotificacoesLidas()
      loadNotificacoes()
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  const naoLidas = notificacoes.filter(n => !n.lida).length

  const getTipoColor = (tipo) => {
    const colors = {
      beneficio: 'green',
      capacitacao: 'blue',
      evento: 'purple',
      geral: 'default',
    }
    return colors[tipo] || 'default'
  }

  const content = (
    <div style={{ width: 350, maxHeight: 400, overflowY: 'auto' }}>
      <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong>Notificações</Text>
        {naoLidas > 0 && (
          <Button type="link" size="small" onClick={handleMarcarTodasLidas}>
            Marcar todas como lidas
          </Button>
        )}
      </div>
      {notificacoes.length === 0 ? (
        <Empty description="Nenhuma notificação" style={{ padding: '24px 0' }} />
      ) : (
        <List
          dataSource={notificacoes}
          loading={loading}
          renderItem={(item) => (
            <List.Item
              style={{
                backgroundColor: item.lida ? '#fff' : '#f0f7ff',
                padding: '12px',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Text strong={!item.lida}>{item.titulo}</Text>
                    <span style={{ fontSize: '10px', color: '#8c8c8c' }}>
                      {dayjs(item.createdAt).format('DD/MM HH:mm')}
                    </span>
                  </Space>
                }
                description={
                  <div>
                    <Text type={item.lida ? 'secondary' : 'default'}>{item.mensagem}</Text>
                    {item.link && (
                      <div style={{ marginTop: '8px' }}>
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                          Ver mais →
                        </a>
                      </div>
                    )}
                    <div style={{ marginTop: '8px' }}>
                      <Space>
                        {!item.lida && (
                          <Button
                            type="link"
                            size="small"
                            icon={<CheckOutlined />}
                            onClick={() => handleMarcarLida(item._id)}
                          >
                            Marcar como lida
                          </Button>
                        )}
                        <Button
                          type="link"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeletar(item._id)}
                        >
                          Deletar
                        </Button>
                      </Space>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  )

  if (!associadoToken) return null

  return (
    <Popover content={content} title={null} trigger="click" placement="bottomRight">
      <Badge count={naoLidas} size="small">
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: '20px' }} />}
          style={{ color: '#fff' }}
        />
      </Badge>
    </Popover>
  )
}

export default Notificacoes

