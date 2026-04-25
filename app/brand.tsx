import { ScrollView, Text, View, Pressable } from 'react-native'
import { useState } from 'react'
import { Stack, useRouter } from 'expo-router'
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
} from '@/components/ui'
import { colors, spacing } from '@/lib/theme'

type Swatch = {
  name: string
  hex: string
  hsl: string
  meta: string
  textColor?: string
}

const brandSwatches: Swatch[] = [
  {
    name: 'primary',
    hex: colors.primary,
    hsl: 'hsl(338, 68%, 46%)',
    meta: 'Deep rose — warmth + premium. White contrast 5.47:1',
    textColor: '#FFFFFF',
  },
  {
    name: 'accent',
    hex: colors.accent,
    hsl: 'hsl(18, 82%, 52%)',
    meta: 'Warm coral — CTAs/highlights. Analogous +40° from primary',
    textColor: '#FFFFFF',
  },
  {
    name: 'background',
    hex: colors.background,
    hsl: 'hsl(340, 20%, 98%)',
    meta: 'Near-white with rose tint',
  },
  {
    name: 'surface',
    hex: colors.surface,
    hsl: 'hsl(0, 0%, 100%)',
    meta: 'Pure white — cards/modals',
  },
  {
    name: 'text',
    hex: colors.text,
    hsl: 'hsl(340, 25%, 10%)',
    meta: 'Near-black with rose tint. 16:1 on background',
    textColor: '#FFFFFF',
  },
  {
    name: 'textSecondary',
    hex: colors.textSecondary,
    hsl: 'hsl(340, 12%, 45%)',
    meta: 'Muted rose-gray. 4.72:1 on background',
    textColor: '#FFFFFF',
  },
]

const semanticSwatches: Swatch[] = [
  { name: 'error', hex: colors.error, hsl: 'hsl(0, 74%, 51%)', meta: 'Red 600', textColor: '#FFFFFF' },
  { name: 'success', hex: colors.success, hsl: 'hsl(160, 93%, 30%)', meta: 'Emerald 600', textColor: '#FFFFFF' },
  { name: 'warning', hex: colors.warning, hsl: 'hsl(30, 94%, 44%)', meta: 'Amber 600', textColor: '#FFFFFF' },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-10">
      <Text className="text-2xl font-bold text-[#201317] mb-4">{title}</Text>
      {children}
    </View>
  )
}

function ColorSwatch({ swatch }: { swatch: Swatch }) {
  return (
    <View className="mb-3" style={{ width: '100%' }}>
      <View
        style={{
          backgroundColor: swatch.hex,
          borderRadius: 12,
          padding: 16,
          borderWidth: swatch.hex === '#FFFFFF' || swatch.hex === '#FBF9FA' ? 1 : 0,
          borderColor: '#F0E6EA',
        }}
      >
        <Text style={{ color: swatch.textColor ?? colors.text, fontSize: 14, fontWeight: '700' }}>
          {swatch.name}
        </Text>
        <Text style={{ color: swatch.textColor ?? colors.text, fontSize: 12, marginTop: 2 }}>
          {swatch.hex} · {swatch.hsl}
        </Text>
      </View>
      <Text className="text-xs text-[#81656E] mt-1.5">{swatch.meta}</Text>
    </View>
  )
}

export default function BrandPage() {
  const [inputValue, setInputValue] = useState('')
  const router = useRouter()

  return (
    <>
      <Stack.Screen options={{ title: 'Brand', headerLeft: () => (
        <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
          <Text style={{ color: '#C52660', fontWeight: '600' }}>← Back</Text>
        </Pressable>
      )}} />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ padding: 24, paddingBottom: 80, maxWidth: 720, alignSelf: 'center', width: '100%' }}
      >
        <View className="mb-8">
          <Text className="text-4xl font-extrabold text-[#201317] leading-[48px]">
            DateRabbit Brand
          </Text>
          <Text className="text-base text-[#81656E] mt-2">
            Warm. Premium. Trustworthy. · Analogous rose + coral harmony
          </Text>
        </View>

        <Section title="Palette — Brand">
          {brandSwatches.map((s) => (
            <ColorSwatch key={s.name} swatch={s} />
          ))}
        </Section>

        <Section title="Palette — Semantic">
          {semanticSwatches.map((s) => (
            <ColorSwatch key={s.name} swatch={s} />
          ))}
        </Section>

        <Section title="Typography — Plus Jakarta Sans">
          <View className="gap-3">
            <Text className="text-4xl font-extrabold text-[#201317] leading-[48px]">Display 40/48</Text>
            <Text className="text-3xl font-bold text-[#201317] leading-10">Title 30/40</Text>
            <Text className="text-2xl font-bold text-[#201317] leading-8">Heading 24/32</Text>
            <Text className="text-lg font-semibold text-[#201317] leading-7">Subtitle 18/28</Text>
            <Text className="text-base text-[#201317] leading-6">
              Body 16/24 — главный размер текста в приложении. Минимум для читаемости на mobile.
            </Text>
            <Text className="text-sm text-[#81656E] leading-5">Body small 14/20 — secondary info</Text>
            <Text className="text-xs text-[#81656E] leading-4">CAPTION 12/16 — METADATA</Text>
          </View>
        </Section>

        <Section title="Spacing">
          <View className="gap-2">
            {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((key) => (
              <View key={key} className="flex-row items-center">
                <Text className="text-sm font-semibold text-[#201317] w-10">{key}</Text>
                <View style={{ width: spacing[key], height: 16, backgroundColor: colors.primary, borderRadius: 4 }} />
                <Text className="text-xs text-[#81656E] ml-3">{spacing[key]}px</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Buttons">
          <View className="gap-3">
            <Button label="Primary" onPress={() => {}} variant="primary" />
            <Button label="Secondary" onPress={() => {}} variant="secondary" />
            <Button label="Ghost" onPress={() => {}} variant="ghost" />
            <Button label="Loading..." onPress={() => {}} loading />
            <Button label="Disabled" onPress={() => {}} disabled />
            <View className="flex-row gap-3">
              <Button label="Small" onPress={() => {}} size="sm" />
              <Button label="Medium" onPress={() => {}} size="md" />
              <Button label="Large" onPress={() => {}} size="lg" />
            </View>
          </View>
        </Section>

        <Section title="Inputs">
          <View className="gap-3">
            <Input
              label="Email"
              placeholder="you@daterabbit.com"
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="email-address"
            />
            <Input
              label="Password"
              placeholder="••••••••"
              secureTextEntry
            />
            <Input
              label="Error state"
              placeholder="Invalid input"
              error="Это поле обязательно"
            />
            <Input
              label="Disabled"
              placeholder="Cannot edit"
              disabled
              value="read-only"
            />
          </View>
        </Section>

        <Section title="Cards">
          <View className="gap-3">
            <Card variant="default">
              <Text className="font-semibold text-[#201317]">Default card</Text>
              <Text className="text-sm text-[#81656E] mt-1">White surface, no border</Text>
            </Card>
            <Card variant="outlined">
              <Text className="font-semibold text-[#201317]">Outlined card</Text>
              <Text className="text-sm text-[#81656E] mt-1">With border — good for lists</Text>
            </Card>
            <Card variant="elevated">
              <Text className="font-semibold text-[#201317]">Elevated card</Text>
              <Text className="text-sm text-[#81656E] mt-1">Shadow — modal/sheet context</Text>
            </Card>
          </View>
        </Section>

        <Section title="Avatars">
          <View className="flex-row items-end gap-3">
            <Avatar name="Sergei Demo" size="sm" />
            <Avatar name="Anna Companion" size="md" />
            <Avatar name="Mike Seeker" size="lg" />
            <Avatar name="Admin User" size="xl" />
          </View>
          <View className="flex-row items-end gap-3 mt-4">
            <Avatar uri="https://i.pravatar.cc/100?img=5" size="md" />
            <Avatar uri="https://i.pravatar.cc/100?img=12" size="lg" />
            <Avatar uri="https://i.pravatar.cc/100?img=32" size="xl" />
          </View>
        </Section>

        <Section title="Badges">
          <View className="flex-row flex-wrap gap-2">
            <Badge label="Neutral" variant="neutral" />
            <Badge label="Primary" variant="primary" />
            <Badge label="Verified" variant="success" />
            <Badge label="Pending" variant="warning" />
            <Badge label="Rejected" variant="error" />
          </View>
        </Section>

        <Section title="States">
          <Card variant="outlined">
            <EmptyState
              title="No bookings yet"
              message="Найди companion и забронируй первое свидание."
              actionLabel="Начать поиск"
              onAction={() => {}}
            />
          </Card>
          <View className="h-3" />
          <Card variant="outlined">
            <ErrorState onRetry={() => {}} />
          </Card>
          <View className="h-3" />
          <Card variant="outlined">
            <LoadingState message="Загружаем профили..." />
          </Card>
        </Section>
      </ScrollView>
    </>
  )
}
