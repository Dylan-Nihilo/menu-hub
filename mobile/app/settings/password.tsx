import { useState } from 'react'
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { AnimatedPressable } from '../../components/animated'

export default function PasswordSettingsScreen() {
  const router = useRouter()
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')

  const handleSave = () => {
    if (!currentPwd || !newPwd || !confirmPwd) {
      Alert.alert('提示', '请填写所有字段')
      return
    }
    if (newPwd !== confirmPwd) {
      Alert.alert('提示', '两次密码不一致')
      return
    }
    Alert.alert('提示', '功能开发中')
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <AnimatedPressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color="#0a0a0a" />
        </AnimatedPressable>
        <Text style={styles.title}>修改密码</Text>
        <AnimatedPressable onPress={handleSave}>
          <Text style={styles.saveBtn}>保存</Text>
        </AnimatedPressable>
      </View>

      <View style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>当前密码</Text>
          <TextInput
            style={styles.input}
            placeholder="请输入当前密码"
            placeholderTextColor="#a3a3a3"
            secureTextEntry
            value={currentPwd}
            onChangeText={setCurrentPwd}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>新密码</Text>
          <TextInput
            style={styles.input}
            placeholder="请输入新密码"
            placeholderTextColor="#a3a3a3"
            secureTextEntry
            value={newPwd}
            onChangeText={setNewPwd}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>确认新密码</Text>
          <TextInput
            style={styles.input}
            placeholder="请再次输入新密码"
            placeholderTextColor="#a3a3a3"
            secureTextEntry
            value={confirmPwd}
            onChangeText={setConfirmPwd}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 17, fontWeight: '600', color: '#0a0a0a' },
  saveBtn: { fontSize: 15, fontWeight: '600', color: '#0a0a0a' },
  content: { padding: 24, gap: 16 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '500', color: '#0a0a0a' },
  input: {
    height: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#0a0a0a',
  },
})
