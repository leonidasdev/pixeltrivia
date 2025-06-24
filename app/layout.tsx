/**
 * PixelTrivia Layout Component
 * 
 * Enhanced navigation layout featuring:
 * 🪧 PixelTrivia Logo: Always visible (except during gameplay), clickable to return to main menu
 * ↩️ Back Button: Context-aware navigation using router.back() 
 * 🆘 Help Button: Smart context-sensitive help system with modal tabs
 * 
 * Navigation hides during active gameplay (/play routes) to avoid UI clutter.
 * Layout uses flexbox for responsive positioning and pixel-art theming.
 */
import type { Metadata } from 'next'
import './globals.css'
import MainMenuLogo from './components/MainMenuLogo'
import BackButton from './components/BackButton'
import { HelpButton, HelpProvider } from './components/Help'

export const metadata: Metadata = {
  title: 'PixelTrivia - Retro Trivia Game',
  description: 'A pixel-perfect trivia game experience',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {  return (
    <html lang="en">
      <body className="font-pixel bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen">
        <HelpProvider>
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
          {children}
        </HelpProvider>
      </body>
    </html>
  )
}
