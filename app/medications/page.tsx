"use client";

import React from 'react';
import MedicationList from '../../components/MedicationList';

export default function MedicationsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Medication Management</h1>
      <MedicationList />
    </div>
  );
}
