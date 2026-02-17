import { create } from 'zustand';
import { messagesApi, Message, Chat, ApiError } from '../services/api';

interface MessagesState {
  chats: Chat[];
  messages: Record<string, Message[]>; // bookingId -> messages
  isLoading: boolean;
  isSending: boolean;
  unreadCount: number;
  error: string | null;

  // Actions
  fetchChats: () => Promise<void>;
  fetchMessages: (bookingId: string, page?: number) => Promise<void>;
  sendMessage: (bookingId: string, content: string) => Promise<{ success: boolean; error?: string }>;
  markAsRead: (bookingId: string) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;

  // Utility
  getChat: (bookingId: string) => Chat | undefined;
  getMessages: (bookingId: string) => Message[];
  clearError: () => void;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  chats: [],
  messages: {},
  isLoading: false,
  isSending: false,
  unreadCount: 0,
  error: null,

  fetchChats: async () => {
    set({ isLoading: true, error: null });

    try {
      const chats = await messagesApi.getChats();
      const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);
      set({ chats, unreadCount: totalUnread, isLoading: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch chats';
      set({ error: message, isLoading: false });
    }
  },

  fetchMessages: async (bookingId, page = 1) => {
    set({ isLoading: true, error: null });

    try {
      const response = await messagesApi.getMessages(bookingId, page);
      set((state) => ({
        messages: {
          ...state.messages,
          [bookingId]: page === 1
            ? response.messages
            : [...(state.messages[bookingId] || []), ...response.messages],
        },
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch messages';
      set({ error: message, isLoading: false });
    }
  },

  sendMessage: async (bookingId, content) => {
    set({ isSending: true, error: null });

    try {
      const newMessage = await messagesApi.sendMessage(bookingId, content);

      set((state) => {
        const existingMessages = state.messages[bookingId] || [];
        const updatedChats = state.chats.map((chat) =>
          chat.bookingId === bookingId
            ? {
                ...chat,
                lastMessage: {
                  content,
                  createdAt: newMessage.createdAt,
                  isRead: false,
                },
              }
            : chat
        );

        return {
          messages: {
            ...state.messages,
            [bookingId]: [...existingMessages, newMessage],
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

  markAsRead: async (bookingId) => {
    try {
      await messagesApi.markAsRead(bookingId);

      set((state) => {
        const chat = state.chats.find((c) => c.bookingId === bookingId);
        const unreadDecrease = chat?.unreadCount || 0;

        return {
          chats: state.chats.map((c) =>
            c.bookingId === bookingId ? { ...c, unreadCount: 0 } : c
          ),
          messages: {
            ...state.messages,
            [bookingId]: (state.messages[bookingId] || []).map((msg) => ({
              ...msg,
              isRead: true,
            })),
          },
          unreadCount: Math.max(0, state.unreadCount - unreadDecrease),
        };
      });
    } catch {
      // Silent fail
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

  getChat: (bookingId) => {
    return get().chats.find((c) => c.bookingId === bookingId);
  },

  getMessages: (bookingId) => {
    return get().messages[bookingId] || [];
  },

  clearError: () => set({ error: null }),
}));
