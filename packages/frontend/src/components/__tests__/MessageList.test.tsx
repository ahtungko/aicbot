import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MessageList } from '../MessageList';
import { Message } from '@aicbot/shared';

const createMockMessage = (overrides: Partial<Message> = {}): Message => ({
  id: 'msg-1',
  content: 'Hello, world!',
  role: 'user',
  timestamp: new Date('2023-01-01T00:00:00Z'),
  conversationId: 'conv-1',
  ...overrides,
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe('MessageList', () => {
  it('renders empty state when no messages', () => {
    renderWithQueryClient(<MessageList messages={[]} />);

    expect(screen.getByText('Start a conversation')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Send a message to begin chatting with the AI assistant.'
      )
    ).toBeInTheDocument();
  });

  it('renders user messages correctly', () => {
    const messages = [
      createMockMessage({ role: 'user', content: 'Hello from user' }),
    ];

    renderWithQueryClient(<MessageList messages={messages} />);

    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByText('Hello from user')).toBeInTheDocument();
  });

  it('renders assistant messages correctly', () => {
    const messages = [
      createMockMessage({ role: 'assistant', content: 'Hello from assistant' }),
    ];

    renderWithQueryClient(<MessageList messages={messages} />);

    expect(screen.getByText('Assistant')).toBeInTheDocument();
    expect(screen.getByText('Hello from assistant')).toBeInTheDocument();
  });

  it('renders multiple messages in order', () => {
    const messages = [
      createMockMessage({
        id: 'msg-1',
        role: 'user',
        content: 'First message',
      }),
      createMockMessage({
        id: 'msg-2',
        role: 'assistant',
        content: 'Second message',
      }),
      createMockMessage({
        id: 'msg-3',
        role: 'user',
        content: 'Third message',
      }),
    ];

    renderWithQueryClient(<MessageList messages={messages} />);

    expect(screen.getByText('First message')).toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
    expect(screen.getByText('Third message')).toBeInTheDocument();
  });

  it('shows streaming indicator for last assistant message when streaming', () => {
    const messages = [
      createMockMessage({ role: 'user', content: 'User message' }),
      createMockMessage({ role: 'assistant', content: 'Assistant response' }),
    ];

    renderWithQueryClient(
      <MessageList messages={messages} isStreaming={true} />
    );

    expect(screen.getByText('(typing...)')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading and no messages', () => {
    renderWithQueryClient(<MessageList messages={[]} loading={true} />);

    expect(screen.getAllByRole('status')).toHaveLength(2); // Two skeleton messages
  });

  it('formats timestamps correctly', () => {
    const messages = [
      createMockMessage({ timestamp: new Date('2023-01-01T14:30:00Z') }),
    ];

    renderWithQueryClient(<MessageList messages={messages} />);

    expect(screen.getByText('14:30')).toBeInTheDocument();
  });

  it('preserves whitespace in message content', () => {
    const messages = [
      createMockMessage({
        content: 'Line 1\n\nLine 2\n  Indented line 3',
      }),
    ];

    renderWithQueryClient(<MessageList messages={messages} />);

    const messageContent = screen.getByText(
      'Line 1\n\nLine 2\n  Indented line 3'
    );
    expect(messageContent).toBeInTheDocument();
    expect(messageContent).toHaveStyle('white-space: pre-wrap');
  });
});
