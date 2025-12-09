import { Box, Typography, Paper, useTheme } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Message } from "@/app/types";

interface ChatMessagesProps {
  currentChatId: string | null;
  isTemporaryChat: boolean;
  messages: Message[];
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  currentChatId,
  isTemporaryChat,
  messages,
}) => {
  const theme = useTheme();

  // Don't render if conditions aren't met
  if (!currentChatId || isTemporaryChat || messages.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      {messages.map((msg) => (
        <Box
          key={msg.id}
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 2,
            bgcolor:
              msg.role === "user" ? "action.hover" : "background.paper",
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            variant="caption"
            sx={{ mb: 1, display: "block", color: "text.primary" }}
          >
            {msg.role === "user" ? "You" : "Assistant"}
          </Typography>
          <Box sx={{ color: "text.primary" }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                // Custom styling for various markdown elements
                p: ({ ...props }) => (
                  <Typography variant="body1" sx={{ mb: 2 }} {...props} />
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
                code: ({
                  className,
                  children,
                  ...props
                }: // eslint-disable-next-line @typescript-eslint/no-explicit-any
                any) => {
                  const inline = !className?.includes("language-");
                  return !inline ? (
                    <Paper
                      sx={{
                        p: 1.5,
                        mb: 2,
                        overflow: "auto",
                        bgcolor: "background.default",
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
                        backgroundColor: theme.palette.action.hover,
                        padding: "2px 4px",
                        borderRadius: 4,
                      }}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {msg.content}
            </ReactMarkdown>
          </Box>
        </Box>
      ))}
    </Box>
  );
};