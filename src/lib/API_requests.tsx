export const rewriteEmail = async (email: string, tone: string): Promise<string> => {
  try {
    const response = await fetch('/api/email/rewrite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        tone,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to rewrite email');
    }
    
    const data = await response.json();
    return data.rewritten_email || 'No response received.';
    
  } catch (error) {
    console.error('Error rewriting email:', error);
    throw error; // Re-throw so component can handle it
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
