<template>
  <div ref="el"></div>
</template>

<script lang="ts" setup>
import DPlayer, { DPlayerContextMenuItem } from 'dplayer'

import { store } from '@/store'

const emit = defineEmits<{
  (
    e: 'seek',
    params: {
      type: 'play' | 'pause' | 'seek' | 'ratechange'
      paused: boolean
      time: number
      rate: number
    }
  ): void
}>()

const props = defineProps<{
  src?: string
  filename?: string
}>()

const el = ref<HTMLVideoElement>()
const player = ref<DPlayer>()

let isManual = true
let isManualSeek = true

onBeforeUnmount(() => {
  player.value?.destroy()
})

onMounted(() => {
  if (!el.value) return

  const contextmenu: DPlayerContextMenuItem[] = []
  if ('exitPictureInPicture' in document) {
    contextmenu.push({
      text: '画中画',
      click: () => {
        _player.video.requestPictureInPicture()
      },
    })
  }

  const _player = (player.value = new DPlayer({
    container: el.value,
    theme: '#56c4a1',
    contextmenu,

    video: {
      url: props.src || '//vjs.zencdn.net/v/oceans.mp4',
    },
  }))

  _player.on('play' as any, () => {
    if (!store.firstPlayed) store.setFirstPlayed(true)

    if (isManual) {
      emit('seek', {
        type: 'play',
        paused: false,
        time: _player.video.currentTime,
        rate: _player.video.playbackRate,
      })
    }
    isManual = true
  })
  _player.on('pause' as any, () => {
    if (isManual && !_player.video.ended) {
      emit('seek', {
        type: 'pause',
        paused: true,
        time: _player.video.currentTime,
        rate: _player.video.playbackRate,
      })
    }
    isManual = true
  })

  _player.on('seeked' as any, () => {
    if (isManualSeek) {
      emit('seek', {
        type: 'seek',
        paused: _player.video.paused,
        time: _player.video.currentTime,
        rate: _player.video.playbackRate,
      })
    }
    isManualSeek = true
  })

  _player.on('ratechange' as any, () => {
    if (isManual) {
      emit('seek', {
        type: 'ratechange',
        paused: _player.video.paused,
        time: _player.video.currentTime,
        rate: _player.video.playbackRate,
      })
    }
    isManual = true
  })
})

function play() {
  if (!player.value) return
  if (!player.value.video.paused) return
  isManual = false
  player.value?.video.play()
}
function pause() {
  if (!player.value) return
  if (player.value.video.paused) return
  isManual = false
  player.value?.pause()
}
function seek(time: number) {
  if (!player.value) return
  isManualSeek = false
  player.value?.seek(time)
}
function setRate(rate: number) {
  if (!player.value) return
  if (player.value.video.playbackRate === rate) return
  isManual = false
  player.value?.speed(rate)
}

defineExpose({
  play,
  pause,
  seek,
  setRate,
})
</script>

<style lang="less" scoped></style>
