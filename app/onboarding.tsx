import { useState } from 'react'
import { Pressable, Text, View, useWindowDimensions } from 'react-native'
import { useRouter, Stack } from 'expo-router'
import { colors } from '@/lib/theme'

interface Slide {
  color: string
  emoji: string
  title: string
  description: string
}

const slides: Slide[] = [
  {
    color: '#C52660',
    emoji: '💫',
    title: 'Meet Amazing People',
    description:
      'DateRabbit connects you with verified, genuine companions for memorable offline experiences. No swiping endlessly — real dates, real connections.',
  },
  {
    color: '#E95C20',
    emoji: '✅',
    title: 'Safe & Verified',
    description:
      'Every companion is ID-verified before joining. Payments are secured via Stripe. Your personal details stay private throughout the entire experience.',
  },
  {
    color: '#8B1A4A',
    emoji: '📅',
    title: 'Easy Booking',
    description:
      'Browse companion profiles, pick a time that works, and send a booking request in seconds. Get confirmation, pay securely, and enjoy your date.',
  },
]

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0)
  const router = useRouter()
  const { height } = useWindowDimensions()
  const isLast = current === slides.length - 1
  const slide = slides[current]

  function handleNext() {
    if (isLast) {
      router.replace('/(auth)/welcome')
    } else {
      setCurrent((c) => c + 1)
    }
  }

  function handleSkip() {
    router.replace('/(auth)/welcome')
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: '#FBF9FA' }}>
        {/* Slide illustration */}
        <View
          style={{
            backgroundColor: slide.color,
            height: height * 0.45,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 96, lineHeight: 112 }}>{slide.emoji}</Text>
        </View>

        {/* Content */}
        <View
          style={{
            flex: 1,
            paddingHorizontal: 32,
            paddingTop: 40,
            paddingBottom: 48,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: '800',
              color: colors.text,
              textAlign: 'center',
              marginBottom: 16,
              lineHeight: 36,
            }}
          >
            {slide.title}
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: colors.textSecondary,
              textAlign: 'center',
              lineHeight: 26,
              maxWidth: 360,
            }}
          >
            {slide.description}
          </Text>

          {/* Dot indicators */}
          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              marginTop: 32,
              marginBottom: 32,
            }}
          >
            {/* static list — no empty state */}
            {slides.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === current ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: i === current ? colors.primary : '#F0E6EA',
                }}
              />
            ))}
          </View>

          {/* Buttons */}
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#A01E50' : colors.primary,
              paddingHorizontal: 40,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              width: '100%',
              maxWidth: 360,
              marginBottom: 16,
            })}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>
              {isLast ? 'Get Started' : 'Next'}
            </Text>
          </Pressable>

          {!isLast && (
            <Pressable onPress={handleSkip}>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  fontWeight: '500',
                }}
              >
                Skip
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </>
  )
}
