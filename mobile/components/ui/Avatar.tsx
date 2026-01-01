import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../../constants'

interface AvatarProps {
  name: string
  size?: number
}

export function Avatar({ name, size = 40 }: AvatarProps) {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.text, { fontSize: size * 0.4 }]}>{name?.[0] || '?'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontWeight: '600', color: colors.background },
})
