import { Check, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, SearchField } from '../components/UI'
import { useApp } from '../state/AppContext'
import type { IngredientCategory } from '../types'

const categories: IngredientCategory[]=['肉蛋','蔬菜','主食','豆制品','其他']

export function IngredientPage(){
  const {data,selectedIngredientIds,setSelectedIngredientIds}=useApp()
  const navigate=useNavigate();const [category,setCategory]=useState<IngredientCategory>('肉蛋');const [search,setSearch]=useState('')
  const visible=useMemo(()=>data.ingredients.filter((item)=>item.enabled&&(search?item.name.includes(search):item.category===category)),[data.ingredients,category,search])
  const toggle=(id:string)=>setSelectedIngredientIds(selectedIngredientIds.includes(id)?selectedIngredientIds.filter((item)=>item!==id):[...selectedIngredientIds,id])
  return <div className="sub-page ingredients-page"><PageHeader title="今天想买点什么" subtitle="选今晚想吃的，不用管家里库存"/>
    <SearchField value={search} onChange={setSearch} placeholder="搜索食材"/>
    {!search&&<div className="category-tabs" role="tablist" aria-label="食材分类">{categories.map((item)=><button role="tab" aria-selected={category===item} className={category===item?'active':''} key={item} onClick={()=>setCategory(item)}>{item}</button>)}</div>}
    <div className="ingredient-grid">{visible.map((item)=>{const selected=selectedIngredientIds.includes(item.id);return <button key={item.id} className={selected?'ingredient-card selected':'ingredient-card'} onClick={()=>toggle(item.id)} aria-pressed={selected}><span className="ingredient-name">{item.name}</span>{selected&&<span className="check-badge"><Check/></span>}<span className="ingredient-emoji" aria-hidden="true">{item.emoji}</span><span className="ingredient-shape" aria-hidden="true"/></button>})}</div>
    {visible.length===0&&<p className="inline-empty">没有找到相关食材</p>}
    <div className="sticky-action ingredient-action"><div><span>已选</span><strong>{selectedIngredientIds.length}</strong><span>种食材</span></div><button className="primary-button" disabled={!selectedIngredientIds.length} onClick={()=>navigate('/recommendations')}>看看能做什么 <ChevronRight/></button>{!selectedIngredientIds.length&&<small>至少选择一种食材</small>}</div>
  </div>
}
