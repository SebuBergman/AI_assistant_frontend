
// components/WelcomeMessage.tsx
import React from "react";
import { Box, Typography } from "@mui/material";
import { Chat, AutoFixHigh } from "@mui/icons-material";

interface WelcomeMessageProps {
  activeFeature: "ai" | "email";
  show: boolean; // whether to render or not
  mode: "light" | "dark" | "system";
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ activeFeature, show, mode }) => {
  if (!show) return null;

  const isEmail = activeFeature === "email";

  return (
    <Box textAlign="center" py={12}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap={1}
        mb={2}
      >
        {isEmail ? (
          <>
            <AutoFixHigh sx={{ fontSize: 40 }} color="primary" />
            <Typography variant="h3" fontWeight="bold">
              Email Rewriter
            </Typography>
          </>
        ) : (
          <>
            <Chat sx={{ fontSize: 40 }} color="primary" />
            <Typography variant="h3" fontWeight="bold" sx={{ color: mode ? "dark" : "#fff", }}>
              AI Chat
            </Typography>
          </>
        )}
      </Box>

      <Typography variant="h6">
        {isEmail
          ? "Paste your email and select a tone to get an improved version"
          : "Ask questions to different AI models with adjustable creativity"}
      </Typography>
    </Box>
  );
};

export default WelcomeMessage;
