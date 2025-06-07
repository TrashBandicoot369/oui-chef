'use client'

import { useState, useEffect } from 'react'

// Default colors matching tailwind config
const defaultColors = {
  primary1: '#F13F27',
  primary2: '#FFF042', 
  primary3: '#FFD230',
  accent1: '#6C1234',
  accent2: '#F56F4C',
  stroke: '#F13F27'
}

export default function ColorManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [colors, setColors] = useState(defaultColors)

  useEffect(() => {
    // Load saved colors on mount
    const saved = localStorage.getItem('chef-colors')
    if (saved) {
      try {
        const parsedColors = JSON.parse(saved)
        setColors(parsedColors)
        applyColors(parsedColors)
      } catch (e) {
        applyColors(defaultColors)
      }
    } else {
      applyColors(defaultColors)
    }
  }, [])

  const applyColors = (newColors: typeof colors) => {
    // ONLY set CSS root variables - let Tailwind handle the rest
    const root = document.documentElement
    root.style.setProperty('--color-primary1', newColors.primary1)
    root.style.setProperty('--color-primary2', newColors.primary2)
    root.style.setProperty('--color-primary3', newColors.primary3)
    root.style.setProperty('--color-accent1', newColors.accent1)
    root.style.setProperty('--color-accent2', newColors.accent2)
    root.style.setProperty('--color-stroke', newColors.stroke)
    
    // Save to localStorage
    localStorage.setItem('chef-colors', JSON.stringify(newColors))
  }

  const updateColor = (key: keyof typeof colors, value: string) => {
    const newColors = { ...colors, [key]: value }
    setColors(newColors)
    applyColors(newColors)
  }

  const resetColors = () => {
    setColors(defaultColors)
    applyColors(defaultColors)
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {isOpen && (
        <div className="mb-4 bg-white rounded-lg shadow-lg border p-4 w-72">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-sm">Colors</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400">✕</button>
          </div>
          
          <div className="space-y-2">
            {Object.entries(colors).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => updateColor(key as keyof typeof colors, e.target.value)}
                  className="w-6 h-6 rounded border"
                />
                <span className="text-xs font-mono flex-1">{key}</span>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateColor(key as keyof typeof colors, e.target.value)}
                  className="w-16 text-xs p-1 border rounded font-mono"
                />
              </div>
            ))}
          </div>
          
          <button
            onClick={resetColors}
            className="w-full mt-3 text-xs py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            Reset
          </button>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white px-3 py-2 rounded-full shadow text-sm"
      >
        🎨
      </button>
    </div>
  )
} 