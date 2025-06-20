'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '@/app/components/ui/button'
import ColorManager from '../ColorManager'
import FontSwitcher from '../FontSwitcher'

export default function DesignToolsTab() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const saveTheme = async () => {
    setIsLoading(true)
    try {
      // Get current colors from localStorage
      const savedColors = localStorage.getItem('chef-colors')
      const savedFonts = localStorage.getItem('chef-fonts')
      
      let colors = {}
      let fonts = {}
      
      if (savedColors) {
        try {
          colors = JSON.parse(savedColors)
        } catch (e) {
          console.error('Error parsing colors:', e)
        }
      }
      
      if (savedFonts) {
        try {
          fonts = JSON.parse(savedFonts)
        } catch (e) {
          console.error('Error parsing fonts:', e)
        }
      }

      // Save theme via API
      const response = await fetch('/api/admin/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          colors,
          fonts
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save theme')
      }

      setLastSaved(new Date())
      
      // Show success feedback
      const toast = document.createElement('div')
      toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'
      toast.textContent = '✓ Theme saved successfully!'
      document.body.appendChild(toast)
      
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 3000)
      
    } catch (error) {
      console.error('Error saving theme:', error)
      
      // Show error feedback
      const toast = document.createElement('div')
      toast.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'
      toast.textContent = '✗ Failed to save theme'
      document.body.appendChild(toast)
      
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 3000)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Save Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Design Tools</h2>
        <div className="flex items-center gap-4">
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <Button 
            onClick={saveTheme}
            disabled={isLoading}
            className="bg-primary1 hover:bg-primary1/90"
          >
            {isLoading ? 'Saving...' : 'Save Theme'}
          </Button>
        </div>
      </div>

      {/* Two Cards Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Manager Card */}
        <Card>
          <CardHeader>
            <CardTitle>Color Manager</CardTitle>
          </CardHeader>
          <CardContent>
            <ColorManager />
          </CardContent>
        </Card>

        {/* Font Switcher Card */}
        <Card>
          <CardHeader>
            <CardTitle>Font Switcher</CardTitle>
          </CardHeader>
          <CardContent>
            <FontSwitcher />
          </CardContent>
        </Card>
      </div>

      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              Use the tools above to customize your site's visual appearance. Changes are applied in real-time 
              and saved locally in your browser.
            </p>
            <p>
              Click <strong>"Save Theme"</strong> to permanently store your current color palette and font selections 
              to the database. This will make them available across all sessions and devices.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <h4 className="font-medium text-blue-900 mb-1">How it works:</h4>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li><strong>Color Manager:</strong> Adjust individual colors, apply group effects, or use randomization presets</li>
                <li><strong>Font Switcher:</strong> Choose fonts for headers, body text, and buttons with live preview</li>
                <li><strong>Auto-save:</strong> Changes persist in browser storage and sync when you save theme</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 