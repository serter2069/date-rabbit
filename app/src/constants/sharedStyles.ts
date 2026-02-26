import { StyleSheet } from 'react-native';
import { colors, spacing, typography, PAGE_PADDING, borderWidth } from './theme';

export const screenStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: PAGE_PADDING },
  header: { marginBottom: spacing.xl },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xxl,
    color: colors.text,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    lineHeight: 24,
  },
});
