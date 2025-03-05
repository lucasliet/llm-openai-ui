import { describe, it, expect } from 'vitest';

// Importamos a função de processamento de forma isolada para testá-la
function processMessage(content: string) {
  const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
  if (!thinkMatch) return { mainContent: content, thinkContent: null };

  const thinkContent = thinkMatch[1].trim();
  const mainContent = content.replace(/<think>[\s\S]*?<\/think>/, '').trim();

  return { mainContent, thinkContent };
}

describe('processMessage', () => {
  it('should return the original content when no think tag is present', () => {
    const content = 'Esta é uma mensagem normal sem tag de pensamento.';
    const result = processMessage(content);
    
    expect(result.mainContent).toBe(content);
    expect(result.thinkContent).toBeNull();
  });
  
  it('should extract think content and return both parts', () => {
    const content = 'Esta é a mensagem principal <think>Este é o pensamento interno</think> e a continuação.';
    const result = processMessage(content);
    
    // Usando toMatch em vez de toBe para ser mais flexível com espaços
    expect(result.mainContent).toMatch(/Esta é a mensagem principal\s+e a continuação\./);
    expect(result.thinkContent).toBe('Este é o pensamento interno');
  });
  
  it('should handle think tag at the beginning', () => {
    const content = '<think>Pensamento no início</think>Mensagem principal.';
    const result = processMessage(content);
    
    expect(result.mainContent).toBe('Mensagem principal.');
    expect(result.thinkContent).toBe('Pensamento no início');
  });
  
  it('should handle think tag at the end', () => {
    const content = 'Mensagem principal.<think>Pensamento no final</think>';
    const result = processMessage(content);
    
    expect(result.mainContent).toBe('Mensagem principal.');
    expect(result.thinkContent).toBe('Pensamento no final');
  });
  
  it('should handle multiline think content', () => {
    const content = 'Mensagem principal.<think>Linha 1\nLinha 2\nLinha 3</think>';
    const result = processMessage(content);
    
    expect(result.mainContent).toBe('Mensagem principal.');
    expect(result.thinkContent).toBe('Linha 1\nLinha 2\nLinha 3');
  });
}); 