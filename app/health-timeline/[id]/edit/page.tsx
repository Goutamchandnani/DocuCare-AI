"use client";

import { useRouter } from 'next/navigation';
import EditHealthEventForm from '../../../../components/EditHealthEventForm';

export default function EditHealthEventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const handleEventUpdated = () => {
    router.push('/health-timeline');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Edit Health Event</h1>
      <EditHealthEventForm eventId={id} onEventUpdated={handleEventUpdated} />
    </div>
  );
}
