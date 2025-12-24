"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import MedicationEditForm from '@/components/MedicationEditForm';

export default function EditMedicationPage() {
  const params = useParams();
  const medicationId = params.id as string;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Edit Medication</h1>
      <MedicationEditForm medicationId={medicationId} />
    </div>
  );
}
