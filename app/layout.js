import './globals.css'

export const metadata = {
  metadataBase: new URL('https://app.wmediator.trinos.group'),
  title: 'Wing Mediator — AI-Powered Mediation Training',
  description: 'AI 기반 실전 조정 역량 훈련 시스템 by Trinos',
  icons: {
    icon: '/favicon-32.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Wing Mediator — AI-Powered Mediation Training',
    description: '10가지 실전 시나리오로 조정 역량을 비약적으로 향상시키세요. Powered by Trinos.',
    images: [{ url: '/images/og-image.png', width: 1200, height: 630, alt: 'Wing Mediator' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wing Mediator — AI-Powered Mediation Training',
    description: '10가지 실전 시나리오로 조정 역량을 비약적으로 향상시키세요.',
    images: ['/images/og-image.png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-gray-900 min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
