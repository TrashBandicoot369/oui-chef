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

// Helper function to convert HSL to Hex
const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Helper function to adjust brightness
const adjustBrightness = (hex: string, percent: number) => {
  // Convert hex to RGB
  let r = parseInt(hex.substring(1, 3), 16)
  let g = parseInt(hex.substring(3, 5), 16)
  let b = parseInt(hex.substring(5, 7), 16)

  // Adjust brightness
  r = Math.min(255, Math.max(0, r + (r * percent / 100)))
  g = Math.min(255, Math.max(0, g + (g * percent / 100)))
  b = Math.min(255, Math.max(0, b + (b * percent / 100)))

  // Convert back to hex
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`
}

// Helper function to adjust saturation
const adjustSaturation = (hex: string, percent: number) => {
  // Convert hex to RGB
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);

  // Convert RGB to HSL
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  // Adjust saturation
  s = Math.min(1, Math.max(0, s + (s * percent / 100)));

  // Convert HSL back to RGB
  let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  let p = 2 * l - q;
  function hue2rgb(p: number, q: number, t: number) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }
  r = hue2rgb(p, q, h + 1/3);
  g = hue2rgb(p, q, h);
  b = hue2rgb(p, q, h - 1/3);

  // Convert to hex
  return `#${Math.round(r * 255).toString(16).padStart(2, '0')}${Math.round(g * 255).toString(16).padStart(2, '0')}${Math.round(b * 255).toString(16).padStart(2, '0')}`;
}

// Helper function to calculate contrast ratio
const getContrastRatio = (color1: string, color2: string) => {
  const getLuminance = (hex: string) => {
    const r = parseInt(hex.substring(1, 3), 16) / 255
    const g = parseInt(hex.substring(3, 5), 16) / 255
    const b = parseInt(hex.substring(5, 7), 16) / 255
    
    const srgb = [r, g, b].map(c => 
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    )
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]
  }
  
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  return (brightest + 0.05) / (darkest + 0.05)
}

export default function ColorManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [colors, setColors] = useState(defaultColors)
  const [adjustments, setAdjustments] = useState<Record<keyof typeof colors, { brightness: number; saturation: number }>>(
    Object.keys(defaultColors).reduce((acc, key) => ({
      ...acc,
      [key]: { brightness: 0, saturation: 0 }
    }), {} as any)
  )
  const [groupAdjustments, setGroupAdjustments] = useState({
    primary: { brightness: 0, saturation: 0 },
    accent: { brightness: 0, saturation: 0 }
  })

  useEffect(() => {
    // Load saved colors and adjustments on mount
    const savedColors = localStorage.getItem('chef-colors')
    const savedAdjustments = localStorage.getItem('chef-color-adjustments')
    const savedGroupAdjustments = localStorage.getItem('chef-group-adjustments')
    
    if (savedColors) {
      try {
        const parsedColors = JSON.parse(savedColors)
        setColors(parsedColors)
        applyColors(parsedColors)
      } catch (e) {
        applyColors(defaultColors)
      }
    } else {
      applyColors(defaultColors)
    }
    
    if (savedAdjustments) {
      try {
        setAdjustments(JSON.parse(savedAdjustments))
      } catch (e) {
        // Ignore
      }
    }

    if (savedGroupAdjustments) {
      try {
        setGroupAdjustments(JSON.parse(savedGroupAdjustments))
      } catch (e) {
        // Ignore
      }
    }
  }, [])

  const applyColors = (newColors: typeof colors) => {
    // Apply individual adjustments first, then global adjustments
    const adjustedColors = { ...newColors }
    Object.keys(adjustedColors).forEach(key => {
      const colorKey = key as keyof typeof colors
      const adjustment = adjustments[colorKey]
      let adjusted = adjustedColors[colorKey]
      
      // Apply individual adjustments
      if (adjustment) {
        if (adjustment.saturation !== 0) {
          adjusted = adjustSaturation(adjusted, adjustment.saturation)
        }
        if (adjustment.brightness !== 0) {
          adjusted = adjustBrightness(adjusted, adjustment.brightness)
        }
      }
      
      // Apply group adjustments
      const isPrimary = ['primary1', 'primary2', 'primary3'].includes(key)
      const isAccent = ['accent1', 'accent2', 'stroke'].includes(key)
      
      if (isPrimary) {
        if (groupAdjustments.primary.saturation !== 0) {
          adjusted = adjustSaturation(adjusted, groupAdjustments.primary.saturation)
        }
        if (groupAdjustments.primary.brightness !== 0) {
          adjusted = adjustBrightness(adjusted, groupAdjustments.primary.brightness)
        }
      } else if (isAccent) {
        if (groupAdjustments.accent.saturation !== 0) {
          adjusted = adjustSaturation(adjusted, groupAdjustments.accent.saturation)
        }
        if (groupAdjustments.accent.brightness !== 0) {
          adjusted = adjustBrightness(adjusted, groupAdjustments.accent.brightness)
        }
      }
      
      adjustedColors[colorKey] = adjusted
    })

    // Set CSS root variables
    const root = document.documentElement
    root.style.setProperty('--color-primary1', adjustedColors.primary1)
    root.style.setProperty('--color-primary2', adjustedColors.primary2)
    root.style.setProperty('--color-primary3', adjustedColors.primary3)
    root.style.setProperty('--color-accent1', adjustedColors.accent1)
    root.style.setProperty('--color-accent2', adjustedColors.accent2)
    root.style.setProperty('--color-stroke', adjustedColors.stroke)
    
    // Save to localStorage
    localStorage.setItem('chef-colors', JSON.stringify(newColors))
    localStorage.setItem('chef-color-adjustments', JSON.stringify(adjustments))
    localStorage.setItem('chef-group-adjustments', JSON.stringify(groupAdjustments))
  }

  const updateColor = (key: keyof typeof colors, value: string) => {
    const newColors = { ...colors, [key]: value }
    setColors(newColors)
    applyColors(newColors)
  }

  const updateAdjustment = (key: keyof typeof colors, type: 'brightness' | 'saturation', value: number) => {
    const newAdjustments = {
      ...adjustments,
      [key]: {
        ...adjustments[key],
        [type]: value
      }
    }
    setAdjustments(newAdjustments)
    localStorage.setItem('chef-color-adjustments', JSON.stringify(newAdjustments))
    applyColors(colors) // Reapply colors with new adjustments
  }

  const updateGroupAdjustment = (group: 'primary' | 'accent', type: 'brightness' | 'saturation', value: number) => {
    const newGroupAdjustments = {
      ...groupAdjustments,
      [group]: {
        ...groupAdjustments[group],
        [type]: value
      }
    }
    setGroupAdjustments(newGroupAdjustments)
    localStorage.setItem('chef-group-adjustments', JSON.stringify(newGroupAdjustments))
    applyColors(colors) // Reapply colors with new group adjustments
  }

  const resetColors = () => {
    setColors(defaultColors)
    setAdjustments(Object.keys(defaultColors).reduce((acc, key) => ({
      ...acc,
      [key]: { brightness: 0, saturation: 0 }
    }), {} as any))
    setGroupAdjustments({
      primary: { brightness: 0, saturation: 0 },
      accent: { brightness: 0, saturation: 0 }
    })
    applyColors(defaultColors)
  }

  // NEW: Randomize colors in monochrome scheme
  const randomizeMonochrome = () => {
    const baseHue = Math.floor(Math.random() * 360);
    const newColors = {
      primary1: hslToHex(baseHue, 90, 50),
      primary2: hslToHex(baseHue, 85, 70),
      primary3: hslToHex(baseHue, 85, 85),
      accent1: hslToHex(baseHue, 90, 30),
      accent2: hslToHex(baseHue, 85, 60),
      stroke: hslToHex(baseHue, 85, 20),
    };
    setColors(newColors);
    applyColors(newColors);
  }

  // NEW: Randomize colors in complimentary scheme
  const randomizeComplimentary = () => {
    const baseHue = Math.floor(Math.random() * 360);
    const compHue = (baseHue + 180) % 360;
    const newColors = {
      primary1: hslToHex(baseHue, 90, 50),
      primary2: hslToHex(baseHue, 85, 70),
      primary3: hslToHex(baseHue, 85, 85),
      accent1: hslToHex(compHue, 90, 50),
      accent2: hslToHex(compHue, 85, 70),
      stroke: hslToHex(compHue, 85, 30),
    };
    setColors(newColors);
    applyColors(newColors);
  }

  // NEW: Randomize colors in analogous scheme (adjacent colors on color wheel)
  const randomizeAnalogous = () => {
    const baseHue = Math.floor(Math.random() * 360);
    const newColors = {
      primary1: hslToHex(baseHue, 90, 50),
      primary2: hslToHex((baseHue + 30) % 360, 85, 70),
      primary3: hslToHex((baseHue + 60) % 360, 80, 85),
      accent1: hslToHex((baseHue - 30 + 360) % 360, 95, 40),
      accent2: hslToHex((baseHue + 15) % 360, 85, 60),
      stroke: hslToHex(baseHue, 90, 30),
    };
    setColors(newColors);
    applyColors(newColors);
  }

  // NEW: Randomize colors in triadic scheme (3 colors 120° apart)
  const randomizeTriadic = () => {
    const baseHue = Math.floor(Math.random() * 360);
    const hue2 = (baseHue + 120) % 360;
    const hue3 = (baseHue + 240) % 360;
    const newColors = {
      primary1: hslToHex(baseHue, 90, 50),
      primary2: hslToHex(baseHue, 85, 75),
      primary3: hslToHex(baseHue, 80, 85),
      accent1: hslToHex(hue2, 90, 45),
      accent2: hslToHex(hue3, 85, 60),
      stroke: hslToHex(hue2, 85, 35),
    };
    setColors(newColors);
    applyColors(newColors);
  }

  // NEW: Randomize colors in tetradic scheme (4 colors forming rectangle)
  const randomizeTetradic = () => {
    const baseHue = Math.floor(Math.random() * 360);
    const hue2 = (baseHue + 90) % 360;
    const hue3 = (baseHue + 180) % 360;
    const hue4 = (baseHue + 270) % 360;
    const newColors = {
      primary1: hslToHex(baseHue, 90, 50),
      primary2: hslToHex(hue2, 85, 70),
      primary3: hslToHex(baseHue, 80, 85),
      accent1: hslToHex(hue3, 90, 45),
      accent2: hslToHex(hue4, 85, 60),
      stroke: hslToHex(hue3, 85, 30),
    };
    setColors(newColors);
    applyColors(newColors);
  }

  // NEW: Randomize colors in split complimentary scheme
  const randomizeSplitComplimentary = () => {
    const baseHue = Math.floor(Math.random() * 360);
    const comp1 = (baseHue + 150) % 360;
    const comp2 = (baseHue + 210) % 360;
    const newColors = {
      primary1: hslToHex(baseHue, 90, 50),
      primary2: hslToHex(baseHue, 85, 70),
      primary3: hslToHex(baseHue, 80, 85),
      accent1: hslToHex(comp1, 90, 45),
      accent2: hslToHex(comp2, 85, 60),
      stroke: hslToHex(comp1, 85, 30),
    };
    setColors(newColors);
    applyColors(newColors);
  }

  // NEW: Randomize neutral colors with accent
  const randomizeNeutralWithAccent = () => {
    const accentHue = Math.floor(Math.random() * 360);
    const neutralHue = Math.floor(Math.random() * 360);
    const newColors = {
      primary1: hslToHex(neutralHue, 15, 45), // Low saturation neutral
      primary2: hslToHex(neutralHue, 20, 75), // Light neutral
      primary3: hslToHex(neutralHue, 25, 85), // Very light neutral
      accent1: hslToHex(accentHue, 95, 35), // Strong accent
      accent2: hslToHex(accentHue, 85, 55), // Medium accent
      stroke: hslToHex(neutralHue, 30, 25), // Dark neutral
    };
    setColors(newColors);
    applyColors(newColors);
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {isOpen && (
        <div className="mb-4 bg-white rounded-lg shadow-lg border p-4 w-80">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-sm">Color Manager</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400">✕</button>
          </div>
          
          <div className="space-y-4">
            {Object.entries(colors).map(([key, value]) => {
              const colorKey = key as keyof typeof colors
              const adjustment = adjustments[colorKey] || { brightness: 0, saturation: 0 }
              
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => updateColor(colorKey, e.target.value)}
                      className="w-6 h-6 rounded border"
                    />
                    <span className="text-xs font-mono flex-1">{key}</span>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateColor(colorKey, e.target.value)}
                      className="w-16 text-xs p-1 border rounded font-mono"
                    />
                  </div>
                  
                  <div className="pl-8 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs w-16">Brightness</span>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={adjustment.brightness}
                        onChange={(e) => updateAdjustment(colorKey, 'brightness', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-xs w-8 text-right">{adjustment.brightness}%</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs w-16">Saturation</span>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={adjustment.saturation}
                        onChange={(e) => updateAdjustment(colorKey, 'saturation', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-xs w-8 text-right">{adjustment.saturation}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* NEW: Color Scheme buttons */}
          <div className="mt-3">
            <div className="text-xs font-medium mb-2 text-gray-600">Color Schemes</div>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={randomizeMonochrome}
                className="text-xs py-1 px-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                Monochrome
              </button>
              <button
                onClick={randomizeComplimentary}
                className="text-xs py-1 px-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                Complimentary
              </button>
              <button
                onClick={randomizeAnalogous}
                className="text-xs py-1 px-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                Analogous
              </button>
              <button
                onClick={randomizeTriadic}
                className="text-xs py-1 px-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                Triadic
              </button>
              <button
                onClick={randomizeTetradic}
                className="text-xs py-1 px-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                Tetradic
              </button>
              <button
                onClick={randomizeSplitComplimentary}
                className="text-xs py-1 px-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                Split Comp
              </button>
              <button
                onClick={randomizeNeutralWithAccent}
                className="text-xs py-1 px-2 bg-gray-100 rounded hover:bg-gray-200 col-span-2"
              >
                Neutral + Accent
              </button>
            </div>
          </div>
          
          {/* NEW: Group Adjustments */}
          <div className="mt-3">
            <div className="text-xs font-medium mb-2 text-gray-600">Group Adjustments</div>
            
            {/* Primary Colors */}
            <div className="mb-3">
              <div className="text-xs font-medium mb-1 text-gray-500">Primary Colors</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs w-16">Brightness</span>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={groupAdjustments.primary.brightness}
                    onChange={(e) => updateGroupAdjustment('primary', 'brightness', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-xs w-8 text-right">{groupAdjustments.primary.brightness}%</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs w-16">Saturation</span>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={groupAdjustments.primary.saturation}
                    onChange={(e) => updateGroupAdjustment('primary', 'saturation', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-xs w-8 text-right">{groupAdjustments.primary.saturation}%</span>
                </div>
              </div>
            </div>

            {/* Accent Colors */}
            <div>
              <div className="text-xs font-medium mb-1 text-gray-500">Accent Colors</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs w-16">Brightness</span>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={groupAdjustments.accent.brightness}
                    onChange={(e) => updateGroupAdjustment('accent', 'brightness', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-xs w-8 text-right">{groupAdjustments.accent.brightness}%</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs w-16">Saturation</span>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={groupAdjustments.accent.saturation}
                    onChange={(e) => updateGroupAdjustment('accent', 'saturation', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-xs w-8 text-right">{groupAdjustments.accent.saturation}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={resetColors}
            className="w-full mt-3 text-xs py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            Reset All Colors
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