// api/ragApi.ts - RAG-related API functions
import axios from 'axios';
import { SavedDocument } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_PY_BACKEND_URL || 'http://localhost:8000';

export const uploadPDF = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
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

export const fetchSavedDocuments = async (): Promise<SavedDocument[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/fetch_pdfs`);
    return response.data.pdfs || [];
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
};

export const deleteDocument = async (fileName: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/delete_document`, {
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
    const response = await axios.post(`${API_BASE_URL}/clear_all`);
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