"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Document {
  id: string;
  file_name: string;
  file_type: string;
  created_at: string;
  structured_data: any;
}

interface TimelineViewProps {
  initialDocuments: Document[];
}

const documentTypeColors: { [key: string]: string } = {
  'prescription': 'bg-blue-500',
  'lab_report': 'bg-green-500',
  'invoice': 'bg-yellow-500',
  'other': 'bg-gray-500',
};

const TimelineView: React.FC<TimelineViewProps> = ({ initialDocuments }) => {
  const [filterDate, setFilterDate] = useState<string>('');

  const filteredDocuments = useMemo(() => {
    if (!filterDate) {
      return initialDocuments;
    }
    return initialDocuments.filter(doc => format(new Date(doc.created_at), 'yyyy-MM-dd') === filterDate);
  }, [initialDocuments, filterDate]);

  const groupedDocuments = useMemo(() => {
    return filteredDocuments.reduce((acc, doc) => {
      const date = format(new Date(doc.created_at), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(doc);
      return acc;
    }, {} as Record<string, Document[]>);
  }, [filteredDocuments]);

  const sortedDates = useMemo(() => Object.keys(groupedDocuments).sort((a, b) => b.localeCompare(a)), [groupedDocuments]);

  return (
    <div className="p-4">
      <div className="mb-6">
        <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700">Filter by Date:</label>
        <input
          type="date"
          id="dateFilter"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        />
      </div>

      {sortedDates.length === 0 ? (
        <p className="text-center text-gray-500">No documents found for the selected date.</p>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>

          {sortedDates.map(date => (
            <div key={date} className="mb-8 relative pl-12">
              {/* Date marker */}
              <div className="absolute left-0 top-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs">
                {format(new Date(date), 'MMM dd')}
              </div>
              <h2 className="text-xl font-semibold mb-4">{format(new Date(date), 'PPP')}</h2>
              <div className="space-y-4">
                {groupedDocuments[date].map(doc => (
                  <Link href={`/documents/${doc.id}`} key={doc.id} className="block">
                    <div className={`p-4 rounded-lg shadow-md flex items-center space-x-4 ${documentTypeColors[doc.file_type] || documentTypeColors.other}`}>
                      <div className="flex-shrink-0">
                        {/* Icon based on file type */}
                        {doc.file_type === 'prescription' && <span className="text-white">💊</span>}
                        {doc.file_type === 'lab_report' && <span className="text-white">🔬</span>}
                        {doc.file_type === 'invoice' && <span className="text-white">💸</span>}
                        {doc.file_type === 'other' && <span className="text-white">📄</span>}
                      </div>
                      <div>
                        <p className="font-medium text-white">{doc.file_name}</p>
                        <p className="text-sm text-white opacity-90">{doc.file_type.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-xs text-white opacity-80">{format(new Date(doc.created_at), 'HH:mm')}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimelineView;
