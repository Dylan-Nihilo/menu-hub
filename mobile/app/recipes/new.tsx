import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useAuthStore } from '../../stores/authStore'
import { useToast } from '../../components/ui'
import { AnimatedPressable } from '../../components/animated'

const API_BASE = 'http://192.168.88.233:3001/api'

const categories = ['家常菜', '川菜', '粤菜', '西餐', '日料', '甜点', '汤羹', '其他']
const difficulties = ['简单', '中等', '困难']

interface Ingredient { name: string; amount: string }
interface Step { content: string }

export default function NewRecipeScreen() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [prepTime, setPrepTime] = useState('')
  const [cookTime, setCookTime] = useState('')
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [steps, setSteps] = useState<Step[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const { user } = useAuthStore()
  const { showToast } = useToast()
  const router = useRouter()

  // 选择图片
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      showToast('需要相册权限才能选择图片', 'warning')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      uploadImage(result.assets[0].uri)
    }
  }

  // 上传图片
  const uploadImage = async (uri: string) => {
    setUploading(true)
    try {
      const formData = new FormData()
      const filename = uri.split('/').pop() || 'photo.jpg'
      const match = /\.(\w+)$/.exec(filename)
      const type = match ? `image/${match[1]}` : 'image/jpeg'

      formData.append('file', {
        uri,
        name: filename,
        type,
      } as unknown as Blob)

      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (!res.ok) throw new Error('上传失败')
      const data = await res.json()
      setCoverImage(data.url)
      showToast('图片上传成功', 'success')
    } catch {
      showToast('上传失败，请重试', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('请输入菜名', 'warning')
      return
    }
    setLoading(true)
    try {
      const validIngredients = ingredients.filter(i => i.name.trim())
      const validSteps = steps.filter(s => s.content.trim())
      const res = await fetch(`${API_BASE}/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coupleId: user?.coupleId,
          createdById: user?.id,
          name: name.trim(),
          coverImage: coverImage,
          category: category || null,
          difficulty: difficulty || null,
          prepTime: prepTime ? parseInt(prepTime) : null,
          cookTime: cookTime ? parseInt(cookTime) : null,
          ingredients: validIngredients.length > 0 ? JSON.stringify(validIngredients) : null,
          steps: validSteps.length > 0 ? JSON.stringify(validSteps) : null,
        }),
      })
      if (!res.ok) throw new Error()
      // 触发菜谱列表刷新
      useAuthStore.getState().triggerRecipeRefresh()
      showToast('菜谱保存成功', 'success')
      router.back()
    } catch {
      showToast('保存失败，请重试', 'error')
    } finally {
      setLoading(false)
    }
  }

  // AI 生成
  const handleAIGenerate = async () => {
    if (!name.trim()) {
      showToast('请先输入菜名', 'warning')
      return
    }
    setGenerating(true)
    try {
      const res = await fetch(`${API_BASE}/ai/recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dishName: name.trim() }),
      })
      if (!res.ok) throw new Error('生成失败')
      const data = await res.json()
      if (data.category) setCategory(data.category)
      if (data.difficulty) setDifficulty(data.difficulty)
      if (data.prepTime) setPrepTime(String(data.prepTime))
      if (data.cookTime) setCookTime(String(data.cookTime))
      if (data.ingredients) setIngredients(data.ingredients)
      if (data.steps) setSteps(data.steps)
      showToast('AI 生成完成，请检查并调整', 'success')
    } catch {
      showToast('生成失败，请重试', 'error')
    } finally {
      setGenerating(false)
    }
  }

  // 食材操作
  const addIngredient = () => setIngredients([...ingredients, { name: '', amount: '' }])
  const updateIngredient = (index: number, field: 'name' | 'amount', value: string) => {
    const updated = [...ingredients]
    updated[index][field] = value
    setIngredients(updated)
  }
  const removeIngredient = (index: number) => setIngredients(ingredients.filter((_, i) => i !== index))

  // 步骤操作
  const addStep = () => setSteps([...steps, { content: '' }])
  const updateStep = (index: number, content: string) => {
    const updated = [...steps]
    updated[index].content = content
    setSteps(updated)
  }
  const removeStep = (index: number) => setSteps(steps.filter((_, i) => i !== index))

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <AnimatedPressable onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={24} color="#0a0a0a" />
        </AnimatedPressable>
        <Text style={styles.title}>添加菜谱</Text>
        <AnimatedPressable onPress={handleSave} disabled={loading || !name.trim()}>
          {loading ? (
            <ActivityIndicator size="small" color="#0a0a0a" />
          ) : (
            <Text style={[styles.saveBtn, !name.trim() && styles.saveBtnDisabled]}>完成</Text>
          )}
        </AnimatedPressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 封面图片 */}
        <AnimatedPressable style={styles.coverContainer} onPress={pickImage} disabled={uploading}>
          {coverImage ? (
            <Image source={{ uri: `${API_BASE.replace('/api', '')}${coverImage}` }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverPlaceholder}>
              {uploading ? (
                <ActivityIndicator size="large" color="#a3a3a3" />
              ) : (
                <>
                  <Feather name="camera" size={32} color="#a3a3a3" />
                  <Text style={styles.coverText}>添加封面图片</Text>
                </>
              )}
            </View>
          )}
          {coverImage && !uploading && (
            <View style={styles.coverEditBadge}>
              <Feather name="edit-2" size={14} color="#fff" />
            </View>
          )}
        </AnimatedPressable>

        {/* 菜名 + AI生成 */}
        <View style={styles.nameRow}>
          <TextInput
            style={styles.nameInput}
            placeholder="输入菜名"
            placeholderTextColor="#a3a3a3"
            value={name}
            onChangeText={setName}
          />
          <AnimatedPressable
            style={[styles.aiBtn, (!name.trim() || generating) && styles.aiBtnDisabled]}
            onPress={handleAIGenerate}
            disabled={!name.trim() || generating}
          >
            {generating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name="cpu" size={18} color="#fff" />
            )}
          </AnimatedPressable>
        </View>

        {/* 分类选择 */}
        <Text style={styles.sectionLabel}>分类</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
          <View style={styles.tagRow}>
            {categories.map(cat => (
              <AnimatedPressable
                key={cat}
                style={[styles.tag, category === cat && styles.tagActive]}
                onPress={() => setCategory(category === cat ? '' : cat)}
              >
                <Text style={[styles.tagText, category === cat && styles.tagTextActive]}>{cat}</Text>
              </AnimatedPressable>
            ))}
          </View>
        </ScrollView>

        {/* 难度选择 */}
        <Text style={styles.sectionLabel}>难度</Text>
        <View style={styles.difficultyRow}>
          {difficulties.map(d => (
            <AnimatedPressable
              key={d}
              style={[styles.difficultyBtn, difficulty === d && styles.difficultyBtnActive]}
              onPress={() => setDifficulty(difficulty === d ? '' : d)}
            >
              <Text style={[styles.difficultyText, difficulty === d && styles.difficultyTextActive]}>{d}</Text>
            </AnimatedPressable>
          ))}
        </View>

        {/* 时间 */}
        <Text style={styles.sectionLabel}>时间</Text>
        <View style={styles.timeCard}>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>准备时间</Text>
            <TextInput
              style={styles.timeInput}
              placeholder="分钟"
              placeholderTextColor="#a3a3a3"
              keyboardType="number-pad"
              value={prepTime}
              onChangeText={setPrepTime}
            />
          </View>
          <View style={styles.timeDivider} />
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>烹饪时间</Text>
            <TextInput
              style={styles.timeInput}
              placeholder="分钟"
              placeholderTextColor="#a3a3a3"
              keyboardType="number-pad"
              value={cookTime}
              onChangeText={setCookTime}
            />
          </View>
        </View>

        {/* 食材 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>食材</Text>
          <AnimatedPressable onPress={addIngredient} style={styles.addBtn}>
            <Feather name="plus" size={16} color="#0a0a0a" />
            <Text style={styles.addBtnText}>添加</Text>
          </AnimatedPressable>
        </View>
        {ingredients.length === 0 ? (
          <AnimatedPressable style={styles.emptyCard} onPress={addIngredient}>
            <Feather name="plus" size={16} color="#a3a3a3" />
            <Text style={styles.emptyText}>添加食材</Text>
          </AnimatedPressable>
        ) : (
          <View style={styles.listCard}>
            {ingredients.map((ing, index) => (
              <View key={index} style={[styles.listItem, index < ingredients.length - 1 && styles.listItemBorder]}>
                <TextInput
                  style={styles.ingredientName}
                  placeholder="食材名称"
                  placeholderTextColor="#a3a3a3"
                  value={ing.name}
                  onChangeText={(v) => updateIngredient(index, 'name', v)}
                />
                <TextInput
                  style={styles.ingredientAmount}
                  placeholder="用量"
                  placeholderTextColor="#a3a3a3"
                  value={ing.amount}
                  onChangeText={(v) => updateIngredient(index, 'amount', v)}
                />
                <AnimatedPressable onPress={() => removeIngredient(index)}>
                  <Feather name="x" size={16} color="#a3a3a3" />
                </AnimatedPressable>
              </View>
            ))}
          </View>
        )}

        {/* 步骤 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>步骤</Text>
          <AnimatedPressable onPress={addStep} style={styles.addBtn}>
            <Feather name="plus" size={16} color="#0a0a0a" />
            <Text style={styles.addBtnText}>添加</Text>
          </AnimatedPressable>
        </View>
        {steps.length === 0 ? (
          <AnimatedPressable style={styles.emptyCard} onPress={addStep}>
            <Feather name="plus" size={16} color="#a3a3a3" />
            <Text style={styles.emptyText}>添加步骤</Text>
          </AnimatedPressable>
        ) : (
          <View style={styles.stepsContainer}>
            {steps.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stepInputWrapper}>
                  <TextInput
                    style={styles.stepInput}
                    placeholder="描述这一步..."
                    placeholderTextColor="#a3a3a3"
                    multiline
                    value={step.content}
                    onChangeText={(v) => updateStep(index, v)}
                  />
                  <AnimatedPressable style={styles.stepRemove} onPress={() => removeStep(index)}>
                    <Feather name="x" size={14} color="#a3a3a3" />
                  </AnimatedPressable>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
    height: 48,
  },
  closeBtn: { padding: 4 },
  title: { fontSize: 17, fontWeight: '600', color: '#0a0a0a' },
  saveBtn: { fontSize: 15, fontWeight: '600', color: '#0a0a0a' },
  saveBtnDisabled: { color: '#a3a3a3' },
  content: { flex: 1, padding: 24 },
  coverContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  coverText: {
    fontSize: 14,
    color: '#a3a3a3',
  },
  coverEditBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  nameInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#0a0a0a',
  },
  aiBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBtnDisabled: { backgroundColor: '#d4d4d4' },
  sectionLabel: { fontSize: 13, color: '#a3a3a3', marginBottom: 8, marginTop: 8 },
  tagScroll: { marginBottom: 16 },
  tagRow: { flexDirection: 'row', gap: 8 },
  tag: { paddingHorizontal: 16, height: 36, borderRadius: 18, backgroundColor: '#f5f5f5', justifyContent: 'center' },
  tagActive: { backgroundColor: '#0a0a0a' },
  tagText: { fontSize: 14, color: '#666' },
  tagTextActive: { color: '#fff' },
  difficultyRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  difficultyBtn: { flex: 1, height: 44, borderRadius: 12, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  difficultyBtnActive: { backgroundColor: '#0a0a0a' },
  difficultyText: { fontSize: 15, fontWeight: '500', color: '#0a0a0a' },
  difficultyTextActive: { color: '#fff' },
  timeCard: { backgroundColor: '#f5f5f5', borderRadius: 16, marginBottom: 16 },
  timeRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 50 },
  timeDivider: { height: 1, backgroundColor: '#e5e5e5', marginHorizontal: 16 },
  timeLabel: { flex: 1, fontSize: 15, color: '#0a0a0a' },
  timeInput: { width: 80, fontSize: 15, color: '#0a0a0a', textAlign: 'right' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 8 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnText: { fontSize: 13, fontWeight: '500', color: '#0a0a0a' },
  emptyCard: { height: 50, backgroundColor: '#f5f5f5', borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 },
  emptyText: { fontSize: 14, color: '#a3a3a3' },
  listCard: { backgroundColor: '#f5f5f5', borderRadius: 16, marginBottom: 16 },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 50 },
  listItemBorder: { borderBottomWidth: 1, borderBottomColor: '#e5e5e5' },
  ingredientName: { flex: 1, fontSize: 15, color: '#0a0a0a' },
  ingredientAmount: { width: 80, fontSize: 15, color: '#0a0a0a', textAlign: 'right' },
  stepsContainer: { gap: 12, marginBottom: 16 },
  stepRow: { flexDirection: 'row', gap: 12 },
  stepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  stepNumberText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  stepInputWrapper: { flex: 1, position: 'relative' },
  stepInput: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 12, paddingRight: 32, fontSize: 15, color: '#0a0a0a', minHeight: 60, textAlignVertical: 'top' },
  stepRemove: { position: 'absolute', top: 8, right: 8, padding: 4 },
})
