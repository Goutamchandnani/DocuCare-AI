import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = params.id
  const { event_type, event_date, description, related_document_id } = await request.json()

  const { data: updatedHealthEvent, error } = await supabase
    .from('health_events')
    .update({
      event_type,
      event_date,
      description,
      related_document_id,
    })
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user can only update their own health events
    .select()
    .single()

  if (error) {
    console.error('Error updating health event:', error)
    return NextResponse.json({ error: 'Failed to update health event' }, { status: 500 })
  }

  if (!updatedHealthEvent) {
    return NextResponse.json({ error: 'Health event not found or unauthorized' }, { status: 404 })
  }

  return NextResponse.json(updatedHealthEvent)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = params.id

  const { error } = await supabase
    .from('health_events')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user can only delete their own health events

  if (error) {
    console.error('Error deleting health event:', error)
    return NextResponse.json({ error: 'Failed to delete health event' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Health event deleted successfully' }, { status: 204 })
}
