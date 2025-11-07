import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChatComposer } from '../ChatComposer';
import { ConversationSettings } from '@aicbot/shared';

const mockSettings: ConversationSettings = {
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 2000,
};

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('ChatComposer', () => {
  it('renders textarea and send button', () => {
    const mockOnSendMessage = jest.fn();
    
    renderWithQueryClient(
      <ChatComposer
        onSendMessage={mockOnSendMessage}
        settings={mockSettings}
      />
    );
    
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('sends message when send button is clicked', async () => {
    const mockOnSendMessage = jest.fn();
    const user = userEvent.setup();
    
    renderWithQueryClient(
      <ChatComposer
        onSendMessage={mockOnSendMessage}
        settings={mockSettings}
      />
    );
    
    const textarea = screen.getByPlaceholderText('Type your message...');
    await user.type(textarea, 'Hello world');
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello world', mockSettings);
    expect(textarea).toHaveValue('');
  });

  it('sends message when Enter is pressed', async () => {
    const mockOnSendMessage = jest.fn();
    const user = userEvent.setup();
    
    renderWithQueryClient(
      <ChatComposer
        onSendMessage={mockOnSendMessage}
        settings={mockSettings}
      />
    );
    
    const textarea = screen.getByPlaceholderText('Type your message...');
    await user.type(textarea, 'Hello world{enter}');
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello world', mockSettings);
    expect(textarea).toHaveValue('');
  });

  it('creates new line with Shift+Enter', async () => {
    const mockOnSendMessage = jest.fn();
    const user = userEvent.setup();
    
    renderWithQueryClient(
      <ChatComposer
        onSendMessage={mockOnSendMessage}
        settings={mockSettings}
      />
    );
    
    const textarea = screen.getByPlaceholderText('Type your message...');
    await user.type(textarea, 'Line 1{Shift>}{enter}{/Shift}Line 2');
    
    expect(textarea).toHaveValue('Line 1\nLine 2');
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('does not send empty message', async () => {
    const mockOnSendMessage = jest.fn();
    const user = userEvent.setup();
    
    renderWithQueryClient(
      <ChatComposer
        onSendMessage={mockOnSendMessage}
        settings={mockSettings}
      />
    );
    
    const textarea = screen.getByPlaceholderText('Type your message...');
    await user.type(textarea, '   '); // Only whitespace
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);
    
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('disables send button when loading', () => {
    const mockOnSendMessage = jest.fn();
    
    renderWithQueryClient(
      <ChatComposer
        onSendMessage={mockOnSendMessage}
        settings={mockSettings}
        isLoading={true}
      />
    );
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  it('shows stop button when streaming', () => {
    const mockOnSendMessage = jest.fn();
    
    renderWithQueryClient(
      <ChatComposer
        onSendMessage={mockOnSendMessage}
        settings={mockSettings}
        isStreaming={true}
      />
    );
    
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /send/i })).not.toBeInTheDocument();
  });

  it('trims whitespace from message before sending', async () => {
    const mockOnSendMessage = jest.fn();
    const user = userEvent.setup();
    
    renderWithQueryClient(
      <ChatComposer
        onSendMessage={mockOnSendMessage}
        settings={mockSettings}
      />
    );
    
    const textarea = screen.getByPlaceholderText('Type your message...');
    await user.type(textarea, '  Hello world  ');
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello world', mockSettings);
  });

  it('disables textarea when loading', () => {
    const mockOnSendMessage = jest.fn();
    
    renderWithQueryClient(
      <ChatComposer
        onSendMessage={mockOnSendMessage}
        settings={mockSettings}
        isLoading={true}
      />
    );
    
    const textarea = screen.getByPlaceholderText('Type your message...');
    expect(textarea).toBeDisabled();
  });

  it('shows keyboard shortcut hint', () => {
    const mockOnSendMessage = jest.fn();
    
    renderWithQueryClient(
      <ChatComposer
        onSendMessage={mockOnSendMessage}
        settings={mockSettings}
      />
    );
    
    expect(screen.getByText('Press Enter to send, Shift+Enter for new line')).toBeInTheDocument();
  });
});