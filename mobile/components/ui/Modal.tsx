import { Modal as RNModal, View, StyleSheet, TouchableOpacity, Text } from 'react-native'
import { colors, borderRadius, spacing, typography } from '../../constants'

interface ModalProps {
  visible: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.content} onStartShouldSetResponder={() => true}>
          {title && <Text style={styles.title}>{title}</Text>}
          {children}
        </View>
      </TouchableOpacity>
    </RNModal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  content: {
    backgroundColor: colors.background,
    borderRadius: borderRadius['2xl'],
    padding: spacing['2xl'],
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
})
