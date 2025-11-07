import axios from "axios";

export const rewriteEmail = async (email: string, tone: string) => {
  try {
    const response = await axios.post("http://localhost:8000/email_assistant", {
      email,
      tone,
    });
    return response.data.rewritten_email || "No response received.";
  } catch (error) {
    console.error("Error:", error);
    return "An error occurred while processing your request.";
  }
};

export const askAI = async (
  question: string,
  model: string,
  temperature: number
) => {
  try {
    const response = await fetch("http://localhost:8000/ask_ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        model,
        temperature,
      }),
    });
    
    return response; // Return the Response object directly for streaming
  } catch (error) {
    console.error("Error:", error);
    throw error; // Throw the error so it can be caught in Home.tsx
  }
};
