export const store = reactive({
  nickname: localStorage.getItem('nickname') || '',

  firstPlayed: false,
  setFirstPlayed(value: boolean) {
    store.firstPlayed = value
  },
  tryPlay() {
    if (store.firstPlayed) return true

    const video = document.createElement('video')
    video.onplay = () => {
      store.firstPlayed = true
    }
    video.play()
  },
})

watch(
  () => store.nickname,
  (nickname) => localStorage.setItem('nickname', nickname)
)
if (!store.nickname) store.nickname = randomNickName(10)

function randomNickName(length: number) {
  const radix = 36

  const value =
    Math.random() * (radix ** length - radix ** (length - 1)) +
    radix ** (length - 1)

  return Math.floor(value).toString(radix)
}
