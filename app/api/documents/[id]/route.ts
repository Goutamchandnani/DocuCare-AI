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
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure only the owner can delete their document

    if (error) {
      console.error('Error deleting document:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Document deleted successfully' }, { status: 200 });
  } catch (err: any) {
    console.error('Error in DELETE /api/documents/[id] route:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
