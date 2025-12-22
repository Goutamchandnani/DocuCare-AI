"use client";

import React, { useState } from 'react';

interface DocumentSearchFilterProps {
  onSearch: (searchTerm: string) => void;
  onFilter: (filterType: string) => void;
}

export default function DocumentSearchFilter({ onSearch, onFilter }: DocumentSearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
    onFilter(e.target.value);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <input
        type="text"
        placeholder="Search documents..."
        className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <select
        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={filterType}
        onChange={handleFilterChange}
      >
        <option value="all">All Types</option>
        <option value="lab_result">Lab Results</option>
        <option value="prescription">Prescriptions</option>
        <option value="invoice">Invoices</option>
        {/* Add more filter options as needed */}
      </select>
    </div>
  );
}
