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
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { rewriteEmail } from '@/lib/API_requests';
import { chatgptModels, claudeModels, deepseekModels, tones } from '@/components/data';
import ChatSidebar from '@/components/chatSidebar';

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

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isNewChat, setIsNewChat] = useState(true);

  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [response, result, reasoning]);

  // Load messages when chat is selected
  useEffect(() => {
    if (currentChatId) {
      loadChatMessages(currentChatId);
    }
  }, [currentChatId]);

  const loadChatMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`);
      if (!response.ok) throw new Error('Failed to load messages');
      
      const data = await response.json();
      setMessages(data.messages);
      setIsNewChat(false);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
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
    let userMessage = prompt.trim()

    setLoading(true);
    setIsStreaming(true);
    setResponse("");
    setReasoning("");
    setError("");

    try {
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

      console.log(createRes)
      console.log('Create response status:', createRes.status);
      console.log('Create response ok:', createRes.ok);

      if (!createRes.ok) {
        const errorText = await createRes.text();
        console.log('Error response:', errorText);
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

      if (!aiRes.ok) throw new Error("Failed to save AI response");

      const aiData = await aiRes.json();
      setMessages(prev => [...prev, aiData.message]);
    }
  } catch (err) {
    console.error("Stream error:", err);
    setError(`Streaming error: ${err}`);
  } finally {
    setIsStreaming(false);
    setLoading(false);
    setCurrentInput("");
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
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* Sidebar */}
      <ChatSidebar
        sidebarOpen={sidebarOpen}
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
      />

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top AppBar with Tabs */}
        <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: 'white' }}>
          <Toolbar>
            <IconButton
              edge="start"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 3 }}>
              <SettingsSuggest color="primary" />
              <Typography variant="h6" fontWeight="bold">
                AI Assistant
              </Typography>
            </Box>

            <Tabs
              value={activeFeature === 'email' ? 0 : 1}
              onChange={(_, newValue) =>
                setActiveFeature(newValue === 0 ? 'email' : 'ai')
              }
            >
              <Tab icon={<Email />} iconPosition="start" label="Email Assistant" />
              <Tab icon={<Psychology />} iconPosition="start" label="AI Chat" />
            </Tabs>
          </Toolbar>
        </AppBar>

        {/* Chat Area */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            bgcolor: 'background.default',
          }}
        >
          <Box sx={{ maxWidth: 1000, width: '100%', mx: 'auto', p: 3 }}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 3 }} 
                onClose={() => setError('')}
                action={
                  <IconButton size="small" onClick={() => setError('')}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                }
              >
                {error}
              </Alert>
            )}

            {/* Welcome Message */}
            {!response && !result && (
              <Box textAlign="center" py={12}>
                <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={2}>
                  {activeFeature === 'email' ? (
                    <>
                      <AutoFixHigh sx={{ fontSize: 40 }} color="primary" />
                      <Typography variant="h3" fontWeight="bold">
                        Email Rewriter
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Chat sx={{ fontSize: 40 }} color="primary" />
                      <Typography variant="h3" fontWeight="bold">
                        AI Chat
                      </Typography>
                    </>
                  )}
                </Box>
                <Typography variant="h6" color="text.secondary">
                  {activeFeature === 'email'
                    ? 'Paste your email and select a tone to get an improved version'
                    : 'Ask questions to different AI models with adjustable creativity'}
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
                bgcolor={theme.palette.warning.light + '20'}
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
                    fontFamily: 'monospace', 
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
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
                  {activeFeature === 'email' ? (
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
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {result || response}
                </Typography>
              </Box>
            )}
            
            <div ref={chatEndRef} />
          </Box>
        </Box>

        {/* Bottom Input Area */}
        <Box
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            p: 2,
          }}
        >
          <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
            {/* Controls */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              {activeFeature === 'ai' ? (
                <>
                  <FormControl size="small" sx={{ minWidth: 250 }}>
                    <InputLabel>AI Model</InputLabel>
                    <Select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      label="AI Model"
                    >
                      <ListSubheader>DeepSeek Models</ListSubheader>
                      {deepseekModels.map((model) => (
                        <MenuItem key={model.id} value={model.id}>
                          {model.name}
                        </MenuItem>
                      ))}
                      <ListSubheader>ChatGPT Models</ListSubheader>
                      {chatgptModels.map((model) => (
                        <MenuItem key={model.id} value={model.id}>
                          {model.name}
                        </MenuItem>
                      ))}
                      <ListSubheader>Claude Models</ListSubheader>
                      {claudeModels.map((model) => (
                        <MenuItem key={model.id} value={model.id}>
                          {model.name}
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
                        {toneOption.charAt(0).toUpperCase() + toneOption.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>

            {/* Input Box */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                fullWidth
                multiline
                maxRows={6}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder={
                  activeFeature === 'email'
                    ? 'Paste your email here...'
                    : 'Ask me anything...'
                }
                variant="outlined"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
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
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
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