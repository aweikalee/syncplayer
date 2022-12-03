<template>
  <div
    class="subtitle-select"
    :title="filename || src || '选择字幕'"
    @click="inputRef?.click()"
  >
    {{ title }}
    <input
      class="subtitle-select__input"
      type="file"
      @input="onInput"
      ref="inputRef"
      :key="inputKey"
    />
  </div>
</template>

<script lang="ts">
export default defineComponent({
  inheritAttrs: false,
})
</script>

<script lang="ts" setup>
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
  if (!name) return '选择字幕'
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
}
</script>

<style lang="less" scoped>
.subtitle-select {
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

  .subtitle-select__input {
    display: none;
  }
}
</style>
