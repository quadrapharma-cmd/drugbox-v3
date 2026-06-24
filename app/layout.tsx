import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/lib/i18n/LanguageProvider'

export const metadata: Metadata = {
  title: 'Drugbox — Pharma Professional Network',
  description:
    'The professional network for the pharmaceutical, cosmetics, and medical device industries across Egypt, the GCC, and Africa.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}
