// components/ResponseBox.tsx
import React from "react";
import { Box, Typography } from "@mui/material";
import { AutoFixHigh, Chat } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { Streamdown } from "streamdown";
import StreamingMarkdown from "./StreamingMarkdown";

interface ResponseBoxProps {
  response: string;
  result: string;
  feature: "ai" | "email";
}

const ResponseBox: React.FC<ResponseBoxProps> = ({
  response,
  result,
  feature,
}) => {
  const theme = useTheme();
  const output = result || response;

  if (!output) return null;

  return (
    <Box
      p={3}
      border={`1px solid ${theme.palette.divider}`}
      borderRadius={2}
      bgcolor="background.paper"
      boxShadow={1}
      mb={3}
    >
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        {feature === "email" ? (
          <>
            <AutoFixHigh color="primary" />
            <Typography variant="subtitle1" fontWeight="medium">
              Rewritten Email
            </Typography>
          </>
        ) : (
          <>
            <Chat color="primary" />
            <Typography variant="subtitle1" fontWeight="medium">
              AI Response
            </Typography>
          </>
        )}
      </Box>

      <Box sx={{ color: "text.primary" }}>
        <StreamingMarkdown content={output} />
      </Box>
    </Box>
  );
};

export default ResponseBox;