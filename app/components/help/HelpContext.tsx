/**
 * Help Context Provider
 *
 * Tracks visited routes and provides available help tabs
 * based on navigation history.
 *
 * @module app/components/help/HelpContext
 * @since 1.0.0
 */

'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

interface HelpContextType {
  visitedRoutes: string[]
  currentRoute: string
  getAvailableHelpTabs: () => string[]
}

const HelpContext = createContext<HelpContextType | undefined>(undefined)

export const useHelpContext = () => {
  const context = useContext(HelpContext)
  if (context === undefined) {
    throw new Error('useHelpContext must be used within a HelpProvider')
  }
  return context
}

interface HelpProviderProps {
  children: ReactNode
}

export const HelpProvider = ({ children }: HelpProviderProps) => {
  const [visitedRoutes, setVisitedRoutes] = useState<string[]>([])
  const pathname = usePathname()

  // Track visited routes
  useEffect(() => {
    if (!visitedRoutes.includes(pathname)) {
      setVisitedRoutes(prev => [...prev, pathname])
    }
  }, [pathname, visitedRoutes])

  const getAvailableHelpTabs = useCallback((): string[] => {
    const tabs = ['general']

    // Check if user has visited game mode routes
    const hasVisitedQuick = visitedRoutes.some(
      route =>
        route.includes('/game/mode') ||
        route.includes('/game/select') ||
        route.includes('/game/quick')
    )
    const hasVisitedCustom = visitedRoutes.some(
      route =>
        route.includes('/game/create') ||
        route.includes('/game/join') ||
        route.includes('/game/custom')
    )
    const hasVisitedAdvanced = visitedRoutes.some(route => route.includes('/game/advanced'))

    if (hasVisitedQuick) tabs.push('quick')
    if (hasVisitedCustom) tabs.push('custom')
    if (hasVisitedAdvanced) tabs.push('advanced')

    return tabs
  }, [visitedRoutes])

  return (
    <HelpContext.Provider
      value={{
        visitedRoutes,
        currentRoute: pathname,
        getAvailableHelpTabs,
      }}
    >
      {children}
    </HelpContext.Provider>
  )
}
