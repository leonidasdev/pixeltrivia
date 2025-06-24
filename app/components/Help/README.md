# Help System Components

This directory contains the context-aware help system for PixelTrivia.

## Components

### HelpButton
- Pixel-art styled "?" button in green theme
- Positioned in top-right corner of layout
- Fully accessible with keyboard navigation
- Opens HelpModal when clicked

### HelpModal
- Full-screen modal with backdrop blur
- Tab-based interface for different game modes
- Context-aware tab availability based on user navigation
- Responsive design with pixel-art theming
- Dismissible via Escape key or backdrop click

### HelpContext
- Tracks user's visited routes across the application
- Provides context-aware tab availability
- Automatically unlocks help tabs as user explores different game modes

## Features

✨ **Smart Context Awareness**: Help tabs become available only after users visit corresponding game mode sections

🎮 **Pixel-Art Theming**: Consistent with retro game aesthetic using custom CSS utilities

♿ **Full Accessibility**: Keyboard navigation, ARIA labels, focus management

📱 **Mobile Responsive**: Optimized layout for all screen sizes

🚀 **Performance**: Lazy loading of help content, efficient context tracking

## Usage

The help system is automatically available on all pages via the layout component. No additional setup required for new pages.
