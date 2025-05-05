import { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Container,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

export default function Home() {
  const [email, setEmail] = useState("");
  const [tone, setTone] = useState("professional");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const tones = ["professional", "friendly", "persuasive"];

  const handleSubmit = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await axios.post(
        "http://localhost:8000/email_assistant",
        {
          email,
          tone,
        }
      );
      setResult(response.data.rewritten_email || "No response received.");
    } catch (error) {
      console.error("Error:", error);
      setResult("An error occurred while processing your request.");
    } finally {
      setLoading(false);
    }
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
          Email Rewriter
        </Typography>
        <Typography variant="body1" style={{ color: "black" }}>
          Rewrite and summarize your email with your chosen tone (professional,
          friendly, or persuasive).
        </Typography>

        <Box width={"100%"} style={{ marginBottom: "10px", marginTop: "25px" }}>
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
            style={{ display: "block", marginBottom: "8px", color: "black" }}
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
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Processing..." : "Rewrite Email"}
        </Button>

        {result && (
          <Box
            style={{
              marginTop: "20px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <Typography variant="h6" style={{ color: "black" }}>
              Rewritten Email:
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
