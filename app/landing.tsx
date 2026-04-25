import { ScrollView, Text, View, Pressable, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { Stack } from 'expo-router'

export default function LandingPage() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isDesktop = width >= 1024

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: '#FBF9FA' }}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* HERO */}
        <View
          style={{
            backgroundColor: '#C52660',
            paddingHorizontal: 24,
            paddingTop: 80,
            paddingBottom: 60,
          }}
        >
          <View
            style={{
              maxWidth: 1100,
              alignSelf: 'center',
              width: '100%',
              flexDirection: isDesktop ? 'row' : 'column',
              alignItems: isDesktop ? 'center' : 'flex-start',
              gap: 40,
            }}
          >
            {/* Hero text */}
            <View style={{ flex: isDesktop ? 1 : undefined }}>
              <Text
                style={{
                  fontSize: isDesktop ? 56 : 40,
                  fontWeight: '800',
                  color: '#FFFFFF',
                  lineHeight: isDesktop ? 64 : 48,
                  marginBottom: 16,
                }}
              >
                Find Your Perfect Companion
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  color: 'rgba(255,255,255,0.85)',
                  lineHeight: 28,
                  marginBottom: 32,
                }}
              >
                Safe, verified, unforgettable dates
              </Text>
              <View
                style={{
                  flexDirection: isDesktop ? 'row' : 'column',
                  gap: 12,
                }}
              >
                <Pressable
                  onPress={() => router.push('/(auth)/welcome')}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? '#E95C20' : '#FFFFFF',
                    paddingHorizontal: 28,
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: '#FFFFFF',
                  })}
                >
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#C52660' }}>
                    Find a Companion
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => router.push('/onboarding')}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? 'rgba(255,255,255,0.15)' : 'transparent',
                    paddingHorizontal: 28,
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: '#FFFFFF',
                  })}
                >
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>
                    Become a Companion
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Hero decoration — desktop only */}
            {isDesktop && (
              <View
                style={{
                  width: 380,
                  height: 380,
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  borderRadius: 24,
                  borderWidth: 2,
                  borderColor: 'rgba(255,255,255,0.25)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 80 }}>💫</Text>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 18,
                    fontWeight: '600',
                    marginTop: 16,
                  }}
                >
                  DateRabbit
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* HOW IT WORKS */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 60, backgroundColor: '#FFFFFF' }}>
          <View style={{ maxWidth: 1100, alignSelf: 'center', width: '100%' }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: '800',
                color: '#201317',
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              How It Works
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: '#81656E',
                textAlign: 'center',
                marginBottom: 40,
              }}
            >
              Three simple steps to your perfect date
            </Text>
            <View
              style={{
                flexDirection: isDesktop ? 'row' : 'column',
                gap: 20,
              }}
            >
              {[
                { step: '1', icon: '👤', title: 'Create Profile', desc: 'Sign up and build your profile. Seekers describe what they are looking for, companions showcase their personality.' },
                { step: '2', icon: '🔍', title: 'Browse Companions', desc: 'Explore verified companion profiles. Filter by city, interests, and availability to find your match.' },
                { step: '3', icon: '📅', title: 'Book a Date', desc: 'Send a booking request with your preferred time and place. Confirm, pay securely, and enjoy your date.' },
                // static list — no empty state
              ].map((item) => (
                <View
                  key={item.step}
                  style={{
                    flex: isDesktop ? 1 : undefined,
                    backgroundColor: '#FBF9FA',
                    borderRadius: 20,
                    padding: 24,
                    borderWidth: 2,
                    borderColor: '#F0E6EA',
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor: '#C52660',
                      borderRadius: 24,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '800' }}>
                      {item.step}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 22, marginBottom: 8 }}>{item.icon}</Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '700',
                      color: '#201317',
                      marginBottom: 8,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#81656E', lineHeight: 22 }}>{item.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* WHY DATERABBIT */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 60, backgroundColor: '#FBF9FA' }}>
          <View style={{ maxWidth: 1100, alignSelf: 'center', width: '100%' }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: '800',
                color: '#201317',
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              Why DateRabbit?
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: '#81656E',
                textAlign: 'center',
                marginBottom: 40,
              }}
            >
              Built on trust, designed for real connection
            </Text>
            <View
              style={{
                flexDirection: isDesktop ? 'row' : 'column',
                gap: 20,
              }}
            >
              {[
                {
                  icon: '✅',
                  title: 'Verified Safety',
                  desc: 'Every companion goes through ID verification and a background review before joining. Your safety is our top priority.',
                },
                {
                  icon: '🔒',
                  title: 'Private & Secure',
                  desc: 'Your personal data stays private. Payments are processed securely through Stripe. No hidden fees.',
                },
                {
                  icon: '❤️',
                  title: 'Real Connections',
                  desc: 'Not a swipe app. DateRabbit is about genuine offline experiences — dinners, events, and memorable moments.',
                },
              ].map((item) => (
                <View
                  key={item.title}
                  style={{
                    flex: isDesktop ? 1 : undefined,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 20,
                    padding: 28,
                    borderWidth: 2,
                    borderColor: '#F0E6EA',
                  }}
                >
                  <Text style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '700',
                      color: '#201317',
                      marginBottom: 8,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#81656E', lineHeight: 22 }}>{item.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* FOR COMPANIONS */}
        <View
          style={{
            backgroundColor: '#E95C20',
            paddingHorizontal: 24,
            paddingVertical: 60,
          }}
        >
          <View
            style={{
              maxWidth: 700,
              alignSelf: 'center',
              width: '100%',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 32,
                fontWeight: '800',
                color: '#FFFFFF',
                textAlign: 'center',
                marginBottom: 12,
              }}
            >
              Earn on Your Terms
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: 'rgba(255,255,255,0.88)',
                textAlign: 'center',
                lineHeight: 26,
                marginBottom: 32,
              }}
            >
              Join DateRabbit as a companion and set your own schedule, rates, and boundaries.
              Connect with respectful seekers and get paid directly to your bank account.
            </Text>
            <Pressable
              onPress={() => router.push('/(auth)/welcome')}
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#C52660' : '#FFFFFF',
                paddingHorizontal: 32,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#FFFFFF',
              })}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#E95C20' }}>
                Become a Companion
              </Text>
            </Pressable>
          </View>
        </View>

        {/* FOOTER */}
        <View
          style={{
            backgroundColor: '#201317',
            paddingHorizontal: 24,
            paddingVertical: 40,
          }}
        >
          <View style={{ maxWidth: 1100, alignSelf: 'center', width: '100%' }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: '800',
                color: '#FFFFFF',
                marginBottom: 8,
              }}
            >
              DateRabbit
            </Text>
            <Text style={{ fontSize: 14, color: '#81656E', marginBottom: 20 }}>
              Safe, verified, unforgettable dates
            </Text>
            <View style={{ flexDirection: 'row', gap: 20 }}>
              <Pressable onPress={() => router.push('/legal/terms')}>
                <Text style={{ fontSize: 14, color: '#81656E' }}>Terms of Service</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/legal/privacy')}>
                <Text style={{ fontSize: 14, color: '#81656E' }}>Privacy Policy</Text>
              </Pressable>
            </View>
            <Text style={{ fontSize: 12, color: '#4A3038', marginTop: 24 }}>
              © {new Date().getFullYear()} DateRabbit. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  )
}
