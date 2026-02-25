'use client'

import { useState } from 'react'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
}

export default function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [hexValue, setHexValue] = useState(value)

  const handleColorChange = (newColor: string) => {
    setHexValue(newColor)
    onChange(newColor)
  }

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    // Allow # and hex digits
    if (input === '' || /^#[0-9A-Fa-f]{0,6}$/.test(input)) {
      setHexValue(input)
      if (/^#[0-9A-Fa-f]{6}$/.test(input)) {
        onChange(input)
      }
    }
  }

  const handleHexBlur = () => {
    // Validate and fix hex on blur
    if (!hexValue.startsWith('#')) {
      const fixed = '#' + hexValue.replace(/[^0-9A-Fa-f]/g, '')
      if (/^#[0-9A-Fa-f]{6}$/.test(fixed)) {
        setHexValue(fixed)
        onChange(fixed)
      } else {
        setHexValue(value) // Revert to original
      }
    } else if (!/^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
      setHexValue(value) // Revert to original if invalid
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      <div className="flex items-center gap-3">
        {/* Color Preview Box */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm hover:border-gray-400 transition-colors cursor-pointer"
            style={{ backgroundColor: value || '#000000' }}
            title="Click to open color picker"
          />
          {showPicker && (
            <div className="absolute z-10 mt-2 left-0">
              <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
                <input
                  type="color"
                  value={value || '#000000'}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-48 h-32 cursor-pointer"
                />
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-gray-600">Hex:</span>
                  <input
                    type="text"
                    value={hexValue}
                    onChange={handleHexInput}
                    onBlur={handleHexBlur}
                    placeholder="#000000"
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={7}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPicker(false)}
                  className="mt-2 w-full px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hex Input Field */}
        <div className="flex-1">
          <input
            type="text"
            value={hexValue}
            onChange={handleHexInput}
            onBlur={handleHexBlur}
            placeholder="#000000"
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500 font-mono text-sm"
            maxLength={7}
          />
        </div>
      </div>
    </div>
  )
}

