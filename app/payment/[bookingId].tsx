import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
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
  date: string
  durationHours: number
  activity: string
  location: string
  totalAmount: number
  platformFee: number
  stripeFee: number
  companion: {
    displayName: string
    hourlyRate: number
    user: { name: string | null }
  }
}

function formatCardNumber(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
  return digits
}

export default function PaymentScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>()
  const { token } = useAuth()
  const insets = useSafeAreaInsets()

  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Card form state
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [zip, setZip] = useState('')
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({})

  const [processing, setProcessing] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

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

  function validateCard() {
    const errs: Record<string, string> = {}
    const rawCard = cardNumber.replace(/\s/g, '')
    if (rawCard.length < 16) errs['cardNumber'] = 'Enter a valid 16-digit card number'
    const expiryParts = expiry.split('/')
    const month = parseInt(expiryParts[0] ?? '', 10)
    const year = parseInt(expiryParts[1] ?? '', 10)
    const now = new Date()
    const expYear = 2000 + (year || 0)
    if (!month || month < 1 || month > 12 || !year || expYear < now.getFullYear() ||
      (expYear === now.getFullYear() && month < now.getMonth() + 1)) {
      errs['expiry'] = 'Invalid expiry date'
    }
    if (cvc.replace(/\D/g, '').length < 3) errs['cvc'] = 'Enter a valid CVC'
    if (zip.replace(/\D/g, '').length < 5) errs['zip'] = 'Enter a valid ZIP code'
    setCardErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handlePay() {
    if (!validateCard() || !booking) return
    setProcessing(true)
    setPayError(null)
    try {
      const res = await fetch(`${API_URL}/api/payments/bookings/${bookingId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ bookingId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Payment failed')
      // Navigate to confirmation, no back
      router.replace(`/booking/${bookingId}/sent` as never)
    } catch (e: unknown) {
      setPayError(e instanceof Error ? e.message : 'Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <LoadingState />
  if (fetchError || !booking)
    return <ErrorState message={fetchError || 'Booking not found'} onRetry={fetchBooking} />

  const companionName = booking.companion.displayName || booking.companion.user.name || 'Companion'
  const subtotal = booking.companion.hourlyRate * booking.durationHours

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
        <Text className="text-2xl font-bold text-[#201317] mb-6">Payment</Text>

        {/* Price breakdown */}
        <Card variant="outlined" padding="md">
          <Text className="text-base font-bold text-[#201317] mb-3">Order Summary</Text>
          <View className="gap-2">
            <PriceLine label={`Date with ${companionName}`} value="" />
            <PriceLine label={`${companionName}'s rate`} value={`$${booking.companion.hourlyRate}/hr`} muted />
            <PriceLine label="Duration" value={`${booking.durationHours}h`} muted />
            <PriceLine label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
            <View className="h-px bg-[#F0E6EA] my-1" />
            <PriceLine label="Platform fee (15%)" value={`$${booking.platformFee.toFixed(2)}`} muted />
            <PriceLine label="Stripe fee (3%)" value={`$${booking.stripeFee.toFixed(2)}`} muted />
            <View className="h-px bg-[#F0E6EA] my-1" />
            <View className="flex-row justify-between items-center">
              <Text className="text-base font-bold text-[#201317]">Total</Text>
              <Text className="text-base font-bold text-[#C52660]">
                ${booking.totalAmount.toFixed(2)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Stripe badge */}
        <View className="flex-row items-center justify-center mt-4 mb-2 gap-1.5">
          <Text className="text-xs text-[#81656E]">Secure payment powered by Stripe</Text>
        </View>

        {/* Mock card form */}
        <Card variant="outlined" padding="md">
          <Text className="text-base font-bold text-[#201317] mb-4">Card Details</Text>
          <View className="gap-4">
            {/* Card number */}
            <View>
              <Text className="text-sm font-semibold text-[#201317] mb-2">Card Number</Text>
              <CardInput
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                keyboardType="number-pad"
                maxLength={19}
                error={cardErrors['cardNumber']}
              />
            </View>
            {/* Expiry + CVC */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-[#201317] mb-2">Expiry</Text>
                <CardInput
                  placeholder="MM/YY"
                  value={expiry}
                  onChangeText={(t) => setExpiry(formatExpiry(t))}
                  keyboardType="number-pad"
                  maxLength={5}
                  error={cardErrors['expiry']}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-[#201317] mb-2">CVC</Text>
                <CardInput
                  placeholder="123"
                  value={cvc}
                  onChangeText={(t) => setCvc(t.replace(/\D/g, '').slice(0, 4))}
                  keyboardType="number-pad"
                  maxLength={4}
                  error={cardErrors['cvc']}
                  secureTextEntry
                />
              </View>
            </View>
            {/* ZIP */}
            <View>
              <Text className="text-sm font-semibold text-[#201317] mb-2">ZIP Code</Text>
              <CardInput
                placeholder="10001"
                value={zip}
                onChangeText={(t) => setZip(t.replace(/\D/g, '').slice(0, 10))}
                keyboardType="number-pad"
                maxLength={10}
                error={cardErrors['zip']}
              />
            </View>
          </View>
        </Card>

        {payError && (
          <View className="mt-4 bg-red-50 rounded-xl p-3">
            <Text className="text-sm text-[#DC2626]">{payError}</Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky Pay button */}
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
          label={processing ? 'Processing...' : `Pay $${booking.totalAmount.toFixed(2)}`}
          onPress={handlePay}
          variant="primary"
          size="lg"
          fullWidth
          loading={processing}
          disabled={processing}
        />
      </View>
    </KeyboardAvoidingView>
  )
}

// ---- Helper components ----

function PriceLine({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <View className="flex-row justify-between items-center">
      <Text className={`text-sm ${muted ? 'text-[#81656E]' : 'text-[#201317]'}`}>{label}</Text>
      {value ? (
        <Text className={`text-sm ${muted ? 'text-[#81656E]' : 'text-[#201317] font-medium'}`}>
          {value}
        </Text>
      ) : null}
    </View>
  )
}

function CardInput({
  placeholder,
  value,
  onChangeText,
  keyboardType,
  maxLength,
  error,
  secureTextEntry,
}: {
  placeholder: string
  value: string
  onChangeText: (t: string) => void
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad'
  maxLength?: number
  error?: string
  secureTextEntry?: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <View>
      <View
        style={{
          borderColor: error ? colors.error : focused ? colors.primary : '#E6D5DC',
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
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          maxLength={maxLength}
          secureTextEntry={secureTextEntry}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
      {error && <Text className="text-xs text-[#DC2626] mt-1">{error}</Text>}
    </View>
  )
}
