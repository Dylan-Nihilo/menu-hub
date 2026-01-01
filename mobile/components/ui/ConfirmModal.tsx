import React from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native'
import { BlurView } from 'expo-blur'

interface ConfirmModalProps {
  visible: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmStyle?: 'danger' | 'primary'
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  confirmStyle = 'primary',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
              <View style={styles.buttons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onCancel}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelText}>{cancelText}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    confirmStyle === 'danger' && styles.dangerButton,
                    loading && styles.disabledButton,
                  ]}
                  onPress={onConfirm}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.confirmText, confirmStyle === 'danger' && styles.dangerText]}>
                    {loading ? '处理中...' : confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  content: {
    width: '85%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0a0a0a',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0a0a0a',
  },
  confirmButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  dangerText: {
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.6,
  },
})
