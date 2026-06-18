import { Input, Button, Tooltip } from 'antd'
import { CopyOutlined, LinkOutlined } from '@ant-design/icons'
import { buildEventoInscricaoUrl, copyEventoInscricaoLink } from '../lib/eventoInscricaoLink'

export function EventoInscricaoLinkField({ eventoId, label = 'Link de inscrição pública' }) {
  if (!eventoId) return null

  const url = buildEventoInscricaoUrl(eventoId)

  return (
    <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
        <LinkOutlined />
        {label}
      </div>
      <Input
        readOnly
        value={url}
        className="!rounded-lg"
        addonAfter={
          <Tooltip title="Copiar link">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => copyEventoInscricaoLink(eventoId)}
            />
          </Tooltip>
        }
      />
      <p className="mb-0 mt-2 text-xs text-gray-500">
        Quem acessar este link verá o formulário de inscrição deste evento.
      </p>
    </div>
  )
}
