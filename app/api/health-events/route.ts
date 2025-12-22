import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: healthEvents, error } = await supabase
    .from('health_events')
    .select('*')
    .eq('user_id', user.id)
    .order('event_date', { ascending: false })

  if (error) {
    console.error('Error fetching health events:', error)
    return NextResponse.json({ error: 'Failed to fetch health events' }, { status: 500 })
  }

  return NextResponse.json(healthEvents)
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { event_type, event_date, description, related_document_id } = await request.json()

  const { data: newHealthEvent, error } = await supabase
    .from('health_events')
    .insert({
      user_id: user.id,
      event_type,
      event_date,
      description,
      related_document_id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding health event:', error)
    return NextResponse.json({ error: 'Failed to add health event' }, { status: 500 })
  }

  return NextResponse.json(newHealthEvent, { status: 201 })
}
