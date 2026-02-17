import { act, renderHook } from '@testing-library/react-native';
import { useMessagesStore } from '../../store/messagesStore';
import * as api from '../../services/api';

jest.mock('../../services/api', () => ({
  messagesApi: {
    getChats: jest.fn(),
    getMessages: jest.fn(),
    sendMessage: jest.fn(),
    markAsRead: jest.fn(),
  },
  ApiError: class ApiError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
    }
  },
}));

const mockChat: api.Chat = {
  bookingId: 'booking-1',
  otherUser: {
    id: 'user-2',
    name: 'Sarah',
    photo: 'https://example.com/photo.jpg',
  },
  lastMessage: {
    id: 'msg-1',
    content: 'Hello!',
    createdAt: '2024-03-10T10:00:00Z',
  },
  unreadCount: 2,
};

const mockMessage: api.Message = {
  id: 'msg-1',
  bookingId: 'booking-1',
  senderId: 'user-1',
  content: 'Hello!',
  createdAt: '2024-03-10T10:00:00Z',
  isRead: false,
};

describe('messagesStore', () => {
  beforeEach(() => {
    useMessagesStore.setState({
      chats: [],
      messages: {},
      isLoading: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  describe('fetchChats', () => {
    it('should fetch all chats', async () => {
      const mockGetChats = api.messagesApi.getChats as jest.Mock;
      mockGetChats.mockResolvedValue([mockChat]);

      const { result } = renderHook(() => useMessagesStore());

      await act(async () => {
        await result.current.fetchChats();
      });

      expect(result.current.chats).toHaveLength(1);
      expect(result.current.chats[0].bookingId).toBe('booking-1');
    });

    it('should handle error fetching chats', async () => {
      const mockGetChats = api.messagesApi.getChats as jest.Mock;
      mockGetChats.mockRejectedValue(new api.ApiError('Network error', 500));

      const { result } = renderHook(() => useMessagesStore());

      await act(async () => {
        await result.current.fetchChats();
      });

      expect(result.current.error).toBe('Failed to fetch chats');
    });
  });

  describe('fetchMessages', () => {
    it('should fetch messages for booking', async () => {
      const mockGetMessages = api.messagesApi.getMessages as jest.Mock;
      mockGetMessages.mockResolvedValue([mockMessage]);

      const { result } = renderHook(() => useMessagesStore());

      await act(async () => {
        await result.current.fetchMessages('booking-1');
      });

      expect(result.current.messages['booking-1']).toHaveLength(1);
      expect(result.current.messages['booking-1'][0].content).toBe('Hello!');
    });
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      const mockSendMessage = api.messagesApi.sendMessage as jest.Mock;
      const newMessage = { ...mockMessage, id: 'msg-2', content: 'Hi there!' };
      mockSendMessage.mockResolvedValue(newMessage);

      const { result } = renderHook(() => useMessagesStore());

      // Initialize messages array
      await act(async () => {
        useMessagesStore.setState({
          messages: { 'booking-1': [mockMessage] },
          chats: [mockChat],
        });
      });

      await act(async () => {
        const response = await result.current.sendMessage('booking-1', 'Hi there!');
        expect(response?.id).toBe('msg-2');
      });

      expect(mockSendMessage).toHaveBeenCalledWith('booking-1', 'Hi there!');
      expect(result.current.messages['booking-1']).toHaveLength(2);
    });

    it('should update chat lastMessage after sending', async () => {
      const mockSendMessage = api.messagesApi.sendMessage as jest.Mock;
      const newMessage = { ...mockMessage, id: 'msg-2', content: 'New message' };
      mockSendMessage.mockResolvedValue(newMessage);

      const { result } = renderHook(() => useMessagesStore());

      await act(async () => {
        useMessagesStore.setState({
          messages: { 'booking-1': [] },
          chats: [mockChat],
        });
      });

      await act(async () => {
        await result.current.sendMessage('booking-1', 'New message');
      });

      expect(result.current.chats[0].lastMessage?.content).toBe('New message');
    });

    it('should handle send message error', async () => {
      const mockSendMessage = api.messagesApi.sendMessage as jest.Mock;
      mockSendMessage.mockRejectedValue(new api.ApiError('Failed to send', 500));

      const { result } = renderHook(() => useMessagesStore());

      await act(async () => {
        const response = await result.current.sendMessage('booking-1', 'Hello');
        expect(response).toBeNull();
      });

      expect(result.current.error).toBe('Failed to send message');
    });
  });

  describe('markAsRead', () => {
    it('should mark messages as read and update unread count', async () => {
      const mockMarkAsRead = api.messagesApi.markAsRead as jest.Mock;
      mockMarkAsRead.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useMessagesStore());

      await act(async () => {
        useMessagesStore.setState({
          chats: [{ ...mockChat, unreadCount: 5 }],
          messages: { 'booking-1': [{ ...mockMessage, isRead: false }] },
        });
      });

      await act(async () => {
        await result.current.markAsRead('booking-1');
      });

      expect(result.current.chats[0].unreadCount).toBe(0);
      expect(result.current.messages['booking-1'][0].isRead).toBe(true);
    });
  });

  describe('getMessages', () => {
    it('should return messages for booking', async () => {
      const { result } = renderHook(() => useMessagesStore());

      await act(async () => {
        useMessagesStore.setState({
          messages: { 'booking-1': [mockMessage] },
        });
      });

      const messages = result.current.getMessages('booking-1');
      expect(messages).toHaveLength(1);
    });

    it('should return empty array for non-existent booking', () => {
      const { result } = renderHook(() => useMessagesStore());

      const messages = result.current.getMessages('non-existent');
      expect(messages).toEqual([]);
    });
  });
});
