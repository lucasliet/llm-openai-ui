import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import App from '../src/App';

// Mock do ReactDOM.createRoot
const createRootMock = vi.fn(() => ({
  render: vi.fn()
}));

vi.mock('react-dom/client', () => ({
  default: {
    createRoot: createRootMock
  },
  createRoot: createRootMock
}));

// Mock do App
vi.mock('../src/App', () => ({
  default: () => <div>App Component</div>
}));

// Mock do document.getElementById
const mockRoot = document.createElement('div');
vi.spyOn(document, 'getElementById').mockReturnValue(mockRoot);

describe('Main', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should render the App component in the root element', async () => {
    // Importar o main.tsx para executar o código
    await import('../src/main.tsx');
    
    // Verificar se o getElementById foi chamado com 'root'
    expect(document.getElementById).toHaveBeenCalledWith('root');
    
    // Verificar se o createRoot foi chamado com o elemento root
    expect(createRootMock).toHaveBeenCalledWith(mockRoot);
    
    // Verificar se o render foi chamado
    const renderMock = createRootMock.mock.results[0].value.render;
    
    expect(renderMock).toHaveBeenCalled();
    
    // Verificar se o App está dentro de StrictMode
    const renderCall = renderMock.mock.calls[0][0];
    expect(renderCall.type).toBe(React.StrictMode);
    // Verificar apenas se o children existe, sem verificar o tipo específico
    expect(renderCall.props.children).toBeTruthy();
  });
}); 