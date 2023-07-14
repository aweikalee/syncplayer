export function getExt(name: string) {
  const index = name.lastIndexOf('.')
  if (index === -1) return ''
  return name.slice(index)
}
