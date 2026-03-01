/**
 * Root Layout
 *
 * Application shell providing pixel-art fonts, global styles,
 * navigation (logo, back button, help), and metadata.
 * Navigation hides during active gameplay to reduce clutter.
 *
 * @module app/layout
 * @since 1.0.0
 */
import type { Metadata, Viewport } from 'next'
import { Press_Start_2P, VT323 } from 'next/font/google'
import './globals.css'
import MainMenuLogo from './components/MainMenuLogo'
import BackButton from './components/BackButton'
import { HelpButton, HelpProvider } from './components/help'

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
})

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PixelTrivia - Retro Trivia Game',
  description: 'A pixel-perfect trivia game experience',
  manifest: '/manifest.json',
  themeColor: '#7c3aed',
  appleWebApp: {
    capable: true,
    title: 'PixelTrivia',
    statusBarStyle: 'black-translucent',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${pressStart2P.variable} ${vt323.variable}`}>
      <body className="font-pixel-body bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen">
        <HelpProvider>
          {/* Skip navigation link for keyboard/screen-reader users */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-cyan-600 focus:text-white focus:rounded focus:text-sm focus:font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            Skip to main content
          </a>
          <header className="p-4">
            <div className="flex items-center justify-between w-full">
              {/* Left side: Logo and Back Button */}
              <div className="flex items-center gap-3">
                <MainMenuLogo />
                <BackButton />
              </div>

              {/* Right side: Help Button */}
              <div className="flex items-center">
                <HelpButton />
              </div>
            </div>
          </header>
          <div id="main-content">{children}</div>
        </HelpProvider>
      </body>
    </html>
  )
}
