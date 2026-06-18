import { message } from 'antd'

export function buildEventoInscricaoUrl(eventoId) {
  if (!eventoId) return ''
  const id =
    typeof eventoId === 'object' && eventoId.toString
      ? eventoId.toString()
      : String(eventoId)
  return `${window.location.origin}/eventos?inscrever=${encodeURIComponent(id)}`
}

export async function copyEventoInscricaoLink(eventoId) {
  const url = buildEventoInscricaoUrl(eventoId)
  if (!url) {
    message.error('Não foi possível gerar o link de inscrição.')
    return
  }

  try {
    await navigator.clipboard.writeText(url)
    message.success('Link de inscrição copiado!')
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = url
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    message.success('Link de inscrição copiado!')
  }
}
