import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

// Mock do componente Chat para isolar o teste do App
vi.mock('../src/components/chat/Chat', () => ({
  Chat: () => <div data-testid="mock-chat">Chat Component</div>
}));

describe('App Component', () => {
  it('should render the header with title', () => {
    render(<App />);
    
    // Verificar se o título está presente
    expect(screen.getByText('LLM Chat')).toBeInTheDocument();
  });
  
  it('should render the Chat component', () => {
    render(<App />);
    
    // Verificar se o componente Chat foi renderizado
    expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
  });
  
  it('should have the correct structure', () => {
    const { container } = render(<App />);
    
    // Verificar a estrutura do componente
    const appDiv = container.querySelector('.app');
    const header = container.querySelector('.app-header');
    const main = container.querySelector('main');
    
    expect(appDiv).toBeInTheDocument();
    expect(header).toBeInTheDocument();
    expect(main).toBeInTheDocument();
    expect(header?.tagName).toBe('HEADER');
    expect(main?.tagName).toBe('MAIN');
  });
}); 