import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StateSection } from '../StateSection';
import { colors, typography, spacing, borderRadius, borderWidth, shadows } from '../../../constants/theme';

// ---------------------------------------------------------------------------
// Bottom tab bar (shared navigation)
// ---------------------------------------------------------------------------
function BottomTabBar({ active }: { active: number }) {
  const router = useRouter();
  const tabs = [
    { icon: 'home' as const, label: 'Home', route: '/proto/states/seeker-home' },
    { icon: 'calendar' as const, label: 'Bookings', route: '/proto/states/seeker-bookings' },
    { icon: 'message-circle' as const, label: 'Messages', route: '/proto/states/seeker-messages' },
    { icon: 'user' as const, label: 'Profile', route: '/proto/states/seeker-profile' },
  ];
  return (
    <View style={s.bottomTabBar}>
      {tabs.map((t, i) => (
        <Pressable key={t.label} style={s.bottomTabItem} onPress={() => router.push(t.route as any)}>
          <Feather name={t.icon} size={20} color={i === active ? colors.primary : colors.textMuted} />
          <Text style={[s.bottomTabLabel, i === active && { color: colors.primary }]}>{t.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const CONVERSATIONS = [
  { name: 'Jessica M.', message: 'Looking forward to seeing you!', time: '2m ago', unread: 1, seed: 'jessica-chat' },
  { name: 'Ashley R.', message: 'Sounds great! See you at 8', time: '1h ago', unread: 0, seed: 'ashley-chat' },
  { name: 'Kate L.', message: 'Thanks for the lovely evening!', time: 'Yesterday', unread: 0, seed: 'kate-chat' },
];

const CHAT_MESSAGES = [
  { from: 'her', text: 'Hi! I saw your booking request.' },
  { from: 'me', text: 'Hey! Yes, I was hoping we could meet tomorrow?' },
  { from: 'her', text: 'Absolutely! I confirmed your booking. See you at Le Bernardin at 8 PM' },
  { from: 'me', text: "Perfect, can't wait!" },
];

// ---------------------------------------------------------------------------
// STATE 1: DEFAULT
// ---------------------------------------------------------------------------
function DefaultState() {
  return (
    <View style={s.page}>
      <Text style={s.pageTitle}>Messages</Text>

      <View style={s.chatList}>
        {CONVERSATIONS.map(c => (
          <Pressable key={c.name} style={[s.chatItem, shadows.sm]}>
            <Image source={{ uri: `https://picsum.photos/seed/${c.seed}/48/48` }} style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#000' }} />
            <View style={s.chatInfo}>
              <View style={s.chatTop}>
                <Text style={s.chatName}>{c.name}</Text>
                <Text style={s.chatTime}>{c.time}</Text>
              </View>
              <View style={s.chatBottom}>
                <Text style={s.chatMessage} numberOfLines={1}>{c.message}</Text>
                {c.unread > 0 && (
                  <View style={s.unreadBadge}>
                    <Text style={s.unreadText}>{c.unread}</Text>
                  </View>
                )}
              </View>
            </View>
            <Feather name={"chevron-right" as any} size={16} color={colors.textLight} />
          </Pressable>
        ))}
      </View>

      <BottomTabBar active={2} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 2: OPEN_CHAT
// ---------------------------------------------------------------------------
function OpenChatState() {
  const [message, setMessage] = useState('');

  return (
    <View style={s.page}>
      {/* Chat header */}
      <View style={s.chatHeader}>
        <Pressable style={s.backBtn}>
          <Feather name={"arrow-left" as any} size={20} color={colors.text} />
        </Pressable>
        <Image source={{ uri: 'https://picsum.photos/seed/jessica-chat/36/36' }} style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#000' }} />
        <View style={s.chatHeaderInfo}>
          <Text style={s.chatHeaderName}>Jessica M.</Text>
          <View style={s.onlineRow}>
            <View style={s.onlineDot} />
            <Text style={s.onlineText}>Online</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <View style={s.messageList}>
        {CHAT_MESSAGES.map((m, i) => (
          <View
            key={i}
            style={[
              s.messageBubble,
              m.from === 'me' ? s.sentBubble : s.receivedBubble,
            ]}
          >
            <Text style={[s.messageText, m.from === 'me' ? s.sentText : s.receivedText]}>
              {m.text}
            </Text>
          </View>
        ))}
      </View>

      {/* Input bar */}
      <View style={s.inputBar}>
        <TextInput
          style={s.chatInput}
          placeholder="Type a message..."
          placeholderTextColor={colors.textLight}
          value={message}
          onChangeText={setMessage}
        />
        <Pressable style={[s.sendBtn, shadows.sm]}>
          <Feather name={"send" as any} size={18} color={colors.textInverse} />
        </Pressable>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// MAIN EXPORT
// ---------------------------------------------------------------------------
export function SeekerMessagesStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Messages list with conversations">
        <DefaultState />
      </StateSection>
      <StateSection title="OPEN_CHAT" description="Chat thread with companion">
        <OpenChatState />
      </StateSection>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  root: { paddingVertical: 16 },
  page: { gap: 12 },

  pageTitle: { ...typography.h2, color: colors.text },

  // Chat list
  chatList: { gap: 8 },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 12,
  },
  chatInfo: { flex: 1 },
  chatTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  chatName: { ...typography.bodyMedium, color: colors.text },
  chatTime: { ...typography.caption, color: colors.textLight, fontSize: 10 },
  chatBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chatMessage: { ...typography.bodySmall, color: colors.textMuted, flex: 1 },
  unreadBadge: {
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: { fontSize: 10, fontWeight: '700', color: colors.textInverse },

  // Chat header
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 12,
  },
  backBtn: { padding: 4 },
  chatHeaderInfo: { flex: 1 },
  chatHeaderName: { ...typography.h3, color: colors.text },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  onlineText: { ...typography.caption, color: colors.success, fontSize: 10 },

  // Messages
  messageList: { gap: 8, paddingVertical: 8 },
  messageBubble: {
    maxWidth: '75%',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 12,
  },
  receivedBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  sentBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  messageText: { ...typography.bodySmall },
  receivedText: { color: colors.text },
  sentText: { color: colors.textInverse },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 8,
  },
  chatInput: {
    ...typography.body,
    flex: 1,
    color: colors.text,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom tab bar
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    paddingVertical: 8,
    marginTop: 8,
  },
  bottomTabItem: { flex: 1, alignItems: 'center', gap: 2 },
  bottomTabLabel: { ...typography.caption, color: colors.textMuted, fontSize: 10 },
});
