import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: healthEvent, error } = await supabase
      .from('health_events')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching health event:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!healthEvent) {
      return NextResponse.json({ error: 'Health event not found' }, { status: 404 });
    }

    return NextResponse.json(healthEvent, { status: 200 });
  } catch (err: any) {
    console.error('Error in GET /api/health-events/[id] route:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
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
      .update({
        event_type,
        event_date,
        title,
        description,
        metadata,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select();

    if (error) {
      console.error('Error updating health event:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Health event not found or not authorized' }, { status: 404 });
    }

    return NextResponse.json(data[0], { status: 200 });
  } catch (err: any) {
    console.error('Error in PUT /api/health-events/[id] route:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { error } = await supabase
      .from('health_events')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting health event:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Health event deleted successfully' }, { status: 200 });
  } catch (err: any) {
    console.error('Error in DELETE /api/health-events/[id] route:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
