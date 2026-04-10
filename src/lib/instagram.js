/**
 * Extrai o nome de usuário do Instagram para exibição no formulário (sem @; o prefixo fica no Input).
 * Aceita URL armazenada ou texto legado.
 */
export function instagramHandleForForm(stored) {
  if (!stored || typeof stored !== 'string') return ''
  const s = stored.trim()
  if (!s) return ''
  const urlMatch = s.match(/instagram\.com\/([^/?#]+)/i)
  if (urlMatch) {
    return urlMatch[1].replace(/^@/, '')
  }
  return s.replace(/^@/, '')
}

/** Remove @ inicial e caracteres inválidos durante a digitação. */
export function normalizeInstagramInput(value) {
  if (value == null) return ''
  return String(value)
    .trim()
    .replace(/^@+/, '')
    .replace(/[^a-zA-Z0-9._-]/g, '')
}

/** Valor persistido no banco (URL), conforme convenção do produto. */
export function instagramHandleToStoredUrl(handle) {
  const h = normalizeInstagramInput(handle)
  if (!h) return ''
  return `http://Instagram.com/${h}`
}
