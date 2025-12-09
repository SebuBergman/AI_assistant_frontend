import { Box, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Switch, TextField, Typography } from "@mui/material";

interface UploadedFile {
  file_name: string;
}

interface RagControlsProps {
  selectedDocument: string;
  onDocumentChange: (doc: string) => void;
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  useCached: boolean;
  onCacheChange: (cached: boolean) => void;
  uploadedFiles: UploadedFile[];
}

export const RagControls = ({
  selectedDocument,
  onDocumentChange,
  keyword,
  onKeywordChange,
  useCached,
  onCacheChange,
  uploadedFiles,
}: RagControlsProps) => {
  return (
    <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
      {/* Document Selector */}
      <FormControl size="small" sx={{ minWidth: 250 }}>
        <InputLabel>Select Document</InputLabel>
        <Select
          value={selectedDocument}
          onChange={(e) => onDocumentChange(e.target.value)}
          label="Select Document"
          disabled={uploadedFiles.length === 0}
        >
          <MenuItem value="">
            <em>All Documents</em>
          </MenuItem>
          {uploadedFiles.map((doc) => (
            <MenuItem key={doc.file_name} value={doc.file_name}>
              {doc.file_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Keyword Search */}
      <TextField
        size="small"
        label="Keyword (optional)"
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        placeholder="Add keyword for hybrid search"
        sx={{ minWidth: 200 }}
      />

      {/* Cache Toggle */}
      <FormControlLabel
        control={
          <Switch
            checked={useCached}
            onChange={(e) => onCacheChange(e.target.checked)}
            size="small"
          />
        }
        label={<Typography variant="body2">Use Cache</Typography>}
      />

      {uploadedFiles.length === 0 && (
        <Typography
          variant="caption"
          color="warning.main"
          sx={{ display: 'flex', alignItems: 'center', ml: 1 }}
        >
          No documents uploaded. Click the folder icon to upload PDFs.
        </Typography>
      )}
    </Box>
  );
};
