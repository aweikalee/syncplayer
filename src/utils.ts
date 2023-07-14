export function getExt(name: string) {
  const index = name.lastIndexOf('.')
  if (index === -1) return ''
  return name.slice(index + 1).toLowerCase()
}

export const isUrl = (url: string) => /^http(s?):\/\//.test(url)
export const isBlobUrl = (url: string) => /^blob:http(s?):\/\//.test(url)

export const isCid = (val: string) => /^cid\=/.test(val)

export const isBilibiliDanmuUrl = (val: string) =>
  /^http(s?):\/\/api\.bilibili\.com/.test(val)
