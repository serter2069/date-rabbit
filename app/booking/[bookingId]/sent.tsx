import { View, Text } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button } from '@/components/ui/Button'

export default function BookingSentScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>()
  const insets = useSafeAreaInsets()

  return (
    <View
      className="flex-1 bg-[#FBF9FA] items-center justify-center px-8"
      style={{ paddingBottom: insets.bottom + 24, paddingTop: insets.top + 24 }}
    >
      {/* Success icon */}
      <View className="w-24 h-24 rounded-full bg-[#D1FAE5] items-center justify-center mb-6">
        <Text style={{ fontSize: 48 }}>&#10003;</Text>
      </View>

      <Text className="text-3xl font-bold text-[#201317] text-center mb-3">
        Date Request Sent!
      </Text>

      <Text className="text-base text-[#81656E] text-center max-w-xs leading-6">
        We'll notify you when your companion responds. This usually happens within 24 hours.
      </Text>

      <View className="mt-10 w-full gap-3">
        <Button
          label="View My Bookings"
          onPress={() => router.replace('/(tabs)/male/bookings' as never)}
          variant="primary"
          size="lg"
          fullWidth
        />
        <Button
          label="Browse More"
          onPress={() => router.replace('/(tabs)/male/browse' as never)}
          variant="secondary"
          size="lg"
          fullWidth
        />
      </View>
    </View>
  )
}
