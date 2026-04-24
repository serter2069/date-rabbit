import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { useAuth } from '@/contexts/AuthContext'
import { colors } from '@/lib/theme'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3500'

const PLATFORM_FEE_RATE = 0.15
const STRIPE_FEE_RATE = 0.029
const STRIPE_FEE_FIXED = 0.3

interface CompanionData {
  id: string
  displayName: string
  hourlyRate: number
  user: { name: string | null }
}

interface BookingData {
  id: string
  date: string
  durationHours: number
  activity: string
  location: string
  notes: string | null
  status: string
  totalAmount: number
  platformFee: number
  stripeFee: number
  companion: {
    id: string
    displayName: string
    user: { name: string | null }
  }
}

function calcFees(hourlyRate: number, durationHours: number) {
  const subtotal = hourlyRate * durationHours
  const platformFee = parseFloat((subtotal * PLATFORM_FEE_RATE).toFixed(2))
  const stripeFee = parseFloat((subtotal * STRIPE_FEE_RATE + STRIPE_FEE_FIXED).toFixed(2))
  const total = parseFloat((subtotal + platformFee + stripeFee).toFixed(2))
  return { subtotal, platformFee, stripeFee, total }
}

// ---- New booking form ----
function NewBookingForm({ companionId }: { companionId: string }) {
  const { token } = useAuth()
  const insets = useSafeAreaInsets()

  const [companion, setCompanion] = useState<CompanionData | null>(null)
  const [loadingCompanion, setLoadingCompanion] = useState(true)
  const [companionError, setCompanionError] = useState<string | null>(null)

  const [activity, setActivity] = useState('')
  const [date, setDate] = useState('')
  const [duration, setDuration] = useState('2')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    fetchCompanion()
  }, [companionId])

  async function fetchCompanion() {
    setLoadingCompanion(true)
    setCompanionError(null)
    try {
      const res = await fetch(`${API_URL}/api/companions/${companionId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error('Companion not found')
      const data = await res.json()
      setCompanion(data.companion)
    } catch (e: unknown) {
      setCompanionError(e instanceof Error ? e.message : 'Failed to load companion')
    } finally {
      setLoadingCompanion(false)
    }
  }

  function validate() {
    const newErrors: Record<string, string> = {}
    if (!activity.trim()) newErrors['activity'] = 'Activity is required'
    if (!date.trim()) newErrors['date'] = 'Date is required'
    if (!location.trim()) newErrors['location'] = 'Location is required'
    const dur = parseFloat(duration)
    if (isNaN(dur) || dur < 0.5) newErrors['duration'] = 'Minimum 0.5 hours'
    if (dur % 0.5 !== 0) newErrors['duration'] = 'Must be in 0.5h increments'
    if (notes.length > 500) newErrors['notes'] = 'Max 500 characters'
    // Basic future date check
    if (date.trim()) {
      const d = new Date(date.trim())
      if (isNaN(d.getTime())) newErrors['date'] = 'Invalid date format (YYYY-MM-DD HH:MM)'
      else if (d < new Date()) newErrors['date'] = 'Date must be in the future'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit() {
    if (!validate() || !companion) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          companionId,
          date: new Date(date.trim()).toISOString(),
          durationHours: parseFloat(duration),
          activity: activity.trim(),
          location: location.trim(),
          notes: notes.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create booking')
      router.replace(`/payment/${data.booking.id}` as never)
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingCompanion) return <LoadingState />
  if (companionError || !companion)
    return <ErrorState message={companionError || 'Companion not found'} onRetry={fetchCompanion} />

  const dur = parseFloat(duration) || 0
  const fees = companion ? calcFees(companion.hourlyRate, dur) : null
  const companionName = companion.displayName || companion.user.name || 'Companion'

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
        {/* Header info */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-[#201317]">Book a Date</Text>
          <Text className="text-base text-[#81656E] mt-1">with {companionName}</Text>
        </View>

        {/* Form fields */}
        <View className="gap-4">
          <Input
            label="Activity"
            placeholder="e.g. Dinner, Museum tour, Coffee..."
            value={activity}
            onChangeText={setActivity}
            error={errors['activity']}
            autoCapitalize="sentences"
          />

          <View>
            <Text className="text-sm font-semibold text-[#201317] mb-2">Date & Time</Text>
            <View
              style={{
                borderColor: errors['date'] ? colors.error : '#E6D5DC',
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
                placeholder="YYYY-MM-DD HH:MM"
                placeholderTextColor={colors.textSecondary}
                value={date}
                onChangeText={setDate}
                autoCapitalize="none"
              />
            </View>
            {errors['date'] && (
              <Text className="text-xs text-[#DC2626] mt-1.5">{errors['date']}</Text>
            )}
          </View>

          <View>
            <Text className="text-sm font-semibold text-[#201317] mb-2">Duration (hours)</Text>
            <View
              style={{
                borderColor: errors['duration'] ? colors.error : '#E6D5DC',
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
                placeholder="e.g. 2, 2.5, 3"
                placeholderTextColor={colors.textSecondary}
                value={duration}
                onChangeText={setDuration}
                keyboardType="decimal-pad"
              />
            </View>
            {errors['duration'] && (
              <Text className="text-xs text-[#DC2626] mt-1.5">{errors['duration']}</Text>
            )}
            <Text className="text-xs text-[#81656E] mt-1">Minimum 0.5h, steps of 0.5h</Text>
          </View>

          <Input
            label="Location"
            placeholder="e.g. Manhattan, NYC"
            value={location}
            onChangeText={setLocation}
            error={errors['location']}
            autoCapitalize="words"
          />

          <View>
            <Text className="text-sm font-semibold text-[#201317] mb-2">
              Notes <Text className="text-[#81656E] font-normal">(optional)</Text>
            </Text>
            <View
              style={{
                borderColor: '#E6D5DC',
                borderWidth: 1,
                borderRadius: 12,
                backgroundColor: '#FFFFFF',
                paddingHorizontal: 14,
                paddingVertical: 12,
                minHeight: 96,
              }}
            >
              <TextInput
                style={{ fontSize: 16, color: colors.text }}
                placeholder="Any special requests or preferences..."
                placeholderTextColor={colors.textSecondary}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
            </View>
            <Text className="text-xs text-[#81656E] mt-1 text-right">{notes.length}/500</Text>
            {errors['notes'] && (
              <Text className="text-xs text-[#DC2626] mt-1">{errors['notes']}</Text>
            )}
          </View>
        </View>

        {/* Price breakdown */}
        {fees && dur >= 0.5 && (
          <View className="mt-6">
            <Card variant="outlined" padding="md">
              <Text className="text-base font-bold text-[#201317] mb-3">Price Breakdown</Text>
              <View className="gap-2">
                <PriceLine
                  label={`${companionName}'s rate`}
                  value={`$${companion.hourlyRate}/hr`}
                />
                <PriceLine label="Duration" value={`${dur}h`} />
                <PriceLine label="Subtotal" value={`$${fees.subtotal.toFixed(2)}`} />
                <View className="h-px bg-[#F0E6EA] my-1" />
                <PriceLine label="Platform fee (15%)" value={`$${fees.platformFee.toFixed(2)}`} muted />
                <PriceLine label="Stripe fee (3%)" value={`$${fees.stripeFee.toFixed(2)}`} muted />
                <View className="h-px bg-[#F0E6EA] my-1" />
                <View className="flex-row justify-between items-center">
                  <Text className="text-base font-bold text-[#201317]">Total</Text>
                  <Text className="text-base font-bold text-[#C52660]">${fees.total.toFixed(2)}</Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {submitError && (
          <View className="mt-4 bg-red-50 rounded-xl p-3">
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
          label={submitting ? 'Creating booking...' : 'Continue to Payment'}
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

// ---- Existing booking view ----
function ExistingBookingView({ bookingId }: { bookingId: string }) {
  const { token } = useAuth()
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBooking()
  }, [bookingId])

  async function fetchBooking() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error('Booking not found')
      const data = await res.json()
      setBooking(data.booking)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load booking')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />
  if (error || !booking)
    return <ErrorState message={error || 'Booking not found'} onRetry={fetchBooking} />

  const companionName = booking.companion.displayName || 'Companion'
  const dateStr = new Date(booking.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const timeStr = new Date(booking.date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <ScrollView className="flex-1 bg-[#FBF9FA]" contentContainerStyle={{ padding: 16 }}>
      <Text className="text-2xl font-bold text-[#201317] mb-6">Booking Details</Text>
      <Card variant="outlined" padding="md">
        <View className="gap-4">
          <DetailRow label="Companion" value={companionName} />
          <DetailRow label="Date" value={`${dateStr} at ${timeStr}`} />
          <DetailRow label="Activity" value={booking.activity} />
          <DetailRow label="Location" value={booking.location} />
          <DetailRow label="Duration" value={`${booking.durationHours}h`} />
          {booking.notes && <DetailRow label="Notes" value={booking.notes} />}
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-semibold text-[#81656E]">Status</Text>
            <Badge label={booking.status} variant={statusToVariant(booking.status)} />
          </View>
        </View>
      </Card>

      <View className="mt-4">
        <Card variant="outlined" padding="md">
          <Text className="text-base font-bold text-[#201317] mb-3">Price Breakdown</Text>
          <View className="gap-2">
            <PriceLine
              label="Platform fee"
              value={`$${booking.platformFee.toFixed(2)}`}
              muted
            />
            <PriceLine label="Stripe fee" value={`$${booking.stripeFee.toFixed(2)}`} muted />
            <View className="h-px bg-[#F0E6EA] my-1" />
            <View className="flex-row justify-between items-center">
              <Text className="text-base font-bold text-[#201317]">Total</Text>
              <Text className="text-base font-bold text-[#C52660]">
                ${booking.totalAmount.toFixed(2)}
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  )
}

// ---- Helpers ----
function PriceLine({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <View className="flex-row justify-between items-center">
      <Text className={`text-sm ${muted ? 'text-[#81656E]' : 'text-[#201317]'}`}>{label}</Text>
      <Text className={`text-sm ${muted ? 'text-[#81656E]' : 'text-[#201317] font-medium'}`}>
        {value}
      </Text>
    </View>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-xs font-semibold text-[#81656E] uppercase tracking-wide">{label}</Text>
      <Text className="text-base text-[#201317] mt-0.5">{value}</Text>
    </View>
  )
}

function statusToVariant(status: string): 'neutral' | 'success' | 'warning' | 'error' {
  switch (status.toLowerCase()) {
    case 'accepted':
    case 'paid':
    case 'completed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'declined':
    case 'disputed':
      return 'error'
    default:
      return 'neutral'
  }
}

// ---- Route ----
// /booking/[id] — id is either a companionId (new booking) or bookingId (existing)
// Distinguish by query param: ?mode=new or ?mode=view (defaults to view)
export default function BookingScreen() {
  const { id, mode, companionId } = useLocalSearchParams<{
    id: string
    mode?: string
    companionId?: string
  }>()

  // If companionId param passed, or mode=new — show new booking form
  const effectiveCompanionId = companionId || (mode === 'new' ? id : null)

  return (
    <View className="flex-1 bg-[#FBF9FA]">
      {effectiveCompanionId ? (
        <NewBookingForm companionId={effectiveCompanionId} />
      ) : (
        <ExistingBookingView bookingId={id} />
      )}
    </View>
  )
}
