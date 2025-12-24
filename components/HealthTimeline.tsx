"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface HealthEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_date: string;
  title: string;
  description: string | null;
  metadata: any | null;
  created_at: string;
}

interface HealthTimelineProps {
  refreshTrigger: number;
  searchQuery: string;
}

export function HealthTimeline({ refreshTrigger, searchQuery }: HealthTimelineProps) {
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this health event?")) {
      return;
    }

    try {
      const response = await fetch(`/api/health-events/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete health event');
      }

      toast({
        title: "Event Deleted",
        description: "The health event has been successfully deleted.",
      });
      setHealthEvents(prevEvents => prevEvents.filter(event => event.id !== id));
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to delete event: ${err.message}`,
        variant: "destructive",
      });
    }
  };

  const filteredEvents = healthEvents.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.event_type.toLowerCase().includes(searchQuery.toLowerCase())
  );


  useEffect(() => {
    async function fetchHealthEvents() {
      setLoading(true);
      setError(null);


      try {
        const response = await fetch('/api/health-events');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setHealthEvents(data as HealthEvent[]);
      } catch (err: any) {
        console.error('Error fetching health events:', err);
        setError(`Failed to load health events: ${err.message}`);
        setHealthEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchHealthEvents();
  }, [refreshTrigger]);

  if (loading) return <div className="p-4 text-center">Loading health timeline...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Health Timeline</h2>
      {filteredEvents.length === 0 ? (
            <p>No health events found. Start by adding some!</p>
          ) : (
            <div className="space-y-6">
              {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white shadow-md rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
              <p className="text-gray-600 text-sm mb-1">{new Date(event.event_date).toLocaleDateString()} - {event.event_type}</p>
              {event.description && <p className="text-gray-700 mb-2">{event.description}</p>}
              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <div className="mt-2 text-sm text-gray-500">
                  <strong>Details:</strong>
                  <pre className="bg-gray-100 p-2 rounded-md mt-1 text-xs whitespace-pre-wrap">{JSON.stringify(event.metadata, null, 2)}</pre>
                </div>
              )}
              <div className="mt-4 flex space-x-2">
                <Button onClick={() => router.push(`/health-timeline/${event.id}/edit`)}>Edit</Button>
                <Button variant="destructive" onClick={() => handleDelete(event.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
