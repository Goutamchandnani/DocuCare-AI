export interface Document {
  id: string;
  user_id: string;
  filename: string;
  file_url: string;
  document_type: 'prescription' | 'lab_report' | 'other';
  extracted_text: string;
  ai_summary: string;
  metadata: any;
  created_at: string;
  last_reminder_sent?: string;
  reminder_days?: string;
}

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  reminder_time?: string | null;
  instructions?: string;
  is_active?: boolean;
  reminder_frequency?: 'daily' | 'twice_daily' | 'weekly' | null;
  last_reminder_sent?: string;
  reminder_days?: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  response: string;
  context_documents: string[];
  created_at: string;
}

export interface HealthEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_date: string;
  description: string | null;
  related_document_id: string | null;
  created_at: string;
  updated_at: string;
}