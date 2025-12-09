'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  Typography,
  IconButton,
  AppBar,
  Toolbar,
  Tab,
  Tabs,
  LinearProgress,
  Alert,
  FormControl,
  InputLabel,
  ListSubheader,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Email,
  Psychology,
  AutoFixHigh,
  Chat,
  Send,
  SettingsSuggest,
  Close as CloseIcon,
  FlashOn,
  Brightness7,
  Brightness4
} from '@mui/icons-material';
import { useColorScheme, useTheme } from '@mui/material/styles';
import { rewriteEmail } from '@/lib/API_requests';
import { chatgptModels, claudeModels, deepseekModels, tones } from '@/components/data';
import ChatSidebar from '@/components/chatSidebar';
import { Streamdown } from "streamdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import InfoIcon from "@mui/icons-material/Info";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export default function AIAssistant() {
  const theme = useTheme();

  const [activeFeature, setActiveFeature] = useState('ai');
  const [prompt, setPrompt] = useState('');
  const [email, setEmail] = useState('');
  const [tone, setTone] = useState('professional');
  const [selectedModel, setSelectedModel] = useState('deepseek-chat');
  const [temperature, setTemperature] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [response, setResponse] = useState('');
  const [result, setResult] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [error, setError] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // For sidebar and chat history
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isNewChat, setIsNewChat] = useState(true);

  // Sidebar refresh prop
  const [refreshSidebar, setRefreshSidebar] = useState(0);

  // For Dark mode
  const { mode, setMode } = useColorScheme();
  
  // For temporary chat
  const [isTemporaryChat, setIsTemporaryChat] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [response, result, reasoning]);

  // Load messages when chat is selected
  useEffect(() => {
    if (currentChatId) {
      loadChatMessages(currentChatId);
    }
  }, [currentChatId]);

  // For changing from light to dark and vice versa
  if (!mode) {
    return null;
  }

  const loadChatMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`);
      if (!response.ok) throw new Error("Failed to load messages");

      const data = await response.json();
      setMessages(data.messages);
      setIsNewChat(false);

      // Add these lines to clear the response area
      setResponse("");
      setResult("");
      setReasoning("");
      setError("");
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setResponse("");
    setResult("");
    setReasoning("");
    setIsNewChat(true);
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  // Your AI response logic
  const streamChat = async (question: string, model: string, temperature: number) => {
  const response = await fetch("/api/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, model, temperature }),
  });

  return response; // Keep streaming intact
};

  const getUserId = () => {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      //userId = `user_${Math.random().toString(36).substr(2, 9)}`;
      userId = "654321987"
      localStorage.setItem('userId', userId);
    }
    return userId;
  };

  const handleStreamMessage = async () => {
    if (!prompt || !selectedModel) return;
    // eslint-disable-next-line prefer-const
    let userMessage = prompt.trim()

    setLoading(true);
    setIsStreaming(true);
    setResponse("");
    setReasoning("");
    setError("");

    try {
      // If temporary chat mode, skip all database operations
      if (isTemporaryChat) {
        // Add user message locally
        const userMsg: Message = {
          id: Date.now().toString(),
          role: "user",
          content: userMessage,
          createdAt: new Date(),
        };
        setMessages(prev => [...prev, userMsg]);

        // Start Streaming request
        const streamRes = await streamChat(userMessage, selectedModel, temperature);
        if (!streamRes.ok) {
          throw new Error(`HTTP error! status: ${streamRes.status}`);
        }

        const reader = streamRes.body?.getReader();
        if (!reader) {
          throw new Error("Failed to get response reader");
        }

        const decoder = new TextDecoder();
        let buffer = "";
        let finalAIText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;

            try {
              const json = JSON.parse(line.slice(6));

              if (json.error) {
                setError(json.error);
                break;
              }
              if (json.done) break;

              if (json.type === "reasoning") {
                setReasoning(prev => prev + json.content);
              }

              if (json.type === "content" || json.content) {
                setResponse(prev => prev + json.content);
                finalAIText += json.content;
              }
            } catch (e) {
              console.error("Parse error:", e);
            }
          }
        }

        // Add AI message locally (no database save)
        if (finalAIText.trim()) {
          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: finalAIText,
            createdAt: new Date(),
          };
          setMessages(prev => [...prev, aiMsg]);
        }

        setPrompt("");
        return;
      }

      let chatId = currentChatId;

      // If it's a new chat, create it first
      if (isNewChat) {
        const createRes = await fetch('/api/chats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': getUserId(),
          },
          body: JSON.stringify({ message: userMessage }),
        });

        if (!createRes.ok) {
          const errorText = await createRes.text();
          throw new Error(`Failed to create chat: ${errorText}`);
        }

        if (!createRes.ok) throw new Error("Failed to create chat");

        const createData = await createRes.json();
        chatId = createData.chat.id;

        setCurrentChatId(chatId);
        setIsNewChat(false);

        // Add initial user message (local)
        setMessages([
          {
            id: Date.now().toString(),
            role: "user",
            content: userMessage,
            createdAt: new Date(),
          },
        ]);
      } else {
        // Existing chat → save user message
        const userRes = await fetch(`/api/chats/${chatId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "user", content: userMessage }),
        });

        if (!userRes.ok) throw new Error("Failed to save user message");

        const userData = await userRes.json();
        setMessages(prev => [...prev, userData.message]);
        setRefreshSidebar((prev) => prev + 1);
      }

      // Start Streaming request
      const streamRes = await streamChat(userMessage, selectedModel, temperature);
      if (!streamRes.ok) {
        throw new Error(`HTTP error! status: ${streamRes.status}`);
      }

      const reader = streamRes.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get response reader");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let finalAIText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          try {
            const json = JSON.parse(line.slice(6));

            if (json.error) {
              setError(json.error);
              break;
            }
            if (json.done) break;

            if (json.type === "reasoning") {
              setReasoning(prev => prev + json.content);
            }

            if (json.type === "content" || json.content) {
              setResponse(prev => prev + json.content);
              finalAIText += json.content;
            }
          } catch (e) {
            console.error("Parse error:", e);
          }
        }
      }

      // Save AI Message (full combined text)
      if (finalAIText.trim()) {
        const aiRes = await fetch(`/api/chats/${chatId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "assistant", content: finalAIText }),
        });

        setRefreshSidebar((prev) => prev + 1);

        if (!aiRes.ok) throw new Error("Failed to save AI response");

        const aiData = await aiRes.json();
        // Only save AI message to messages if chat is loaded from sidebar (persistent chat)
        if (currentChatId && !isTemporaryChat) {
          setMessages((prev) => [...prev, aiData.message]);
        }
      }
    } catch (err) {
      console.error("Stream error:", err);
      setError(`Streaming error: ${err}`);
    } finally {
      setIsStreaming(false);
      setLoading(false);
      setCurrentInput("");
      if (!isTemporaryChat) {
        setPrompt("");
      }
    }
  };

  const handleEmailSubmit = async () => {
    setLoading(true);
    setResult("");
    setError("");
    try {
      const response = await rewriteEmail(email, tone);
      setResult(response);
    } catch (err) {
      setError("Failed to rewrite email. Please try again.");
    } finally {
      setLoading(false);
      setCurrentInput('');
    }
  };

  const handleSend = () => {
    if (activeFeature === 'email') {
      handleEmailSubmit();
    } else {
      handleStreamMessage();
    }
  };

  const currentInput = activeFeature === 'email' ? email : prompt;
  const setCurrentInput = (value: React.SetStateAction<string>) => {
    if (activeFeature === 'email') {
      setEmail(value);
    } else {
      setPrompt(value);
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <ChatSidebar
        sidebarOpen={sidebarOpen}
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        refreshTrigger={refreshSidebar}
      />

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Top AppBar with Tabs */}
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <IconButton
              edge="start"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 3 }}>
              <SettingsSuggest color="primary" />
              <Typography variant="h6" fontWeight="bold">
                AI Assistant
              </Typography>
            </Box>

            <Tabs
              value={activeFeature === "email" ? 0 : 1}
              onChange={(_, newValue) =>
                setActiveFeature(newValue === 0 ? "email" : "ai")
              }
              sx={{ flex: 1 }}
            >
              <Tab
                icon={<Email />}
                iconPosition="start"
                label="Email Assistant"
              />
              <Tab icon={<Psychology />} iconPosition="start" label="AI Chat" />
            </Tabs>
            {activeFeature === "ai" && (
              <IconButton
                onClick={() => {
                  setIsTemporaryChat(!isTemporaryChat);
                  if (!isTemporaryChat) {
                    // Switching to temporary mode - clear current chat
                    setCurrentChatId(null);
                    setMessages([]);
                    setResponse("");
                    setReasoning("");
                  }
                }}
                sx={{
                  bgcolor: isTemporaryChat ? "warning.main" : "action.hover",
                  color: isTemporaryChat ? "white" : "text.primary",
                  "&:hover": {
                    bgcolor: isTemporaryChat
                      ? "warning.dark"
                      : "action.selected",
                  },
                  transition: "all 0.2s",
                }}
              >
                <FlashOn />
              </IconButton>
            )}
            <IconButton
              onClick={() => setMode(mode === "dark" ? "light" : "dark")}
              sx={{
                ml: 2,
                bgcolor: "action.hover",
                "&:hover": { bgcolor: "action.selected" },
              }}
            >
              {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Chat Area */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            bgcolor: "background.default",
          }}
        >
          <Box sx={{ maxWidth: 1000, width: "100%", mx: "auto", p: 3 }}>
            {error && (
              <Alert
                severity="error"
                sx={{ mb: 3 }}
                onClose={() => setError("")}
                action={
                  <IconButton size="small" onClick={() => setError("")}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                }
              >
                {error}
              </Alert>
            )}
            {/* Temporary Chat Indicator */}
            {isTemporaryChat && activeFeature === "ai" && (
              <Alert severity="warning" icon={<FlashOn />} sx={{ mb: 3 }}>
                <strong>Temporary Chat Mode:</strong> Messages won&apos;t be
                saved to history
              </Alert>
            )}

            {/* Chat Messages History — show ONLY when loading a saved chat */}
            {currentChatId && !isTemporaryChat && messages.length > 0 && (
              <Box sx={{ mb: 3 }}>
                {messages.map((msg) => (
                  <Box
                    key={msg.id}
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor:
                        msg.role === "user"
                          ? "action.hover"
                          : "background.paper",
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
                            <Typography
                              variant="body1"
                              sx={{ mb: 2 }}
                              {...props}
                            />
                          ),
                          h1: ({ ...props }) => (
                            <Typography
                              variant="h4"
                              sx={{ mt: 3, mb: 2 }}
                              {...props}
                            />
                          ),
                          h2: ({ ...props }) => (
                            <Typography
                              variant="h5"
                              sx={{ mt: 3, mb: 2 }}
                              {...props}
                            />
                          ),
                          h3: ({ ...props }) => (
                            <Typography
                              variant="h6"
                              sx={{ mt: 2, mb: 1 }}
                              {...props}
                            />
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
            )}

            {/* Welcome Message */}
            {!response && !result && messages.length === 0 && (
              <Box textAlign="center" py={12}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap={1}
                  mb={2}
                >
                  {activeFeature === "email" ? (
                    <>
                      <AutoFixHigh sx={{ fontSize: 40 }} color="primary" />
                      <Typography
                        variant="h3"
                        fontWeight="bold"
                        sx={{ color: "text.primary" }}
                      >
                        Email Rewriter
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Chat sx={{ fontSize: 40 }} color="primary" />
                      <Typography
                        variant="h3"
                        fontWeight="bold"
                        sx={{ color: "text.primary" }}
                      >
                        AI Chat
                      </Typography>
                    </>
                  )}
                </Box>
                <Typography variant="h6" sx={{ color: "text.primary" }}>
                  {activeFeature === "email"
                    ? "Paste your email and select a tone to get an improved version"
                    : "Ask questions to different AI models with adjustable creativity"}
                </Typography>
              </Box>
            )}

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {/* Reasoning Display */}
            {reasoning && (
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
                  }}
                >
                  {reasoning}
                </Typography>
              </Box>
            )}

            {/* Response Display */}
            {(result || response) && (
              <Box
                p={3}
                border={`1px solid ${theme.palette.divider}`}
                borderRadius={2}
                bgcolor="background.paper"
                boxShadow={1}
              >
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  {activeFeature === "email" ? (
                    <>
                      <AutoFixHigh color="primary" />
                      <Typography
                        variant="subtitle1"
                        fontWeight="medium"
                        sx={{ color: "text.primary" }}
                      >
                        Rewritten Email
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Chat color="primary" />
                      <Typography
                        variant="subtitle1"
                        fontWeight="medium"
                        sx={{ color: "text.primary" }}
                      >
                        AI Response
                      </Typography>
                    </>
                  )}
                </Box>
                <Box sx={{ color: "text.primary" }}>
                  <Streamdown>{result || response}</Streamdown>
                </Box>
              </Box>
            )}

            <div ref={chatEndRef} />
          </Box>
        </Box>

        {/* Bottom Input Area */}
        <Box
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: "background.paper",
            p: 2,
          }}
        >
          <Box sx={{ maxWidth: 1000, mx: "auto" }}>
            {/* Controls */}
            <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
              {activeFeature === "ai" ? (
                <>
                  <FormControl size="small" sx={{ minWidth: 250 }}>
                    <InputLabel>AI Model</InputLabel>
                    <Select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      label="AI Model"
                      MenuProps={{
                        PaperProps: {
                          style: { maxHeight: 400 },
                        },
                      }}
                    >
                      <ListSubheader>DeepSeek Models</ListSubheader>
                      {deepseekModels.map((model) => (
                        <MenuItem key={model.id} value={model.id}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography>{model.name}</Typography>
                            <Tooltip
                              title={
                                <Box>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: "bold" }}
                                  >
                                    {model.name}
                                  </Typography>
                                  <Typography variant="body2">
                                    {model.description}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{ mt: 1, fontWeight: "bold" }}
                                  >
                                    Pricing:
                                  </Typography>
                                  <Typography variant="body2">
                                    Input: {model.pricing.input}
                                  </Typography>
                                  <Typography variant="body2">
                                    Output: {model.pricing.output}
                                  </Typography>
                                </Box>
                              }
                              placement="right"
                              arrow
                            >
                              <InfoIcon
                                fontSize="small"
                                sx={{ ml: 1, color: "action.active" }}
                              />
                            </Tooltip>
                          </Box>
                        </MenuItem>
                      ))}
                      <ListSubheader>ChatGPT Models</ListSubheader>
                      {chatgptModels.map((model) => (
                        <MenuItem key={model.id} value={model.id}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography>{model.name}</Typography>
                            <Tooltip
                              title={
                                <Box>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: "bold" }}
                                  >
                                    {model.name}
                                  </Typography>
                                  <Typography variant="body2">
                                    {model.description}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{ mt: 1, fontWeight: "bold" }}
                                  >
                                    Pricing:
                                  </Typography>
                                  <Typography variant="body2">
                                    Input: {model.pricing.input}
                                  </Typography>
                                  <Typography variant="body2">
                                    Output: {model.pricing.output}
                                  </Typography>
                                </Box>
                              }
                              placement="right"
                              arrow
                            >
                              <InfoIcon
                                fontSize="small"
                                sx={{ ml: 1, color: "action.active" }}
                              />
                            </Tooltip>
                          </Box>
                        </MenuItem>
                      ))}
                      <ListSubheader>Claude Models</ListSubheader>
                      {claudeModels.map((model) => (
                        <MenuItem key={model.id} value={model.id}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography>{model.name}</Typography>
                            <Tooltip
                              title={
                                <Box>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: "bold" }}
                                  >
                                    {model.name}
                                  </Typography>
                                  <Typography variant="body2">
                                    {model.description}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{ mt: 1, fontWeight: "bold" }}
                                  >
                                    Pricing:
                                  </Typography>
                                  <Typography variant="body2">
                                    Input: {model.pricing.input}
                                  </Typography>
                                  <Typography variant="body2">
                                    Output: {model.pricing.output}
                                  </Typography>
                                </Box>
                              }
                              placement="right"
                              arrow
                            >
                              <InfoIcon
                                fontSize="small"
                                sx={{ ml: 1, color: "action.active" }}
                              />
                            </Tooltip>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    size="small"
                    label="Temperature"
                    type="number"
                    value={temperature}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (val >= 0 && val <= 2) setTemperature(val);
                    }}
                    inputProps={{ min: 0, max: 2, step: 0.1 }}
                    sx={{ width: 120 }}
                  />
                </>
              ) : (
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Tone</InputLabel>
                  <Select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    label="Tone"
                  >
                    {tones.map((toneOption) => (
                      <MenuItem key={toneOption} value={toneOption}>
                        {toneOption.charAt(0).toUpperCase() +
                          toneOption.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>

            {/* Input Box */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                fullWidth
                multiline
                maxRows={6}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder={
                  activeFeature === "email"
                    ? "Paste your email here..."
                    : "Ask me anything..."
                }
                variant="outlined"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSend}
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
          </Box>
        </Box>
      </Box>
    </Box>
  );
}