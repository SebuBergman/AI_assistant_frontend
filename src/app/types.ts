export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface SavedDocument {
  file_name: string;
  file_path: string;      // S3 URL
  upload_date: string;    // ISO string or formatted date
  file_size: number;     // in bytes
  file_id: string;       // unique identifier for the file
  chunks?: DocumentChunk[]; // optional array of chunks for preview
}

export interface DocumentChunk {
  chunk_id: string;
  chunk_index: number;
  page: number;
  content: string;
}

export interface RAGOptions {
  enabled: boolean;
  selectedFiles: string[];
  keyword?: string;
  cached?: boolean;
  alpha?: number;
}