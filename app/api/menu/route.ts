import { NextRequest, NextResponse } from 'next/server'

// In a real app, this would fetch from a database
// For now, we'll return mock data that matches the admin dashboard structure
export async function GET(request: NextRequest) {
  try {
    // Mock menu items - in production, fetch from database based on restaurant ID
    const menuItems = [
      {
        id: 1,
        name: 'Margherita Pizza',
        category: 'Main Course',
        description: 'Classic pizza with fresh mozzarella, tomatoes, and basil',
        price: 16.99,
        allergens: ['Gluten', 'Dairy'],
        dietaryTags: ['Vegetarian'],
        ingredients: 'Pizza dough, tomato sauce, fresh mozzarella, basil, olive oil',
        available: true
      },
      {
        id: 2,
        name: 'Caesar Salad',
        category: 'Appetizer',
        description: 'Crisp romaine lettuce with parmesan and house-made Caesar dressing',
        price: 12.99,
        allergens: ['Dairy', 'Fish'],
        dietaryTags: [],
        ingredients: 'Romaine lettuce, parmesan cheese, croutons, Caesar dressing, anchovies',
        available: true
      }
    ]

    return NextResponse.json({ menuItems })
  } catch (error) {
    console.error('Menu API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    )
  }
}




