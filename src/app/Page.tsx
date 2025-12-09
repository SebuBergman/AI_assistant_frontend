'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  Typography,
  IconButton,
  LinearProgress,
  Alert,
  FormControl,
  InputLabel,
  ListSubheader,
  Tooltip,
  FormControlLabel,
  Switch,
  Chip,
} from '@mui/material';
import {
  Send,
  Close as CloseIcon,
  FlashOn,
  Folder as FolderIcon,
} from '@mui/icons-material';
import { useColorScheme, useTheme } from '@mui/material/styles';
import { rewriteEmail } from '@/lib/API_requests';
import { chatgptModels, claudeModels, deepseekModels, tones } from '@/components/data';
import ChatSidebar from '@/components/chatSidebar';
import "highlight.js/styles/github.css";
import InfoIcon from "@mui/icons-material/Info";
import { Message, SavedDocument } from "@/app/types";
import TopBar from '@/components/shared/TopBar';
import { ChatMessages } from '@/components/chat/ChatMessages';
import WelcomeMessage from '@/components/shared/WelcomeMessage';
import ReasoningBox from '@/components/chat/ReasoningBox';
import ResponseBox from '@/components/chat/ResponseBox';
import { DocumentsDialog } from '@/components/chat/DocumentDialog';
import { fetchSavedDocuments } from './api/ragAPI';

export default function AIAssistant() {
  const theme = useTheme();
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const [activeFeature, setActiveFeature] = useState<"email" | "ai">("ai");
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

  // File upload and RAG state
  const [uploadedFiles, setUploadedFiles] = useState<SavedDocument[]>([]);
  const [isRagEnabled, setIsRagEnabled] = useState(false);
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [keyword, setKeyword] = useState('');
  const [useCached, setUseCached] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [response, result, reasoning]);

  // Load messages when chat is selected
  useEffect(() => {
    if (currentChatId) {
      loadChatMessages(currentChatId);
    }
  }, [currentChatId]);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const docs = await fetchSavedDocuments();
    setUploadedFiles(docs);
  };

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
  const streamChat = async (
    question: string, 
    model: string, 
    temperature: number,
    ragOptions?: {
      ragEnabled: boolean;
      file_name?: string;
      keyword?: string;
      cached?: boolean;
      alpha?: number;
    }
  ) => {
    const response = await fetch("/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        question, 
        model, 
        temperature,
        ragEnabled: ragOptions?.ragEnabled || false,
        file_name: ragOptions?.file_name || '',
        keyword: ragOptions?.keyword || '',
        cached: ragOptions?.cached || false,
        alpha: ragOptions?.alpha || 0.7,
      }),
    });

    return response;
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
  console.log("handleStreamMessage called with prompt:", prompt);
  let userMessage = prompt.trim();
  console.log("userMessage:", userMessage);

  setLoading(true);
  setIsStreaming(true);
  setResponse("");
  setReasoning("");
  setError("");

  try {
    // If temporary chat mode, skip all database operations
    if (isTemporaryChat) {
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: userMessage,
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, userMsg]);

      // Start Streaming request with RAG options
      const streamRes = await streamChat(
        userMessage, 
        selectedModel, 
        temperature,
        {
          ragEnabled: isRagEnabled,
          file_name: selectedDocument,
          keyword: keyword,
          cached: useCached,
        }
      );

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

            // Handle RAG metadata
            if (json.metadata?.rag_enabled) {
              console.log('RAG is being used:', json.metadata);
            }

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

      const createData = await createRes.json();
      chatId = createData.chat.id;

      setCurrentChatId(chatId);
      setIsNewChat(false);

      setMessages([
        {
          id: Date.now().toString(),
          role: "user",
          content: userMessage,
          createdAt: new Date(),
        },
      ]);
    } else {
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

    // Start Streaming request with RAG options
    const streamRes = await streamChat(
      userMessage, 
      selectedModel, 
      temperature,
      {
        ragEnabled: isRagEnabled,
        file_name: selectedDocument,
        keyword: keyword,
        cached: useCached,
      }
    );

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

          // Handle RAG metadata
          if (json.metadata?.rag_enabled) {
            console.log('RAG is being used:', json.metadata);
          }

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

    // Save AI Message
    if (finalAIText.trim()) {
      const aiRes = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "assistant", content: finalAIText }),
      });

      setRefreshSidebar((prev) => prev + 1);

      if (!aiRes.ok) throw new Error("Failed to save AI response");

      const aiData = await aiRes.json();
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
        <TopBar
          activeFeature={activeFeature}
          setActiveFeature={setActiveFeature}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isRagEnabled={isRagEnabled}
          setIsRagEnabled={setIsRagEnabled}
          isTemporaryChat={isTemporaryChat}
          toggleTemporaryChat={() => {
            setIsTemporaryChat(!isTemporaryChat);
            if (!isTemporaryChat) {
              setCurrentChatId(null);
              setMessages([]);
              setResponse("");
              setReasoning("");
            }
          }}
          mode={mode}
          setMode={setMode}
        />

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
              <ChatMessages
                currentChatId={currentChatId}
                isTemporaryChat={isTemporaryChat}
                messages={messages}
              />
            )}

            {/* Welcome Message */}
            {!response && !result && messages.length === 0 && (
              <WelcomeMessage
                activeFeature={activeFeature}
                show={!response && !result && messages.length === 0}
              />
            )}

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {/* Reasoning Display */}
            {reasoning && (
              <ReasoningBox reasoning={reasoning} />
            )}

            {/* Response Display */}
            {(result || response) && (
              <ResponseBox
                response={response}
                result={result}
                feature={activeFeature}
              />
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

                  {/* Documents Button */}
                  <Tooltip title="Manage uploaded documents">
                    <IconButton
                      onClick={() => setDocumentsDialogOpen(true)}
                      color={uploadedFiles.length > 0 ? "primary" : "default"}
                      sx={{
                        border: 1,
                        borderColor: uploadedFiles.length > 0 ? 'primary.main' : 'divider',
                      }}
                    >
                      <FolderIcon />
                      {uploadedFiles.length > 0 && (
                        <Chip
                          label={uploadedFiles.length}
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

            {/* RAG Options - Show when RAG is enabled */}
            {activeFeature === "ai" && isRagEnabled && (
              <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                {/* Document Selector */}
                <FormControl size="small" sx={{ minWidth: 250 }}>
                  <InputLabel>Select Document</InputLabel>
                  <Select
                    value={selectedDocument}
                    onChange={(e) => setSelectedDocument(e.target.value)}
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
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Add keyword for hybrid search"
                  sx={{ minWidth: 200 }}
                />

                {/* Cache Toggle */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={useCached}
                      onChange={(e) => setUseCached(e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2">Use Cache</Typography>
                  }
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
            )}

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
                    : isRagEnabled && uploadedFiles.length > 0
                    ? "Ask a question about your documents..."
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
        {/* Documents Dialog */}
        <DocumentsDialog
          open={documentsDialogOpen}
          onClose={() => setDocumentsDialogOpen(false)}
          documents={uploadedFiles}
          onDocumentsUpdate={loadDocuments}
        />
      </Box>
    </Box>
  );
}