import { useState } from 'react'
import { Text, TextInput, View } from 'react-native'
import type { ReactNode } from 'react'
import { colors } from '@/lib/theme'

interface InputProps {
  label?: string
  placeholder?: string
  value?: string
  onChangeText?: (text: string) => void
  error?: string
  secureTextEntry?: boolean
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad'
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  icon?: ReactNode
  disabled?: boolean
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  icon,
  disabled = false,
}: InputProps) {
  const [focused, setFocused] = useState(false)

  const borderColor = error
    ? colors.error
    : focused
      ? colors.primary
      : '#E6D5DC'

  return (
    <View className="w-full">
      {label && (
        <Text className="text-sm font-semibold text-[#201317] mb-2">{label}</Text>
      )}
      <View
        style={{
          borderColor,
          borderWidth: 1,
          borderRadius: 12,
          backgroundColor: disabled ? '#F5EEF0' : '#FFFFFF',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          height: 48,
        }}
      >
        {icon && <View style={{ marginRight: 10 }}>{icon}</View>}
        <TextInput
          style={{
            flex: 1,
            fontSize: 16,
            color: colors.text,
            height: '100%',
          }}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
      {error && (
        <Text className="text-xs text-[#DC2626] mt-1.5">{error}</Text>
      )}
    </View>
  )
}
