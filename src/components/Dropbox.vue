<template>
  <div class="dropbox" v-show="dragging">
    <h1 class="dropbox__tips">将文件拖拽到此处</h1>
  </div>
</template>

<script lang="ts" setup>
const emit = defineEmits<{
  (event: 'drop', file: File): void
}>()

/* 拖拽文件 */
const dragging = ref(false)
function onDragEnter(e: DragEvent) {
  if (e.dataTransfer?.types.includes('Files')) {
    dragging.value = true
  }
}
function onDragLeave(e: DragEvent) {
  if (!(e as any).fromElement) {
    dragging.value = false
  }
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

  const file = e.dataTransfer?.files?.[0]

  emit('drop', file)
}

onMounted(() => {
  document.addEventListener('dragenter', onDragEnter)
  document.addEventListener('dragleave', onDragLeave)
  document.addEventListener('dragover', onDragOver)
  document.addEventListener('drop', onDragDrop)
})
onUnmounted(() => {
  document.removeEventListener('dragenter', onDragEnter)
  document.removeEventListener('dragleave', onDragLeave)
  document.removeEventListener('dragover', onDragOver)
  document.removeEventListener('drop', onDragDrop)
})
</script>

<style lang="less" scoped>
.dropbox {
  position: fixed;
  top: 30px;
  bottom: 30px;
  left: 30px;
  right: 30px;
  padding: 20px;
  z-index: 99999999999;

  color: white;
  background: linear-gradient(rgba(black, 0.5), rgba(hsl(220, 13%, 48%), 0.5));
  border: 5px dashed white;
  user-select: none;
  pointer-events: none;

  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.dropbox__tips {
  user-select: none;
  pointer-events: none;
}
</style>
