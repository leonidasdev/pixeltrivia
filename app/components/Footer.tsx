/**
 * Shared Footer Component
 *
 * Displays consistent copyright line and optional keyboard hint text
 * across all game pages, eliminating duplicated footer markup.
 *
 * @module app/components/Footer
 * @since 1.3.0
 */

interface FooterProps {
  /** Optional keyboard hint or tip text displayed above the copyright */
  hint?: string
  /** Extra CSS classes for the footer element */
  className?: string
}

export default function Footer({ hint, className = '' }: FooterProps) {
  return (
    <footer className={`text-center text-gray-400 text-sm ${className}`}>
      {hint && <p>{hint}</p>}
      <p className="font-pixel text-[8px] mt-1 opacity-75">&copy; 2026 PixelTrivia</p>
    </footer>
  )
}
