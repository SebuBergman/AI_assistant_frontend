import { useState } from "react";
import {
  Box,
  Button,
  Container,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { rewriteEmail, askAI } from "../components/API_requests";
import { tones, deepseekModels, chatgptModels } from "../components/data";

export default function Home() {
  const [activeFeature, setActiveFeature] = useState("email");
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
    <Container maxWidth="md" style={{ padding: "20px" }}>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        style={{
          backgroundColor: "white",
          padding: "40px 20px 40px 20px",
          borderRadius: "10px",
        }}
      >
        <Typography variant="h1" style={{ color: "black" }}>
          AI Assistant
        </Typography>

        {/* Feature Selection Menu */}
        <Box style={{ marginBottom: "20px", width: "100%" }}>
          <Select
            value={activeFeature}
            onChange={(e) => setActiveFeature(e.target.value)}
            style={{ width: "100%" }}
          >
            <MenuItem value="email">Email Assistant</MenuItem>
            <MenuItem value="ask-ai">Ask the AI</MenuItem>
          </Select>
        </Box>

        {activeFeature === "email" ? (
          <>
            <Typography variant="body1" style={{ color: "black" }}>
              Rewrite and summarize your email with your chosen tone
              (professional, friendly, or persuasive).
            </Typography>

            <Box
              width={"100%"}
              style={{ marginBottom: "10px", marginTop: "25px" }}
            >
              <TextField
                id="email"
                label="Enter your email here"
                multiline
                rows={4}
                style={{
                  width: "100%",
                  fontSize: "16px",
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Box>

            <Box
              style={{ marginBottom: "20px" }}
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              <Typography
                variant="body1"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "black",
                }}
              >
                Select a tone:
              </Typography>
              <Select
                id="tone"
                style={{ width: "100%", padding: "10px", fontSize: "16px" }}
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                {tones.map((toneOption) => (
                  <MenuItem key={toneOption} value={toneOption}>
                    {toneOption.charAt(0).toUpperCase() + toneOption.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Button
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#007BFF",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                borderRadius: "5px",
              }}
              onClick={handleEmailSubmit}
              disabled={loading}
            >
              {loading ? "Processing..." : "Rewrite Email"}
            </Button>
          </>
        ) : (
          <>
            <Typography variant="body1" style={{ color: "black" }}>
              Ask different AI models to answer your prompts.
            </Typography>

            <Box
              width={"100%"}
              style={{ marginBottom: "10px", marginTop: "25px" }}
            >
              <TextField
                id="question"
                label="Enter your question here"
                multiline
                rows={4}
                style={{
                  width: "100%",
                  fontSize: "16px",
                }}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </Box>

            <Box
              style={{ marginBottom: "20px", width: "100%" }}
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              <Typography
                variant="body1"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "black",
                }}
              >
                Creativity/Temperature (0-2):
              </Typography>
              <TextField
                type="number"
                inputProps={{
                  min: 0,
                  max: 2,
                  step: 0.1,
                }}
                value={temperature}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (val >= 0 && val <= 2) {
                    setTemperature(val);
                  }
                }}
                style={{ width: "100%" }}
                helperText="Lower = more factual, Higher = more creative"
              />
            </Box>

            <Box
              style={{ marginBottom: "20px" }}
              display="flex"
              flexDirection="column"
              alignItems="center"
              width="100%"
            >
              <Typography
                variant="body1"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "black",
                }}
              >
                Select an AI model:
              </Typography>

              <Select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                style={{ width: "100%" }}
              >
                <Typography
                  variant="h6"
                  style={{ padding: "8px 16px", color: "gray" }}
                >
                  DeepSeek Models
                </Typography>
                {deepseekModels.map((model) => (
                  <MenuItem key={model.id} value={model.id}>
                    {model.name}
                  </MenuItem>
                ))}

                <Typography
                  variant="h6"
                  style={{ padding: "8px 16px", color: "gray" }}
                >
                  ChatGPT Models
                </Typography>
                {chatgptModels.map((model) => (
                  <MenuItem key={model.id} value={model.id}>
                    {model.name}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Button
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#007BFF",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                borderRadius: "5px",
              }}
              onClick={handleAISubmit}
              disabled={loading}
            >
              {loading ? "Processing..." : "Ask AI"}
            </Button>
          </>
        )}

        {result && (
          <Box
            style={{
              marginTop: "20px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              backgroundColor: "#f9f9f9",
              width: "100%",
            }}
          >
            <Typography variant="h6" style={{ color: "black" }}>
              {activeFeature === "email" ? "Rewritten Email:" : "AI Response:"}
            </Typography>
            <Typography variant="body1" style={{ color: "black" }}>
              {result}
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
}
