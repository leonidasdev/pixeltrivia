/**
 * Confetti Effect Component
 *
 * Canvas-based pixel confetti burst for celebrations.
 * Renders falling pixel-art confetti particles with rotation and gravity.
 *
 * @module app/components/ui/PixelConfetti
 * @since 1.1.0
 */

'use client'

import React, { useEffect, useRef, useCallback } from 'react'

// ============================================================================
// Types
// ============================================================================

export interface PixelConfettiProps {
  /** Whether confetti is active */
  active: boolean
  /** Number of particles */
  particleCount?: number
  /** Duration in ms before auto-cleanup */
  duration?: number
  /** Confetti color palette */
  colors?: string[]
  /** Callback when animation completes */
  onComplete?: () => void
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rotation: number
  rotationSpeed: number
  gravity: number
  opacity: number
  decay: number
}

// ============================================================================
// Default Colors (pixel-art palette)
// ============================================================================

const DEFAULT_COLORS = [
  '#FF004D', // red
  '#FFEC27', // yellow
  '#00E436', // green
  '#29ADFF', // blue
  '#FF77A8', // pink
  '#FFA300', // orange
  '#7E2553', // purple
  '#83769C', // lavender
  '#00B543', // lime
  '#FF6C24', // dark orange
]

// ============================================================================
// Component
// ============================================================================

export function PixelConfetti({
  active,
  particleCount = 80,
  duration = 3000,
  colors = DEFAULT_COLORS,
  onComplete,
}: PixelConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)

  const createParticles = useCallback(
    (canvas: HTMLCanvasElement) => {
      const particles: Particle[] = []
      const centerX = canvas.width / 2
      const centerY = canvas.height * 0.3

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5)
        const speed = 3 + Math.random() * 8

        particles.push({
          x: centerX + (Math.random() - 0.5) * 100,
          y: centerY + (Math.random() - 0.5) * 50,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 4,
          size: 4 + Math.floor(Math.random() * 6),
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 15,
          gravity: 0.15 + Math.random() * 0.1,
          opacity: 1,
          decay: 0.003 + Math.random() * 0.005,
        })
      }

      return particles
    },
    [particleCount, colors]
  )

  const animate = useCallback(
    (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      const elapsed = Date.now() - startTimeRef.current

      if (elapsed > duration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        onComplete?.()
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      let aliveCount = 0

      for (const p of particlesRef.current) {
        if (p.opacity <= 0) continue

        aliveCount++
        p.x += p.vx
        p.vy += p.gravity
        p.y += p.vy
        p.vx *= 0.99 // air resistance
        p.rotation += p.rotationSpeed
        p.opacity -= p.decay

        if (p.opacity <= 0) continue

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = Math.max(0, p.opacity)
        ctx.fillStyle = p.color

        // Draw a pixel-style square (no anti-aliasing look)
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)

        // Pixel highlight
        ctx.fillStyle = 'rgba(255,255,255,0.4)'
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size / 2, p.size / 2)

        ctx.restore()
      }

      if (aliveCount > 0) {
        animationRef.current = requestAnimationFrame(() => animate(canvas, ctx))
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        onComplete?.()
      }
    },
    [duration, onComplete]
  )

  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Size canvas to viewport
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Turn off image smoothing for pixelated look
    ctx.imageSmoothingEnabled = false

    startTimeRef.current = Date.now()
    particlesRef.current = createParticles(canvas)
    animationRef.current = requestAnimationFrame(() => animate(canvas, ctx))

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [active, createParticles, animate])

  if (!active) return null

  return (
    <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" aria-hidden="true" />
  )
}
