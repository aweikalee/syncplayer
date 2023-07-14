export const player = reactive({
  firstPlayed: false,
  setFirstPlayed(value: boolean) {
    player.firstPlayed = value
  },
  tryPlay() {
    if (player.firstPlayed) return true

    const video = document.createElement('video')
    video.onplay = () => {
      player.firstPlayed = true
    }
    video.play()
  },
})
