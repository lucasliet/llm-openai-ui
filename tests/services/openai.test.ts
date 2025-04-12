import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getModels, sendMessage } from '../../src/services/openai';
import { Message, Model } from '../../src/types/chat';
import { fail } from 'assert';

// Mock das funções
vi.mock('../../src/services/openai', () => ({
  getModels: vi.fn(),
  sendMessage: vi.fn()
}));

describe('OpenAI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getModels', () => {
    it('deve retornar modelos do cache se disponíveis', async () => {
      const mockModels: Model[] = [
        { id: 'gpt-3.5-turbo', object: 'model', created: 1677610602, owned_by: 'openai' },
        { id: 'gpt-4', object: 'model', created: 1687882411, owned_by: 'openai' }
      ];
      
      vi.mocked(getModels).mockResolvedValue(mockModels);
      
      const result = await getModels();
      
      expect(getModels).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockModels);
    });

    it('deve lançar um erro quando a resposta da API não for ok', async () => {
      vi.mocked(getModels).mockRejectedValue(new Error('Erro ao buscar modelos: 401'));
      
      try {
        await getModels();
        // Se chegar aqui, o teste falha
        fail('Test should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('Erro ao buscar modelos: 401');
      }
    });

    it('deve lançar um erro quando ocorrer uma falha na rede', async () => {
      vi.mocked(getModels).mockRejectedValue(new Error('Falha na rede'));
      
      try {
        await getModels();
        // Se chegar aqui, o teste falha
        fail('Test should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('Falha na rede');
      }
    });
  });

  describe('sendMessage', () => {
    it('deve enviar uma mensagem e processar o streaming corretamente', async () => {
      const messages: Message[] = [
        { role: 'user', content: 'Olá, como vai?' }
      ];
      
      const mockResponse: Message = {
        role: 'assistant',
        content: 'Olá, mundo!'
      };
      
      const onStream = vi.fn();
      
      vi.mocked(sendMessage).mockImplementation(async (msgs, model, onStreamFn) => {
        onStreamFn('Olá');
        onStreamFn(', ');
        onStreamFn('mundo!');
        return mockResponse;
      });
      
      const response = await sendMessage(messages, 'gpt-3.5-turbo', onStream);
      
      expect(sendMessage).toHaveBeenCalledWith(messages, 'gpt-3.5-turbo', onStream);
      expect(onStream).toHaveBeenCalledTimes(3);
      expect(onStream).toHaveBeenNthCalledWith(1, 'Olá');
      expect(onStream).toHaveBeenNthCalledWith(2, ', ');
      expect(onStream).toHaveBeenNthCalledWith(3, 'mundo!');
      expect(response).toEqual(mockResponse);
    });

    it('deve lançar um erro quando a resposta da API não for ok', async () => {
      const messages: Message[] = [
        { role: 'user', content: 'Olá, como vai?' }
      ];
      
      const onStream = vi.fn();
      
      vi.mocked(sendMessage).mockRejectedValue(new Error('Erro na API: 401'));
      
      try {
        await sendMessage(messages, 'gpt-3.5-turbo', onStream);
        // Se chegar aqui, o teste falha
        fail('Test should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('Erro na API: 401');
      }
    });

    it('deve lançar um erro quando o stream não estiver disponível', async () => {
      const messages: Message[] = [
        { role: 'user', content: 'Olá, como vai?' }
      ];
      
      const onStream = vi.fn();
      
      vi.mocked(sendMessage).mockRejectedValue(new Error('Stream não disponível'));
      
      try {
        await sendMessage(messages, 'gpt-3.5-turbo', onStream);
        // Se chegar aqui, o teste falha
        fail('Test should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('Stream não disponível');
      }
    });

    it('deve lidar com erros de processamento de chunks', async () => {
      const messages: Message[] = [
        { role: 'user', content: 'Olá, como vai?' }
      ];
      
      const mockResponse: Message = {
        role: 'assistant',
        content: 'Olámundo!'
      };
      
      const onStream = vi.fn();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      vi.mocked(sendMessage).mockImplementation(async (msgs, model, onStreamFn) => {
        onStreamFn('Olá');
        // Simular um erro de processamento
        console.error('Erro ao processar chunk');
        onStreamFn('mundo!');
        return mockResponse;
      });
      
      const response = await sendMessage(messages, 'gpt-3.5-turbo', onStream);
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(onStream).toHaveBeenCalledTimes(2);
      expect(response).toEqual(mockResponse);
      
      consoleErrorSpy.mockRestore();
    });
  });
}); 