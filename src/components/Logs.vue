<template>
  <div class="logs">
    <div class="log" v-for="log in list">
      <template v-if="log.action === 'player'">
        <span class="log--time">
          {{ log.createdAt }}
        </span>
        <span class="log--sender">
          {{ log.sender }}
        </span>
        <span>发起的 {{ log.type }} {{ formatSeek(log.time) }}</span>
      </template>

      <template v-else-if="log.action === 'join'">
        <span class="log--sender">
          {{ log.sender }}
        </span>
        <span>进入了房间</span>
      </template>

      <template v-else-if="log.action === 'leave'">
        <span class="log--sender">
          {{ log.sender }}
        </span>
        <span>离开了房间</span>
      </template>

      <template v-else-if="log.action === 'nickname'">
        <span class="log--sender"> {{ log.oldNickname }} </span>
        <span> 改名为 </span>
        <span class="log--sender">
          {{ log.sender }}
        </span>
      </template>

      <template v-else-if="log.action === 'message'">
        <span class="log--sender">
          {{ log.sender }}
        </span>
        <span>
          {{ log.message }}
        </span>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IResult } from '@/views/Room.vue'

defineProps<{
  list: IResult[]
}>()

function formatSeek(time: number) {
  let t = time
  const hours = Math.floor(t / 3600)
  t = t % 3600

  const minutes = Math.floor(t / 60)
  t = t % 60

  const seconds = Math.floor(t)

  const arr = [minutes, seconds]
  if (hours) arr.unshift(hours)

  return arr.map((v) => v.toString().padStart(2, '0')).join(':')
}
</script>

<style lang="less" scoped>
.logs {
  padding: 10px;
  word-break: break-all;
  word-wrap: break-word;
  .log {
    margin: 6px 0;
    line-height: 1.4;
    font-size: 12px;

    & > span + span {
      margin-left: 5px;
    }
  }

  .log--time {
    opacity: 0.5;
    &::before {
      content: '[';
    }
    &::after {
      content: ']';
    }
  }

  .log--sender {
    color: #56c4a1;
  }
}
</style>
