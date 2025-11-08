import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConversationSidebar } from '../ConversationSidebar';
import { Conversation } from '@aicbot/shared';

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
        content: "I'm doing well, thank you!",
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
  {
    id: 'conv-2',
    title: 'Test Conversation 2',
    createdAt: new Date('2023-01-02T00:00:00Z'),
    updatedAt: new Date('2023-01-02T01:00:00Z'),
    messages: [],
    settings: {
      model: 'gpt-4',
      temperature: 0.5,
      maxTokens: 1000,
    },
  },
];

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

describe('ConversationSidebar', () => {
  const defaultProps = {
    conversations: mockConversations,
    selectedConversationId: undefined,
    onSelectConversation: jest.fn(),
    onCreateConversation: jest.fn(),
    onUpdateConversation: jest.fn(),
    onDeleteConversation: jest.fn(),
  };

  it('renders conversation list', () => {
    renderWithQueryClient(<ConversationSidebar {...defaultProps} />);

    expect(screen.getByText('Test Conversation 1')).toBeInTheDocument();
    expect(screen.getByText('Test Conversation 2')).toBeInTheDocument();
    expect(screen.getByText('New Conversation')).toBeInTheDocument();
  });

  it('shows empty state when no conversations', () => {
    renderWithQueryClient(
      <ConversationSidebar {...defaultProps} conversations={[]} />
    );

    expect(screen.getByText('No conversations yet')).toBeInTheDocument();
    expect(
      screen.getByText('Start a new conversation to get started')
    ).toBeInTheDocument();
  });

  it('calls onSelectConversation when conversation is clicked', async () => {
    const mockOnSelect = jest.fn();
    const user = userEvent.setup();

    renderWithQueryClient(
      <ConversationSidebar
        {...defaultProps}
        onSelectConversation={mockOnSelect}
      />
    );

    const conversation = screen.getByText('Test Conversation 1');
    await user.click(conversation);

    expect(mockOnSelect).toHaveBeenCalledWith('conv-1');
  });

  it('highlights selected conversation', () => {
    renderWithQueryClient(
      <ConversationSidebar {...defaultProps} selectedConversationId="conv-1" />
    );

    const selectedConversation = screen
      .getByText('Test Conversation 1')
      .closest('.bg-blue-50');
    expect(selectedConversation).toBeInTheDocument();
  });

  it('calls onCreateConversation when new conversation button is clicked', async () => {
    const mockOnCreate = jest.fn();
    const user = userEvent.setup();

    renderWithQueryClient(
      <ConversationSidebar
        {...defaultProps}
        onCreateConversation={mockOnCreate}
      />
    );

    const newButton = screen.getByRole('button', { name: /new conversation/i });
    await user.click(newButton);

    expect(mockOnCreate).toHaveBeenCalled();
  });

  it('shows conversation menu on hover and click', async () => {
    const user = userEvent.setup();

    renderWithQueryClient(<ConversationSidebar {...defaultProps} />);

    const conversation = screen
      .getByText('Test Conversation 1')
      .closest('.group');
    const menuButton = within(conversation!).getByRole('button');

    // Menu button should be visible after hover/click
    await user.click(menuButton);

    expect(screen.getByText('Rename')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('enters edit mode when rename is clicked', async () => {
    const user = userEvent.setup();

    renderWithQueryClient(<ConversationSidebar {...defaultProps} />);

    // Open menu
    const conversation = screen
      .getByText('Test Conversation 1')
      .closest('.group');
    const menuButton = within(conversation!).getByRole('button');
    await user.click(menuButton);

    // Click rename
    const renameButton = screen.getByText('Rename');
    await user.click(renameButton);

    // Should show input field
    expect(screen.getByDisplayValue('Test Conversation 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('saves edited title when save is clicked', async () => {
    const mockOnUpdate = jest.fn();
    const user = userEvent.setup();

    renderWithQueryClient(
      <ConversationSidebar
        {...defaultProps}
        onUpdateConversation={mockOnUpdate}
      />
    );

    // Enter edit mode
    const conversation = screen
      .getByText('Test Conversation 1')
      .closest('.group');
    const menuButton = within(conversation!).getByRole('button');
    await user.click(menuButton);
    await user.click(screen.getByText('Rename'));

    // Change title and save
    const input = screen.getByDisplayValue('Test Conversation 1');
    await user.clear(input);
    await user.type(input, 'New Title');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(mockOnUpdate).toHaveBeenCalledWith('conv-1', { title: 'New Title' });
  });

  it('cancels edit when cancel is clicked', async () => {
    const user = userEvent.setup();

    renderWithQueryClient(<ConversationSidebar {...defaultProps} />);

    // Enter edit mode
    const conversation = screen
      .getByText('Test Conversation 1')
      .closest('.group');
    const menuButton = within(conversation!).getByRole('button');
    await user.click(menuButton);
    await user.click(screen.getByText('Rename'));

    // Cancel edit
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // Should show original title again
    expect(screen.getByText('Test Conversation 1')).toBeInTheDocument();
    expect(
      screen.queryByDisplayValue('Test Conversation 1')
    ).not.toBeInTheDocument();
  });

  it('shows last message preview', () => {
    renderWithQueryClient(<ConversationSidebar {...defaultProps} />);

    // Should show preview of last message from conv-1
    expect(screen.getByText(/I'm doing well, thank you!/)).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    renderWithQueryClient(<ConversationSidebar {...defaultProps} />);

    // Should show formatted date
    expect(screen.getByText(/Jan 1,.*:.* AM/)).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    renderWithQueryClient(
      <ConversationSidebar {...defaultProps} loading={true} />
    );

    // Should show skeleton loaders
    expect(screen.getAllByRole('status')).toHaveLength(3); // 3 conversation skeletons
  });
});
