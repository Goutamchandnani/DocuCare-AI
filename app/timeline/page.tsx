import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TimelineView from '@/components/TimelineView';

export default async function TimelinePage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/sign-in');
  }

  const { data: documents, error } = await supabase
    .from('documents')
    .select('id, file_name, file_type, created_at, structured_data')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents for timeline:', error);
    return <div className="p-4 text-red-500">Error loading timeline data.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Document Timeline</h1>
      <TimelineView initialDocuments={documents || []} />
    </div>
  );
}
