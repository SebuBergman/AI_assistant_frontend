import { Box, Typography, Paper, useTheme } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Message } from "@/app/types";
import { useEffect, useRef } from "react";

interface ChatMessagesProps {
  messages: Message[];
  isStreaming?: boolean;
  mode: "light" | "dark" | "system";
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isStreaming = false,
  mode,
}) => {
  const theme = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change or streaming completes
  useEffect(() => {
    if (!isStreaming && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      {messages.map((msg, index) => (
        <Box
          key={msg.id}
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
          }}
        >
          {msg.role === "user" ? (
            // User message - speech bubble style
            <Box
              sx={{
                maxWidth: "70%",
                bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                borderRadius: 3,
                px: 2.5,
                py: 1.5,
                position: "relative",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  color: mode === "dark" ? "#fff" : "#000",
                }}
              >
                {msg.content}
              </Typography>
            </Box>
          ) : (
            // AI message - full width, no box
            <Box sx={{ width: "100%", color: "text.primary" }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  p: ({ ...props }) => (
                    <Typography
                      variant="body1"
                      sx={{ mb: 2, lineHeight: 1.6 }}
                      {...props}
                    />
                  ),
                  h1: ({ ...props }) => (
                    <Typography variant="h4" sx={{ mt: 3, mb: 2 }} {...props} />
                  ),
                  h2: ({ ...props }) => (
                    <Typography variant="h5" sx={{ mt: 3, mb: 2 }} {...props} />
                  ),
                  h3: ({ ...props }) => (
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }} {...props} />
                  ),
                  code: ({ className, children, ...props }: any) => {
                    const inline = !className?.includes("language-");
                    return !inline ? (
                      <Paper
                        sx={{
                          p: 2,
                          mb: 2,
                          overflow: "auto",
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "rgba(0, 0, 0, 0.2)"
                              : "rgba(0, 0, 0, 0.05)",
                          borderRadius: 2,
                        }}
                        elevation={0}
                      >
                        <code
                          style={{ fontFamily: "monospace" }}
                          className={className}
                          {...props}
                        >
                          {children}
                        </code>
                      </Paper>
                    ) : (
                      <code
                        style={{
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(255, 255, 255, 0.1)"
                              : "rgba(0, 0, 0, 0.08)",
                          padding: "2px 6px",
                          borderRadius: 4,
                          fontFamily: "monospace",
                        }}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  ul: ({ ...props }) => (
                    <Box component="ul" sx={{ mb: 2, pl: 3 }} {...props} />
                  ),
                  ol: ({ ...props }) => (
                    <Box component="ol" sx={{ mb: 2, pl: 3 }} {...props} />
                  ),
                  li: ({ ...props }) => (
                    <Typography
                      component="li"
                      variant="body1"
                      sx={{ mb: 0.5, lineHeight: 1.6 }}
                      {...props}
                    />
                  ),
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </Box>
          )}
        </Box>
      ))}
      <div ref={messagesEndRef} />
    </Box>
  );
};