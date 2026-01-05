import { useEffect, useRef, useState } from "react";
import { Box, Typography, Paper, useTheme, Collapse, IconButton, Chip } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Message } from "@/app/types";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DescriptionIcon from "@mui/icons-material/Description";

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
  const [expandedRefs, setExpandedRefs] = useState<{ [key: string]: boolean }>({});


  // Scroll to bottom when messages change or streaming completes
  useEffect(() => {
    if (!isStreaming && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming]);

  const toggleReferences = (messageId: string) => {
    setExpandedRefs((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

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
            <Box sx={{ width: "100%" }}>
              <Box sx={{ color: "text.primary" }}>
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

              {/* References Section */}
              {msg.references && msg.references.length > 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.02)",
                    borderRadius: 2,
                    border: `1px solid ${
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.1)"
                    }`,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                    }}
                    onClick={() => toggleReferences(msg.id)}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <DescriptionIcon
                        sx={{
                          fontSize: 20,
                          color: theme.palette.mode === "dark" ? "#90caf9" : "#1976d2",
                        }}
                      />
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.mode === "dark" ? "#90caf9" : "#1976d2",
                        }}
                      >
                        References ({msg.references.length})
                      </Typography>
                    </Box>
                    <IconButton size="small">
                      {expandedRefs[msg.id] ? (
                        <ExpandLessIcon fontSize="small" />
                      ) : (
                        <ExpandMoreIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Box>

                  <Collapse in={expandedRefs[msg.id]} timeout="auto">
                    <Box sx={{ mt: 2 }}>
                      {msg.references.map((ref, refIndex) => (
                        <Paper
                          key={refIndex}
                          elevation={0}
                          sx={{
                            p: 2,
                            mb: refIndex < msg.references!.length - 1 ? 1.5 : 0,
                            bgcolor:
                              theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.03)"
                                : "rgba(255, 255, 255, 0.8)",
                            border: `1px solid ${
                              theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.08)"
                                : "rgba(0, 0, 0, 0.08)"
                            }`,
                            borderRadius: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              mb: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: "text.primary",
                              }}
                            >
                              {ref.file_name}
                            </Typography>
                            <Chip
                              label={`Score: ${parseFloat(ref.score).toFixed(2)}`}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.7rem",
                                bgcolor:
                                  theme.palette.mode === "dark"
                                    ? "rgba(144, 202, 249, 0.2)"
                                    : "rgba(25, 118, 210, 0.1)",
                                color:
                                  theme.palette.mode === "dark" ? "#90caf9" : "#1976d2",
                              }}
                            />
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              fontSize: "0.875rem",
                              lineHeight: 1.5,
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                            }}
                          >
                            {ref.content}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  </Collapse>
                </Paper>
              )}
            </Box>
          )}
        </Box>
      ))}
      <div ref={messagesEndRef} />
    </Box>
  );
};