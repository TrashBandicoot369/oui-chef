'use client'

import { useState, useEffect } from 'react'

// Load Google Fonts dynamically
const loadGoogleFont = (fontName: string) => {
  const existingLink = document.querySelector(`link[href*="${encodeURIComponent(fontName)}"]`)
  if (existingLink) return

  const link = document.createElement('link')
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@300;400;500;600;700&display=swap`
  link.rel = 'stylesheet'
  document.head.appendChild(link)
}

// Quick preset combinations
const quickPresets = [
  {
    name: 'Default',
    display: 'Chango',
    sans: 'Roboto',
    button: 'Oswald'
  },
  {
    name: 'Elegant',
    display: 'Playfair Display',
    sans: 'Source Sans Pro',
    button: 'Montserrat'
  },
  {
    name: 'Modern',
    display: 'Inter',
    sans: 'Lato',
    button: 'Poppins'
  },
  {
    name: 'Clean',
    display: 'Helvetica',
    sans: 'Arial',
    button: 'Verdana'
  }
]

export default function FontSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentFonts, setCurrentFonts] = useState({
    display: 'Chango',
    sans: 'Roboto',
    button: 'Oswald'
  })

  // Load saved fonts on mount
  useEffect(() => {
    const saved = localStorage.getItem('chef-fonts')
    if (saved) {
      try {
        const parsedFonts = JSON.parse(saved)
        setCurrentFonts(parsedFonts)
        applyFonts(parsedFonts)
      } catch (e) {
        applyFonts(currentFonts)
      }
    } else {
      applyFonts(currentFonts)
    }
  }, [])

  // Apply fonts by directly setting CSS custom properties
  const applyFonts = (fonts: typeof currentFonts) => {
    // Load Google Fonts for any non-standard font names
    Object.values(fonts).forEach(fontName => {
      if (!['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Impact', 'Courier New'].includes(fontName)) {
        loadGoogleFont(fontName)
      }
    })

    // Set CSS custom properties on the root element
    const root = document.documentElement
    root.style.setProperty('--font-display', `"${fonts.display}", cursive`)
    root.style.setProperty('--font-sans', `"${fonts.sans}", sans-serif`)
    root.style.setProperty('--font-button', `"${fonts.button}", sans-serif`)
    
    // Save to localStorage
    localStorage.setItem('chef-fonts', JSON.stringify(fonts))
  }

  const changeFontCategory = (category: 'display' | 'sans' | 'button', fontName: string) => {
    const newFonts = { ...currentFonts, [category]: fontName }
    setCurrentFonts(newFonts)
    applyFonts(newFonts)
  }

  const applyPreset = (preset: typeof quickPresets[0]) => {
    const newFonts = {
      display: preset.display,
      sans: preset.sans,
      button: preset.button
    }
    setCurrentFonts(newFonts)
    applyFonts(newFonts)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Main Font Picker Panel */}
      {isOpen && (
        <div className="mb-4 bg-white rounded-lg shadow-lg border p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-sm">Font Picker</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Quick Presets */}
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-600 mb-2">Quick Presets:</div>
            <div className="grid grid-cols-2 gap-1">
              {quickPresets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => applyPreset(preset)}
                  className="text-xs p-2 bg-gray-100 rounded hover:bg-primary1 transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Individual Font Inputs */}
          <div className="space-y-4">
            {/* Display Font */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Display Font (Headers, Logo):
              </label>
              <input 
                type="text"
                value={currentFonts.display}
                onChange={(e) => changeFontCategory('display', e.target.value)}
                placeholder="e.g. Playfair Display, Georgia, Impact"
                className="w-full text-xs p-2 border rounded focus:border-primary1 outline-none"
              />
              <div className="mt-1 text-sm font-display">Preview: Aa Chef Alex J</div>
              <div className="text-xs text-gray-500 mt-1">
                Try: Bebas Neue, Oswald, Fredoka One, Righteous
              </div>
            </div>

            {/* Body Font */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Body Font (Paragraphs, Text):
              </label>
              <input 
                type="text"
                value={currentFonts.sans}
                onChange={(e) => changeFontCategory('sans', e.target.value)}
                placeholder="e.g. Inter, Roboto, Open Sans"
                className="w-full text-xs p-2 border rounded focus:border-primary1 outline-none"
              />
              <div className="mt-1 text-sm font-sans">Preview: This is body text for reading</div>
              <div className="text-xs text-gray-500 mt-1">
                Try: Nunito, Source Sans Pro, Lato, Poppins
              </div>
            </div>

            {/* Button Font */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Button Font (CTAs, Buttons):
              </label>
              <input 
                type="text"
                value={currentFonts.button}
                onChange={(e) => changeFontCategory('button', e.target.value)}
                placeholder="e.g. Montserrat, Oswald, Raleway"
                className="w-full text-xs p-2 border rounded focus:border-primary1 outline-none"
              />
              <div className="mt-1 text-sm font-button">Preview: BOOK EVENT</div>
              <div className="text-xs text-gray-500 mt-1">
                Try: Work Sans, Fira Sans, Barlow, Quicksand
              </div>
            </div>
          </div>

          {/* Helper Text */}
          <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
            <div className="font-medium mb-1">💡 How to use:</div>
            <div>• Type any Google Font name (e.g. "Dancing Script")</div>
            <div>• Use web-safe fonts (Arial, Georgia, etc.)</div>
            <div>• Fonts load automatically from Google Fonts</div>
            <div>• Visit <span className="text-blue-600">fonts.google.com</span> to browse</div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-accent1 text-white px-4 py-2 rounded-full shadow-lg hover:bg-accent2 transition-all text-sm font-button mb-2"
        title="Open Font Picker"
      >
        🔤 Pick Fonts
      </button>
      
      {/* Current Font Info */}
      <div className="bg-white rounded-lg shadow-sm p-2 text-xs">
        <div className="font-medium mb-1">Current:</div>
        <div>Display: <span className="font-display">Aa</span></div>
        <div>Body: <span className="font-sans">Aa</span></div>
        <div>Button: <span className="font-button">Aa</span></div>
      </div>
    </div>
  )
} 