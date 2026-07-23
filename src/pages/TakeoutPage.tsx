import { Check, Clock3, Edit3, Heart, Plus, Search, Tags, ThumbsDown, Trash2, UtensilsCrossed } from 'lucide-react'
import { useMemo, useState, type CSSProperties, type FormEvent } from 'react'
import { ImageField } from '../components/ImageField'
import { Modal, PageHeader, SearchField } from '../components/UI'
import { useApp } from '../state/AppContext'
import type { TakeoutCategory, TakeoutOption } from '../types'
import { createId } from '../utils/id'

type EditorState = { mode: 'new' } | { mode: 'edit'; item: TakeoutOption }
type CategoryRow = { id: string; original?: string; name: string }

function takeoutScore(item: TakeoutOption, favorite: boolean, rejected: number) {
  const age = item.lastEatenAt ? (Date.now() - new Date(item.lastEatenAt).getTime()) / 86_400_000 : 99
  return (favorite ? 25 : 0) - rejected * 10 + (age < 3 ? -22 : age < 7 ? -10 : 0) - item.minutes * .08 - item.price * .03
}

export function TakeoutPage() {
  const { data, updateData, setPreference, addHistory, notify } = useApp()
  const [category, setCategory] = useState('全部')
  const [search, setSearch] = useState('')
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [categoryEditor, setCategoryEditor] = useState(false)
  const takeoutCategories = data.settings.takeoutCategories ?? []
  const categories = ['全部', ...takeoutCategories]

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
  const saveCategories = (rows: CategoryRow[]) => {
    const names = rows.map((row) => row.name.trim())
    const renameMap = new Map(rows.filter((row) => row.original).map((row) => [row.original as string, row.name.trim()]))
    updateData((current) => ({
      ...current,
      takeouts: current.takeouts.map((item) => ({ ...item, category: renameMap.get(item.category) ?? item.category })),
      settings: { ...current.settings, takeoutCategories: names }
    }), '外卖分类已保存')
    setCategory('全部')
    setCategoryEditor(false)
  }

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
      <div>
        <button type="button" className="category-manage-button" onClick={() => setCategoryEditor(true)}><Tags />管理分类</button>
        <button type="button" className="small-add" onClick={openNew}><Plus />新增候选</button>
      </div>
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
      categories={takeoutCategories}
      onClose={() => setEditor(null)}
      onSave={save}
    />}
    {categoryEditor && <CategoryManager
      categories={takeoutCategories}
      takeouts={data.takeouts}
      onClose={() => setCategoryEditor(false)}
      onSave={saveCategories}
    />}
  </div>
}

function TakeoutEditor({ initial, categories, onClose, onSave }: {
  initial: TakeoutOption | null
  categories: string[]
  onClose: () => void
  onSave: (value: TakeoutOption) => void
}) {
  const categoryOptions = initial?.category && !categories.includes(initial.category) ? [initial.category, ...categories] : categories
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<TakeoutCategory>(initial?.category ?? categoryOptions[0] ?? '')
  const [price, setPrice] = useState(initial?.price ?? 25)
  const [minutes, setMinutes] = useState(initial?.minutes ?? 30)
  const [image, setImage] = useState(initial?.image)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !category) return
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
      <label>分类<select required value={category} onChange={(event) => setCategory(event.target.value as TakeoutCategory)}>{categoryOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
      <div className="field-row">
        <label>大致价格<input type="number" min="0" inputMode="decimal" value={price} onChange={(event) => setPrice(Number(event.target.value))} /></label>
        <label>预计分钟<input type="number" min="1" inputMode="numeric" value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} /></label>
      </div>
      <button className="primary-button" type="submit">保存候选</button>
    </form>
  </Modal>
}

function CategoryManager({ categories, takeouts, onClose, onSave }: {
  categories: string[]
  takeouts: TakeoutOption[]
  onClose: () => void
  onSave: (rows: CategoryRow[]) => void
}) {
  const [rows, setRows] = useState<CategoryRow[]>(categories.map((name) => ({ id: createId(), original: name, name })))
  const [error, setError] = useState('')
  const usedCount = (row: CategoryRow) => row.original ? takeouts.filter((item) => item.category === row.original).length : 0
  const remove = (id: string) => setRows((current) => current.filter((row) => row.id !== id))
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const names = rows.map((row) => row.name.trim())
    if (!names.length) return setError('至少保留一个分类')
    if (names.some((name) => !name)) return setError('分类名称不能为空')
    if (new Set(names).size !== names.length) return setError('分类名称不能重复')
    onSave(rows.map((row) => ({ ...row, name: row.name.trim() })))
  }

  return <Modal title="管理外卖分类" onClose={onClose}>
    <form className="form-stack" onSubmit={submit}>
      <p className="form-note">重命名会同步更新已有候选；仍有候选的分类不能直接删除。</p>
      <div className="category-editor-list">{rows.map((row) => {
        const count = usedCount(row)
        return <div key={row.id}>
          <label>
            <span className="sr-only">分类名称</span>
            <input value={row.name} onChange={(event) => {
              setRows((current) => current.map((item) => item.id === row.id ? { ...item, name: event.target.value } : item))
              setError('')
            }} />
          </label>
          <small>{count ? `${count} 个候选` : '未使用'}</small>
          <button type="button" className="delete-button" disabled={count > 0} onClick={() => remove(row.id)} aria-label={`删除分类${row.name}`} title={count ? '请先修改该分类下的候选' : '删除分类'}><Trash2 /></button>
        </div>
      })}</div>
      <button type="button" className="secondary-button category-add-button" onClick={() => setRows((current) => [...current, { id: createId(), name: '' }])}><Plus />添加分类</button>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button" type="submit">保存分类</button>
    </form>
  </Modal>
}
