<template>
  <div
    class="file-select"
    :title="filename || src || '选择文件'"
    @click="inputRef?.click()"
  >
    {{ title }}
    <input
      class="file-select__input"
      type="file"
      @input="onInput"
      ref="inputRef"
      :key="inputKey"
    />
  </div>

  <div class="file-select__dropbox" v-show="dragging">
    <h1>将文件拖拽到此处更换视频源</h1>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  inheritAttrs: false,
})
</script>

<script lang="ts" setup>
import { store } from '@/store'

const emit = defineEmits<{
  (e: 'update:src', src: string): void
  (e: 'update:filename', src: string): void
}>()

const file = ref<File>()
const filename = computed(() => file.value?.name || '')
const src = computed(() => (file.value ? URL.createObjectURL(file.value) : ''))
watch(src, (src) => emit('update:src', src))
watch(filename, (filename) => emit('update:filename', filename))

const title = computed(() => {
  const name = filename.value || src.value
  if (!name) return '选择文件'
  if (name.length < 60) return name
  return `${name.slice(0, 30)} ... ${name.slice(-20)}`
})

/* 点击选择文件 */
const inputRef = ref<HTMLInputElement>()
const inputKey = ref(0)
function onInput(e: Event) {
  const _file = (e.target as any)?.files?.[0]
  file.value = _file
  inputKey.value += 1

  store.tryPlay()
}

/* 拖拽文件 */
const dragging = ref(false)
function onDragEnter(e: DragEvent) {
  if (e.dataTransfer?.types.includes('Files')) {
    dragging.value = true
  }
}
function onDragLeave(e: DragEvent) {
  dragging.value = false
}
function onDragOver(e: DragEvent) {
  if (e.dataTransfer?.types.includes('Files')) {
    dragging.value = true
    e.preventDefault()
  }
}
function onDragDrop(e: DragEvent) {
  dragging.value = false
  if (!e.dataTransfer?.types.includes('Files')) return
  e.preventDefault()

  const _file = e.dataTransfer?.files?.[0]
  file.value = _file

  store.tryPlay()
}

onMounted(() => {
  addEventListener('dragenter', onDragEnter)
  addEventListener('dragleave', onDragLeave)
  addEventListener('dragover', onDragOver)
  addEventListener('drop', onDragDrop)
})
onUnmounted(() => {
  removeEventListener('dragenter', onDragEnter)
  removeEventListener('dragleave', onDragLeave)
  removeEventListener('dragover', onDragOver)
  removeEventListener('drop', onDragDrop)
})
</script>

<style lang="less" scoped>
.file-select {
  color: white;
  font-size: 16px;

  padding: 10px 10px;
  box-sizing: border-box;
  text-align: center;
  word-break: break-all;
  word-wrap: break-word;

  cursor: pointer;
  user-select: none;

  background-image: linear-gradient(
    135deg,
    rgba(#56c4a1, 1),
    rgba(hsl(220, 13%, 38%), 1)
  );

  &:hover {
    opacity: 0.9;
  }
  &:active {
    opacity: 0.7;
  }

  .file-select__input {
    display: none;
  }
}

.file-select__dropbox {
  position: fixed;
  top: 30px;
  bottom: 30px;
  left: 30px;
  right: 30px;
  padding: 20px;
  z-index: 9999999;

  color: white;
  background: linear-gradient(rgba(black, 0.5), rgba(hsl(220, 13%, 48%), 0.5));
  border: 5px dashed white;
  user-select: none;
  pointer-events: none !important;

  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
</style>
