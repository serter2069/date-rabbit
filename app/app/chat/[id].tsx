import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserImage } from '../../src/components/UserImage';
import { Icon } from '../../src/components/Icon';
import { EmptyState } from '../../src/components/EmptyState';
import { useMessagesStore, POLL_INTERVAL } from '../../src/store/messagesStore';
import { useAuthStore } from '../../src/store/authStore';
import { useActiveDateStore } from '../../src/store/activeDateStore';
import { useVerificationGate } from '../../src/hooks/useVerificationGate';
import { useTheme, spacing, typography, borderRadius, colors as themeColors } from '../../src/constants/theme';
import * as Haptics from 'expo-haptics';

interface FailedMessage {
  tempId: string;
  text: string;
  time: Date;
}

export default function ChatScreen() {
  const { id, name, preBooking } = useLocalSearchParams<{ id: string; name: string; preBooking?: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messageText, setMessageText] = useState('');
  const [failedMessages, setFailedMessages] = useState<FailedMessage[]>([])

  const { user } = useAuthStore();
  const { messages, sendMessage, getMessages, fetchMessages, fetchChats, chats, isSending, preChatStatus, fetchPreChatStatus } = useMessagesStore();
  const { activeBooking, fetchActive } = useActiveDateStore();
  const { requireVerification } = useVerificationGate();

  // id param is the otherUser's id
  const otherUserId = id || '';
  const chatMessages = getMessages(otherUserId);
  const chat = chats.find(c => c.otherUser.id === otherUserId);

  // Resolve companion name: prefer URL param, fall back to chat data
  const companionName = name || chat?.otherUser?.name || '';

  const isPreBooking = preBooking === '1';
  const isCompanion = user?.role === 'companion';

  // Check if there's an active booking with the other user — used to show SOS button
  const activeDateBookingId =
    activeBooking &&
    (activeBooking.seeker.id === otherUserId || activeBooking.companion.id === otherUserId)
      ? activeBooking.id
      : null;

  // Whether to show the pre-booking banner
  const showPreBookingBanner = isPreBooking && preChatStatus && !preChatStatus.hasBooking && !preChatStatus.companionReplied;
  // Whether input is disabled due to pre-chat limit
  const preChatLimitReached = showPreBookingBanner && !preChatStatus.canSend;
  // Whether companion sees "Pre-booking request" label
  const showCompanionPreBookingLabel = isPreBooking && isCompanion && preChatStatus && !preChatStatus.hasBooking;

  // Poll messages every 5 seconds while screen is focused
  useFocusEffect(
    useCallback(() => {
      // Initial fetch (with loading spinner)
      fetchMessages(otherUserId);
      // Ensure chats are loaded so companion name resolves from store
      if (!chat) fetchChats(true);
      // Fetch pre-chat status if navigated from profile
      if (isPreBooking) fetchPreChatStatus(otherUserId);
      // Check for active booking to conditionally show SOS button
      fetchActive();

      // Poll every 5s silently (no loading spinner)
      const interval = setInterval(() => {
        fetchMessages(otherUserId, 1, true);
        if (isPreBooking) fetchPreChatStatus(otherUserId);
      }, POLL_INTERVAL);

      return () => clearInterval(interval);
    }, [otherUserId, isPreBooking])
  );

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [chatMessages.length]);

  useEffect(() => {
    // Scroll to bottom when failed messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [failedMessages.length]);

  const handleSend = async () => {
    if (!messageText.trim() || !user) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const text = messageText.trim();
    setMessageText('');
    try {
      await sendMessage(otherUserId, text);
      // Refresh pre-chat status so counter updates immediately
      if (isPreBooking) fetchPreChatStatus(otherUserId);
    } catch {
      // Show failed message bubble with retry instead of alert
      const tempId = `failed-${Date.now()}`;
      setFailedMessages(prev => [...prev, { tempId, text, time: new Date() }]);
    }
  };

  const handleRetry = async (tempId: string, text: string) => {
    if (isSending) return;
    // Remove from failed list optimistically
    setFailedMessages(prev => prev.filter(m => m.tempId !== tempId));
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      await sendMessage(otherUserId, text);
    } catch {
      // Re-add as failed if retry also fails
      const newTempId = `failed-${Date.now()}`;
      setFailedMessages(prev => [...prev, { tempId: newTempId, text, time: new Date() }]);
    }
  };

  const handleBook = () => {
    if (requireVerification()) return;
    router.push(`/booking/${id || ''}`);
  };

  const handleSOSPress = () => {
    if (!activeDateBookingId) return;
    Alert.alert(
      'Feel unsafe?',
      'This will alert DateRabbit support and cancel your date.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Alert Support',
          style: 'destructive',
          onPress: () => router.push(`/date/sos/${activeDateBookingId}`),
        },
      ],
    );
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

  const todayKey = new Date().toDateString();

  // Show error state when no valid conversation ID is provided
  if (!otherUserId) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.white, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} testID="chat-back-btn"
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Icon name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="alert-circle"
            title="Conversation not found"
            description="This conversation does not exist or may have been removed."
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.white, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} testID="chat-back-btn"
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerProfile}
          onPress={() => router.push(`/profile/${id || ''}`)}
          accessibilityLabel={`View ${companionName}'s profile`}
          accessibilityRole="button"
        >
          <UserImage name={companionName} size={40} />
          <View style={styles.headerInfo}>
            <Text style={[styles.headerName, { color: colors.text }]}>{companionName}</Text>
            {showCompanionPreBookingLabel ? (
              <Text style={[styles.headerStatus, { color: colors.accent }]}>Pre-booking request</Text>
            ) : (
              <Text style={[styles.headerStatus, { color: colors.textSecondary }]}>Tap to view profile</Text>
            )}
          </View>
        </TouchableOpacity>

        {activeDateBookingId && (
          <TouchableOpacity
            style={styles.sosButton}
            onPress={handleSOSPress}
            testID="chat-sos-btn"
            accessibilityLabel="I feel unsafe — trigger SOS"
            accessibilityRole="button"
          >
            <Text style={styles.sosButtonText}>!</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.bookButton, { backgroundColor: colors.primary }]}
          onPress={handleBook}
          testID="chat-book-btn"
          accessibilityLabel={`Book ${companionName}`}
          accessibilityRole="button"
        >
          <Text style={[styles.bookButtonText, { color: colors.white }]}>Book</Text>
        </TouchableOpacity>
      </View>

      {/* Pre-booking banner */}
      {showPreBookingBanner && (
        <View style={[styles.preBookingBanner, { backgroundColor: colors.warningLight, borderBottomColor: colors.warning }]}>
          <Icon name="message-circle" size={16} color={colors.warning} />
          <Text style={styles.preBookingBannerText}>
            {preChatLimitReached
              ? 'Message limit reached. Book a date to continue chatting.'
              : `Pre-booking conversation — ${preChatStatus.messagesLeft} message${preChatStatus.messagesLeft !== 1 ? 's' : ''} remaining`
            }
          </Text>
        </View>
      )}

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
      >
        {chatMessages.length === 0 && failedMessages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="message-circle"
              title="Start the conversation"
              description={`Say hello to ${companionName}! Be respectful and have a great conversation.`}
            />
          </View>
        ) : (
          <>
            {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
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
                        <UserImage name={companionName} size={32} />
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
                            { color: isMine ? colors.white + 'BB' : colors.textSecondary }
                          ]}
                        >
                          {formatTime(new Date(message.createdAt))}
                        </Text>
                      </View>
                    </View>
                  );
                })}

                {/* Inject failed messages into today's date group */}
                {dateKey === todayKey && failedMessages.map((failed) => (
                  <TouchableOpacity
                    key={failed.tempId}
                    style={[styles.messageRow, styles.messageRowMine]}
                    onPress={() => handleRetry(failed.tempId, failed.text)}
                    disabled={isSending}
                    accessibilityLabel="Failed message, tap to retry"
                    accessibilityRole="button"
                  >
                    <View style={styles.failedMessageWrapper}>
                      <View style={[styles.messageBubble, styles.messageBubbleMine, { backgroundColor: colors.error }]}>
                        <Text style={[styles.messageText, { color: colors.white }]}>
                          {failed.text}
                        </Text>
                        <Text style={[styles.messageTime, { color: colors.white + 'BB' }]}>
                          {formatTime(failed.time)}
                        </Text>
                      </View>
                      <Text style={[styles.retryText, { color: colors.error }]}>
                        {isSending ? 'Sending...' : 'Tap to retry'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            {/* Render failed messages in today's group if no messages exist yet for today */}
            {!groupedMessages[todayKey] && failedMessages.length > 0 && (
              <View key={todayKey}>
                <View style={styles.dateHeader}>
                  <Text style={[styles.dateHeaderText, { color: colors.textSecondary, backgroundColor: colors.background }]}>
                    Today
                  </Text>
                </View>
                {failedMessages.map((failed) => (
                  <TouchableOpacity
                    key={failed.tempId}
                    style={[styles.messageRow, styles.messageRowMine]}
                    onPress={() => handleRetry(failed.tempId, failed.text)}
                    disabled={isSending}
                    accessibilityLabel="Failed message, tap to retry"
                    accessibilityRole="button"
                  >
                    <View style={styles.failedMessageWrapper}>
                      <View style={[styles.messageBubble, styles.messageBubbleMine, { backgroundColor: colors.error }]}>
                        <Text style={[styles.messageText, { color: colors.white }]}>
                          {failed.text}
                        </Text>
                        <Text style={[styles.messageTime, { color: colors.white + 'BB' }]}>
                          {formatTime(failed.time)}
                        </Text>
                      </View>
                      <Text style={[styles.retryText, { color: colors.error }]}>
                        {isSending ? 'Sending...' : 'Tap to retry'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Input Area */}
      {preChatLimitReached ? (
        <View style={[styles.inputContainer, { backgroundColor: colors.white, borderTopColor: colors.border, paddingBottom: insets.bottom || spacing.md }]}>
          <TouchableOpacity
            style={[styles.bookDateCta, { backgroundColor: colors.primary }]}
            onPress={handleBook}
            testID="chat-book-date-cta"
            accessibilityLabel="Book a date to continue chatting"
            accessibilityRole="button"
          >
            <Icon name="calendar" size={20} color={colors.white} />
            <Text style={[styles.bookDateCtaText, { color: colors.white }]}>Book Date to Continue</Text>
          </TouchableOpacity>
        </View>
      ) : (
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
            accessibilityLabel="Send message"
            accessibilityRole="button"
            accessibilityState={{ disabled: !messageText.trim() }}
          >
            <Icon name="send" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      )}
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
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  headerStatus: {
    fontFamily: typography.fonts.body,
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
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  sosButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: themeColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  sosButtonText: {
    color: themeColors.white,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
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
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
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
    fontFamily: typography.fonts.body,
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
    fontFamily: typography.fonts.body,
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
  failedMessageWrapper: {
    alignItems: 'flex-end',
  },
  retryText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    marginTop: 4,
    marginRight: spacing.xs,
  },
  preBookingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  preBookingBannerText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    color: themeColors.warning,
    flex: 1,
  },
  bookDateCta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    minHeight: 44,
  },
  bookDateCtaText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
});
