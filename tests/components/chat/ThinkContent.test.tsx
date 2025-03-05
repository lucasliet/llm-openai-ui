import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThinkContent } from '../../../src/components/chat/ThinkContent';

describe('ThinkContent', () => {
  it('should render correctly with thinking time', () => {
    render(<ThinkContent content="Este é o conteúdo do pensamento" thinkingTime={5} />);
    
    // Verifica se o tempo de pensamento está sendo exibido
    expect(screen.getByText(/pensou por 5 segundos/i)).toBeInTheDocument();
    
    // O conteúdo não deve ser visível inicialmente
    expect(screen.queryByText('Este é o conteúdo do pensamento')).not.toBeInTheDocument();
  });

  it('should toggle content visibility when clicked', () => {
    render(<ThinkContent content="Este é o conteúdo do pensamento" thinkingTime={3} />);
    
    // Inicialmente o conteúdo não está visível
    expect(screen.queryByText('Este é o conteúdo do pensamento')).not.toBeInTheDocument();
    
    // Clica no toggle
    fireEvent.click(screen.getByText(/pensou por 3 segundos/i));
    
    // Agora o conteúdo deve estar visível
    expect(screen.getByText('Este é o conteúdo do pensamento')).toBeInTheDocument();
    
    // Clica novamente para esconder
    fireEvent.click(screen.getByText(/pensou por 3 segundos/i));
    
    // O conteúdo não deve mais estar visível
    expect(screen.queryByText('Este é o conteúdo do pensamento')).not.toBeInTheDocument();
  });

  it('should handle different thinking times', () => {
    const { rerender } = render(<ThinkContent content="Conteúdo" thinkingTime={1} />);
    
    expect(screen.getByText(/pensou por 1 segundos/i)).toBeInTheDocument();
    
    rerender(<ThinkContent content="Conteúdo" thinkingTime={10} />);
    
    expect(screen.getByText(/pensou por 10 segundos/i)).toBeInTheDocument();
  });
}); 