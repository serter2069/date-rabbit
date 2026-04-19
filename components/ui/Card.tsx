import { View } from 'react-native'
import type { ReactNode } from 'react'

type Variant = 'default' | 'outlined' | 'elevated'

interface CardProps {
  children: ReactNode
  variant?: Variant
  padding?: 'sm' | 'md' | 'lg'
}

const variantStyles: Record<Variant, string> = {
  default: 'bg-white',
  outlined: 'bg-white border border-[#F0E6EA]',
  elevated: 'bg-white shadow-sm',
}

const paddingStyles = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export function Card({ children, variant = 'default', padding = 'md' }: CardProps) {
  return (
    <View className={`${variantStyles[variant]} ${paddingStyles[padding]} rounded-2xl`}>
      {children}
    </View>
  )
}
