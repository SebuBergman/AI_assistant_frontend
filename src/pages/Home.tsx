
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Drawer,
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
  Add as AddIcon,
  Email,
  Psychology,
  AutoFixHigh,
  Chat,
  Send,
  SettingsSuggest,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

import { askAI, rewriteEmail } from '../components/API_requests';
import { chatgptModels, claudeModels, deepseekModels, tones } from '../components/data';

export default function AIAssistant() {
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [response, result, reasoning]);

  const handleStream = async () => {
    if (!prompt || !selectedModel) return;

    setLoading(true);
    setIsStreaming(true);
    setResponse("");
    setReasoning("");
    setResult("");
    setError("");

    try {
      const res = await askAI(prompt, selectedModel, temperature);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get response reader");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.error) {
                console.error("Error:", data.error);
                setError(`Error: ${data.error}`);
                break;
              }

              if (data.done) {
                break;
              }

              if (data.type === "reasoning") {
                setReasoning((prev) => prev + data.content);
              } else if (data.type === "content" || data.content) {
                setResponse((prev) => prev + data.content);
              }
            } catch (e) {
              console.error("Parse error:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error);
      setError(`Streaming error: ${error || "Unknown error"}`);
    } finally {
      setIsStreaming(false);
      setLoading(false);
      setCurrentInput('');
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
      handleStream();
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
      <Drawer
        variant="persistent"
        open={sidebarOpen}
        sx={{
          width: sidebarOpen ? 260 : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 260,
            boxSizing: 'border-box',
            bgcolor: '#1a1a1a',
            borderRight: 'none',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            fullWidth
            sx={{ 
              mb: 2, 
              justifyContent: 'flex-start',
              color: 'white',
              borderColor: 'rgba(255,255,255,0.2)',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.3)',
                bgcolor: 'rgba(255,255,255,0.05)',
              }
            }}
          >
            New Chat
          </Button>
          
          <Typography variant="caption" sx={{ px: 1, mb: 1, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
            CHAT HISTORY
          </Typography>
          
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <Typography variant="body2" sx={{ px: 1, py: 2, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
              No saved chats yet
            </Typography>
          </Box>
        </Box>
      </Drawer>

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