// components/ReasoningBox.tsx
import React from "react";
import { Box, Typography } from "@mui/material";
import { Psychology } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

interface ReasoningBoxProps {
  reasoning: string;
}

const ReasoningBox: React.FC<ReasoningBoxProps> = ({ reasoning }) => {
  const theme = useTheme();
  if (!reasoning) return null;

  return (
    <Box
      mb={3}
      p={3}
      border={`2px dashed ${theme.palette.warning.main}`}
      borderRadius={2}
      bgcolor={theme.palette.warning.light + "20"}
    >
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Psychology color="warning" />
        <Typography variant="subtitle1" fontWeight="medium">
          Reasoning Process
        </Typography>
      </Box>

      <Typography
        variant="body2"
        component="pre"
        sx={{
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          color: "text.primary",
        }}
      >
        {reasoning}
      </Typography>
    </Box>
  );
};

export default ReasoningBox;