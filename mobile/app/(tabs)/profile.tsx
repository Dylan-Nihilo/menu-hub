import { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore'
import { useToast, ConfirmModal } from '../../components/ui'
import { AnimatedPressable } from '../../components/animated'

const API_BASE = 'http://192.168.88.233:3001/api'

export default function ProfileScreen() {
  const { user, setUser } = useAuthStore()
  const router = useRouter()
  const { showToast } = useToast()
  const [stats, setStats] = useState({ menuCount: 0, recipeCount: 0, daysUsed: 0 })
  const [partner, setPartner] = useState<{ nickname: string } | null>(null)
  const [pairCode, setPairCode] = useState<string | null>(null)
  const [daysTogether, setDaysTogether] = useState(0)
  const [preferences, setPreferences] = useState<string[]>([])
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false)
  const [unlinking, setUnlinking] = useState(false)

  // 可选的偏好标签
  const preferenceOptions = ['辣', '清淡', '肉食', '海鲜', '素食', '甜食']

  const loadStats = useCallback(async () => {
    if (!user?.coupleId) return
    try {
      const recipeRes = await fetch(`${API_BASE}/recipes?coupleId=${user.coupleId}`)
      const recipes = await recipeRes.json()
      setStats({
        menuCount: 0,
        recipeCount: Array.isArray(recipes) ? recipes.length : 0,
        daysUsed: 1
      })
    } catch {}
  }, [user?.coupleId])

  const loadCoupleInfo = useCallback(async () => {
    if (!user?.coupleId) return
    try {
      const res = await fetch(`${API_BASE}/couple/${user.coupleId}`)
      if (res.ok) {
        const data = await res.json()
        const partnerUser = data.users?.find((u: { id: string }) => u.id !== user.id)
        if (partnerUser) setPartner({ nickname: partnerUser.nickname })
        if (data.pairCode || data.inviteCode) {
          setPairCode(data.pairCode || data.inviteCode)
        }
        // 计算在一起的天数
        if (data.createdAt) {
          const days = Math.floor((Date.now() - new Date(data.createdAt).getTime()) / (1000 * 60 * 60 * 24)) + 1
          setDaysTogether(days)
        }
      }
    } catch {}
  }, [user?.coupleId, user?.id])

  useEffect(() => {
    loadStats()
    loadCoupleInfo()
  }, [loadStats, loadCoupleInfo])

  const handleLogout = () => {
    setShowLogoutConfirm(false)
    setUser(null)
    router.replace('/(auth)/login')
  }

  // 切换偏好标签
  const togglePreference = (pref: string) => {
    setPreferences(prev =>
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    )
  }

  // 解除配对
  const handleUnlink = async () => {
    setUnlinking(true)
    try {
      const res = await fetch(`${API_BASE}/couple/${user?.coupleId}`, { method: 'DELETE' })
      if (res.ok) {
        setUser({ ...user!, coupleId: null })
        setPartner(null)
        setPairCode(null)
        showToast('已解除配对', 'success')
      } else {
        showToast('解除配对失败，请重试', 'error')
      }
    } catch {
      showToast('网络错误，请重试', 'error')
    } finally {
      setUnlinking(false)
      setShowUnlinkConfirm(false)
    }
  }

  const initials = user?.nickname?.slice(0, 2) || '?'
  const partnerInitials = partner?.nickname?.slice(0, 2) || '?'

  const menuItems = [
    { icon: 'user' as const, label: '个人资料', route: '/settings/profile' },
    { icon: 'lock' as const, label: '修改密码', route: '/settings/password' },
    { icon: 'heart' as const, label: '情侣设置', route: '/settings/couple' },
  ]

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 标题 */}
        <View style={styles.header}>
          <Text style={styles.title}>我的</Text>
        </View>

        {/* 配对状态卡片 - 对齐 Web 版 */}
        <View style={styles.coupleCard}>
          {user?.coupleId && partner ? (
            <View style={styles.pairedContent}>
              <View style={styles.avatarsRow}>
                <View style={styles.avatarsContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                  <View style={[styles.avatar, styles.partnerAvatar]}>
                    <Text style={styles.avatarText}>{partnerInitials}</Text>
                  </View>
                </View>
                <View style={styles.coupleInfo}>
                  <Text style={styles.coupleNames}>{user?.nickname} & {partner.nickname}</Text>
                  <Text style={styles.coupleStatus}>已配对</Text>
                </View>
                {/* 在一起天数 - 对齐 Web 版 */}
                <View style={styles.daysContainer}>
                  <Text style={styles.daysNumber}>{daysTogether}</Text>
                  <Text style={styles.daysLabel}>天</Text>
                </View>
              </View>
              {/* 配对码 */}
              {pairCode && (
                <View style={styles.pairCodeRow}>
                  <Text style={styles.pairCodeLabel}>配对码</Text>
                  <Text style={styles.pairCodeValue}>{pairCode}</Text>
                </View>
              )}
              {/* 解绑按钮 */}
              <TouchableOpacity style={styles.unlinkBtn} onPress={() => setShowUnlinkConfirm(true)}>
                <Feather name="link-2" size={14} color="#ef4444" />
                <Text style={styles.unlinkBtnText}>解除配对</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.unpairedContent}>
              <View style={styles.singleAvatar}>
                <Text style={styles.singleAvatarText}>{initials}</Text>
              </View>
              <Text style={styles.userName}>{user?.nickname || '未登录'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.pairButtons}>
                <TouchableOpacity
                  style={styles.pairBtn}
                  onPress={() => router.push('/pair/create')}
                >
                  <Text style={styles.pairBtnText}>创建配对</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.joinBtn}
                  onPress={() => router.push('/pair/join')}
                >
                  <Text style={styles.joinBtnText}>加入配对</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* 统计数据 */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Feather name="book-open" size={24} color="#666" />
            <Text style={styles.statNumber}>{stats.recipeCount}</Text>
            <Text style={styles.statLabel}>菜谱数量</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="calendar" size={24} color="#666" />
            <Text style={styles.statNumber}>{stats.daysUsed}</Text>
            <Text style={styles.statLabel}>使用天数</Text>
          </View>
        </View>

        {/* 口味偏好 - 对齐 Web 版 */}
        <View style={styles.preferencesSection}>
          <Text style={styles.sectionTitle}>口味偏好</Text>
          <View style={styles.preferenceTags}>
            {preferenceOptions.map(pref => (
              <AnimatedPressable
                key={pref}
                style={[
                  styles.preferenceTag,
                  preferences.includes(pref) && styles.preferenceTagActive,
                ]}
                onPress={() => togglePreference(pref)}
              >
                <Text style={[styles.preferenceText, preferences.includes(pref) && styles.preferenceTextActive]}>
                  {pref}
                </Text>
              </AnimatedPressable>
            ))}
          </View>
        </View>

        {/* 菜单列表 - 对齐 Web 版 */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <AnimatedPressable
              key={item.label}
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.menuIcon}>
                <Feather name={item.icon} size={20} color="#666" />
              </View>
              <Text style={styles.menuText}>{item.label}</Text>
              <Feather name="chevron-right" size={20} color="#a3a3a3" />
            </AnimatedPressable>
          ))}
        </View>

        {/* 退出登录 */}
        <TouchableOpacity style={styles.logoutBtn} onPress={() => setShowLogoutConfirm(true)}>
          <Feather name="log-out" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>

        {/* 版本信息 */}
        <Text style={styles.version}>Menu Hub v1.0.0</Text>
      </ScrollView>

      {/* 退出确认弹窗 */}
      <ConfirmModal
        visible={showLogoutConfirm}
        title="退出登录"
        message="确定要退出登录吗？"
        confirmText="退出"
        cancelText="取消"
        confirmStyle="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      {/* 解除配对确认弹窗 */}
      <ConfirmModal
        visible={showUnlinkConfirm}
        title="解除配对"
        message="确定要解除与 TA 的配对吗？解除后需要重新配对。"
        confirmText="解除"
        cancelText="取消"
        confirmStyle="danger"
        onConfirm={handleUnlink}
        onCancel={() => setShowUnlinkConfirm(false)}
        loading={unlinking}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#0a0a0a',
  },
  coupleCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 16,
  },
  pairedContent: {},
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarsContainer: {
    flexDirection: 'row',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerAvatar: {
    backgroundColor: '#666',
    marginLeft: -16,
    borderWidth: 2,
    borderColor: '#f5f5f5',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  coupleInfo: {
    marginLeft: 12,
  },
  coupleNames: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0a0a0a',
  },
  coupleStatus: {
    fontSize: 12,
    color: '#a3a3a3',
  },
  daysContainer: {
    alignItems: 'flex-end',
  },
  daysNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0a0a0a',
  },
  daysLabel: {
    fontSize: 12,
    color: '#a3a3a3',
  },
  pairCodeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  pairCodeLabel: {
    fontSize: 13,
    color: '#666',
  },
  pairCodeValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0a0a0a',
    letterSpacing: 1,
  },
  unlinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  unlinkBtnText: {
    fontSize: 13,
    color: '#ef4444',
  },
  unpairedContent: {
    alignItems: 'center',
  },
  singleAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0a0a0a',
    marginTop: 12,
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
  },
  pairButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  pairBtn: {
    flex: 1,
    height: 40,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pairBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  joinBtn: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0a0a0a',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  preferencesSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    marginBottom: 12,
  },
  preferenceTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preferenceTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  preferenceTagActive: {
    backgroundColor: '#0a0a0a',
  },
  preferenceTagPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  preferenceText: {
    fontSize: 14,
    color: '#666',
  },
  preferenceTextActive: {
    color: '#fff',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0a0a0a',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  menuSection: {
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#0a0a0a',
    marginLeft: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    height: 48,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ef4444',
  },
  version: {
    fontSize: 12,
    color: '#a3a3a3',
    textAlign: 'center',
    marginBottom: 32,
  },
})