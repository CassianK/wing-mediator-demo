import './globals.css'

export const metadata = {
  title: 'Wing Mediator — AI-Powered Mediation Training',
  description: 'AI 기반 실전 조정 역량 훈련 시스템 by Trinos × KCAB',
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
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-gray-900 min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
