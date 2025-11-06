import { useState } from "react";
import {
  Box,
  Button,
  Container,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  Avatar,
  LinearProgress,
  Divider,
  Tabs,
  Tab,
  styled,
  useTheme,
  FormControl,
  InputLabel,
} from "@mui/material";
import { rewriteEmail, askAI } from "../components/API_requests";
import { tones, deepseekModels, chatgptModels, claudeModels } from "../components/data";
import {
  Email,
  Chat,
  AutoFixHigh,
  Psychology,
  SettingsSuggest,
  Lightbulb,
} from "@mui/icons-material";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: "16px",
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
  background: theme.palette.background.paper,
}));

const FeatureTabs = styled(Tabs)({
  marginBottom: "24px",
  "& .MuiTabs-indicator": {
    height: 4,
  },
});

const FeatureTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontSize: "1rem",
  fontWeight: 500,
  minWidth: "120px",
  "&.Mui-selected": {
    color: theme.palette.primary.main,
  },
}));

export default function Home() {
  const theme = useTheme();
  const [activeFeature, setActiveFeature] = useState<"email" | "ai">("email");
  const [email, setEmail] = useState("");
  const [tone, setTone] = useState("professional");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiModel, setAiModel] = useState("deepseek-chat");
  const [temperature, setTemperature] = useState(0.7);

  const handleEmailSubmit = async () => {
    setLoading(true);
    setResult("");
    const response = await rewriteEmail(email, tone);
    setResult(response);
    setLoading(false);
  };

  const handleAISubmit = async () => {
    setLoading(true);
    setResult("");
    const response = await askAI(question, aiModel, temperature);
    setResult(response);
    setLoading(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <StyledPaper>
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={1}
            >
              <SettingsSuggest fontSize="large" color="primary" />
              AI Assistant
            </Box>
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Enhance your productivity with AI-powered tools
          </Typography>
        </Box>

        {/* Feature Selection Tabs */}
        <FeatureTabs
          value={activeFeature === "email" ? 0 : 1}
          onChange={(_, newValue) =>
            setActiveFeature(newValue === 0 ? "email" : "ai")
          }
          centered
        >
          <FeatureTab
            icon={<Email />}
            iconPosition="start"
            label="Email Assistant"
          />
          <FeatureTab
            icon={<Psychology />}
            iconPosition="start"
            label="AI Chat"
          />
        </FeatureTabs>

        {activeFeature === "email" ? (
          <>
            <Typography variant="h6" fontWeight="medium" gutterBottom>
              <AutoFixHigh
                color="primary"
                sx={{ verticalAlign: "middle", mr: 1 }}
              />
              Email Rewriter
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Paste your email below and select a tone to get an improved
              version
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              label="Original Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Box display="flex" gap={3} mb={4}>
              <FormControl fullWidth>
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

              <Button
                variant="contained"
                size="large"
                onClick={handleEmailSubmit}
                disabled={loading || !email.trim()}
                sx={{ minWidth: 200 }}
                startIcon={<AutoFixHigh />}
              >
                {loading ? "Rewriting..." : "Rewrite Email"}
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="h6" fontWeight="medium" gutterBottom>
              <Chat color="primary" sx={{ verticalAlign: "middle", mr: 1 }} />
              AI Chat
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Ask questions to different AI models with adjustable creativity
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              label="Your question or prompt"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Box display="flex" gap={3} mb={4} flexWrap="wrap">
              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>AI Model</InputLabel>
                <Select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  label="AI Model"
                >
                  <Box px={2} py={1}>
                    <Typography variant="overline" color="text.secondary">
                      DeepSeek Models for chat and reasoning
                    </Typography>
                  </Box>
                  {deepseekModels.map((model) => (
                    <MenuItem key={model.id} value={model.id}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: theme.palette.primary.main,
                          }}
                        >
                          <Typography variant="caption">DS</Typography>
                        </Avatar>
                        <Box>
                          <Typography>{model.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {model.description}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}

                  <Divider sx={{ my: 1 }} />

                  <Box px={2} py={1}>
                    <Typography variant="overline" color="text.secondary">
                      ChatGPT Models for various tasks
                    </Typography>
                  </Box>
                  {chatgptModels.map((model) => (
                    <MenuItem key={model.id} value={model.id}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: theme.palette.success.main,
                          }}
                        >
                          <Typography variant="caption">GPT</Typography>
                        </Avatar>
                        <Box>
                          <Typography>{model.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {model.description}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}

                  <Box px={2} py={1}>
                    <Typography variant="overline" color="text.secondary">
                      Claude Models for programming
                    </Typography>
                  </Box>
                  {claudeModels.map((model) => (
                    <MenuItem key={model.id} value={model.id}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: theme.palette.error.main,
                          }}
                        >
                          <Typography variant="caption">Cld</Typography>
                        </Avatar>
                        <Box>
                          <Typography>{model.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {model.description}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ width: 180 }}>
                <TextField
                  label="Creativity"
                  type="number"
                  value={temperature}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (val >= 0 && val <= 2) setTemperature(val);
                  }}
                  inputProps={{
                    min: 0,
                    max: 2,
                    step: 0.1,
                  }}
                  helperText="0 = precise, 2 = creative"
                />
              </FormControl>

              <Button
                variant="contained"
                size="large"
                onClick={handleAISubmit}
                disabled={loading || !question.trim()}
                sx={{ minWidth: 120 }}
                startIcon={<Lightbulb />}
              >
                {loading ? "Thinking..." : "Ask AI"}
              </Button>
            </Box>
          </>
        )}

        {loading && <LinearProgress sx={{ mb: 3 }} />}

        {result && (
          <Box
            mt={4}
            p={3}
            border={`1px solid ${theme.palette.divider}`}
            borderRadius="12px"
            bgcolor={theme.palette.background.default}
          >
            <Typography variant="h6" fontWeight="medium" gutterBottom>
              {activeFeature === "email" ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <AutoFixHigh color="primary" />
                  Rewritten Email
                </Box>
              ) : (
                <Box display="flex" alignItems="center" gap={1}>
                  <Chat color="primary" />
                  AI Response
                </Box>
              )}
            </Typography>
            <Typography variant="body1" whiteSpace="pre-wrap">
              {result}
            </Typography>
          </Box>
        )}
      </StyledPaper>
    </Container>
  );
}
