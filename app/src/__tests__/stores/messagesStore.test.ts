import { act, renderHook } from '@testing-library/react-native';
import { useMessagesStore } from '../../store/messagesStore';
import * as api from '../../services/api';

jest.mock('../../services/api', () => ({
  messagesApi: {
    getChats: jest.fn(),
    getMessages: jest.fn(),
    sendMessage: jest.fn(),
    getUnreadCount: jest.fn(),
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
  id: 'conv-1',
  otherUser: {
    id: 'user-2',
    name: 'Sarah',
    photos: [],
  },
  lastMessageAt: '2024-03-10T10:00:00Z',
  unreadCount: 2,
};

const mockMessage: api.Message = {
  id: 'msg-1',
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
      expect(result.current.chats[0].id).toBe('conv-1');
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
    it('should fetch messages for user', async () => {
      const mockGetMessages = api.messagesApi.getMessages as jest.Mock;
      mockGetMessages.mockResolvedValue([mockMessage]);

      const { result } = renderHook(() => useMessagesStore());

      await act(async () => {
        await result.current.fetchMessages('user-2');
      });

      expect(result.current.messages['user-2']).toHaveLength(1);
      expect(result.current.messages['user-2'][0].content).toBe('Hello!');
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
          messages: { 'user-2': [mockMessage] },
          chats: [mockChat],
        });
      });

      await act(async () => {
        const response = await result.current.sendMessage('user-2', 'Hi there!');
        expect(response?.success).toBe(true);
      });

      expect(mockSendMessage).toHaveBeenCalledWith('user-2', 'Hi there!');
      expect(result.current.messages['user-2']).toHaveLength(2);
    });

    it('should update chat lastMessageAt after sending', async () => {
      const mockSendMessage = api.messagesApi.sendMessage as jest.Mock;
      const newMessage = { ...mockMessage, id: 'msg-2', content: 'New message', createdAt: '2024-03-10T11:00:00Z' };
      mockSendMessage.mockResolvedValue(newMessage);

      const { result } = renderHook(() => useMessagesStore());

      await act(async () => {
        useMessagesStore.setState({
          messages: { 'user-2': [] },
          chats: [mockChat],
        });
      });

      await act(async () => {
        await result.current.sendMessage('user-2', 'New message');
      });

      expect(result.current.chats[0].lastMessageAt).toBe('2024-03-10T11:00:00Z');
    });

    it('should handle send message error', async () => {
      const mockSendMessage = api.messagesApi.sendMessage as jest.Mock;
      mockSendMessage.mockRejectedValue(new api.ApiError('Failed to send', 500));

      const { result } = renderHook(() => useMessagesStore());

      await act(async () => {
        const response = await result.current.sendMessage('user-2', 'Hello');
        expect(response.success).toBe(false);
      });

      expect(result.current.error).toBe('Failed to send message');
    });
  });

  describe('getMessages', () => {
    it('should return messages for user', async () => {
      const { result } = renderHook(() => useMessagesStore());

      await act(async () => {
        useMessagesStore.setState({
          messages: { 'user-2': [mockMessage] },
        });
      });

      const messages = result.current.getMessages('user-2');
      expect(messages).toHaveLength(1);
    });

    it('should return empty array for non-existent user', () => {
      const { result } = renderHook(() => useMessagesStore());

      const messages = result.current.getMessages('non-existent');
      expect(messages).toEqual([]);
    });
  });

  describe('getChat', () => {
    it('should return chat by otherUser.id', async () => {
      const { result } = renderHook(() => useMessagesStore());

      await act(async () => {
        useMessagesStore.setState({ chats: [mockChat] });
      });

      const chat = result.current.getChat('user-2');
      expect(chat).toBeDefined();
      expect(chat?.id).toBe('conv-1');
    });
  });
});
