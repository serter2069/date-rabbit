import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserImage } from '../../src/components/UserImage';
import { Icon } from '../../src/components/Icon';
import { EmptyState } from '../../src/components/EmptyState';
import { useMessagesStore } from '../../src/store/messagesStore';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme, spacing, typography, borderRadius } from '../../src/constants/theme';

export default function ChatScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messageText, setMessageText] = useState('');

  const { user } = useAuthStore();
  const { messages, sendMessage, markAsRead, getMessages, fetchMessages, chats } = useMessagesStore();

  // Use booking ID as conversation/chat ID
  const bookingId = id || '';
  const chatMessages = getMessages(bookingId);
  const chat = chats.find(c => c.bookingId === bookingId);

  useEffect(() => {
    // Mark messages as read when opening chat
    markAsRead(bookingId);
  }, [bookingId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [chatMessages.length]);

  const handleSend = async () => {
    if (!messageText.trim() || !user) return;

    const text = messageText.trim();
    setMessageText('');
    await sendMessage(bookingId, text);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateHeader = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return messageDate.toLocaleDateString([], {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  const isMyMessage = (senderId: string) => {
    return senderId === user?.id;
  };

  // Group messages by date
  const groupedMessages = chatMessages.reduce((groups, message) => {
    const dateKey = new Date(message.createdAt).toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
    return groups;
  }, {} as Record<string, typeof chatMessages>);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.white, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} testID="chat-back-btn">
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerProfile}
          onPress={() => router.push({ pathname: '/profile/[id]', params: { id: id || '' } })}
        >
          <UserImage name={name || 'User'} size={40} />
          <View style={styles.headerInfo}>
            <Text style={[styles.headerName, { color: colors.text }]}>{name || 'User'}</Text>
            <Text style={[styles.headerStatus, { color: colors.textSecondary }]}>Tap to view profile</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bookButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push({ pathname: '/booking/[id]', params: { id: id || '' } })}
          testID="chat-book-btn"
        >
          <Text style={[styles.bookButtonText, { color: colors.white }]}>Book</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {chatMessages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="message-circle"
              title="Start the conversation"
              description={`Say hello to ${name}! Be respectful and have a great conversation.`}
            />
          </View>
        ) : (
          Object.entries(groupedMessages).map(([dateKey, msgs]) => (
            <View key={dateKey}>
              <View style={styles.dateHeader}>
                <Text style={[styles.dateHeaderText, { color: colors.textSecondary, backgroundColor: colors.background }]}>
                  {formatDateHeader(new Date(dateKey))}
                </Text>
              </View>

              {msgs.map((message, index) => {
                const isMine = isMyMessage(message.senderId);
                const showAvatar = !isMine && (
                  index === msgs.length - 1 ||
                  isMyMessage(msgs[index + 1]?.senderId)
                );

                return (
                  <View
                    key={message.id}
                    style={[
                      styles.messageRow,
                      isMine && styles.messageRowMine
                    ]}
                  >
                    {!isMine && showAvatar && (
                      <UserImage name={name || 'User'} size={32} />
                    )}
                    {!isMine && !showAvatar && (
                      <View style={{ width: 32 }} />
                    )}

                    <View
                      style={[
                        styles.messageBubble,
                        isMine
                          ? [styles.messageBubbleMine, { backgroundColor: colors.primary }]
                          : [styles.messageBubbleOther, { backgroundColor: colors.white }]
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          { color: isMine ? colors.white : colors.text }
                        ]}
                      >
                        {message.content}
                      </Text>
                      <Text
                        style={[
                          styles.messageTime,
                          { color: isMine ? 'rgba(255,255,255,0.7)' : colors.textSecondary }
                        ]}
                      >
                        {formatTime(new Date(message.createdAt))}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={[styles.inputContainer, { backgroundColor: colors.white, borderTopColor: colors.border, paddingBottom: insets.bottom || spacing.md }]}>
        <View style={[styles.inputWrapper, { backgroundColor: colors.background }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
            testID="chat-message-input"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: messageText.trim() ? colors.primary : colors.border }
          ]}
          onPress={handleSend}
          disabled={!messageText.trim()}
          testID="chat-send-btn"
        >
          <Icon name="send" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerProfile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  headerInfo: {
    marginLeft: spacing.sm,
  },
  headerName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  headerStatus: {
    fontSize: typography.sizes.xs,
  },
  bookButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  bookButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  emptyContainer: {
    paddingTop: 100,
  },
  dateHeader: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dateHeaderText: {
    fontSize: typography.sizes.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
    alignItems: 'flex-end',
  },
  messageRowMine: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginLeft: spacing.xs,
  },
  messageBubbleMine: {
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: typography.sizes.md,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    minHeight: 44,
    maxHeight: 120,
    justifyContent: 'center',
  },
  input: {
    fontSize: typography.sizes.md,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
