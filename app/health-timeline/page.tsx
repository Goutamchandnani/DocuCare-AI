"use client";

import { useState } from 'react';
import { HealthTimeline } from '../../components/HealthTimeline';
import AddHealthEventForm from '../../components/AddHealthEventForm';
import { Input } from "@/components/ui/input";

export default function HealthTimelinePage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const handleEventAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Health Timeline</h1>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <HealthTimeline refreshTrigger={refreshTrigger} searchQuery={searchQuery} />
        </div>
        <div className="md:col-span-1">
          <AddHealthEventForm onEventAdded={handleEventAdded} />
        </div>
      </div>
    </div>
  );
}
