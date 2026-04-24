import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { useAuth } from '@/contexts/AuthContext'
import { colors } from '@/lib/theme'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3500'

interface BookingData {
  id: string
  activity: string
  durationHours: number
  actualDuration: number | null
  status: string
  seekerId: string
  companion: {
    userId: string
    displayName: string
    user: { name: string | null }
  }
  completedAt: string | null
}

export default function BookingCompleteScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>()
  const { token, user } = useAuth()
  const insets = useSafeAreaInsets()

  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Companion mode
  const [durationInput, setDurationInput] = useState('')
  const [durationError, setDurationError] = useState<string | null>(null)
  const [submittingDuration, setSubmittingDuration] = useState(false)
  const [durationSubmitError, setDurationSubmitError] = useState<string | null>(null)

  // Seeker mode
  const [showDisputeInput, setShowDisputeInput] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [submittingConfirm, setSubmittingConfirm] = useState(false)
  const [submittingDispute, setSubmittingDispute] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    fetchBooking()
  }, [bookingId])

  async function fetchBooking() {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error('Booking not found')
      const data = await res.json()
      setBooking(data.booking)
    } catch (e: unknown) {
      setFetchError(e instanceof Error ? e.message : 'Failed to load booking')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitDuration() {
    const dur = parseFloat(durationInput)
    if (isNaN(dur) || dur < 0.5) {
      setDurationError('Minimum duration is 0.5 hours')
      return
    }
    if (dur % 0.5 !== 0) {
      setDurationError('Must be in 0.5h increments')
      return
    }
    setDurationError(null)
    setSubmittingDuration(true)
    setDurationSubmitError(null)
    try {
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ actualDuration: dur }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit duration')
      router.replace('/(tabs)/female/bookings' as never)
    } catch (e: unknown) {
      setDurationSubmitError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSubmittingDuration(false)
    }
  }

  async function handleConfirm() {
    setSubmittingConfirm(true)
    setActionError(null)
    try {
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}/confirm-duration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to confirm')
      router.replace('/reviews/new' as never)
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSubmittingConfirm(false)
    }
  }

  async function handleDispute() {
    if (!showDisputeInput) {
      setShowDisputeInput(true)
      return
    }
    if (!disputeReason.trim()) {
      setActionError('Please provide a reason for the dispute')
      return
    }
    setSubmittingDispute(true)
    setActionError(null)
    try {
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}/dispute`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reason: disputeReason.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit dispute')
      router.replace('/(tabs)/male/bookings' as never)
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSubmittingDispute(false)
    }
  }

  if (loading) return <LoadingState />
  if (fetchError || !booking)
    return <ErrorState message={fetchError || 'Booking not found'} onRetry={fetchBooking} />

  // Determine role: is current user the companion?
  const isCompanion = user?.id === booking.companion.userId
  const companionName = booking.companion.displayName || booking.companion.user.name || 'Companion'

  // Countdown: 48h from completedAt
  let countdownText = ''
  if (!isCompanion && booking.completedAt) {
    const deadline = new Date(booking.completedAt).getTime() + 48 * 60 * 60 * 1000
    const remaining = deadline - Date.now()
    if (remaining > 0) {
      const hoursLeft = Math.floor(remaining / (1000 * 60 * 60))
      const minsLeft = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
      countdownText = `${hoursLeft}h ${minsLeft}m remaining to respond`
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FBF9FA]"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-2xl font-bold text-[#201317] mb-2">Complete Date</Text>
        <Text className="text-base text-[#81656E] mb-6">{booking.activity}</Text>

        {isCompanion ? (
          // Companion view: enter actual duration
          <Card variant="outlined" padding="md">
            <Text className="text-base font-bold text-[#201317] mb-2">
              How long was the date?
            </Text>
            <Text className="text-sm text-[#81656E] mb-4">
              Booked for {booking.durationHours}h. Enter actual duration.
            </Text>

            <View>
              <Text className="text-sm font-semibold text-[#201317] mb-2">Actual Duration (hours)</Text>
              <View
                style={{
                  borderColor: durationError ? colors.error : '#E6D5DC',
                  borderWidth: 1,
                  borderRadius: 12,
                  backgroundColor: '#FFFFFF',
                  paddingHorizontal: 14,
                  height: 48,
                  justifyContent: 'center',
                }}
              >
                <TextInput
                  style={{ fontSize: 16, color: colors.text }}
                  placeholder="e.g. 2.5"
                  placeholderTextColor={colors.textSecondary}
                  value={durationInput}
                  onChangeText={setDurationInput}
                  keyboardType="decimal-pad"
                />
              </View>
              {durationError && (
                <Text className="text-xs text-[#DC2626] mt-1">{durationError}</Text>
              )}
              <Text className="text-xs text-[#81656E] mt-1">Minimum 0.5h, steps of 0.5h</Text>
            </View>

            {durationSubmitError && (
              <View className="mt-3 bg-red-50 rounded-xl p-3">
                <Text className="text-sm text-[#DC2626]">{durationSubmitError}</Text>
              </View>
            )}

            <View className="mt-4">
              <Button
                label="Submit Duration"
                onPress={handleSubmitDuration}
                variant="primary"
                size="lg"
                fullWidth
                loading={submittingDuration}
                disabled={submittingDuration}
              />
            </View>
          </Card>
        ) : (
          // Seeker view: confirm or dispute
          <View className="gap-4">
            <Card variant="outlined" padding="md">
              <Text className="text-base font-bold text-[#201317] mb-1">
                Duration Submitted by {companionName}
              </Text>
              <Text className="text-3xl font-bold text-[#C52660] mt-2">
                {booking.actualDuration ?? '—'}h
              </Text>
              <Text className="text-sm text-[#81656E] mt-1">
                Originally booked for {booking.durationHours}h
              </Text>
              {countdownText ? (
                <Text className="text-xs text-[#D97706] mt-3 font-semibold">{countdownText}</Text>
              ) : null}
            </Card>

            {showDisputeInput && (
              <Card variant="outlined" padding="md">
                <Text className="text-sm font-semibold text-[#201317] mb-2">Dispute Reason</Text>
                <View
                  style={{
                    borderColor: '#E6D5DC',
                    borderWidth: 1,
                    borderRadius: 12,
                    backgroundColor: '#FFFFFF',
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    minHeight: 80,
                  }}
                >
                  <TextInput
                    style={{ fontSize: 16, color: colors.text }}
                    placeholder="Describe the issue..."
                    placeholderTextColor={colors.textSecondary}
                    value={disputeReason}
                    onChangeText={setDisputeReason}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </Card>
            )}

            {actionError && (
              <View className="bg-red-50 rounded-xl p-3">
                <Text className="text-sm text-[#DC2626]">{actionError}</Text>
              </View>
            )}

            <Button
              label="Confirm Duration"
              onPress={handleConfirm}
              variant="primary"
              size="lg"
              fullWidth
              loading={submittingConfirm}
              disabled={submittingConfirm || submittingDispute}
            />
            <Button
              label={showDisputeInput ? 'Submit Dispute' : 'Dispute'}
              onPress={handleDispute}
              variant="secondary"
              size="lg"
              fullWidth
              loading={submittingDispute}
              disabled={submittingConfirm || submittingDispute}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
