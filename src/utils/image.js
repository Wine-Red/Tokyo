export const getImageUrl = (path) => {
  // 如果路径以 http, https 或 / 开头，并且当前环境有 BASE_URL，则给 / 开头的路径加上 BASE_URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  if (path.startsWith('/')) {
    const basePath = import.meta.env.BASE_URL || '/'
    // 避免出现双斜杠，例如 //teams/wbg.png
    return basePath.replace(/\/$/, '') + path
  }
  
  // 否则尝试使用内部的 assets 图片
  try {
    return new URL(`../assets/${path}`, import.meta.url).href
  } catch (e) {
    console.error(`Image not found: ${path}`, e)
    return ''
  }
}
