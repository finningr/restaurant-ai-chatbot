'use client'

import { useState, useEffect } from 'react'
import { Save, Plus, Trash2, Edit3, X, Wand2 } from 'lucide-react'

interface Substitution {
  name: string
  price: number
}

interface CategoryRule {
  default_sides: string[]
  substitutions: Substitution[]
}

interface MenuItemRules {
  category_rules?: Record<string, CategoryRule>
}

interface MenuRulesEditorProps {
  rules: MenuItemRules | null
  categories: string[] // Available menu categories
  onSave: (rules: MenuItemRules) => void
  onCancel: () => void
}

export default function MenuRulesEditor({ rules, categories, onSave, onCancel }: MenuRulesEditorProps) {
  const [categoryRules, setCategoryRules] = useState<Record<string, CategoryRule>>(
    rules?.category_rules || {}
  )
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [parsingText, setParsingText] = useState('')
  const [showParser, setShowParser] = useState(false)

  // Parse text like "All burgers and sandwiches served with your choice of potato chips, baked beans or potato salad. Sub baked potato or Mac N Cheese for $3"
  const parseRulesFromText = (text: string, targetCategories: string[]) => {
    const parsed: Record<string, CategoryRule> = {}
    
    // Extract default sides (between "your choice of" and ".")
    const sidesMatch = text.match(/your choice of\s+([^.]+)/i)
    const defaultSides = sidesMatch 
      ? sidesMatch[1].split(/\s*,\s*|\s+or\s+/i).map(s => s.trim()).filter(Boolean)
      : []
    
    // Extract substitutions (after "Sub" or "Substitute")
    const subMatch = text.match(/[Ss]ub(?:stitute)?\s+([^.]+)/i)
    const substitutions: Substitution[] = []
    
    if (subMatch) {
      const subText = subMatch[1]
      // Look for price patterns like "$3" or "for $3"
      const priceMatch = subText.match(/\$(\d+(?:\.\d+)?)/)
      const price = priceMatch ? parseFloat(priceMatch[1]) : 0
      
      // Extract item names (before "for $X" or at the end)
      const itemsText = subText.replace(/\s+for\s+\$\d+(?:\.\d+)?/i, '').trim()
      const items = itemsText.split(/\s+or\s+/i).map(s => s.trim()).filter(Boolean)
      
      items.forEach(item => {
        substitutions.push({ name: item, price })
      })
    }
    
    // Apply to all target categories
    targetCategories.forEach(category => {
      parsed[category] = {
        default_sides: [...defaultSides],
        substitutions: [...substitutions]
      }
    })
    
    return parsed
  }

  const handleParseText = () => {
    if (!parsingText.trim()) return
    
    // Try to detect categories from text (e.g., "burgers and sandwiches")
    const detectedCategories: string[] = []
    const textLower = parsingText.toLowerCase()
    
    categories.forEach(cat => {
      if (textLower.includes(cat.toLowerCase())) {
        detectedCategories.push(cat)
      }
    })
    
    // If no categories detected, show category selector
    if (detectedCategories.length === 0) {
      alert('Please select which categories this rule applies to, or include category names in the text.')
      // For now, apply to all categories or let user select
      // You could add a category selector UI here
      return
    }
    
    const parsed = parseRulesFromText(parsingText, detectedCategories)
    
    // Merge with existing rules
    setCategoryRules(prev => {
      const merged = { ...prev }
      Object.keys(parsed).forEach(cat => {
        merged[cat] = parsed[cat]
      })
      return merged
    })
    
    setParsingText('')
    setShowParser(false)
  }

  const handleAddCategory = (category: string) => {
    if (!categoryRules[category]) {
      setCategoryRules(prev => ({
        ...prev,
        [category]: {
          default_sides: [],
          substitutions: []
        }
      }))
    }
    setEditingCategory(category)
  }

  const handleAddSide = (category: string, side: string) => {
    if (!side.trim()) return
    setCategoryRules(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        default_sides: [...(prev[category]?.default_sides || []), side.trim()]
      }
    }))
  }

  const handleRemoveSide = (category: string, index: number) => {
    setCategoryRules(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        default_sides: prev[category].default_sides.filter((_, i) => i !== index)
      }
    }))
  }

  const handleAddSubstitution = (category: string, name: string, price: number) => {
    if (!name.trim()) return
    setCategoryRules(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        substitutions: [...(prev[category]?.substitutions || []), { name: name.trim(), price }]
      }
    }))
  }

  const handleRemoveSubstitution = (category: string, index: number) => {
    setCategoryRules(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        substitutions: prev[category].substitutions.filter((_, i) => i !== index)
      }
    }))
  }

  const handleSave = () => {
    onSave({
      category_rules: categoryRules
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">Menu Item Rules</h3>
        <button
          onClick={() => setShowParser(!showParser)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Wand2 className="w-4 h-4" />
          Parse from Text
        </button>
      </div>

      {showParser && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Paste menu note text (e.g., "All burgers and sandwiches served with your choice of potato chips, baked beans or potato salad. Sub baked potato or Mac N Cheese for $3")
          </label>
          <textarea
            value={parsingText}
            onChange={(e) => setParsingText(e.target.value)}
            rows={3}
            placeholder="All burgers and sandwiches served with your choice of potato chips, baked beans or potato salad. Sub baked potato or Mac N Cheese for $3"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={handleParseText}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Parse & Apply
            </button>
            <button
              onClick={() => {
                setShowParser(false)
                setParsingText('')
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Category Rules */}
      <div className="space-y-4">
        {Object.entries(categoryRules).map(([category, rule]) => (
          <div key={category} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-lg font-semibold text-gray-800">{category}</h4>
              <button
                onClick={() => setEditingCategory(editingCategory === category ? null : category)}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                <Edit3 className="w-4 h-4" />
                {editingCategory === category ? 'Done' : 'Edit'}
              </button>
            </div>

            {editingCategory === category && (
              <div className="space-y-4">
                {/* Default Sides */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Sides (choose one)
                  </label>
                  <div className="space-y-2">
                    {rule.default_sides.map((side, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="flex-1 text-gray-900">{side}</span>
                        <button
                          onClick={() => handleRemoveSide(category, index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add side option"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddSide(category, e.currentTarget.value)
                            e.currentTarget.value = ''
                          }
                        }}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement
                          handleAddSide(category, input.value)
                          input.value = ''
                        }}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Substitutions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Substitutions (with prices)
                  </label>
                  <div className="space-y-2">
                    {rule.substitutions.map((sub, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="flex-1 text-gray-900">{sub.name} (+${sub.price})</span>
                        <button
                          onClick={() => handleRemoveSubstitution(category, index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Substitution name"
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id={`sub-name-${category}`}
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        step="0.01"
                        min="0"
                        className="w-24 border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id={`sub-price-${category}`}
                      />
                      <button
                        onClick={(e) => {
                          const nameInput = document.getElementById(`sub-name-${category}`) as HTMLInputElement
                          const priceInput = document.getElementById(`sub-price-${category}`) as HTMLInputElement
                          handleAddSubstitution(category, nameInput.value, parseFloat(priceInput.value) || 0)
                          nameInput.value = ''
                          priceInput.value = ''
                        }}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {editingCategory !== category && (
              <div className="space-y-2">
                {rule.default_sides.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Default Sides: </span>
                    <span className="text-gray-900">{rule.default_sides.join(', ')}</span>
                  </div>
                )}
                {rule.substitutions.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Substitutions: </span>
                    <span className="text-gray-900">
                      {rule.substitutions.map(s => `${s.name} (+$${s.price})`).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Add Category Button */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleAddCategory(e.target.value)
                e.target.value = ''
              }
            }}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Add rules for a category...</option>
            {categories
              .filter(cat => !categoryRules[cat])
              .map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Rules
        </button>
      </div>
    </div>
  )
}

