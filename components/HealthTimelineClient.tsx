'use client';

import React, { useState } from 'react';
import { HealthTimeline } from '@/components/HealthTimeline';

export default function HealthTimelineClient() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <HealthTimeline refreshTrigger={refreshTrigger} searchQuery={searchQuery} />
  );
}