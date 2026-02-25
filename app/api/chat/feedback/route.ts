import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { conversation_log_id, response_metrics_id, feedback, restaurant_id, session_id } = await request.json()

    // Validate input
    if (!conversation_log_id || !feedback) {
      return NextResponse.json(
        { error: 'conversation_log_id and feedback are required' },
        { status: 400 }
      )
    }

    if (feedback !== 'positive' && feedback !== 'negative') {
      return NextResponse.json(
        { error: 'feedback must be "positive" or "negative"' },
        { status: 400 }
      )
    }

    // Convert feedback to numeric score
    const feedbackScore = feedback === 'positive' ? 1 : -1

    // Update conversation_logs
    if (conversation_log_id) {
      const { error: convError } = await supabaseAdmin
        .from('conversation_logs')
        .update({ feedback_score: feedbackScore })
        .eq('id', conversation_log_id)

      if (convError) {
        console.error('Error updating conversation_logs feedback:', convError)
        return NextResponse.json(
          { error: 'Failed to update conversation log feedback' },
          { status: 500 }
        )
      }
    }

    // Update response_metrics
    if (response_metrics_id) {
      const { error: metricsError } = await supabaseAdmin
        .from('response_metrics')
        .update({ user_satisfaction: feedbackScore })
        .eq('id', response_metrics_id)

      if (metricsError) {
        console.error('Error updating response_metrics feedback:', metricsError)
        // Don't fail if this update fails, conversation_logs is more important
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Feedback recorded successfully'
    })

  } catch (error) {
    console.error('Error in feedback API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


