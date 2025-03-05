import { useState, useRef, useEffect } from 'react';
import { Message, Model } from '../types/chat';
import { sendMessage, getModels } from '../services/openai';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
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

      await sendMessage([...messages, userMessage], selectedModel, (chunk) => {
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