import { useChat } from '../../hooks/useChat';
import { ThinkContent } from './ThinkContent';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Chat.css';

function processMessage(content: string) {
  const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
  if (!thinkMatch) return { mainContent: content, thinkContent: null };

  const thinkContent = thinkMatch[1].trim();
  const mainContent = content.replace(/<think>[\s\S]*?<\/think>/, '').trim();

  return { mainContent, thinkContent };
}

export function Chat() {
  const {
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
    systemMessage,
    setSystemMessage,
  } = useChat();

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="model-select-container">
          <label htmlFor="model-select">Modelo:</label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={isLoadingModels}
            className="model-select"
          >
            {isLoadingModels ? (
              <option value="">Carregando modelos...</option>
            ) : error ? (
              <option value="">Erro ao carregar modelos</option>
            ) : models.length === 0 ? (
              <option value="">Nenhum modelo disponível</option>
            ) : (
              models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.id} ({model.owned_by})
                </option>
              ))
            )}
          </select>
          {error && <div className="error-message">{error}</div>}
        </div>
        <div className="system-message-container">
          <input
            type="text"
            value={systemMessage}
            onChange={(e) => setSystemMessage(e.target.value)}
            placeholder="system message"
            className="system-message-input"
          />
        </div>
      </div>
      <div className="messages-container">
        {messages.map((message, index) => {
          const { mainContent, thinkContent } = processMessage(message.content as string);
          
          const isLastAssistantMessage = 
            index === messages.length - 1 && 
            message.role === 'assistant' && 
            isLoading;
          
          const displayContent = isLastAssistantMessage && !mainContent 
            ? "..." 
            : isLastAssistantMessage 
            ? `${mainContent}...` 
            : mainContent;
          
          return (
            <div
              key={index}
              className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              <div className="message-content">
                {message.role === 'assistant' && thinkContent && (
                  <ThinkContent content={thinkContent} thinkingTime={message.thinkingTime || 0} />
                )}
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {displayContent}
                </ReactMarkdown>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={isLoading || !selectedModel}
        />
        <button type="submit" disabled={isLoading || !selectedModel}>
          Enviar
        </button>
      </form>
    </div>
  );
} 