<template>
  <div data-vjs-player>
    <video class="video-js vjs-big-play-centered vjs-fill" ref="el" />
  </div>
</template>

<script lang="ts" setup>
import videojs, { VideoJsPlayer } from 'video.js'
import 'video.js/dist/video-js.css'

import { store } from '@/store'

const emit = defineEmits<{
  (
    e: 'seek',
    params: {
      type: 'play' | 'pause' | 'seek'
      paused: boolean
      time: number
    }
  ): void
}>()

const props = defineProps<{
  src?: string
  filename?: string
}>()

const el = ref<HTMLVideoElement>()
const player = ref<VideoJsPlayer>()

let isManual = true

onBeforeUnmount(() => {
  player.value?.dispose()
})

onMounted(() => {
  if (!el.value) return

  const _player = (player.value = videojs(el.value!, {
    autoplay: false,
    controls: true,
    language: 'zh-CN',
    userActions: {
      hotkeys(e) {
        const offset = e.ctrlKey ? 10 : 3
        const HOTKEY = {
          /* 播放/暂停 */
          32: /* 空格 */ () => {
            e.preventDefault()
            _player.paused() ? _player.play() : _player.pause()
          },

          /* 前进/后退 */
          37: /* 左 */ () => {
            e.preventDefault()
            _player.currentTime(_player.currentTime() - offset)
          },
          39: /* 右 */ () => {
            e.preventDefault()
            _player.currentTime(_player.currentTime() + offset)
          },

          /* 音量增减 */
          38: /* 上 */ () => {
            e.preventDefault()
            _player.volume(_player.volume() + 0.05)
          },
          40: /* 下 */ () => {
            e.preventDefault()
            _player.volume(_player.volume() - 0.05)
          },
        }

        HOTKEY[e.which as keyof typeof HOTKEY]?.()
      },
      doubleClick: false,
    },
    sources: [
      {
        src: props.src || '//vjs.zencdn.net/v/oceans.mp4',
        type: 'video/mp4',
      },
    ],
  }))

  /* 初始设置 */
  _player.volume(Number(localStorage.getItem('volume')) || 0.7)
  _player.one('play', () => store.setFirstPlayed(true))

  /* 事件 */
  _player.on(['play', 'pause'], (e) => {
    if (isManual) {
      emit('seek', {
        type: e.type,
        paused: e.type === 'pause',
        time: _player.currentTime(),
      })
    }
    isManual = true
  })

  let isSeeked = false
  _player.on('seeked', (e) => {
    isSeeked = true
  })

  _player.on('timeupdate', (e) => {
    if (e.manuallyTriggered && isSeeked) {
      isSeeked = false
      emit('seek', {
        type: 'seek',
        paused: _player.paused(),
        time: _player.currentTime(),
      })
    }
  })

  _player.on('volumechange', () => {
    localStorage.setItem('volume', String(_player.volume()))
  })
})

function play() {
  if (!player.value) return
  if (!player.value.paused()) return

  isManual = false
  player.value?.play()
}
function pause() {
  if (!player.value) return
  if (player.value.paused()) return

  isManual = false
  player.value?.pause()
}
function seek(time: number) {
  player.value?.currentTime(time)
}

defineExpose({
  play,
  pause,
  seek,
})
</script>

<style lang="less" scoped></style>
