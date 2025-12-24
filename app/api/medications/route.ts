import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: medications, error } = await supabase
    .from('medications')
    .select('*')
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching medications:', error)
    return NextResponse.json({ error: 'Failed to fetch medications' }, { status: 500 })
  }

  return NextResponse.json(medications)
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, dosage, frequency, start_date, end_date, notes, reminder_time, reminder_frequency, reminder_days } = await request.json()

  const { data: newMedication, error } = await supabase
    .from('medications')
    .insert({
      user_id: user.id,
      name,
      dosage,
      frequency,
      start_date,
      end_date,
      notes,
      reminder_time,
      reminder_frequency,
      reminder_days,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding medication:', error)
    return NextResponse.json({ error: 'Failed to add medication' }, { status: 500 })
  }

  return NextResponse.json(newMedication, { status: 201 })
}
