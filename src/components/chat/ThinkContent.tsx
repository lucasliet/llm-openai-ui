import React, { useState } from 'react';
import './ThinkContent.css';

interface ThinkContentProps {
  content: string;
  thinkingTime: number; // Tempo em segundos
}

export const ThinkContent: React.FC<ThinkContentProps> = ({ content, thinkingTime }) => {
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar a visibilidade

  return (
    <div className="think-content">
      <div className="think-toggle" onClick={() => setIsOpen(!isOpen)}>
        pensou por {thinkingTime} segundos {isOpen ? '▼' : '▶'}
      </div>
      {isOpen && (
        <div className="think-details">
          {content}
        </div>
      )}
    </div>
  );
}; 