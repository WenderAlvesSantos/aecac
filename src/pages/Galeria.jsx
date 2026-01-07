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

  const handleImageClick = (image) => {
    setSelectedImage(image)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedImage(null)
  }

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div style={{ background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      {/* Header Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a237e 0%, #1565c0 50%, #00c853 100%)',
          color: '#fff',
          padding: window.innerWidth < 768 ? '50px 16px' : '100px 24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative elements */}
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
          <Title level={1} style={{ color: '#fff', marginBottom: '16px', fontSize: window.innerWidth < 768 ? '32px' : '42px', fontWeight: 'bold', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            Galeria
          </Title>
          <Paragraph
            style={{
              color: 'rgba(255,255,255,0.95)',
              fontSize: window.innerWidth < 768 ? '16px' : '20px',
              lineHeight: '1.8',
            }}
          >
            Confira os momentos marcantes dos nossos eventos e atividades
          </Paragraph>
        </div>
      </div>

      {/* Galeria de Imagens */}
      <div style={{ padding: window.innerWidth < 768 ? '32px 16px' : '64px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {images.length === 0 ? (
            <Empty description="Nenhuma imagem disponível" />
          ) : (
            <Row gutter={[16, 16]}>
              {images.map((image, index) => (
                <Col xs={24} sm={12} md={8} key={image._id || image.id}>
                  <div
                  style={{
                    position: 'relative',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    border: '1px solid #e0e0e0',
                    opacity: 0,
                    transform: 'translateY(30px)',
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.03)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
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
                    <EyeOutlined style={{ fontSize: '20px', color: '#1565c0' }} />
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
        width={window.innerWidth < 768 ? '95%' : 800}
        centered
      >
        {selectedImage && (
          <div>
            <Image
              src={selectedImage.url}
              alt={selectedImage.title || 'Imagem'}
              style={{ width: '100%', marginBottom: '20px', borderRadius: '8px' }}
            />
            <Title level={4} style={{ color: '#1a237e', marginBottom: '12px', fontSize: '22px', fontWeight: 'bold' }}>{selectedImage.title}</Title>
            {selectedImage.description && (
              <Paragraph style={{ color: '#666', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
                {selectedImage.description}
              </Paragraph>
            )}
          </div>
        )}
      </Modal>
    </div>
    </>
  )
}

export default Galeria

