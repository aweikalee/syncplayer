<template>
  <div class="home">
    <div class="home-title">SyncPlayer 同步播放器</div>

    <div class="home-input">
      <input
        type="text"
        v-model="room"
        @keypress.enter="submit"
        placeholder="请输入房间号"
      />
    </div>

    <div class="home-input__error" v-if="errorMessage">
      {{ errorMessage }}
    </div>

    <div class="home-enter" @click="submit" v-else>
      <div class="home-enter__bg"></div>
      <div class="home-enter__text">LINK START</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const room = ref('')
const errorMessage = computed(() => {
  const value = room.value
  if (!value?.length) return '房间号不能为空'
  if (value.length > 32) return '房间号不能大于32位'

  return ''
})

function submit() {
  if (errorMessage.value) return

  router.push({
    name: 'Room',
    params: {
      id: room.value,
    },
  })
}
</script>

<style lang="less" scoped>
.home {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 20px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: black;
  background-image: radial-gradient(circle, black 30%, rgba(#56c4a1, 0.6));

  .home-title {
    position: relative;
    font-size: 40px;
    font-weight: bold;
    color: white;
    overflow: hidden;
    text-align: center;

    &::before,
    &::after {
      content: '';
      position: absolute;
      top: -988px;
      left: 50%;
      width: 2000px;
      height: 2000px;
      border-radius: 45% 48% 35% 47%;
      transform: translate(-50%, -50%);
      background: rgba(#56c4a1, 0.85);
      animation: rotate 10s infinite linear;
      z-index: 1;
      mix-blend-mode: darken;
    }

    &::after {
      background: rgba(#63ecf1, 0.85);
      border-radius: 43% 47% 44% 48%;
      animation: rotate 11.3s infinite 0.3s linear;
    }
  }

  @keyframes rotate {
    0% {
      transform: translate(-50%, -50%) rotate(0);
    }
    100% {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }

  .home-input {
    width: 100%;
    height: 50px;
    max-width: 300px;
    margin-top: 30px;

    background-color: #282c34;
    border: 2px solid;
    border-image: linear-gradient(135deg, rgba(#56c4a1, 1), rgba(#545d6d, 1)) 1
      1;

    > input {
      width: 100%;
      height: 100%;
      appearance: none;
      background-color: transparent;
      border: none;
      color: inherit;
      outline: none;
      box-sizing: border-box;
      padding: 0 10px;
      text-align: center;
      font-size: 20px;
    }
  }

  .home-input__error {
    color: rgb(240, 109, 69);
    font-size: 14px;
    text-shadow: rgba(white, 0.7) 0 0 4px;
    margin-top: 10px;
  }

  .home-enter {
    font-size: 16px;
    font-weight: bold;
    color: white;

    margin-top: 10px;
    padding: 10px 20px;
    position: relative;
    overflow: hidden;

    cursor: pointer;
    user-select: none;

    .home-enter__text {
      position: relative;
    }

    .home-enter__bg {
      width: 150%;
      padding-bottom: 150%;
      position: absolute;
      z-index: 0;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(135deg);
      transition: all 0.6s;

      background-image: linear-gradient(
        rgba(#56c4a1, 1),
        rgba(hsl(220, 13%, 38%), 1)
      );
    }

    &:hover {
      .home-enter__bg {
        transform: translate(-50%, -50%) rotate(135deg + 360deg);
      }
    }

    &:active {
      opacity: 0.8;
    }
  }
}
</style>
