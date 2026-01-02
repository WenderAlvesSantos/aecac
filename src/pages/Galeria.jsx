import { useState, useEffect } from 'react'
import { Row, Col, Typography, Image, Modal, Spin, Empty } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import { getGaleria } from '../lib/api'

const { Title, Paragraph } = Typography

const Galeria = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = async () => {
    try {
      const response = await getGaleria()
      // Ordenar imagens pela ordem salva
      const sortedImages = [...response.data].sort((a, b) => (a.order || 0) - (b.order || 0))
      setImages(sortedImages)
    } catch (error) {
      console.error('Erro ao carregar imagens:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '100px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    )
  }

  // Dados de exemplo - fallback se não houver imagens
  const fallbackImages = [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
      title: 'Evento de Networking 2024',
      description: 'Encontro de empresários realizado em março de 2024',
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      title: 'Workshop de Inovação',
      description: 'Workshop sobre inovação empresarial',
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
      title: 'Reunião de Diretoria',
      description: 'Reunião mensal da diretoria AECAC',
    },
    {
      id: 4,
      url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800',
      title: 'Cerimônia de Premiação',
      description: 'Premiação de empresas destaque do ano',
    },
    {
      id: 5,
      url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800',
      title: 'Feira Comercial',
      description: 'Feira comercial de Águas Claras',
    },
    {
      id: 6,
      url: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800',
      title: 'Palestra de Marketing',
      description: 'Palestra sobre marketing digital para empresas',
    },
    {
      id: 7,
      url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
      title: 'Encontro de Parceiros',
      description: 'Encontro anual de parceiros estratégicos',
    },
    {
      id: 8,
      url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      title: 'Workshop de Gestão',
      description: 'Workshop sobre gestão empresarial',
    },
    {
      id: 9,
      url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
      title: 'Evento de Lançamento',
      description: 'Lançamento de novos projetos da associação',
    },
  ]

  const handleImageClick = (image) => {
    setSelectedImage(image)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedImage(null)
  }

  return (
    <div style={{ background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      {/* Header Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Title level={1} style={{ color: '#fff', marginBottom: '16px' }}>
            Galeria
          </Title>
          <Paragraph
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '18px',
            }}
          >
            Confira os momentos marcantes dos nossos eventos e atividades
          </Paragraph>
        </div>
      </div>

      {/* Galeria de Imagens */}
      <div style={{ padding: '64px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {images.length === 0 ? (
            <Empty description="Nenhuma imagem disponível" />
          ) : (
            <Row gutter={[16, 16]}>
              {images.map((image) => (
                <Col xs={24} sm={12} md={8} key={image._id || image.id}>
                  <div
                  style={{
                    position: 'relative',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                  onClick={() => handleImageClick(image)}
                >
                  <Image
                    src={image.url}
                    alt={image.title || 'Imagem'}
                    style={{
                      width: '100%',
                      height: '300px',
                      objectFit: 'cover',
                    }}
                    preview={false}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                      padding: '16px',
                      color: '#fff',
                    }}
                  >
                    <Title
                      level={5}
                      style={{ color: '#fff', margin: 0, marginBottom: '4px' }}
                    >
                      {image.title}
                    </Title>
                    {image.description && (
                      <Paragraph
                        style={{
                          color: 'rgba(255,255,255,0.9)',
                          margin: 0,
                          fontSize: '12px',
                        }}
                      >
                        {image.description}
                      </Paragraph>
                    )}
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: 'rgba(255,255,255,0.9)',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <EyeOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                  </div>
                </div>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>

      {/* Modal para visualização ampliada */}
      <Modal
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
        centered
      >
        {selectedImage && (
          <div>
            <Image
              src={selectedImage.url}
              alt={selectedImage.title || 'Imagem'}
              style={{ width: '100%', marginBottom: '16px' }}
            />
            <Title level={4}>{selectedImage.title}</Title>
            {selectedImage.description && (
              <Paragraph>{selectedImage.description}</Paragraph>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Galeria

