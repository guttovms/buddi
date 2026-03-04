import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Buddi — Orçamentos Profissionais em Minutos',
  description:
    'Crie orçamentos profissionais em PDF direto do celular. Envie por WhatsApp e feche mais negócios.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geist.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
