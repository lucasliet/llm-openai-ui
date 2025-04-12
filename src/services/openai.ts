import { Model, ModelsResponse } from '../types/chat';
import { createOpenAI } from '@ai-sdk/openai';
import { CoreMessage, streamText } from 'ai';

const openai = createOpenAI({
  baseURL: import.meta.env.VITE_OPENAI_API_URL,
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

export async function getModels(): Promise<Model[]> {
  const cachedModels = sessionStorage.getItem('models');
  if (cachedModels) {
    return JSON.parse(cachedModels);
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_OPENAI_API_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
    });

    if (!response.ok) {
      console.log(response)
      throw new Error(`Erro ao buscar modelos: ${response.status}`);
    }

    const data: ModelsResponse = await response.json();
    sessionStorage.setItem('models', JSON.stringify(data.data));
    return data.data;
  } catch (error) {
    console.error('Erro ao buscar modelos:', error);
    throw error;
  }
}

export async function sendMessage(
  messages: CoreMessage[],
  model: string,
  onStream: (chunk: string) => void
): Promise<CoreMessage> {
  try {
    const response = streamText({
      model: openai(model),
      messages,
      temperature: 0.7,
      maxRetries: 1,
    });

    let fullContent = '';
    for await (const chunk of response.textStream) {
      fullContent += chunk;
      console.log('Chunk received:', chunk);
      onStream(chunk);
    }

    console.log('Full content:', fullContent);

    return {
      role: 'assistant',
      content: fullContent,
    };
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw error;
  }
}