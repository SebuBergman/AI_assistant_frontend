export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  chatId?: string;
  references?: Reference[]; // for streaming
  rag_references?: Reference[]; // for DB loaded messages
  tokenCounts?: TokenCounts; // for token usage tracking
}

export interface Reference {
  file_name: string;
  content: string;
  score: string;
}

export interface TokenCounts {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

export interface Chat {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedDocument {
  file_name: string;
  file_path: string;      // S3 URL
  upload_date: string;    // ISO string or formatted date
  file_size: number;     // in bytes
  file_id: string;       // unique identifier for the file
  chunks?: DocumentChunk[]; // optional array of chunks for preview
  metrics?: {
    total_chunk_tokens: number;
  };
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