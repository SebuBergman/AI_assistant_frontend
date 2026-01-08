import React from "react";

import { Send } from "@mui/icons-material";
import { Box, IconButton, TextField } from "@mui/material";

interface MessageInputProps {
  currentInput: string;
  onInputChange: (input: string) => void;
  onSend: () => void;
  loading: boolean;
  isStreaming: boolean;
  placeholder: string;
}

export const MessageInput = React.memo(function MessageInput({
  currentInput,
  onInputChange,
  onSend,
  loading,
  isStreaming,
  placeholder,
}: MessageInputProps) {
  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      <TextField
        fullWidth
        multiline
        maxRows={6}
        value={currentInput}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder={placeholder}
        variant="outlined"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
      />
      <IconButton
        color="primary"
        onClick={onSend}
        disabled={loading || isStreaming || !currentInput.trim()}
        sx={{
          bgcolor: "primary.main",
          color: "white",
          "&:hover": { bgcolor: "primary.dark" },
          "&.Mui-disabled": { bgcolor: "action.disabledBackground" },
        }}
      >
        <Send />
      </IconButton>
    </Box>
  );
});