export const user = reactive({
  nickname: localStorage.getItem('nickname') || '',
})

watch(
  () => user.nickname,
  (nickname) => localStorage.setItem('nickname', nickname)
)
if (!user.nickname) user.nickname = randomNickName(10)

function randomNickName(length: number) {
  const radix = 36

  const value =
    Math.random() * (radix ** length - radix ** (length - 1)) +
    radix ** (length - 1)

  return Math.floor(value).toString(radix)
}
