import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { colors } from '@/lib/theme'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3500'

const MAX_COMMENT = 1000

function StarPicker({
  value,
  onChange,
}: {
  value: number
  onChange: (n: number) => void
}) {
  return (
    <View className="flex-row gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          onPress={() => onChange(star)}
          accessibilityLabel={`Rate ${star} star${star > 1 ? 's' : ''}`}
          style={{ padding: 4 }}
        >
          <Text
            style={{
              fontSize: 40,
              color: star <= value ? '#D97706' : '#E6D5DC',
            }}
          >
            {star <= value ? '★' : '☆'}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

export default function WriteReviewScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>()
  const { token } = useAuth()
  const insets = useSafeAreaInsets()

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [ratingError, setRatingError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    if (rating < 1 || rating > 5) {
      setRatingError('Please select a rating')
      return false
    }
    setRatingError(null)
    return true
  }

  async function handleSubmit() {
    if (!validate()) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          bookingId: bookingId || undefined,
          rating,
          comment: comment.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit review')
      router.replace('/(tabs)/male/bookings' as never)
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FBF9FA]"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-2xl font-bold text-[#201317] mb-2">Write a Review</Text>
        <Text className="text-base text-[#81656E] mb-8">
          Share your experience to help others.
        </Text>

        {/* Star picker */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-[#201317] mb-3">Your Rating</Text>
          <StarPicker value={rating} onChange={(n) => { setRating(n); setRatingError(null) }} />
          {ratingError && (
            <Text className="text-xs text-[#DC2626] mt-2">{ratingError}</Text>
          )}
          {rating > 0 && (
            <Text className="text-sm text-[#81656E] mt-2">
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
            </Text>
          )}
        </View>

        {/* Comment */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-[#201317] mb-2">
            Comment <Text className="text-[#81656E] font-normal">(optional)</Text>
          </Text>
          <View
            style={{
              borderColor: '#E6D5DC',
              borderWidth: 1,
              borderRadius: 12,
              backgroundColor: '#FFFFFF',
              paddingHorizontal: 14,
              paddingVertical: 12,
              minHeight: 120,
            }}
          >
            <TextInput
              style={{ fontSize: 16, color: colors.text, textAlignVertical: 'top' }}
              placeholder="Share your experience..."
              placeholderTextColor={colors.textSecondary}
              value={comment}
              onChangeText={(t) => setComment(t.slice(0, MAX_COMMENT))}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={MAX_COMMENT}
            />
          </View>
          <Text className="text-xs text-[#81656E] mt-1 text-right">
            {comment.length}/{MAX_COMMENT}
          </Text>
        </View>

        {submitError && (
          <View className="bg-red-50 rounded-xl p-3 mb-4">
            <Text className="text-sm text-[#DC2626]">{submitError}</Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky CTA */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: insets.bottom + 16,
          paddingTop: 12,
          paddingHorizontal: 16,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F0E6EA',
        }}
      >
        <Button
          label="Submit Review"
          onPress={handleSubmit}
          variant="primary"
          size="lg"
          fullWidth
          loading={submitting}
          disabled={submitting}
        />
      </View>
    </KeyboardAvoidingView>
  )
}
