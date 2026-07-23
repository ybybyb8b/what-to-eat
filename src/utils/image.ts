const MAX_SOURCE_SIZE = 12 * 1024 * 1024
const MAX_EDGE = 720

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('无法读取这张图片'))
    image.src = url
  })
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) return resolve(blob)
        canvas.toBlob(
          (fallback) => fallback ? resolve(fallback) : reject(new Error('图片压缩失败')),
          'image/jpeg',
          quality
        )
      },
      'image/webp',
      quality
    )
  })
}

function blobDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('图片读取失败'))
    reader.readAsDataURL(blob)
  })
}

export async function compressImage(file: File) {
  if (!file.type.startsWith('image/')) throw new Error('请选择图片文件')
  if (file.size > MAX_SOURCE_SIZE) throw new Error('原图不能超过 12 MB')

  const sourceUrl = URL.createObjectURL(file)
  try {
    const image = await loadImage(sourceUrl)
    const scale = Math.min(1, MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('当前浏览器无法处理图片')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    let blob = await canvasBlob(canvas, 0.78)
    if (blob.size > 500 * 1024) blob = await canvasBlob(canvas, 0.62)
    return blobDataUrl(blob)
  } finally {
    URL.revokeObjectURL(sourceUrl)
  }
}
