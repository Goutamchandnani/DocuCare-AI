import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure only the owner can delete their medication

    if (error) {
      console.error('Error deleting medication:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Medication deleted successfully' }, { status: 200 });
  } catch (err: any) {
    console.error('Error in DELETE /api/medications/[id] route:', err);
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

  const { name, dosage, frequency, instructions, start_date, end_date, is_active, reminder_time, reminder_frequency, reminder_days } = await request.json();

  try {
    const { data: updatedMedication, error } = await supabase
      .from('medications')
      .update({
        name,
        dosage,
        frequency,
        instructions,
        start_date,
        end_date,
        is_active,
        reminder_time,
        reminder_frequency,
        reminder_days,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating medication:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updatedMedication, { status: 200 });
  } catch (err: any) {
    console.error('Error in PUT /api/medications/[id] route:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
