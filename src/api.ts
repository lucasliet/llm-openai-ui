interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

export async function sendMessage(messages: Message[]): Promise<Message> {
  try {
    const response = await fetch(`${import.meta.env.VITE_OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data: ChatCompletionResponse = await response.json();
    
    return {
      role: 'assistant',
      content: data.choices[0].message.content,
    };
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw error;
  }
} 