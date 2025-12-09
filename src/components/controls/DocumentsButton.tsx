import { Chip, IconButton, Tooltip } from "@mui/material";
import {
  Folder as FolderIcon,
} from '@mui/icons-material';

interface DocumentsButtonProps {
  uploadedFilesCount: number;
  onOpenDialog: () => void;
}

export const DocumentsButton = ({
  uploadedFilesCount,
  onOpenDialog,
}: DocumentsButtonProps) => {
  return (
    <Tooltip title="Manage uploaded documents">
      <IconButton
        onClick={onOpenDialog}
        color={uploadedFilesCount > 0 ? "primary" : "default"}
        sx={{
          border: 1,
          borderColor: uploadedFilesCount > 0 ? 'primary.main' : 'divider',
        }}
      >
        <FolderIcon />
        {uploadedFilesCount > 0 && (
          <Chip
            label={uploadedFilesCount}
            size="small"
            color="primary"
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              height: 20,
              minWidth: 20,
            }}
          />
        )}
      </IconButton>
    </Tooltip>
  );
};
