// Polyfill TextEncoder for MSW in Jest environment
class TextEncoder {
  encode(input: string): Uint8Array {
    const utf8 = [];
    for (let i = 0; i < input.length; i++) {
      let charcode = input.charCodeAt(i);
      if (charcode < 0x80) utf8.push(charcode);
      else if (charcode < 0x800) {
        utf8.push(0xc0 | (charcode >> 6));
        utf8.push(0x80 | (charcode & 0x3f));
      } else if (charcode < 0xd800 || charcode >= 0xe000) {
        utf8.push(0xe0 | (charcode >> 12));
        utf8.push(0x80 | ((charcode >> 6) & 0x3f));
        utf8.push(0x80 | (charcode & 0x3f));
      } else {
        i++;
        charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (input.charCodeAt(i) & 0x3ff));
        utf8.push(0xf0 | (charcode >> 18));
        utf8.push(0x80 | ((charcode >> 12) & 0x3f));
        utf8.push(0x80 | ((charcode >> 6) & 0x3f));
        utf8.push(0x80 | (charcode & 0x3f));
      }
    }
    return new Uint8Array(utf8);
  }
}

// Set global TextEncoder before importing MSW
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

import { rest, setupServer } from 'msw';
import { Model, Conversation, ConversationSettings } from '@aicbot/shared';

const mockModels: Model[] = [
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient model for most tasks',
    maxTokens: 4096,
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Most capable model for complex tasks',
    maxTokens: 8192,
  },
];

const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Test Conversation 1',
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T01:00:00Z'),
    messages: [
      {
        id: 'msg-1',
        content: 'Hello, how are you?',
        role: 'user',
        timestamp: new Date('2023-01-01T00:30:00Z'),
        conversationId: 'conv-1',
      },
      {
        id: 'msg-2',
        content: 'I\'m doing well, thank you! How can I help you today?',
        role: 'assistant',
        timestamp: new Date('2023-01-01T00:31:00Z'),
        conversationId: 'conv-1',
      },
    ],
    settings: {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2000,
    },
  },
];

export const handlers = [
  // Models API
  rest.get('/api/models', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(mockModels)
    );
  }),

  // Conversations API
  rest.get('/api/conversations', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(mockConversations)
    );
  }),

  rest.get('/api/conversations/:id', (req, res, ctx) => {
    const { id } = req.params;
    const conversation = mockConversations.find(c => c.id === id);
    
    if (!conversation) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'Conversation not found' })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json(conversation)
    );
  }),

  rest.post('/api/conversations', (req, res, ctx) => {
    const { title, settings } = req.body as { title: string; settings: ConversationSettings };
    
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      settings,
    };
    
    return res(
      ctx.status(201),
      ctx.json(newConversation)
    );
  }),

  rest.patch('/api/conversations/:id', (req, res, ctx) => {
    const { id } = req.params;
    const updates = req.body as Partial<Conversation>;
    
    const conversation = mockConversations.find(c => c.id === id);
    
    if (!conversation) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'Conversation not found' })
      );
    }
    
    const updatedConversation = { ...conversation, ...updates, updatedAt: new Date() };
    
    return res(
      ctx.status(200),
      ctx.json(updatedConversation)
    );
  }),

  rest.delete('/api/conversations/:id', (req, res, ctx) => {
    const { id } = req.params;
    const conversation = mockConversations.find(c => c.id === id);
    
    if (!conversation) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'Conversation not found' })
      );
    }
    
    return res(
      ctx.status(204)
    );
  }),

  // Chat API (streaming mock)
  rest.post('/api/chat', (req, res, ctx) => {
    const { message, settings } = req.body;
    
    // Mock streaming response
    const stream = new ReadableStream({
      start(controller) {
        const response = `This is a mock response to: "${message}"`;
        const words = response.split(' ');
        
        let currentContent = '';
        let wordIndex = 0;
        
        const interval = setInterval(() => {
          if (wordIndex < words.length) {
            currentContent += (wordIndex > 0 ? ' ' : '') + words[wordIndex];
            
            const chunk = {
              id: `assistant-${Date.now()}`,
              content: currentContent,
              conversationId: 'mock-conv-id',
              isComplete: wordIndex === words.length - 1,
            };
            
            controller.enqueue(`data: ${JSON.stringify(chunk)}\n\n`);
            wordIndex++;
          } else {
            controller.enqueue('data: [DONE]\n\n');
            controller.close();
            clearInterval(interval);
          }
        }, 50);
      },
    });
    
    return res(
      ctx.status(200),
      ctx.body(stream)
    );
  }),
];

export const server = setupServer(...handlers);