import { describe, it, expect, vi, Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Chat } from '../../../src/components/chat/Chat';
import { useChat } from '../../../src/hooks/useChat';

// Mock do hook useChat
vi.mock('../../../src/hooks/useChat', () => ({
  useChat: vi.fn()
}));

describe('Chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the chat interface correctly', () => {
    // Configurar o mock do hook
    (useChat as Mock).mockReturnValue({
      messages: [],
      input: '',
      setInput: vi.fn(),
      isLoading: false,
      messagesEndRef: { current: null },
      handleSubmit: vi.fn(),
      models: [
        { id: 'model1', owned_by: 'openai' },
        { id: 'model2', owned_by: 'anthropic' }
      ],
      selectedModel: 'model1',
      setSelectedModel: vi.fn(),
      isLoadingModels: false,
      error: null
    });

    render(<Chat />);
    
    // Verificar se o seletor de modelo está presente
    expect(screen.getByLabelText(/modelo/i)).toBeInTheDocument();
    
    // Verificar se o campo de entrada está presente
    expect(screen.getByPlaceholderText(/digite sua mensagem/i)).toBeInTheDocument();
    
    // Verificar se o botão de envio está presente
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
  });

  it('should display messages correctly', () => {
    // Configurar o mock do hook com mensagens
    (useChat as Mock).mockReturnValue({
      messages: [
        { role: 'user', content: 'Olá, como vai?' },
        { role: 'assistant', content: 'Estou bem, obrigado por perguntar!' }
      ],
      input: '',
      setInput: vi.fn(),
      isLoading: false,
      messagesEndRef: { current: null },
      handleSubmit: vi.fn(),
      models: [{ id: 'model1', owned_by: 'openai' }],
      selectedModel: 'model1',
      setSelectedModel: vi.fn(),
      isLoadingModels: false,
      error: null
    });

    render(<Chat />);
    
    // Verificar se as mensagens são exibidas
    expect(screen.getByText('Olá, como vai?')).toBeInTheDocument();
    expect(screen.getByText('Estou bem, obrigado por perguntar!')).toBeInTheDocument();
  });

  it('should handle input changes', () => {
    const setInputMock = vi.fn();
    
    // Configurar o mock do hook
    (useChat as Mock).mockReturnValue({
      messages: [],
      input: '',
      setInput: setInputMock,
      isLoading: false,
      messagesEndRef: { current: null },
      handleSubmit: vi.fn(),
      models: [{ id: 'model1', owned_by: 'openai' }],
      selectedModel: 'model1',
      setSelectedModel: vi.fn(),
      isLoadingModels: false,
      error: null
    });

    render(<Chat />);
    
    // Simular digitação no campo de entrada
    const inputField = screen.getByPlaceholderText(/digite sua mensagem/i);
    fireEvent.change(inputField, { target: { value: 'Nova mensagem' } });
    
    // Verificar se a função setInput foi chamada com o valor correto
    expect(setInputMock).toHaveBeenCalledWith('Nova mensagem');
  });

  it('should handle form submission', () => {
    const handleSubmitMock = vi.fn();
    
    // Configurar o mock do hook
    (useChat as Mock).mockReturnValue({
      messages: [],
      input: 'Mensagem para enviar',
      setInput: vi.fn(),
      isLoading: false,
      messagesEndRef: { current: null },
      handleSubmit: handleSubmitMock,
      models: [{ id: 'model1', owned_by: 'openai' }],
      selectedModel: 'model1',
      setSelectedModel: vi.fn(),
      isLoadingModels: false,
      error: null
    });

    render(<Chat />);
    
    // Simular envio do formulário
    const form = screen.getByRole('button', { name: /enviar/i }).closest('form');
    fireEvent.submit(form!);
    
    // Verificar se a função handleSubmit foi chamada
    expect(handleSubmitMock).toHaveBeenCalled();
  });

  it('should handle model selection', () => {
    const setSelectedModelMock = vi.fn();
    
    // Configurar o mock do hook
    (useChat as Mock).mockReturnValue({
      messages: [],
      input: '',
      setInput: vi.fn(),
      isLoading: false,
      messagesEndRef: { current: null },
      handleSubmit: vi.fn(),
      models: [
        { id: 'model1', owned_by: 'openai' },
        { id: 'model2', owned_by: 'anthropic' }
      ],
      selectedModel: 'model1',
      setSelectedModel: setSelectedModelMock,
      isLoadingModels: false,
      error: null
    });

    render(<Chat />);
    
    // Simular seleção de modelo
    const selectElement = screen.getByLabelText(/modelo/i);
    fireEvent.change(selectElement, { target: { value: 'model2' } });
    
    // Verificar se a função setSelectedModel foi chamada com o valor correto
    expect(setSelectedModelMock).toHaveBeenCalledWith('model2');
  });

  it('should display loading state correctly', () => {
    // Configurar o mock do hook com estado de carregamento
    (useChat as Mock).mockReturnValue({
      messages: [
        { role: 'user', content: 'Olá' },
        { role: 'assistant', content: '' }
      ],
      input: '',
      setInput: vi.fn(),
      isLoading: true,
      messagesEndRef: { current: null },
      handleSubmit: vi.fn(),
      models: [{ id: 'model1', owned_by: 'openai' }],
      selectedModel: 'model1',
      setSelectedModel: vi.fn(),
      isLoadingModels: false,
      error: null
    });

    render(<Chat />);
    
    // Verificar se o indicador de carregamento é exibido
    expect(screen.getByText('...')).toBeInTheDocument();
    
    // Verificar se o botão de envio está desabilitado durante o carregamento
    expect(screen.getByRole('button', { name: /enviar/i })).toBeDisabled();
  });

  it('should display think content when available', () => {
    // Configurar o mock do hook com conteúdo de pensamento
    (useChat as Mock).mockReturnValue({
      messages: [
        { role: 'user', content: 'Olá' },
        { role: 'assistant', content: '<think>Este é o pensamento</think>Resposta visível', thinkingTime: 3 }
      ],
      input: '',
      setInput: vi.fn(),
      isLoading: false,
      messagesEndRef: { current: null },
      handleSubmit: vi.fn(),
      models: [{ id: 'model1', owned_by: 'openai' }],
      selectedModel: 'model1',
      setSelectedModel: vi.fn(),
      isLoadingModels: false,
      error: null
    });

    render(<Chat />);
    
    // Verificar se o conteúdo principal é exibido
    expect(screen.getByText('Resposta visível')).toBeInTheDocument();
    
    // Verificar se o componente ThinkContent está presente
    expect(screen.getByText(/pensou por 3 segundos/i)).toBeInTheDocument();
  });
}); 