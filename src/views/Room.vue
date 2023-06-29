<template>
  <div class="room">
    <div class="room-main">
      <Player
        class="room-player"
        ref="player"
        :src="src"
        :filename="filename"
        :subtitle="subtitle"
        :danmu="danmu"
        @seek="onSeek"
        :key="key"
      />

      <div class="room-overlay" v-if="!store.firstPlayed">
        <div class="room-overlay__content">
          <h2>SyncPlayer 同步播放器</h2>
          <p>
            由于浏览器的限制，当你看到这个提示时，说明播放器还未取得播放的控制权。可以通过点击下方的按钮进行授权
          </p>

          <div class="room-overlay__button" @click="store.tryPlay">授权</div>
        </div>
      </div>
    </div>

    <div class="room-slide" :class="{ active: showSlide }">
      <div class="room-slide__container">
        <div class="room-slide__header">
          <FileSelect v-model:src="src" v-model:filename="filename" />
          <SubtitleSelect
            v-model:src="subtitleSrc"
            v-model:filename="subtitleFilename"
          />

          <div class="room-field">
            <label class="room-field__label" for="nickname">我的昵称</label>
            <div class="room-field__input">
              <input
                id="nickname"
                type="text"
                v-model="nicknameModel"
                @change="setNickname"
                autocomplete="off"
              />
            </div>
          </div>

          <div
            class="room-field"
            :class="{
              error: danmuModelError,
            }"
          >
            <label class="room-field__label" for="danmu">弹幕地址</label>
            <div class="room-field__input">
              <input
                id="danmu"
                type="text"
                v-model="danmuModel"
                @change="setDanmu"
                autocomplete="off"
              />
            </div>
            <div class="room-field__append">
              <div class="room-field__tip" @click="showDanmuTip">?</div>
            </div>
          </div>
        </div>

        <Logs class="room-slide__logs" :list="logs" />
      </div>

      <div
        class="room-slice__toggle"
        title="展开/收起侧边栏"
        @click="showSlide = !showSlide"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
type IResultBase<T> = { from: string; sender: string } & T

type IMessagePlayer = {
  action: 'player'
  type: 'play' | 'pause' | 'seek' | 'ratechange'
  paused: boolean
  time: number
  rate: number
}

type IMessageFilename = {
  action: 'filename'
  filename: string
}

type IMessageMessage = {
  action: 'message'
  message: string
}

export type IParams = IMessagePlayer | IMessageMessage | IMessageFilename

export type IResult = IResultBase<
  | IMessagePlayer
  | IMessageMessage
  | IMessageFilename
  | {
      action: 'join'
      nickname: string
    }
  | {
      action: 'leave'
      nickname: string
    }
  | {
      action: 'nickname'
      oldNickname: string
    }
>
</script>

<script lang="ts" setup>
import { io } from 'socket.io-client'
import { onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

import { store } from '@/store'

import Player from '@/components/Player.vue'
import FileSelect from '@/components/FileSelect.vue'
import SubtitleSelect from '@/components/SubtitleSelect.vue'
import Logs from '@/components/Logs.vue'

const route = useRoute()
const id = route.params.id

const player = shallowRef<any>()

/* socket */

const socket = io('/', {
  transports: ['websocket'],
  query: {
    room: id,
    nickname: store.nickname,
  },
})
onUnmounted(() => socket.disconnect())

const logs = ref<IResult[]>([])
const MAX_LOG_LENGTH = 100
function addLog(result: IResult) {
  logs.value.unshift(result)

  logs.value.length = Math.min(MAX_LOG_LENGTH, logs.value.length)
}

socket.on('message', (params: IResult) => {
  switch (params.action) {
    case 'player':
      updateSeek(params)
      break
  }

  addLog(params)
})

function send(params: IParams) {
  socket.emit('message', params)
}

/* 播放器 */
const src = ref('')
const filename = ref('')
const subtitleSrc = ref('')
const subtitleFilename = ref('')
const danmu = ref('')
const key = computed(() =>
  [src.value, subtitleSrc.value, danmu.value].join('-')
)
const subtitle = computed(() => {
  if (!subtitleSrc.value) return {}

  function getSubtitleType(url: string) {
    url = url.toLowerCase()
    if (url.endsWith('.ass')) {
      return 'ass'
    } else if (url.endsWith('.srt')) {
      return 'srt'
    } else {
      return 'vtt'
    }
  }

  return {
    url: subtitleSrc.value,
    type: getSubtitleType(subtitleFilename.value),
  }
})

watch(filename, (filename) =>
  send({
    action: 'filename',
    filename,
  })
)
watch(subtitleFilename, (filename) =>
  send({
    action: 'message',
    message: `更换了字幕文件 ${filename}`,
  })
)

function onSeek(params: Omit<IMessagePlayer, 'action'>) {
  send({
    ...params,
    action: 'player',
  })
}

async function updateSeek(params: IResultBase<IMessagePlayer>) {
  if (params.from === socket.id) return
  player.value?.seek(params.time)
  player.value?.setRate(params.rate)

  await nextTick()
  if (params.paused) {
    player.value?.pause()
  } else {
    player.value?.play()
  }
}

/* 弹幕 */
const danmuModel = ref('')
const danmuModelError = ref(false)
watch(
  () => danmu.value,
  (value) => (danmuModel.value = value)
)
function setDanmu() {
  let value = danmuModel.value
  value = value.trim()
  if (
    !value ||
    /^cid\=/.test(value) ||
    /^http(s?):\/\/api\.bilibili\.com/.test(value)
  ) {
    danmu.value = value
    danmuModelError.value = false

    if (value) {
      send({
        action: 'message',
        message: `将弹幕地址设置为了 ${value}`,
      })
    }
  } else {
    danmuModelError.value = true
  }
}

function showDanmuTip() {
  alert(`仅支持B站弹幕，支持下面2种形式：
  1. 完整的“弹幕地址”
    如：https://api.bilibili.com/x/v1/dm/list.so?oid=1
  2. “cid=xxxx”形式
    如：cid=1
    cid可从B站视频页面接口中寻找
  `)
}

/* 用户名 */
const nicknameModel = ref(store.nickname)
watch(
  () => store.nickname,
  (value) => (nicknameModel.value = value)
)
function setNickname() {
  let nickname = nicknameModel.value
  nickname = nickname.trim()
  if (nickname.length > 20) nickname = nickname.slice(0, 20)
  if (!nickname.length) {
    nicknameModel.value = store.nickname
    return
  }
  nicknameModel.value = nickname

  socket.emit('nickname', { nickname })
  store.nickname = nickname
}

/* 显隐侧边栏 */
const showSlide = ref(true)
</script>

<style lang="less" scoped>
.room {
  display: block;

  .room-main {
    height: 100vw * (9/16);
    position: relative;

    .room-player {
      width: 100%;
      height: 100%;
    }

    .room-overlay {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 100;
      background: linear-gradient(rgba(black, 1), rgba(hsl(220, 13%, 48%), 1));

      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;

      .room-overlay__content {
        color: white;
        overflow: auto;
        padding: 20px;

        p {
          max-width: 400px;
        }
      }

      .room-overlay__button {
        display: inline-block;
        background-color: rgba(white, 0.2);
        border: 1px solid white;
        border-radius: 5px;
        padding: 6px 16px;
        margin-top: 20px;
        cursor: pointer;
        font-size: 14px;
        user-select: none;

        &:hover {
          opacity: 0.8;
        }

        &:active {
          opacity: 0.7;
        }
      }
    }
  }

  .room-slide__container {
    box-sizing: border-box;
  }

  .room-slice__toggle {
    display: none;
  }

  .room-field {
    display: flex;
    align-items: center;
    padding: 4px 4px;
    margin: 0 10px;
    border-bottom: 2px solid;
    border-image: linear-gradient(
        135deg,
        rgba(#56c4a1, 1),
        rgba(hsl(220, 13%, 38%), 1)
      )
      1 1;
    color: white;

    &.error {
      border-image: linear-gradient(
          135deg,
          rgba(#c47d56, 1),
          rgba(hsl(21, 48%, 38%), 1)
        )
        1 1;
    }

    .room-field__label {
      flex-shrink: 0;
      font-weight: bold;
      margin-right: 10px;
    }

    .room-field__input {
      flex-grow: 1;
      height: 30px;

      > input {
        width: 100%;
        height: 100%;
        appearance: none;
        background-color: transparent;
        border: none;
        color: inherit;
        outline: none;
      }
    }

    .room-field__append {
      flex-shrink: 0;
      margin-left: 10px;
    }
    .room-field__tip {
      border: 1px solid white;
      border-radius: 50%;
      width: 1em;
      height: 1em;
      display: flex;
      justify-content: center;
      align-items: center;

      cursor: pointer;
      user-select: none;
      &:active {
        opacity: 0.7;
      }
    }
  }
}

@media (min-width: 500px) {
  .room {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: stretch;

    .room-main {
      flex-grow: 1;
      height: initial;
    }

    .room-slide {
      position: relative;
      max-width: 50%;

      &.active {
        .room-slide__container {
          display: flex;
        }
      }
    }

    .room-slide__container {
      width: 300px;
      max-width: 100%;

      display: flex;
      flex-direction: column;

      display: none;
    }

    .room-slide__header {
      flex-shrink: 0;
    }

    .room-slide__logs {
      flex-grow: 1;
      overflow: auto;
    }

    .room-slice__toggle {
      display: block;
      position: absolute;
      left: 0;
      top: 50%;
      z-index: 100;
      transform: translate(-50%, -50%);
      height: 30px;
      width: 10px;
      border-radius: 5px;
      background-color: rgba(#999, 0.5);

      cursor: pointer;
      user-select: none;
    }
  }
}
</style>
