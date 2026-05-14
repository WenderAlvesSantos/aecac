import { Spin } from 'antd'

/** Loading full-width para páginas públicas (fundo escuro). */
export function PublicLoading({ label }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 bg-black py-24 text-zinc-400">
      <Spin size="large" />
      {label ? <p className="text-sm">{label}</p> : null}
    </div>
  )
}
