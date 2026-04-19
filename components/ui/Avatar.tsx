import { Image, Text, View } from 'react-native'

type Size = 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  uri?: string
  name?: string
  size?: Size
}

const sizeStyles: Record<Size, { container: string; text: string; px: number }> = {
  sm: { container: 'w-8 h-8', text: 'text-xs font-bold', px: 32 },
  md: { container: 'w-12 h-12', text: 'text-base font-bold', px: 48 },
  lg: { container: 'w-16 h-16', text: 'text-lg font-bold', px: 64 },
  xl: { container: 'w-24 h-24', text: 'text-2xl font-bold', px: 96 },
}

function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Avatar({ uri, name, size = 'md' }: AvatarProps) {
  const s = sizeStyles[size]

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: s.px, height: s.px, borderRadius: s.px / 2 }}
      />
    )
  }

  return (
    <View
      className={`${s.container} rounded-full bg-[#F5DDE5] items-center justify-center`}
    >
      <Text className={`${s.text} text-[#C52660]`}>{getInitials(name)}</Text>
    </View>
  )
}
