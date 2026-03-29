import { create } from 'zustand';
import { messagesApi, Message, Chat, ApiError } from '../services/api';
import type { PreChatStatus } from '../types';

// Shared polling interval for all chat-related screens
export const POLL_INTERVAL = 5000;

interface MessagesState {
  chats: Chat[];
  messages: Record<string, Message[]>; // otherUserId -> messages
  isLoading: boolean;
  isSending: boolean;
  unreadCount: number;
  error: string | null;
  preChatStatus: PreChatStatus | null;

  // Actions
  fetchChats: (silent?: boolean) => Promise<void>;
  fetchMessages: (otherUserId: string, page?: number, silent?: boolean) => Promise<void>;
  sendMessage: (otherUserId: string, content: string) => Promise<{ success: boolean; error?: string }>;
  refreshUnreadCount: () => Promise<void>;
  fetchPreChatStatus: (otherUserId: string) => Promise<void>;

  // Utility
  getChat: (otherUserId: string) => Chat | undefined;
  getMessages: (otherUserId: string) => Message[];
  clearError: () => void;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  chats: [],
  messages: {},
  isLoading: false,
  isSending: false,
  unreadCount: 0,
  error: null,
  preChatStatus: null,

  fetchChats: async (silent = false) => {
    if (!silent) set({ isLoading: true, error: null });

    try {
      const chats = await messagesApi.getChats();
      const totalUnread = chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
      set({ chats, unreadCount: totalUnread, isLoading: false });
    } catch (err) {
      if (!silent) {
        const message = err instanceof ApiError ? err.message : 'Failed to fetch chats';
        set({ error: message, isLoading: false });
      }
    }
  },

  fetchMessages: async (otherUserId, page = 1, silent = false) => {
    if (!silent) set({ isLoading: true, error: null });

    try {
      // Backend auto-marks messages as read on GET
      const msgs = await messagesApi.getMessages(otherUserId, page);
      set((state) => {
        const updatedMessages = {
          ...state.messages,
          [otherUserId]: page === 1
            ? msgs
            : [...(state.messages[otherUserId] || []), ...msgs],
        };

        // Sync the chat entry: clear unread count (messages marked as read on GET)
        // and update last message preview if available
        const lastMsg = page === 1 && msgs.length > 0 ? msgs[msgs.length - 1] : null;
        const updatedChats = state.chats.map((chat) => {
          if (chat.otherUser.id !== otherUserId) return chat;
          return {
            ...chat,
            unreadCount: 0,
            ...(lastMsg ? {
              lastMessage: lastMsg.content,
              lastMessageAt: lastMsg.createdAt,
            } : {}),
          };
        });

        return {
          messages: updatedMessages,
          chats: updatedChats,
          isLoading: false,
        };
      });
    } catch (err) {
      if (!silent) {
        const message = err instanceof ApiError ? err.message : 'Failed to fetch messages';
        set({ error: message, isLoading: false });
      }
    }
  },

  sendMessage: async (otherUserId, content) => {
    set({ isSending: true, error: null });

    try {
      const newMessage = await messagesApi.sendMessage(otherUserId, content);

      set((state) => {
        const existingMessages = state.messages[otherUserId] || [];
        const updatedChats = state.chats.map((chat) =>
          chat.otherUser.id === otherUserId
            ? {
                ...chat,
                lastMessage: content,
                lastMessageAt: newMessage.createdAt,
              }
            : chat
        );

        return {
          messages: {
            ...state.messages,
            [otherUserId]: [...existingMessages, newMessage],
          },
          chats: updatedChats,
          isSending: false,
        };
      });

      return { success: true };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to send message';
      set({ error: message, isSending: false });
      return { success: false, error: message };
    }
  },

  refreshUnreadCount: async () => {
    try {
      const response = await messagesApi.getUnreadCount();
      set({ unreadCount: response.count });
    } catch {
      // Silent fail
    }
  },

  fetchPreChatStatus: async (otherUserId) => {
    try {
      const status = await messagesApi.getPreChatStatus(otherUserId);
      set({ preChatStatus: status });
    } catch {
      // Silent fail — pre-chat banner won't show
      set({ preChatStatus: null });
    }
  },

  getChat: (otherUserId) => {
    return get().chats.find((c) => c.otherUser.id === otherUserId);
  },

  getMessages: (otherUserId) => {
    return get().messages[otherUserId] || [];
  },

  clearError: () => set({ error: null }),
}));
