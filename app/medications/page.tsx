"use client";

import React, { useState } from 'react';
import MedicationList from '../../components/MedicationList';
import { AddMedicationForm } from '../../components/AddMedicationForm';

export default function MedicationsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleMedicationAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Medication Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <MedicationList refreshTrigger={refreshTrigger} />
        </div>
        <div className="md:col-span-1">
          <AddMedicationForm onMedicationAdded={handleMedicationAdded} />
        </div>
      </div>
    </div>
  );
}
