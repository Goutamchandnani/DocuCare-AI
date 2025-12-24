"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditHealthEventFormProps {
  eventId: string;
  onEventUpdated?: () => void;
}

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

export default function EditHealthEventForm({ eventId, onEventUpdated }: EditHealthEventFormProps) {
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [metadata, setMetadata] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchHealthEvent() {
      try {
        const response = await fetch(`/api/health-events/${eventId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: HealthEvent = await response.json();
        setEventType(data.event_type);
        setEventDate(data.event_date.split('T')[0]); // Format date for input type="date"
        setTitle(data.title);
        setDescription(data.description || "");
        setMetadata(data.metadata ? JSON.stringify(data.metadata, null, 2) : "");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHealthEvent();
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/health-events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: eventType,
          event_date: eventDate,
          title,
          description,
          metadata: metadata ? JSON.parse(metadata) : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update health event');
      }

      if (onEventUpdated) {
        onEventUpdated();
      }
      router.push('/health-timeline'); // Redirect back to timeline after update
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading event details...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Edit Health Event</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="eventType">Event Type</Label>
          <Input
            id="eventType"
            type="text"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="eventDate">Event Date</Label>
          <Input
            id="eventDate"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="metadata">Metadata (JSON)</Label>
          <Textarea
            id="metadata"
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            rows={5}
            placeholder="e.g., { 'doctor': 'Dr. Smith', 'hospital': 'City Hospital' }"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Updating..." : "Update Event"}
        </Button>
      </form>
    </div>
  );
}
