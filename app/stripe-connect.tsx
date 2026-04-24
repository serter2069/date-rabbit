import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { Linking } from 'react-native'
import { useAuth } from '@/contexts/AuthContext'
import { colors } from '@/lib/theme'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3500'

type PageState = 'loading' | 'not-connected' | 'connected' | 'connecting'

export default function StripeConnectPage() {
  const router = useRouter()
  const { token, user } = useAuth()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !user) {
      router.replace('/(auth)/welcome')
      return
    }
    if (user.role !== 'companion') {
      router.replace('/(tabs)')
      return
    }
    // Check stripe status from user object
    // stripeAccountId would be on the user if present
    const stripeId = (user as unknown as Record<string, unknown>).stripeAccountId
    setPageState(stripeId ? 'connected' : 'not-connected')
  }, [token, user, router])

  async function handleConnect() {
    if (!token) return
    setPageState('connecting')
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/companion/stripe-connect/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error ?? `Server error ${res.status}`)
      }
      const { onboardingUrl } = await res.json()
      await Linking.openURL(onboardingUrl)
      // After returning from browser, re-check state
      setPageState('not-connected')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setPageState('not-connected')
    }
  }

  if (pageState === 'loading') {
    return (
      <>
        <Stack.Screen options={{ title: 'Bank Account', headerShown: true }} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FBF9FA' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </>
    )
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Connect Bank Account', headerShown: true }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: '#FBF9FA' }}
        contentContainerStyle={{ padding: 24, maxWidth: 560, alignSelf: 'center', width: '100%' }}
      >
        {/* Header icon */}
        <View
          style={{
            width: 72,
            height: 72,
            backgroundColor: pageState === 'connected' ? '#059669' : '#C52660',
            borderRadius: 36,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            alignSelf: 'center',
          }}
        >
          <Text style={{ fontSize: 36 }}>{pageState === 'connected' ? '✓' : '🏦'}</Text>
        </View>

        <Text
          style={{
            fontSize: 26,
            fontWeight: '800',
            color: colors.text,
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          {pageState === 'connected' ? 'Bank Account Connected' : 'Connect Bank Account'}
        </Text>

        <Text
          style={{
            fontSize: 15,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 24,
            marginBottom: 36,
          }}
        >
          {pageState === 'connected'
            ? 'Your Stripe account is linked. Earnings from confirmed bookings will be transferred automatically.'
            : 'To receive payments from bookings, connect your bank account via Stripe. Your financial data is handled securely by Stripe — DateRabbit never stores your bank details.'}
        </Text>

        {/* Info cards */}
        {pageState !== 'connected' && (
          <View style={{ gap: 12, marginBottom: 36 }}>
            {[
              { icon: '🔒', title: 'Bank-grade security', desc: 'Stripe is PCI DSS Level 1 certified.' },
              { icon: '⚡', title: 'Fast payouts', desc: 'Earnings deposited within 2–3 business days.' },
              { icon: '🌍', title: '30+ currencies', desc: 'Receive payouts in your local currency.' },
            ].map((item) => (
              <View
                key={item.title}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 14,
                  borderWidth: 1,
                  borderColor: '#F0E6EA',
                }}
              >
                <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 2 }}>
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Connected state details */}
        {pageState === 'connected' && (
          <View
            style={{
              backgroundColor: '#ECFDF5',
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: '#A7F3D0',
              marginBottom: 36,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 28 }}>✅</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#065F46' }}>
                Stripe Connected
              </Text>
              <Text style={{ fontSize: 13, color: '#065F46', marginTop: 2 }}>
                You are ready to receive payments from bookings.
              </Text>
            </View>
          </View>
        )}

        {error && (
          <View
            style={{
              backgroundColor: '#FEF2F2',
              borderRadius: 12,
              padding: 14,
              borderWidth: 1,
              borderColor: '#FECACA',
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 14, color: '#DC2626' }}>{error}</Text>
          </View>
        )}

        {/* CTA */}
        {pageState !== 'connected' && (
          <Pressable
            onPress={handleConnect}
            disabled={pageState === 'connecting'}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#A01E50' : colors.primary,
              paddingVertical: 16,
              borderRadius: 14,
              alignItems: 'center',
              opacity: pageState === 'connecting' ? 0.7 : 1,
              marginBottom: 16,
            })}
          >
            {pageState === 'connecting' ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>
                Connect with Stripe
              </Text>
            )}
          </Pressable>
        )}

        {pageState === 'connected' && (
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#F3F0F1' : '#FFFFFF',
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: 'center',
              borderWidth: 2,
              borderColor: '#F0E6EA',
            })}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
              Back to Profile
            </Text>
          </Pressable>
        )}

        <Text
          style={{
            fontSize: 12,
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: 20,
            lineHeight: 18,
          }}
        >
          Payments powered by Stripe. DateRabbit does not store your bank details.
        </Text>
      </ScrollView>
    </>
  )
}
