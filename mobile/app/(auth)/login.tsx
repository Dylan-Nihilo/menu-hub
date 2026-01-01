import { useState } from 'react'
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter, Link } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { useAuthStore } from '../../stores/authStore'
import { AnimatedPressable } from '../../components/animated'

const API_BASE = 'http://192.168.88.233:3001/api'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)

  const handleLogin = async () => {
    if (!email || !password) {
      setError('请填写邮箱和密码')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '登录失败')
        return
      }
      setUser(data.user)
      router.replace('/(tabs)/home')
    } catch (err: any) {
      setError('网络错误，无法连接服务器')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 顶部返回按钮 */}
      <View style={styles.header}>
        <AnimatedPressable
          style={styles.backBtn}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
        >
          <Feather name="chevron-left" size={24} color="#0a0a0a" />
        </AnimatedPressable>
      </View>

      {/* 内容区 - 垂直居中 */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.formContainer}>
          {/* 标题 */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.titleSection}>
            <Text style={styles.title}>登录</Text>
            <Text style={styles.subtitle}>欢迎回来</Text>
          </Animated.View>

          {/* 表单 */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>邮箱</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入邮箱"
                placeholderTextColor="#a3a3a3"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>密码</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入密码"
                placeholderTextColor="#a3a3a3"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <AnimatedPressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? '登录中...' : '登录'}
              </Text>
            </AnimatedPressable>
          </Animated.View>

          {/* 底部链接 */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>还没有账号？</Text>
            <Link href="/(auth)/register" asChild>
              <AnimatedPressable>
                <Text style={styles.linkText}>注册</Text>
              </AnimatedPressable>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#0a0a0a',
  },
  subtitle: {
    fontSize: 14,
    color: '#a3a3a3',
    marginTop: 4,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0a0a0a',
  },
  input: {
    height: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#0a0a0a',
  },
  errorText: {
    fontSize: 13,
    color: '#dc2626',
    marginTop: 4,
  },
  button: {
    height: 48,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 14,
    color: '#a3a3a3',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0a0a0a',
  },
})
