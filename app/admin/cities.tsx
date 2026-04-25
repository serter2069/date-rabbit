import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Switch,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native'
import { useAuth } from '@/contexts/AuthContext'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3500'

interface City {
  id: string
  name: string
  country: string
  isActive: boolean
}

function CityRow({
  item,
  token,
  onToggle,
}: {
  item: City
  token: string | null
  onToggle: (id: string, isActive: boolean) => void
}) {
  const [toggling, setToggling] = useState(false)

  async function toggle(value: boolean) {
    try {
      setToggling(true)
      const res = await fetch(`${API_URL}/api/admin/cities/${item.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: value }),
      })
      if (res.ok) onToggle(item.id, value)
    } catch (err) {
      console.error(err)
    } finally {
      setToggling(false)
    }
  }

  return (
    <View className="bg-white border-b border-[#F0E6EA] px-4 py-3 flex-row items-center">
      <View className="flex-1">
        <Text className="text-sm font-semibold text-[#201317]">{item.name}</Text>
        <Text className="text-xs text-[#81656E]">{item.country}</Text>
      </View>
      {toggling ? (
        <ActivityIndicator color="#C52660" size="small" />
      ) : (
        <Switch
          value={item.isActive}
          onValueChange={toggle}
          trackColor={{ false: '#F5EEF0', true: '#C52660' }}
          thumbColor="#FFFFFF"
        />
      )}
    </View>
  )
}

export default function AdminCities() {
  const { width } = useWindowDimensions()
  const { token } = useAuth()
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add city form
  const [newName, setNewName] = useState('')
  const [newCountry, setNewCountry] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  useEffect(() => {
    fetchCities()
  }, [])

  async function fetchCities() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${API_URL}/api/admin/cities`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setCities(data.cities)
    } catch (err) {
      setError('Failed to load cities')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function addCity() {
    const name = newName.trim()
    const country = newCountry.trim()
    if (!name || !country) {
      setAddError('Name and country are required')
      return
    }
    try {
      setAdding(true)
      setAddError(null)
      const res = await fetch(`${API_URL}/api/admin/cities`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, country }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }
      const data = await res.json()
      setCities((prev) => [...prev, data.city].sort((a, b) => a.name.localeCompare(b.name)))
      setNewName('')
      setNewCountry('')
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add city')
    } finally {
      setAdding(false)
    }
  }

  function handleToggle(id: string, isActive: boolean) {
    setCities((prev) => prev.map((c) => (c.id === id ? { ...c, isActive } : c)))
  }

  return (
    <View className="flex-1 bg-[#FBF9FA]">
      {/* Add city form */}
      <View className="bg-white px-4 pt-3 pb-4 border-b border-[#F0E6EA]">
        <Text className="text-sm font-semibold text-[#201317] mb-2">Add City</Text>
        <View className="flex-row gap-2 mb-2">
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="City name"
            placeholderTextColor="#81656E"
            className="flex-1 bg-[#FBF9FA] border border-[#F0E6EA] rounded-xl px-3 py-2.5 text-sm text-[#201317]"
          />
          <TextInput
            value={newCountry}
            onChangeText={setNewCountry}
            placeholder="Country"
            placeholderTextColor="#81656E"
            className="w-28 bg-[#FBF9FA] border border-[#F0E6EA] rounded-xl px-3 py-2.5 text-sm text-[#201317]"
          />
        </View>
        {addError && (
          <Text className="text-xs text-[#DC2626] mb-2">{addError}</Text>
        )}
        <Pressable
          onPress={addCity}
          disabled={adding}
          className="bg-[#C52660] rounded-xl py-2.5 items-center active:opacity-80"
        >
          {adding ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-white text-sm font-semibold">Save City</Text>
          )}
        </Pressable>
      </View>

      {error && (
        <View className="mx-4 mt-3 bg-[#FEE2E2] rounded-xl p-3">
          <Text className="text-[#DC2626] text-sm">{error}</Text>
        </View>
      )}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#C52660" />
        </View>
      ) : cities.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-[#81656E]">No cities yet</Text>
        </View>
      ) : (
        <FlatList
          data={cities}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => (
            <CityRow item={item} token={token} onToggle={handleToggle} />
          )}
        />
      )}
    </View>
  )
}
