export const getImageUrl = (path) => {
  // 如果路径以 http, https 或 / 开头，直接返回该外部/绝对链接
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path
  }
  
  // 否则尝试使用内部的 assets 图片
  try {
    return new URL(`../assets/${path}`, import.meta.url).href
  } catch (e) {
    console.error(`Image not found: ${path}`, e)
    return ''
  }
}
