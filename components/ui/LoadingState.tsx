import { ActivityIndicator, Text, View } from 'react-native'
import { colors } from '@/lib/theme'

interface LoadingStateProps {
  message?: string
  size?: 'small' | 'large'
}

export function LoadingState({ message, size = 'large' }: LoadingStateProps) {
  return (
    <View className="items-center justify-center py-12 px-6">
      <ActivityIndicator size={size} color={colors.primary} />
      {message && (
        <Text className="text-base text-[#81656E] mt-3">{message}</Text>
      )}
    </View>
  )
}
