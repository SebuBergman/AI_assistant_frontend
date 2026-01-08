// api/ragApi.ts - RAG-related API functions
import axios from 'axios';
import { SavedDocument } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_PY_BACKEND_URL || 'http://localhost:8000';

export const uploadPDF = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${API_BASE_URL}/files/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
};

export async function fetchSavedDocuments(): Promise<SavedDocument[]> {
  const res = await fetch(`${API_BASE_URL}/rag/fetch_documents`);
  console.log("Fetch documents response:", res);
  if (!res.ok) throw new Error("Failed to fetch documents");

  const data = await res.json();

  // Map Milvus response to front-end type
  return data.documents.map((doc: any) => ({
    file_name: doc.file_name,
    file_path: doc.file_path || doc.source, // S3 URL
    upload_date: doc.upload_date,
    file_size: doc.file_size,
    file_id: doc.file_id,
    chunks: doc.chunks || [], // Now includes chunk previews
    metrics: {
      total_chunk_tokens: doc.metrics.total_chunk_tokens || 0,
    }
  }));
}

export const deleteDocument = async (fileName: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/rag/delete_document`, {
      file_name: fileName
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

export const deleteAllDocuments = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/rag/clear_all`);
    return response.data;
  } catch (error) {
    console.error('Error clearing documents:', error);
    throw error;
  }
};

export const getCacheStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cache/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    throw error;
  }
};