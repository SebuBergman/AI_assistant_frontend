export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  uploadedAt: Date;
  chunksCreated: number;
}

export interface SavedDocument {
  file_name: string;
  s3_url: string;
  uploaded_at: string;
  timestamp: number;
}

export interface RAGOptions {
  enabled: boolean;
  selectedFiles: string[];
  keyword?: string;
  cached?: boolean;
  alpha?: number;
}