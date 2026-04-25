import { useCallback, useEffect, useState } from 'react'
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { colors } from '@/lib/theme'
import { Button, Card, ErrorState, LoadingState } from '@/components/ui'

interface BookingDay {
  date: string // 'YYYY-MM-DD'
  count: number
}

interface DayAvailability {
  enabled: boolean
  startHour: number
  endHour: number
}

type WeekAvailability = Record<string, DayAvailability>

interface DayBooking {
  id: string
  seekerName: string
  time: string
  duration: number
  location: string
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DEFAULT_AVAILABILITY: WeekAvailability = {
  Sun: { enabled: false, startHour: 10, endHour: 22 },
  Mon: { enabled: true,  startHour: 10, endHour: 22 },
  Tue: { enabled: true,  startHour: 10, endHour: 22 },
  Wed: { enabled: true,  startHour: 10, endHour: 22 },
  Thu: { enabled: true,  startHour: 10, endHour: 22 },
  Fri: { enabled: true,  startHour: 10, endHour: 22 },
  Sat: { enabled: false, startHour: 10, endHour: 22 },
}

function pad(n: number): string { return n.toString().padStart(2, '0') }

function toDateKey(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export default function CalendarScreen() {
  const insets = useSafeAreaInsets()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [bookedDays, setBookedDays] = useState<BookingDay[]>([])
  const [availability, setAvailability] = useState<WeekAvailability>(DEFAULT_AVAILABILITY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [dayBookings, setDayBookings] = useState<DayBooking[]>([])
  const [dayLoading, setDayLoading] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [bookingsRes, profileRes] = await Promise.all([
        fetch('/api/bookings?filter=all'),
        fetch('/api/companion/profile'),
      ])
      if (bookingsRes.ok) {
        const json = await bookingsRes.json()
        // group by date
        const byDay: Record<string, number> = {}
        for (const b of (json.bookings ?? json ?? [])) {
          const key = (b.date as string).slice(0, 10)
          byDay[key] = (byDay[key] ?? 0) + 1
        }
        setBookedDays(Object.entries(byDay).map(([date, count]) => ({ date, count })))
      }
      if (profileRes.ok) {
        const profile = await profileRes.json()
        if (profile.availability) {
          setAvailability({ ...DEFAULT_AVAILABILITY, ...profile.availability })
        }
      }
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    await fetchData()
    setLoading(false)
  }, [fetchData])

  useEffect(() => { load() }, [load])

  const saveAvailability = async () => {
    setSaving(true)
    try {
      await fetch('/api/companion/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability }),
      })
    } finally {
      setSaving(false)
    }
  }

  const openDay = async (key: string) => {
    setSelectedDay(key)
    setDayLoading(true)
    setDayBookings([])
    try {
      const res = await fetch(`/api/bookings?filter=all&date=${key}`)
      if (res.ok) {
        const json = await res.json()
        setDayBookings(json.bookings ?? json ?? [])
      }
    } finally {
      setDayLoading(false)
    }
  }

  const bookedSet = new Set(bookedDays.map(b => b.date))
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfWeek(year, month)
  const today = toDateKey(now.getFullYear(), now.getMonth(), now.getDate())

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <LoadingState message="Loading calendar..." />
      </View>
    )
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <ErrorState message={error} onRetry={load} />
      </View>
    )
  }

  // Build grid cells
  const cells: Array<{ day: number | null; key: string | null }> = []
  for (let i = 0; i < firstDay; i++) cells.push({ day: null, key: null })
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, key: toDateKey(year, month, d) })
  while (cells.length % 7 !== 0) cells.push({ day: null, key: null })

  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 80 }}
    >
      <View className="max-w-4xl w-full mx-auto px-4">
        <Text className="text-2xl font-bold text-[#201317] py-4">Calendar</Text>

        {/* Month navigator */}
        <Card variant="default" padding="md">
          <View className="flex-row items-center justify-between mb-4">
            <Pressable onPress={prevMonth} accessibilityLabel="Previous month" className="p-2">
              <FontAwesome name="chevron-left" size={16} color={colors.text} />
            </Pressable>
            <Text className="text-base font-bold text-[#201317]">{monthLabel}</Text>
            <Pressable onPress={nextMonth} accessibilityLabel="Next month" className="p-2">
              <FontAwesome name="chevron-right" size={16} color={colors.text} />
            </Pressable>
          </View>

          {/* Day-of-week headers */}
          <View className="flex-row mb-1">
            {DAYS_OF_WEEK.map(d => (
              <View key={d} className="flex-1 items-center">
                <Text className="text-xs font-semibold text-[#81656E]">{d}</Text>
              </View>
            ))}
          </View>

          {/* Grid */}
          {Array.from({ length: cells.length / 7 }).map((_, rowIdx) => (
            <View key={rowIdx} className="flex-row mb-1">
              {cells.slice(rowIdx * 7, rowIdx * 7 + 7).map((cell, colIdx) => {
                if (!cell.day || !cell.key) {
                  return <View key={colIdx} className="flex-1 aspect-square" />
                }
                const isToday = cell.key === today
                const hasBooking = bookedSet.has(cell.key)
                return (
                  <Pressable
                    key={cell.key}
                    onPress={() => openDay(cell.key!)}
                    accessibilityLabel={`Day ${cell.day}${hasBooking ? ', has bookings' : ''}`}
                    className="flex-1 aspect-square items-center justify-center m-0.5 rounded-xl"
                    style={{
                      backgroundColor: hasBooking ? colors.primary : isToday ? '#F5DDE5' : 'transparent',
                    }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: hasBooking ? '#fff' : isToday ? colors.primary : colors.text }}
                    >
                      {cell.day}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          ))}
        </Card>

        {/* Weekly availability */}
        <View className="mt-5 mb-2">
          <Text className="text-lg font-bold text-[#201317] mb-3">Weekly Availability</Text>
          <Card variant="outlined" padding="md">
            {DAYS_OF_WEEK.map(day => {
              const avail = availability[day] ?? DEFAULT_AVAILABILITY[day]
              return (
                <View key={day} className="flex-row items-center py-2 border-b border-[#F0E6EA]">
                  <View style={{ width: 36 }}>
                    <Text className="text-sm font-semibold text-[#201317]">{day}</Text>
                  </View>
                  <Switch
                    value={avail.enabled}
                    onValueChange={v => setAvailability(prev => ({
                      ...prev,
                      [day]: { ...prev[day], enabled: v },
                    }))}
                    trackColor={{ false: colors.textSecondary, true: colors.primary }}
                    thumbColor="#fff"
                    accessibilityLabel={`${day} availability toggle`}
                  />
                  {avail.enabled && (
                    <View className="flex-row items-center ml-3" style={{ gap: 8 }}>
                      <Text className="text-xs text-[#81656E]">From</Text>
                      <TextInput
                        value={String(avail.startHour)}
                        onChangeText={v => {
                          const n = parseInt(v, 10)
                          if (!isNaN(n) && n >= 0 && n <= 23) {
                            setAvailability(prev => ({ ...prev, [day]: { ...prev[day], startHour: n } }))
                          }
                        }}
                        keyboardType="numeric"
                        style={{
                          width: 36,
                          height: 32,
                          borderWidth: 1,
                          borderColor: '#F0E6EA',
                          borderRadius: 8,
                          textAlign: 'center',
                          color: colors.text,
                          fontSize: 13,
                        }}
                        maxLength={2}
                        accessibilityLabel={`${day} start hour`}
                      />
                      <Text className="text-xs text-[#81656E]">To</Text>
                      <TextInput
                        value={String(avail.endHour)}
                        onChangeText={v => {
                          const n = parseInt(v, 10)
                          if (!isNaN(n) && n >= 0 && n <= 24) {
                            setAvailability(prev => ({ ...prev, [day]: { ...prev[day], endHour: n } }))
                          }
                        }}
                        keyboardType="numeric"
                        style={{
                          width: 36,
                          height: 32,
                          borderWidth: 1,
                          borderColor: '#F0E6EA',
                          borderRadius: 8,
                          textAlign: 'center',
                          color: colors.text,
                          fontSize: 13,
                        }}
                        maxLength={2}
                        accessibilityLabel={`${day} end hour`}
                      />
                    </View>
                  )}
                </View>
              )
            })}
            <View className="mt-4">
              <Button
                label={saving ? 'Saving...' : 'Save Availability'}
                variant="primary"
                size="md"
                loading={saving}
                onPress={saveAvailability}
                fullWidth
              />
            </View>
          </Card>
        </View>
      </View>

      {/* Day detail modal */}
      <Modal
        visible={selectedDay !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedDay(null)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
          onPress={() => setSelectedDay(null)}
        >
          <Pressable
            style={{ backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: insets.bottom + 24 }}
            onPress={e => e.stopPropagation()}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-[#201317]">{selectedDay}</Text>
              <Pressable onPress={() => setSelectedDay(null)} accessibilityLabel="Close">
                <FontAwesome name="times" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
            {dayLoading ? (
              <LoadingState size="small" />
            ) : dayBookings.length === 0 ? (
              <Text className="text-base text-[#81656E] text-center py-4">No bookings on this day.</Text>
            ) : (
              dayBookings.map(b => (
                <View key={b.id} className="flex-row items-center py-2 border-b border-[#F0E6EA]">
                  <FontAwesome name="calendar-check-o" size={16} color={colors.primary} />
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-semibold text-[#201317]">{b.seekerName}</Text>
                    <Text className="text-xs text-[#81656E]">{b.time} · {b.duration}h · {b.location}</Text>
                  </View>
                </View>
              ))
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  )
}
