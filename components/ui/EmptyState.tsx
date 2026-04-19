import { Text, View } from 'react-native'
import type { ReactNode } from 'react'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  message?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="items-center justify-center py-12 px-6">
      {icon && <View className="mb-4">{icon}</View>}
      <Text className="text-xl font-bold text-[#201317] text-center">{title}</Text>
      {message && (
        <Text className="text-base text-[#81656E] text-center mt-2 max-w-sm">
          {message}
        </Text>
      )}
      {actionLabel && onAction && (
        <View className="mt-6">
          <Button label={actionLabel} onPress={onAction} variant="primary" size="md" />
        </View>
      )}
    </View>
  )
}
