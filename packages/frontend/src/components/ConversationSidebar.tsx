import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  MessageSquare,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';
import { Conversation } from '@aicbot/shared';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';

interface ConversationSidebarProps {
  conversations: Conversation[] | undefined;
  selectedConversationId?: string;
  onSelectConversation: (id: string) => void;
  onCreateConversation: () => void;
  onUpdateConversation: (id: string, updates: Partial<Conversation>) => void;
  onDeleteConversation: (id: string) => void;
  loading?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function ConversationSidebar({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onCreateConversation,
  onUpdateConversation,
  onDeleteConversation,
  loading = false,
  isOpen = true,
  onClose,
}: ConversationSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const handleStartEdit = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditingTitle(conversation.title);
    setShowMenu(null);
  };

  const handleSaveEdit = () => {
    if (editingId && editingTitle.trim()) {
      onUpdateConversation(editingId, { title: editingTitle.trim() });
    }
    setEditingId(null);
    setEditingTitle('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      onDeleteConversation(id);
    }
    setShowMenu(null);
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-lg">Conversations</h2>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="lg:hidden"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          <Button
            onClick={onCreateConversation}
            className="w-full mt-3"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Conversation
          </Button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div>
              <ConversationSkeleton />
              <ConversationSkeleton />
              <ConversationSkeleton />
            </div>
          ) : conversations && conversations.length > 0 ? (
            conversations.map(conversation => (
              <div
                key={conversation.id}
                className={`
                  relative group border-b border-gray-100 hover:bg-gray-50 cursor-pointer
                  ${selectedConversationId === conversation.id ? 'bg-blue-50' : ''}
                `}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="p-3">
                  {editingId === conversation.id ? (
                    <div
                      className="space-y-2"
                      onClick={e => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={e => setEditingTitle(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={handleSaveEdit}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {conversation.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {format(
                              new Date(conversation.updatedAt),
                              'MMM d, h:mm a'
                            )}
                          </p>
                          {conversation.messages.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1 truncate">
                              {truncateMessage(
                                conversation.messages[
                                  conversation.messages.length - 1
                                ].content
                              )}
                            </p>
                          )}
                        </div>

                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={e => {
                              e.stopPropagation();
                              setShowMenu(
                                showMenu === conversation.id
                                  ? null
                                  : conversation.id
                              );
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>

                          {showMenu === conversation.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  handleStartEdit(conversation);
                                }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit2 className="w-4 h-4" />
                                Rename
                              </button>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  handleDelete(conversation.id);
                                }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No conversations yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Start a new conversation to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ConversationSkeleton() {
  return (
    <div className="p-3 border-b border-gray-100">
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
