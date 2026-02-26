import { create } from 'zustand';
import { messagesApi, Message, Chat, ApiError } from '../services/api';

interface MessagesState {
  chats: Chat[];
  messages: Record<string, Message[]>; // otherUserId -> messages
  isLoading: boolean;
  isSending: boolean;
  unreadCount: number;
  error: string | null;

  // Actions
  fetchChats: () => Promise<void>;
  fetchMessages: (otherUserId: string, page?: number) => Promise<void>;
  sendMessage: (otherUserId: string, content: string) => Promise<{ success: boolean; error?: string }>;
  refreshUnreadCount: () => Promise<void>;

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

  fetchChats: async () => {
    set({ isLoading: true, error: null });

    try {
      const chats = await messagesApi.getChats();
      const totalUnread = chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
      set({ chats, unreadCount: totalUnread, isLoading: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch chats';
      set({ error: message, isLoading: false });
    }
  },

  fetchMessages: async (otherUserId, page = 1) => {
    set({ isLoading: true, error: null });

    try {
      // Backend auto-marks messages as read on GET
      const msgs = await messagesApi.getMessages(otherUserId, page);
      set((state) => ({
        messages: {
          ...state.messages,
          [otherUserId]: page === 1
            ? msgs
            : [...(state.messages[otherUserId] || []), ...msgs],
        },
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch messages';
      set({ error: message, isLoading: false });
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

  getChat: (otherUserId) => {
    return get().chats.find((c) => c.otherUser.id === otherUserId);
  },

  getMessages: (otherUserId) => {
    return get().messages[otherUserId] || [];
  },

  clearError: () => set({ error: null }),
}));
