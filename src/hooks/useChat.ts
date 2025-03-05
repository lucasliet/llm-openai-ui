import { useState, useRef, useEffect } from 'react';
import { Message, Model } from '../types/chat';
import { sendMessage, getModels } from '../services/openai';

/**
 * Cria o histórico de mensagens para enviar à API incluindo a mensagem do sistema, se fornecida
 * @param systemMessage A mensagem do sistema a ser incluída no histórico, se existir
 * @param messages As mensagens existentes no chat
 * @param userMessage A mensagem atual do usuário
 * @returns Um array de mensagens para enviar à API
 */
function createMessageHistory(
  systemMessage: string,
  messages: Message[],
  userMessage: Message
): Message[] {
  const messageHistory: Message[] = [];
  if (systemMessage.trim()) {
    messageHistory.push({ role: 'system', content: systemMessage.trim() });
  }
  messageHistory.push(...messages, userMessage);
  return messageHistory;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [systemMessage, setSystemMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setIsLoadingModels(true);
      setError(null);
      const availableModels = await getModels();
      setModels(availableModels);
      if (availableModels.length > 0) {
        setSelectedModel(availableModels[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar modelos:', error);
      setError('Erro ao carregar modelos. Por favor, tente novamente.');
    } finally {
      setIsLoadingModels(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !selectedModel) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let currentStreamContent = '';
      const assistantMessage: Message = { role: 'assistant', content: '', thinkingTime: 0 };
      setMessages(prev => [...prev, assistantMessage]);

      const startTime = Date.now();

      // Usar a função para criar o histórico de mensagens
      const messageHistory = createMessageHistory(systemMessage, messages, userMessage);

      await sendMessage(messageHistory, selectedModel, (chunk) => {
        currentStreamContent += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            ...assistantMessage,
            content: currentStreamContent,
          };
          return newMessages;
        });
      });

      const endTime = Date.now();
      const thinkingTime = Math.round((endTime - startTime) / 1000);

      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          ...newMessages[newMessages.length - 1],
          thinkingTime: thinkingTime,
        };
        return newMessages;
      });
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    systemMessage,
    setSystemMessage,
    isLoading,
    messagesEndRef,
    handleSubmit,
    models,
    selectedModel,
    setSelectedModel,
    isLoadingModels,
    error,
  };
} 