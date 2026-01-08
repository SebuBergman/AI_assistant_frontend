// components/DocumentsDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Collapse,
  ListItemButton,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { DocumentChunk, SavedDocument } from '@/app/types';
import { deleteAllDocuments, deleteDocument, uploadPDF } from '@/app/api/ragAPI';
import DeleteDialog from '../shared/DeleteDialog';
import { formatFileSize } from '@/utils/formatFileSize';

interface DocumentsDialogProps {
  open: boolean;
  onClose: () => void;
  documents: SavedDocument[];
  onDocumentsUpdate: () => void;
}

export const DocumentsDialog: React.FC<DocumentsDialogProps> = ({
  open,
  onClose,
  documents,
  onDocumentsUpdate,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    fileName: string;
    isDeleteAll: boolean;
  }>({
    open: false,
    fileName: '',
    isDeleteAll: false,
  });
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Please upload a document file');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const result = await uploadPDF(file);
      setUploadSuccess(`Successfully uploaded ${file.name} with ${result.chunks_created} chunks`);
      onDocumentsUpdate();

      setTimeout(() => setUploadSuccess(''), 3000);
    } catch (error) {
      setUploadError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDeleteClick = (fileName: string) => {
    setDeleteDialog({
      open: true,
      fileName,
      isDeleteAll: false,
    });
  };

  const handleDeleteAllClick = () => {
    setDeleteDialog({
      open: true,
      fileName: '',
      isDeleteAll: true,
    });
  };

  const handleDeleteConfirm = async (data: any) => {
    try {
      if (deleteDialog.isDeleteAll) {
        await deleteAllDocuments();
        setUploadSuccess('All documents deleted successfully');
      } else {
        await deleteDocument(data.fileName);
        setUploadSuccess(`"${data.fileName}" deleted successfully`);
      }
      onDocumentsUpdate();
      setTimeout(() => setUploadSuccess(''), 3000);
    } catch (error) {
      setUploadError('Failed to delete document(s). Please try again.');
    }
  };

  const getDeleteMessage = () => {
    if (deleteDialog.isDeleteAll) {
      return 'Are you sure you want to delete all documents? This cannot be undone.';
    }
    return `Are you sure you want to delete "${deleteDialog.fileName}"? This cannot be undone.`;
  };

  const toggleExpand = (fileId: string) => {
    setExpandedDocs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) newSet.delete(fileId);
      else newSet.add(fileId);
      return newSet;
    });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Manage RAG Documents</DialogTitle>
        <DialogContent>
          {uploadError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUploadError('')}>
              {uploadError}
            </Alert>
          )}
          {uploadSuccess && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setUploadSuccess('')}>
              {uploadSuccess}
            </Alert>
          )}

          <Box sx={{ mb: 2 }}>
            <input
              accept=".pdf"
              style={{ display: 'none' }}
              id="pdf-upload-input"
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <label htmlFor="pdf-upload-input">
              <Button
                variant="contained"
                component="span"
                startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
                disabled={uploading}
                fullWidth
              >
                {uploading ? 'Uploading...' : 'Upload PDF'}
              </Button>
            </label>
          </Box>

          {documents.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
              No documents uploaded yet. Upload a document to get started.
            </Typography>
          ) : (
            <>
              <Typography variant="subtitle2" gutterBottom>
                Uploaded Documents ({documents.length})
              </Typography>
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {documents.map((doc) => (
                  <Box key={doc.file_id} sx={{ mb: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <ListItem
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteClick(doc.file_name)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                      disablePadding
                    >
                      <ListItemButton onClick={() => toggleExpand(doc.file_id)}>
                        <FileIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <ListItemText
                          primary={doc.file_name}
                          secondary={`Uploaded: ${new Date(doc.upload_date).toLocaleDateString()} | Size: ${formatFileSize(doc.file_size)}`}
                        />
                        {expandedDocs.has(doc.file_id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </ListItemButton>
                    </ListItem>

                    {/* Chunk preview */}
                    <Collapse in={expandedDocs.has(doc.file_id)} timeout="auto" unmountOnExit>
                      <List sx={{ pl: 4, maxHeight: 200, overflow: 'auto' }}>
                        {doc.chunks?.length ? doc.chunks.map((chunk: DocumentChunk) => (
                          <ListItem key={chunk.chunk_id} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <ListItemText
                              primary={`Chunk ${chunk.chunk_index + 1} (Page ${chunk.page})`}
                              secondary={chunk.content.slice(0, 100) + (chunk.content.length > 100 ? '...' : '')}
                            />
                          </ListItem>
                        )) : (
                          <Typography variant="caption" sx={{ p: 1 }}>No chunks available</Typography>
                        )}
                      </List>
                    </Collapse>
                  </Box>
                ))}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2, alignItems: 'center' }}>
          {documents.length > 0 && (
            <Button
              onClick={handleDeleteAllClick}
              color="error"
              startIcon={<DeleteIcon />}
              variant="outlined"
              sx={{ textAlign: 'center' }}
            >
              <Typography variant="body1">Delete All</Typography>
            </Button>
          )}
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <DeleteDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}
        onConfirm={handleDeleteConfirm}
        fileName={deleteDialog.fileName}
        message={getDeleteMessage()}
        itemType={deleteDialog.isDeleteAll ? 'documents' : 'document'}
        additionalData={{ isDeleteAll: deleteDialog.isDeleteAll }}
      />
    </>
  );
};
