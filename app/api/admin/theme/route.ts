import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { colors, fonts } = await request.json()

    // Save theme to Firestore
    const themeRef = db.collection('theme').doc('current')
    await themeRef.set({
      colors: colors || {},
      fonts: fonts || {},
      updatedAt: new Date()
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Theme saved successfully' 
    })
  } catch (error) {
    console.error('Error saving theme:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save theme' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const themeRef = db.collection('theme').doc('current')
    const themeSnapshot = await themeRef.get()
    
    if (themeSnapshot.exists) {
      return NextResponse.json({
        success: true,
        data: themeSnapshot.data()
      })
    } else {
      return NextResponse.json({
        success: true,
        data: {
          colors: {},
          fonts: {}
        }
      })
    }
  } catch (error) {
    console.error('Error fetching theme:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch theme' 
      },
      { status: 500 }
    )
  }
} 