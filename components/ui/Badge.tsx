import { Text, View } from 'react-native'

type Variant = 'neutral' | 'success' | 'warning' | 'error' | 'primary'

interface BadgeProps {
  label: string
  variant?: Variant
}

const variantStyles: Record<Variant, { container: string; text: string }> = {
  neutral: { container: 'bg-[#F5EEF0]', text: 'text-[#81656E]' },
  primary: { container: 'bg-[#FCE7EF]', text: 'text-[#C52660]' },
  success: { container: 'bg-[#D1FAE5]', text: 'text-[#059669]' },
  warning: { container: 'bg-[#FEF3C7]', text: 'text-[#D97706]' },
  error: { container: 'bg-[#FEE2E2]', text: 'text-[#DC2626]' },
}

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const v = variantStyles[variant]
  return (
    <View className={`${v.container} px-2.5 py-1 rounded-full self-start`}>
      <Text className={`${v.text} text-xs font-semibold`}>{label}</Text>
    </View>
  )
}
