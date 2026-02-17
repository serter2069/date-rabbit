import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserImage } from '../../../src/components/UserImage';
import { EmptyState } from '../../../src/components/EmptyState';
import { useMessagesStore } from '../../../src/store/messagesStore';
import { useTheme, spacing, typography } from '../../../src/constants/theme';
import type { Chat } from '../../../src/types';

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { chats, isLoading, fetchChats } = useMessagesStore();

  useEffect(() => {
    fetchChats();
  }, []);

  const formatTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleOpenChat = (chat: Chat) => {
    router.push({
      pathname: '/chat/[id]',
      params: { id: chat.bookingId, name: chat.otherUser.name },
    });
  };

  if (isLoading && chats.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={[styles.title, { color: colors.text }]}>Messages</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {chats.length === 0 ? (
          <EmptyState
            icon="message-circle"
            title="No messages yet"
            description="Start booking dates to begin conversations with companions"
          />
        ) : (
          chats.map((chat) => (
            <TouchableOpacity
              key={chat.bookingId}
              style={[styles.conversationItem, { borderBottomColor: colors.border }]}
              onPress={() => handleOpenChat(chat)}
              testID={`messages-conversation-${chat.bookingId}`}
            >
              <UserImage
                uri={chat.otherUser.photo}
                name={chat.otherUser.name}
                size={56}
                showVerified
              />
              <View style={styles.conversationInfo}>
                <View style={styles.conversationHeader}>
                  <Text style={[styles.conversationName, { color: colors.text }]}>{chat.otherUser.name}</Text>
                  {chat.lastMessage && (
                    <Text style={[styles.conversationTime, { color: colors.textSecondary }]}>
                      {formatTime(chat.lastMessage.createdAt)}
                    </Text>
                  )}
                </View>
                <View style={styles.conversationFooter}>
                  <Text
                    style={[
                      styles.lastMessage,
                      { color: colors.textSecondary },
                      chat.unreadCount > 0 && { color: colors.text, fontWeight: '500' },
                    ]}
                    numberOfLines={1}
                  >
                    {chat.lastMessage?.content || 'No messages yet'}
                  </Text>
                  {chat.unreadCount > 0 && (
                    <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.unreadCount, { color: colors.white }]}>{chat.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    minHeight: 72,
  },
  conversationInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  conversationTime: {
    fontSize: typography.sizes.xs,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: typography.sizes.sm,
    marginRight: spacing.sm,
  },
  unreadBadge: {
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  unreadCount: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
});
