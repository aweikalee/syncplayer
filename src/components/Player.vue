<template>
  <div class="com-player">
    <div ref="el" class="com-player__container"></div>
  </div>
</template>

<script lang="ts" setup>
import Artplayer from 'artplayer'
import type { Option } from 'artplayer/types/option'
import danmukuPlugin from 'artplayer-plugin-danmuku'

import { store } from '@/store'
import { getExt, isUrl, isBlobUrl, isCid, isBilibiliDanmuUrl } from '@/utils'

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

    url: store.source.src || '//vjs.zencdn.net/v/oceans.mp4',

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

  if (!options.plugins) {
    options.plugins = []
  }

  if (store.source.subtitle) {
    options.subtitle = {
      url: store.source.subtitle,
      type: getExt(store.source.subtitleFilename) || 'vtt',
      style: {
        color: '#fff',
        fontSize: '24px',
        fontWeight: 'bold',
        textShadow: '0 0 5px #000',
      },
    }
  }

  const danmu = store.source.danmu
  if (danmu) {
    let danmuku: any = []

    if (isCid(danmu) || isBilibiliDanmuUrl(danmu)) {
      danmuku = `/danmu?t=${encodeURIComponent(danmu)}`
    } else if (isBlobUrl(danmu)) {
      const ext = getExt(store.source.danmuFilename)
      if (ext === 'xml') {
        danmuku = danmu
      } else {
        danmuku = () => fetch(danmu).then((res) => res.json())
      }
    } else if (isUrl(danmu)) {
      const ext = getExt(danmu)
      if (ext === 'xml') {
        danmuku = danmuku
      } else {
        danmuku = () => fetch(danmu).then((res) => res.json())
      }
    }

    if (danmuku) {
      options.plugins.push(
        danmukuPlugin({
          danmuku,
          heatmap: true,
        })
      )
    }
  }

  const _player = (player.value = new Artplayer(options))

  _player.on('play' as any, () => {
    if (!store.player.firstPlayed) store.player.setFirstPlayed(true)

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
