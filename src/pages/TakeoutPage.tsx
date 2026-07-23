import { Check, Clock3, Edit3, Heart, Plus, Search, ThumbsDown, Trash2, UtensilsCrossed } from 'lucide-react'
import { useMemo, useState, type CSSProperties, type FormEvent } from 'react'
import { ImageField } from '../components/ImageField'
import { Modal, PageHeader, SearchField } from '../components/UI'
import { useApp } from '../state/AppContext'
import type { TakeoutCategory, TakeoutOption } from '../types'
import { createId } from '../utils/id'

const categories: ['全部', ...TakeoutCategory[]] = ['全部', '米饭', '面食', '快餐', '小吃', '清淡', '其他']
type EditorState = { mode: 'new' } | { mode: 'edit'; item: TakeoutOption }

function takeoutScore(item: TakeoutOption, favorite: boolean, rejected: number) {
  const age = item.lastEatenAt ? (Date.now() - new Date(item.lastEatenAt).getTime()) / 86_400_000 : 99
  return (favorite ? 25 : 0) - rejected * 10 + (age < 3 ? -22 : age < 7 ? -10 : 0) - item.minutes * .08 - item.price * .03
}

export function TakeoutPage() {
  const { data, updateData, setPreference, addHistory, notify } = useApp()
  const [category, setCategory] = useState<(typeof categories)[number]>('全部')
  const [search, setSearch] = useState('')
  const [editor, setEditor] = useState<EditorState | null>(null)

  const sorted = useMemo(() => data.takeouts
    .filter((item) => (category === '全部' || item.category === category) && item.name.includes(search))
    .map((item) => {
      const pref = data.preferences.find((entry) => entry.itemId === item.id)
      return { item, pref, score: takeoutScore(item, Boolean(pref?.favorite), pref?.rejectedCount ?? 0) }
    })
    .sort((a, b) => b.score - a.score), [data, category, search])

  const save = (value: TakeoutOption) => {
    updateData((current) => ({
      ...current,
      takeouts: [...current.takeouts.filter((item) => item.id !== value.id), value]
    }), editor?.mode === 'edit' ? '外卖候选已修改' : '外卖候选已添加')
    setEditor(null)
  }
  const openNew = () => setEditor({ mode: 'new' })

  return <div className="sub-page takeout-page">
    <PageHeader
      title="今晚点什么"
      subtitle="推荐只调整顺序，不会藏起其他候选"
      action={<button type="button" className="icon-button" onClick={openNew} aria-label="新增外卖候选"><Plus /></button>}
    />
    <SearchField value={search} onChange={setSearch} placeholder="搜索外卖候选" />
    <div className="category-tabs scroll-tabs">{categories.map((item) => <button type="button" className={category === item ? 'active' : ''} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div>
    <div className="takeout-create-row">
      <span>共 {data.takeouts.length} 个候选</span>
      <button type="button" className="small-add" onClick={openNew}><Plus />新增候选</button>
    </div>

    {sorted.length === 0 && <div className="inline-empty"><Search /><p>没有找到候选，换个关键词或新增一项。</p></div>}
    <div className="takeout-list">{sorted.map(({ item, pref }, index) => <article className="takeout-card" key={item.id}>
      <div className="takeout-art" style={{ '--tone': item.color } as CSSProperties}>
        {item.image ? <img src={item.image} alt="" /> : <UtensilsCrossed className="takeout-placeholder" aria-hidden="true" />}
        {index === 0 && <b>推荐</b>}
      </div>
      <div className="takeout-info">
        <div>
          <span className="category-label">{item.category}</span>
          <h2>{item.name}</h2>
          <p><strong>约 ¥{item.price}</strong><span><Clock3 /> {item.minutes} 分钟</span></p>
          <small>{item.lastEatenAt ? `上次吃：${new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' }).format(new Date(item.lastEatenAt))}` : '最近没有吃过'}</small>
        </div>
        <div className="takeout-actions">
          <button type="button" className={pref?.favorite ? 'active' : ''} onClick={() => setPreference(item.id, { favorite: !pref?.favorite })} aria-label="加入收藏"><Heart /></button>
          <button type="button" onClick={() => { setPreference(item.id, { rejectedCount: (pref?.rejectedCount ?? 0) + 1 }); notify('下次会降低推荐') }} aria-label="不太想吃"><ThumbsDown /></button>
          <button type="button" onClick={() => setEditor({ mode: 'edit', item })} aria-label={`编辑${item.name}`} title="编辑"><Edit3 /></button>
          <button type="button" onClick={() => {
            if (window.confirm(`删除“${item.name}”？`)) {
              updateData((current) => ({ ...current, takeouts: current.takeouts.filter((entry) => entry.id !== item.id) }), '已删除')
            }
          }} aria-label={`删除${item.name}`} title="删除"><Trash2 /></button>
        </div>
        <button type="button" className="primary-button choose-takeout" onClick={() => {
          const now = new Date().toISOString()
          updateData((current) => ({ ...current, takeouts: current.takeouts.map((entry) => entry.id === item.id ? { ...entry, lastEatenAt: now } : entry) }))
          addHistory({ kind: 'takeout', itemId: item.id, name: item.name })
        }}><Check />今晚吃这个</button>
      </div>
    </article>)}</div>

    {editor && <TakeoutEditor
      key={editor.mode === 'edit' ? editor.item.id : 'new-takeout'}
      initial={editor.mode === 'edit' ? editor.item : null}
      onClose={() => setEditor(null)}
      onSave={save}
    />}
  </div>
}

function TakeoutEditor({ initial, onClose, onSave }: {
  initial: TakeoutOption | null
  onClose: () => void
  onSave: (value: TakeoutOption) => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<TakeoutCategory>(initial?.category ?? '米饭')
  const [price, setPrice] = useState(initial?.price ?? 25)
  const [minutes, setMinutes] = useState(initial?.minutes ?? 30)
  const [image, setImage] = useState(initial?.image)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    onSave({
      id: initial?.id ?? createId(),
      name: name.trim(),
      category,
      price: Math.max(0, price),
      minutes: Math.max(1, minutes),
      color: initial?.color ?? '#e59a5b',
      lastEatenAt: initial?.lastEatenAt,
      image
    })
  }

  return <Modal title={initial ? '编辑外卖候选' : '新增外卖候选'} onClose={onClose}>
    <form className="form-stack editor-scroll" onSubmit={submit}>
      <label>名称<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：鸡腿饭" /></label>
      <ImageField image={image} onChange={setImage} label="外卖图片（可选）" />
      <label>分类<select value={category} onChange={(event) => setCategory(event.target.value as TakeoutCategory)}>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label>
      <div className="field-row">
        <label>大致价格<input type="number" min="0" inputMode="decimal" value={price} onChange={(event) => setPrice(Number(event.target.value))} /></label>
        <label>预计分钟<input type="number" min="1" inputMode="numeric" value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} /></label>
      </div>
      <button className="primary-button" type="submit">保存候选</button>
    </form>
  </Modal>
}
