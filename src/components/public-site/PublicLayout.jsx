import { ConfigProvider, theme } from 'antd'
import { ScrollToTop } from './ScrollToTop'
import { BackToTop } from './BackToTop'
import { PublicHeader } from './PublicHeader'
import { PublicFooter } from './PublicFooter'

const publicDarkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorBgBase: '#000000',
    colorBgContainer: 'rgba(255, 255, 255, 0.06)',
    colorBgElevated: 'rgba(255, 255, 255, 0.08)',
    colorBorder: 'rgba(255, 255, 255, 0.12)',
    colorBorderSecondary: 'rgba(255, 255, 255, 0.08)',
    colorText: 'rgba(255, 255, 255, 0.92)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.55)',
    colorTextTertiary: 'rgba(255, 255, 255, 0.45)',
    borderRadiusLG: 16,
  },
}

export default function PublicLayout({ children, bare = false }) {
  return (
    <div className="public-marketing min-h-screen bg-black text-white">
      <ScrollToTop />
      {!bare && <PublicHeader />}
      <main className={bare ? 'relative flex min-h-screen items-center' : 'relative pt-24'}>
        <div className="pointer-events-none fixed inset-0 -z-10 bg-black" aria-hidden />
        <div
          className="pointer-events-none fixed inset-0 -z-10 opacity-[0.55]"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(91, 155, 213, 0.28), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(30, 77, 123, 0.22), transparent), radial-gradient(ellipse 50% 50% at 0% 80%, rgba(108, 181, 65, 0.14), transparent)',
          }}
          aria-hidden
        />
        <ConfigProvider theme={publicDarkTheme}>
          <div className={bare ? 'w-full' : undefined}>{children}</div>
        </ConfigProvider>
      </main>
      {!bare && <PublicFooter />}
      {!bare && <BackToTop />}
    </div>
  )
}
