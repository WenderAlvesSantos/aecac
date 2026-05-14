import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'

function getCoordinates(e, canvas) {
  const rect = canvas.getBoundingClientRect()
  if ('touches' in e && e.touches.length) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top,
    }
  }
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  }
}

function isCanvasBlank(canvas) {
  if (!canvas) return true
  const ctx = canvas.getContext('2d')
  if (!ctx) return true
  const { width, height } = canvas
  const { data } = ctx.getImageData(0, 0, width, height)
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    if (a < 250) return false
    if (r < 250 || g < 250 || b < 250) return false
  }
  return true
}

function trim(v) {
  return typeof v === 'string' ? v.trim() : ''
}

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {object|null} props.dados
 * @param {() => void} props.onDismiss
 * @param {(payload: { cartaAdesao: object, assinaturaDataUrl: string }) => Promise<void>} props.onConfirmAndSubmit
 * @param {boolean} [props.submitting]
 */
export function CartaAdesaoModal({ open, dados, onDismiss, onConfirmAndSubmit, submitting = false }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [cartaData, setCartaData] = useState({
    rg: '',
    cpf: '',
    dia: '',
    mes: '',
    ano: '',
  })
  const [erroLocal, setErroLocal] = useState('')

  useEffect(() => {
    if (!open || !dados) return
    const hoje = new Date()
    const dia = hoje.getDate().toString().padStart(2, '0')
    const meses = [
      'janeiro',
      'fevereiro',
      'março',
      'abril',
      'maio',
      'junho',
      'julho',
      'agosto',
      'setembro',
      'outubro',
      'novembro',
      'dezembro',
    ]
    const mes = meses[hoje.getMonth()]
    const ano = hoje.getFullYear().toString().slice(-2)
    setCartaData((prev) => ({ ...prev, dia, mes, ano }))
    setErroLocal('')
  }, [open, dados])

  const startDrawing = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    setIsDrawing(true)
    const coords = getCoordinates(e, canvas)
    ctx.beginPath()
    ctx.moveTo(coords.x, coords.y)
    e.preventDefault()
  }

  const draw = (e) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const coords = getCoordinates(e, canvas)
    ctx.lineTo(coords.x, coords.y)
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.stroke()
    e.preventDefault()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  useEffect(() => {
    if (!open) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [open, dados])

  const handleClose = () => {
    setCartaData({ rg: '', cpf: '', dia: '', mes: '', ano: '' })
    clearSignature()
    setErroLocal('')
    onDismiss()
  }

  const validar = useCallback(() => {
    const dia = trim(cartaData.dia)
    const mes = trim(cartaData.mes)
    const ano = trim(cartaData.ano)
    const rg = trim(cartaData.rg)
    const cpf = trim(cartaData.cpf).replace(/\D/g, '')

    if (!dia || !/^\d{1,2}$/.test(dia)) return 'Informe o dia da data (cartão superior da carta).'
    if (!mes || mes.length < 3) return 'Informe o mês por extenso na carta.'
    if (!ano || !/^\d{2}$/.test(ano)) return 'Informe os dois dígitos do ano (ex.: 26).'
    if (!rg || rg.length < 3) return 'RG é obrigatório.'
    if (!cpf || cpf.length !== 11) return 'CPF deve conter 11 dígitos.'
    if (!dados?.email?.trim()) return 'O cadastro deve incluir e-mail da empresa (volte e preencha o formulário).'
    const canvas = canvasRef.current
    if (!canvas || isCanvasBlank(canvas)) return 'Assine no campo de assinatura antes de confirmar.'
    return ''
  }, [cartaData, dados])

  const handleConfirm = async () => {
    const msg = validar()
    if (msg) {
      setErroLocal(msg)
      return
    }
    setErroLocal('')
    const canvas = canvasRef.current
    const assinaturaDataUrl = canvas ? canvas.toDataURL('image/png') : ''
    const cpfDigits = trim(cartaData.cpf).replace(/\D/g, '')
    try {
      await onConfirmAndSubmit({
        cartaAdesao: {
          rg: trim(cartaData.rg),
          cpf: cpfDigits,
          dia: trim(cartaData.dia),
          mes: trim(cartaData.mes),
          ano: trim(cartaData.ano),
        },
        assinaturaDataUrl,
      })
    } catch (e) {
      setErroLocal(e?.message || 'Não foi possível concluir o envio. Tente novamente.')
    }
  }

  if (!open || !dados) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-8 lg:p-12">
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-3xl font-bold text-white">Carta de Adesão - AECAC</h2>
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="text-gray-400 hover:text-white transition-colors text-2xl leading-none disabled:opacity-40"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>

          {erroLocal ? (
            <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {erroLocal}
            </div>
          ) : null}

          <div className="bg-white text-black p-8 rounded-xl mb-8 space-y-6 text-sm">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">CARTA DE ADESÃO - AECAC</h3>
              <p className="text-base font-semibold">Associação Empresarial e Comercial de Águas Claras</p>
              <p className="mt-4 flex flex-wrap items-center justify-center gap-2">
                Águas Claras,
                <input
                  type="text"
                  placeholder="__"
                  maxLength={2}
                  className="w-10 border-b border-gray-400 text-center bg-transparent focus:outline-none focus:border-blue-600"
                  value={cartaData.dia}
                  onChange={(e) => setCartaData({ ...cartaData, dia: e.target.value })}
                  disabled={submitting}
                />
                de
                <input
                  type="text"
                  placeholder="______________"
                  className="w-32 border-b border-gray-400 text-center bg-transparent focus:outline-none focus:border-blue-600"
                  value={cartaData.mes}
                  onChange={(e) => setCartaData({ ...cartaData, mes: e.target.value })}
                  disabled={submitting}
                />
                de 20
                <input
                  type="text"
                  placeholder="____"
                  maxLength={2}
                  className="w-12 border-b border-gray-400 text-center bg-transparent focus:outline-none focus:border-blue-600"
                  value={cartaData.ano}
                  onChange={(e) => setCartaData({ ...cartaData, ano: e.target.value })}
                  disabled={submitting}
                />
              </p>
            </div>

            <div className="border-t-2 border-gray-300 pt-4">
              <h4 className="font-bold mb-4 text-base">I. DADOS DO(A) ASSOCIADO(A)</h4>
              <div className="space-y-3">
                <div className="border-b border-gray-300 pb-1">
                  <span className="text-xs text-gray-600">Nome Completo</span>
                  <p className="font-medium">{dados.responsavel || '____________________'}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border-b border-gray-300 pb-1">
                    <span className="text-xs text-gray-600">RG</span>
                    <input
                      type="text"
                      placeholder="____________________"
                      className="w-full font-medium bg-transparent focus:outline-none focus:border-blue-600 border-b border-transparent"
                      value={cartaData.rg}
                      onChange={(e) => setCartaData({ ...cartaData, rg: e.target.value })}
                      disabled={submitting}
                    />
                  </div>
                  <div className="border-b border-gray-300 pb-1">
                    <span className="text-xs text-gray-600">CPF</span>
                    <input
                      type="text"
                      placeholder="____________________"
                      className="w-full font-medium bg-transparent focus:outline-none focus:border-blue-600 border-b border-transparent"
                      value={cartaData.cpf}
                      onChange={(e) => setCartaData({ ...cartaData, cpf: e.target.value })}
                      disabled={submitting}
                    />
                  </div>
                  <div className="border-b border-gray-300 pb-1">
                    <span className="text-xs text-gray-600">Telefone</span>
                    <p className="font-medium">{dados.telefone || '____________________'}</p>
                  </div>
                </div>
                <div className="border-b border-gray-300 pb-1">
                  <span className="text-xs text-gray-600">E-mail</span>
                  <p className="font-medium">{dados.email || '____________________'}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border-b border-gray-300 pb-1">
                    <span className="text-xs text-gray-600">Razão Social da Empresa</span>
                    <p className="font-medium">{dados.empresa || '____________________'}</p>
                  </div>
                  <div className="border-b border-gray-300 pb-1">
                    <span className="text-xs text-gray-600">CNPJ</span>
                    <p className="font-medium">{dados.cnpj || '____________________'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border-b border-gray-300 pb-1">
                    <span className="text-xs text-gray-600">Endereço</span>
                    <p className="font-medium">{dados.endereco || '____________________'}</p>
                  </div>
                  <div className="border-b border-gray-300 pb-1">
                    <span className="text-xs text-gray-600">CEP</span>
                    <p className="font-medium">{dados.cep || '____________________'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-gray-300 pt-4">
              <h4 className="font-bold mb-3 text-base">II. DECLARAÇÃO DE ADESÃO</h4>
              <p className="text-justify leading-relaxed">
                Eu, o(a) representante legal identificado(a) acima, declaro que solicito minha adesão voluntária à AECAC -
                Associação Empresarial e Comercial de Águas Claras, comprometendo-me a respeitar seu estatuto, suas
                finalidades institucionais e as deliberações regularmente aprovadas por seus órgãos competentes.
              </p>
            </div>

            <div className="border-t-2 border-gray-300 pt-4">
              <h4 className="font-bold mb-3 text-base">III. CONDIÇÕES FINANCEIRAS</h4>
              <ol className="list-decimal list-outside ml-5 space-y-2 text-justify leading-relaxed">
                <li>
                  A taxa única de adesão da AECAC corresponde a 20% (vinte por cento) do salário mínimo nacional vigente,
                  devendo ser paga no ato da inscrição pelos associados que não se enquadrarem na regra de isenção para
                  fundadores.
                </li>
                <li>
                  Serão considerados associados fundadores os primeiros associados admitidos na fase de fundação e
                  implantação da AECAC, desde que assim registrados no cadastro da associação ou em documento próprio da
                  coordenação/diretoria.
                </li>
                <li>
                  Os associados fundadores ficarão isentos da taxa única de adesão, como reconhecimento pela participação
                  inicial na constituição e no fortalecimento da AECAC.
                </li>
                <li>
                  A mensalidade dos associados fundadores será equivalente a 6% (seis por cento) do salário mínimo nacional
                  vigente. Para os demais associados, a mensalidade será equivalente a 8% (oito por cento) do salário mínimo
                  nacional vigente.
                </li>
                <li>
                  A primeira mensalidade deverá ser paga no ato da adesão. A partir dela, o vencimento mensal ficará vinculado
                  ao dia da adesão: se o(a) associado(a) aderir no dia 21, por exemplo, as mensalidades seguintes vencerão todo
                  dia 21 de cada mês. Quando o mês não tiver o mesmo dia correspondente, o vencimento ocorrerá no último dia do
                  mês.
                </li>
                <li>
                  Os pagamentos deverão ser realizados preferencialmente por cartão de crédito, ou por outro meio oficialmente
                  informado pela AECAC, com identificação do(a) associado(a) pagador(a).
                </li>
              </ol>
            </div>

            <div className="border-t-2 border-gray-300 pt-4">
              <h4 className="font-bold mb-3 text-base">IV. COMPROMISSOS DO(A) ASSOCIADO(A)</h4>
              <ol className="list-decimal list-outside ml-5 space-y-2 text-justify leading-relaxed">
                <li>
                  Manter seus dados cadastrais atualizados junto à AECAC, informando alterações de contato, endereço, razão
                  social, CNPJ ou representação legal.
                </li>
                <li>
                  Participar, sempre que possível, das reuniões, assembleias, campanhas e demais ações promovidas pela
                  associação.
                </li>
                <li>
                  Atuar de forma colaborativa, ética e respeitosa, contribuindo para o desenvolvimento empresarial e comercial
                  de Águas Claras.
                </li>
                <li>
                  Cumprir as obrigações financeiras assumidas nesta carta de adesão e observar os prazos definidos pela AECAC.
                </li>
              </ol>
            </div>

            <div className="border-t-2 border-gray-300 pt-4">
              <h4 className="font-bold mb-3 text-base">V. INADIMPLÊNCIA</h4>
              <p className="text-justify leading-relaxed">
                O(a) associado(a) que permanecer inadimplente por período superior a 3 (três) meses consecutivos poderá ter sua
                participação suspensa temporariamente ou ser desligado(a) da associação, conforme o estatuto, as normas
                internas e as deliberações aplicáveis da AECAC.
              </p>
            </div>

            <div className="border-t-2 border-gray-300 pt-4">
              <h4 className="font-bold mb-3 text-base">VI. CIÊNCIA E ACEITE</h4>
              <p className="text-justify leading-relaxed mb-4">
                Declaro que li, compreendi e aceito os termos desta carta de adesão, inclusive as regras relativas à taxa de
                adesão, isenção para associados fundadores, mensalidades e vencimentos. Declaro, ainda, que as informações
                prestadas são verdadeiras e autorizo seu uso pela AECAC para fins cadastrais, administrativos e associativos.
              </p>
            </div>

            <div className="border-t-2 border-gray-300 pt-6 mt-6">
              <p className="text-center text-xs text-gray-600">
                A assinatura do(a) associado(a) é recolhida digitalmente na secção seguinte.
              </p>
            </div>

            <div className="mt-8 border-t border-gray-400 pt-6">
              <p className="text-center text-xs italic text-gray-600">
                Observação: os percentuais previstos nesta carta incidem sobre o salário mínimo nacional vigente, observadas as
                atualizações legais e as deliberações validamente aprovadas pela AECAC.
              </p>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-1">Assinatura do(a) Associado(a)</h3>
            <p className="mb-4 text-sm text-gray-300">Assine no campo abaixo com o rato ou o toque no ecrã:</p>
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="w-full max-w-full bg-white rounded-xl cursor-crosshair border-2 border-gray-300 touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            <div className="flex gap-4 mt-4">
              <motion.button
                type="button"
                onClick={clearSignature}
                disabled={submitting}
                className="px-6 py-2 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors disabled:opacity-40"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Limpar assinatura
              </motion.button>
            </div>
            <p className="mt-3 text-center text-sm font-semibold text-white">Assinatura do(a) Associado(a)</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 bg-white/10 border border-white/20 text-white py-4 rounded-xl hover:bg-white/20 transition-colors font-semibold disabled:opacity-40"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Fechar
            </motion.button>
            <motion.button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-[#6cb541] to-[#8fd652] text-white py-4 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              whileHover={!submitting ? { scale: 1.02, boxShadow: '0 10px 40px rgba(108, 181, 65, 0.5)' } : {}}
              whileTap={!submitting ? { scale: 0.98 } : {}}
            >
              {submitting ? 'Enviando…' : 'Confirmar e concluir'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
