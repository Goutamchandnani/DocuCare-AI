export interface ChatRequestBody {
  message: string;
}

export interface Document {
  id: string;
  content: string;
  filename: string;
  file_url: string;
}

export interface Citation {
  id: string;
  title: string;
  url: string;
}

export interface ChatHistoryItem {
  user_id: string;
  user_message: string;
  ai_reply: string;
}

export interface ChatSuccessResponse {
  reply: string;
  citations: Citation[];
}

export interface ChatErrorResponse {
  error: string;
}