"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AddHealthEventFormProps {
  onEventAdded?: () => void;
}

export default function AddHealthEventForm({ onEventAdded }: AddHealthEventFormProps) {
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [metadata, setMetadata] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/health-events', {
        method: 'POST',
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
        throw new Error(errorData.error || 'Failed to add health event');
      }

      if (onEventAdded) {
        onEventAdded();
      }
      // Clear form
      setEventType("");
      setEventDate("");
      setTitle("");
      setDescription("");
      setMetadata("");
      router.refresh(); // Refresh the page to show new event
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Add New Health Event</h2>
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
        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Event"}
        </Button>
      </form>
    </div>
  );
}
