import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { colors } from '@/lib/theme'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps {
  label: string
  onPress?: () => void
  variant?: Variant
  size?: Size
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}

const variantStyles: Record<Variant, { container: string; text: string }> = {
  primary: {
    container: 'bg-[#C52660] active:opacity-90',
    text: 'text-white',
  },
  secondary: {
    container: 'bg-white border border-[#C52660] active:bg-[#FBF9FA]',
    text: 'text-[#C52660]',
  },
  ghost: {
    container: 'bg-transparent active:bg-[#FBF9FA]',
    text: 'text-[#C52660]',
  },
}

const sizeStyles: Record<Size, { container: string; text: string }> = {
  sm: { container: 'h-10 px-4 rounded-lg', text: 'text-sm font-semibold' },
  md: { container: 'h-12 px-5 rounded-xl', text: 'text-base font-semibold' },
  lg: { container: 'h-14 px-6 rounded-xl', text: 'text-lg font-bold' },
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
}: ButtonProps) {
  const v = variantStyles[variant]
  const s = sizeStyles[size]
  const isDisabled = disabled || loading

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`${v.container} ${s.container} ${fullWidth ? 'w-full' : ''} ${
        isDisabled ? 'opacity-50' : ''
      } items-center justify-center flex-row`}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : colors.primary}
        />
      ) : (
        <Text className={`${v.text} ${s.text}`}>{label}</Text>
      )}
    </Pressable>
  )
}
