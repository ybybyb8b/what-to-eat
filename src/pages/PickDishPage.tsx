import { Check, ShoppingBasket } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, SearchField } from '../components/UI'
import { useApp } from '../state/AppContext'
import type { PickDishCategory, ShoppingItem } from '../types'
import { createId } from '../utils/id'

const categories: PickDishCategory[] = ['火锅', '水煮菜', '卤菜']

export function PickDishPage() {
  const { data, setShopping, notify } = useApp()
  const navigate = useNavigate()
  const [category, setCategory] = useState<PickDishCategory>('火锅')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const visible = useMemo(
    () => data.pickDishItems.filter((item) => item.enabled && (search ? item.name.includes(search) : item.categories.includes(category))),
    [category, data.pickDishItems, search]
  )
  const toggle = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const addToShopping = () => {
    const selected = data.pickDishItems.filter((item) => selectedIds.includes(item.id))
    const existingNames = new Set(data.shopping.map((item) => item.name))
    const additions: ShoppingItem[] = selected.filter((item) => !existingNames.has(item.name)).map((item) => ({
      id: createId(),
      name: item.name,
      amount: 1,
      unit: item.unit,
      status: 'needed',
      custom: true
    }))
    setShopping([...data.shopping, ...additions])
    notify(additions.length ? `已加入 ${additions.length} 项采购内容` : '所选内容已经在采购清单中')
    navigate('/shopping')
  }

  return <div className="sub-page pick-dish-page">
    <PageHeader title="今晚想煮点什么" subtitle="火锅、水煮菜、卤菜都可以自由选"/>
    <SearchField value={search} onChange={setSearch} placeholder="搜索想买的菜"/>
    {!search && <div className="category-tabs pick-dish-tabs" role="tablist" aria-label="做法分类">
      {categories.map((item) => <button key={item} role="tab" aria-selected={category === item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}
    </div>}
    <div className="pick-dish-grid">
      {visible.map((item) => {
        const selected = selectedIds.includes(item.id)
        return <button key={item.id} className={selected ? 'pick-dish-item selected' : 'pick-dish-item'} onClick={() => toggle(item.id)} aria-pressed={selected}>
          <span>{item.name}</span>
          <small>{item.unit}</small>
          {selected && <i aria-hidden="true"><Check/></i>}
        </button>
      })}
    </div>
    {!visible.length && <p className="inline-empty">没有找到相关菜品，可以在“我的”中新增。</p>}
    <div className="sticky-action ingredient-action">
      <div><span>已选</span><strong>{selectedIds.length}</strong><span>样</span></div>
      <button className="primary-button" disabled={!selectedIds.length} onClick={addToShopping}><ShoppingBasket/>加入采购清单</button>
      {!selectedIds.length && <small>先选一点想吃的</small>}
    </div>
  </div>
}
