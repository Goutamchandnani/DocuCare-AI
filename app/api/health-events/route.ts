import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: healthEvents, error } = await supabase
      .from('health_events')
      .select('*')
      .eq('user_id', user.id)
      .order('event_date', { ascending: false });

    if (error) {
      console.error('Error fetching health events:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(healthEvents, { status: 200 });
  } catch (err: any) {
    console.error('Error in GET /api/health-events route:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { event_type, event_date, title, description, metadata } = body;

    const { data, error } = await supabase
      .from('health_events')
      .insert({
        user_id: user.id,
        event_type,
        event_date,
        title,
        description,
        metadata,
      })
      .select();

    if (error) {
      console.error('Error inserting health event:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (err: any) {
    console.error('Error in POST /api/health-events route:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
