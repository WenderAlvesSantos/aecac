import { useState } from 'react'

export function ImageWithFallback({ src, alt, className, ...props }) {
  const [imgSrc, setImgSrc] = useState(src)
  const handleError = () => {
    setImgSrc(
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3C/svg%3E'
    )
  }

  return <img src={imgSrc} alt={alt} className={className} onError={handleError} {...props} />
}
