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