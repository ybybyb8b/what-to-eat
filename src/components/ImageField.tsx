import { ImagePlus, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { compressImage } from '../utils/image'

export function ImageField({ image, onChange, label = '图片（可选）' }: {
  image?: string
  onChange: (value: string | undefined) => void
  label?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const select = async (file?: File) => {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      onChange(await compressImage(file))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '图片处理失败')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return <div className="image-field">
    <span className="image-field-label">{label}</span>
    <div className="image-field-row">
      <div className="image-preview">
        {image ? <img src={image} alt="已选择的预览" /> : <ImagePlus aria-hidden="true" />}
      </div>
      <div className="image-field-actions">
        <button type="button" className="upload-image" disabled={busy} onClick={() => inputRef.current?.click()}>
          <Upload />{busy ? '正在压缩…' : image ? '更换图片' : '上传图片'}
        </button>
        {image && <button type="button" className="remove-image" onClick={() => onChange(undefined)}><Trash2 />移除</button>}
      </div>
    </div>
    <input ref={inputRef} hidden type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={(event) => void select(event.target.files?.[0])} />
    <small>{error || '会压缩到适合手机显示的尺寸，并离线保存在当前设备。'}</small>
  </div>
}
