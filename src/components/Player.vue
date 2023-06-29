<template>
  <div class="com-player">
    <div ref="el" class="com-player__container"></div>
  </div>
</template>

<script lang="ts" setup>
import Artplayer from 'artplayer'
import { Subtitle } from 'artplayer/types/subtitle'
import danmukuPlugin from 'artplayer-plugin-danmuku'

import { store } from '@/store'
import Option from 'artplayer/types/option'

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
  subtitle?: Subtitle
  danmu?: string
}>()

const el = ref<HTMLDivElement>()
const player = shallowRef<Artplayer>()

let isManual = true
let isManualSeek = true

onBeforeUnmount(() => {
  player.value?.destroy()
})

onMounted(() => {
  if (!el.value) return

  const options: Option = {
    container: el.value,
    theme: '#56c4a1',

    url: props.src || '//vjs.zencdn.net/v/oceans.mp4',

    subtitle: {
      ...props.subtitle,
      style: {
        color: '#fff',
        fontSize: '24px',
        fontWeight: 'bold',
        textShadow: '0 0 5px #000',
      },
    },

    setting: true,
    flip: true,
    playbackRate: true,
    aspectRatio: true,
    subtitleOffset: true,
    pip: true,
    fullscreen: true,

    cssVar: {
      '--art-subtitle-bottom': '30px',
    },
  }

  if (props.danmu) {
    if (!options.plugins) {
      options.plugins = []
    }

    options.plugins.push(
      danmukuPlugin({
        danmuku: `/danmu?t=${encodeURIComponent(props.danmu!)}`,
        heatmap: true,
      })
    )
  }

  const _player = (player.value = new Artplayer(options))

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

  _player.on('video:seeked' as any, () => {
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

  _player.on('video:ratechange' as any, () => {
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
  isManual = false
  player.value!.play()
}
function pause() {
  if (!player.value) return
  isManual = false
  player.value!.pause()
}
function seek(time: number) {
  if (!player.value) return
  isManualSeek = false
  player.value!.seek = time
}
function setRate(rate: number) {
  if (!player.value) return
  if (player.value.video.playbackRate === rate) return
  isManual = false
  player.value!.playbackRate = rate
}

defineExpose({
  play,
  pause,
  seek,
  setRate,
})
</script>

<style lang="less" scoped>
.com-player {
  .com-player__container {
    width: 100%;
    height: 100%;
  }

  :deep(.art-danmuku-emitter) {
    display: none;
  }
}
</style>
