<template>
  <div class="logs">
    <div class="log" v-for="log in list">
      <template v-if="log.action === 'player'">
        [{{ new Date().toLocaleString() }}] {{ log.sender }} 发起的
        {{ log.type }} {{ log.time }}
      </template>

      <template v-else-if="log.action === 'join'">
        {{ log.sender }} 进入了房间
      </template>

      <template v-else-if="log.action === 'leave'">
        {{ log.sender }} 离开了房间
      </template>

      <template v-else-if="log.action === 'nickname'">
        {{ log.oldNickname }} 改名为 {{ log.sender }}
      </template>

      <template v-else-if="log.action === 'message'">
        {{ log.sender }} {{ log.message }}
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IResult } from '@/views/Room.vue'
defineProps<{
  list: IResult[]
}>()
</script>

<style lang="less" scoped>
.logs {
  padding: 10px;
  word-break: break-all;
  word-wrap: break-word;
  .log {
    margin: 8px 0;
    line-height: 1.4;
  }
}
</style>
