import { useState } from 'react'

const Logo = ({ 
  height = '50px', 
  width = 'auto', 
  style = {},
  showText = true,
  textColor = '#1890ff',
  invert = false,
  ...props 
}) => {
  const [imageError, setImageError] = useState(false)

  const imageStyle = {
    height,
    width,
    objectFit: 'contain',
    backgroundColor: 'transparent',
    ...(invert && { filter: 'brightness(0) invert(1)' }),
    ...style,
  }

  if (imageError && showText) {
    return (
      <div
        style={{
          fontSize: height.replace('px', '') * 0.5 + 'px',
          fontWeight: 'bold',
          color: textColor,
          ...style,
        }}
        {...props}
      >
        AECAC
      </div>
    )
  }

  return (
    <img
      src="/assets/logo-aecac.png"
      alt="AECAC Logo"
      style={imageStyle}
      onError={() => setImageError(true)}
      {...props}
    />
  )
}

export default Logo

