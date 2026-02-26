import { StyleSheet } from 'react-native';
import { colors, spacing, typography, PAGE_PADDING } from './theme';

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
  },
  subtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: 24,
  },
});
