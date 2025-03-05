import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendMessage } from '../src/api';

// Mock do fetch global
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock do import.meta.env
vi.mock('import.meta', () => ({
  env: {
    VITE_OPENAI_API_URL: 'https://api.openai.com/v1',
    VITE_OPENAI_API_KEY: 'test-key'
  }
}));

describe('API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('deve enviar uma mensagem e retornar a resposta do assistente', async () => {
    // Configurar o mock do fetch para retornar uma resposta bem-sucedida
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: 'Resposta do assistente',
              role: 'assistant'
            }
          }
        ]
      })
    });

    const messages = [
      { role: 'user', content: 'Olá, como vai?' }
    ];

    const response = await sendMessage(messages);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(response).toEqual({
      role: 'assistant',
      content: 'Resposta do assistente'
    });
  });

  it('deve lançar um erro quando a resposta da API não for ok', async () => {
    // Configurar o mock do fetch para retornar uma resposta de erro
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401
    });

    const messages = [
      { role: 'user', content: 'Olá, como vai?' }
    ];

    try {
      await sendMessage(messages);
      // Se chegar aqui, o teste falha
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain('Erro na API: 401');
    }
  });

  it('deve lançar um erro quando ocorrer uma falha na rede', async () => {
    // Configurar o mock do fetch para lançar um erro
    mockFetch.mockRejectedValueOnce(new Error('Falha na rede'));

    const messages = [
      { role: 'user', content: 'Olá, como vai?' }
    ];

    try {
      await sendMessage(messages);
      // Se chegar aqui, o teste falha
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toBe('Falha na rede');
    }
  });
}); 