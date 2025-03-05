import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useChat } from '../../src/hooks/useChat';

// Mock das funções do serviço de OpenAI
vi.mock('../../src/services/openai', () => ({
  getModels: vi.fn().mockImplementation(async () => {
    return [
      { id: 'model1', object: 'model', created: 123, owned_by: 'openai' }
    ];
  }),
  sendMessage: vi.fn().mockImplementation(async (messages, model, onStream) => {
    onStream('Olá');
    onStream(', mundo!');
    return {
      role: 'assistant',
      content: 'Olá, mundo!'
    };
  })
}));

// Importamos após o mock para garantir que o mock seja aplicado
import { getModels, sendMessage } from '../../src/services/openai';

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty messages and load models', async () => {
    const { result } = renderHook(() => useChat());
    
    expect(result.current.messages).toEqual([]);
    expect(result.current.input).toBe('');
    expect(result.current.systemMessage).toBe('');
    expect(result.current.isLoading).toBe(false);
    
    // Espera a carga dos modelos
    await waitFor(() => {
      expect(result.current.isLoadingModels).toBe(false);
    });
    
    expect(getModels).toHaveBeenCalledTimes(1);
    expect(result.current.models).toEqual([
      { id: 'model1', object: 'model', created: 123, owned_by: 'openai' }
    ]);
    expect(result.current.selectedModel).toBe('model1');
  });

  it('should handle message submission and response', async () => {
    const { result } = renderHook(() => useChat());
    
    // Espera a carga dos modelos
    await waitFor(() => {
      expect(result.current.isLoadingModels).toBe(false);
    });
    
    // Define o texto de entrada
    act(() => {
      result.current.setInput('Olá!');
    });
    
    // Simula o envio do formulário
    await act(async () => {
      const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.handleSubmit(event);
    });
    
    // Verifica se a mensagem do usuário foi adicionada
    expect(result.current.messages[0]).toEqual({
      role: 'user',
      content: 'Olá!'
    });
    
    // Verifica se a resposta do assistente foi adicionada
    expect(result.current.messages[1].role).toBe('assistant');
    expect(result.current.messages[1].content).toBe('Olá, mundo!');
    
    // Verifica se a entrada foi limpa
    expect(result.current.input).toBe('');
  });

  it('should include system message when provided', async () => {
    const { result } = renderHook(() => useChat());
    
    // Espera a carga dos modelos
    await waitFor(() => {
      expect(result.current.isLoadingModels).toBe(false);
    });
    
    // Define o texto de entrada e a system message
    act(() => {
      result.current.setInput('Olá!');
      result.current.setSystemMessage('Seja amigável');
    });
    
    // Simula o envio do formulário
    await act(async () => {
      const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.handleSubmit(event);
    });
    
    // Verifica se o sendMessage foi chamado com a system message
    expect(sendMessage).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ role: 'system', content: 'Seja amigável' }),
        expect.objectContaining({ role: 'user', content: 'Olá!' })
      ]),
      'model1',
      expect.any(Function)
    );
  });

  it('should not submit empty messages', async () => {
    const { result } = renderHook(() => useChat());
    
    // Define uma entrada vazia
    act(() => {
      result.current.setInput('   ');
    });
    
    // Tenta enviar
    await act(async () => {
      const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.handleSubmit(event);
    });
    
    // Verifica que nenhuma mensagem foi adicionada
    expect(result.current.messages).toEqual([]);
    expect(sendMessage).not.toHaveBeenCalled();
  });
}); 