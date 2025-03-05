import { Message, Model, ModelsResponse } from '../types/chat';

export async function getModels(): Promise<Model[]> {
  // Verifica se os modelos estão no sessionStorage
  const cachedModels = sessionStorage.getItem('models');
  if (cachedModels) {
    return JSON.parse(cachedModels); // Retorna os modelos armazenados
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_OPENAI_API_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar modelos: ${response.status}`);
    }

    const data: ModelsResponse = await response.json();
    // Armazena os modelos no sessionStorage
    sessionStorage.setItem('models', JSON.stringify(data.data));
    return data.data;
  } catch (error) {
    console.error('Erro ao buscar modelos:', error);
    throw error;
  }
}

export async function sendMessage(
  messages: Message[], 
  model: string,
  onStream: (chunk: string) => void
): Promise<Message> {
  try {
    const response = await fetch(`${import.meta.env.VITE_OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Stream não disponível');

    let fullContent = '';
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            break;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content || '';
            fullContent += content;
            onStream(content);
          } catch (e) {
            console.error('Erro ao processar chunk:', e);
          }
        }
      }
    }

    return {
      role: 'assistant',
      content: fullContent,
    };
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw error;
  }
} 