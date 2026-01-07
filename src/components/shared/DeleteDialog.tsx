import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  fileName: string;
  message?: string;
  itemType?: string;
  additionalData?: any;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  fileName,
  message,
  itemType = 'file',
  additionalData
}) => {
  const handleConfirm = () => {
    onConfirm({ fileName, itemType, ...additionalData });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
          }
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>Confirm Deletion</span>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          sx={{
            color: 'text.primary',
            fontSize: '1rem',
            whiteSpace: 'pre-line',
          }}
        >
          {message || `Are you sure you want to delete the chat with the title: ${itemType}?
          This cannot be undone.`}
        </DialogContentText>
        {fileName && !message?.includes(fileName) && (
          <Box 
            sx={{ 
              mt: 2, 
              p: 2, 
              backgroundColor: 'grey.100', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.300'
            }}
          >
            <DialogContentText 
              sx={{ 
                color: 'text.primary', 
                fontWeight: 600,
                wordBreak: 'break-word'
              }}
            >
              {fileName}
            </DialogContentText>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained"
          color="error"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;