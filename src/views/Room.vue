<template>
  <div class="room">
    <div class="room-main">
      <Player class="room-player" ref="player" @seek="onSeek" :key="key" />

      <div class="room-overlay" v-if="!store.player.firstPlayed">
        <div class="room-overlay__content">
          <h2>SyncPlayer 同步播放器</h2>
          <p>
            由于浏览器的限制，当你看到这个提示时，说明播放器还未取得播放的控制权。可以通过点击下方的按钮进行授权
          </p>

          <div class="room-overlay__button" @click="store.player.tryPlay">
            授权
          </div>
        </div>
      </div>
    </div>

    <div class="room-slide" :class="{ active: showSlide }">
      <div class="room-slide__container">
        <div class="room-slide__header">
          <div class="room-slide__content" @click="showSourceDialog = true">
            {{ sourceTitle }}
          </div>

          <div class="room-slide__nickname">
            <el-input v-model="nicknameModel" @change="setNickname">
              <template #prefix>我的昵称：</template>
            </el-input>
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

  <el-dialog
    v-model="showSourceDialog"
    title="来源设置"
    destroy-on-close
    width="600px"
    :style="{ maxWidth: '100%' }"
    @close="store.player.tryPlay"
  >
    <SourceForm ref="sourceFormRef" />

    <template #footer>
      <el-button @click="showSourceDialog = false">取消</el-button>
      <el-button type="primary" @click="onSourceSubmit">确定</el-button>
    </template>
  </el-dialog>

  <Dropbox @drop="onFileDrop" v-if="!showSourceDialog" />
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

type IMessageMessage = {
  action: 'message'
  message: string
}

export type IParams = IMessagePlayer | IMessageMessage

export type IResult = IResultBase<
  | IMessagePlayer
  | IMessageMessage
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
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'

import { store } from '@/store'
import { getExt } from '@/utils'

import Player from '@/components/Player.vue'
import SourceForm from '@/components/SourceForm.vue'
import Dropbox from '@/components/Dropbox.vue'
import Logs from '@/components/Logs.vue'

const route = useRoute()
const id = route.params.id

const player = shallowRef<any>()

/* socket */

const socket = io('/', {
  transports: ['websocket'],
  query: {
    room: id,
    nickname: store.user.nickname,
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

/* 来源 */
const showSourceDialog = ref(false)
const sourceFormRef = ref()
async function onSourceSubmit() {
  await sourceFormRef.value.submit()
  showSourceDialog.value = false
}

const sourceTitle = computed(() => {
  const name = store.source.filename
  if (!name) return '选择播放内容'
  if (name.length < 60) return name
  return `${name.slice(0, 30)} ... ${name.slice(-20)}`
})

watch(
  () => store.source.filename,
  (filename) => {
    send({
      action: 'message',
      message: `更换了视频源 ${filename}`,
    })
  }
)
watch(
  () => store.source.subtitleFilename,
  (filename) => {
    send({
      action: 'message',
      message: `更换了字幕源 ${filename}`,
    })
  }
)
watch(
  () => store.source.danmuFilename,
  (filename) => {
    send({
      action: 'message',
      message: `更换了弹幕源 ${filename}`,
    })
  }
)

function onFileDrop(file: File) {
  const filename = file.name
  const src = URL.createObjectURL(file)

  const exts = store.config.ext
  const ext = getExt(filename)

  if (exts.video.includes(ext)) {
    store.source.src = src
    store.source.filename = filename
  } else if (exts.subtitle.includes(ext)) {
    store.source.subtitle = src
    store.source.subtitleFilename = filename
  } else if (exts.danmu.includes(ext)) {
    store.source.danmu = src
    store.source.danmuFilename = filename
  } else {
    ElMessage({
      type: 'warning',
      message: '无法识别的文件类型，请通过来源设置使用该文件',
    })
  }

  store.player.tryPlay()
}

/* 播放器 */
const key = computed(() =>
  [store.source.src, store.source.subtitle, store.source.danmu].join('-')
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

/* 用户名 */
const nicknameModel = ref(store.user.nickname)
watch(
  () => store.user.nickname,
  (value) => (nicknameModel.value = value)
)
function setNickname() {
  let nickname = nicknameModel.value
  nickname = nickname.trim()
  if (nickname.length > 20) nickname = nickname.slice(0, 20)
  if (!nickname.length) {
    nicknameModel.value = store.user.nickname
    return
  }
  nicknameModel.value = nickname

  socket.emit('nickname', { nickname })
  store.user.nickname = nickname
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

  .room-slide__content {
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
  }

  .room-slide__nickname {
    padding: 4px;
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
