import { Text, View } from 'react-native'
import { Button } from './Button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Что-то пошло не так',
  message = 'Попробуй ещё раз через секунду.',
  onRetry,
}: ErrorStateProps) {
  return (
    <View className="items-center justify-center py-12 px-6">
      <View className="w-12 h-12 rounded-full bg-[#FEE2E2] items-center justify-center mb-4">
        <Text className="text-2xl">!</Text>
      </View>
      <Text className="text-xl font-bold text-[#201317] text-center">{title}</Text>
      <Text className="text-base text-[#81656E] text-center mt-2 max-w-sm">
        {message}
      </Text>
      {onRetry && (
        <View className="mt-6">
          <Button label="Повторить" onPress={onRetry} variant="primary" size="md" />
        </View>
      )}
    </View>
  )
}
