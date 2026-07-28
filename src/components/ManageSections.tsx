import { Clock3, Edit3, History, Plus, Trash2 } from 'lucide-react'
import type { AppData, Ingredient, MealHistory, MealPlan, PickDishItem, Recipe } from '../types'

type UpdateData = (updater: (current: AppData) => AppData, message?: string) => void

function MediaThumb({ image, name }: { image?: string; name: string }) {
  return <span className="manage-media">{image ? <img src={image} alt="" /> : <span aria-hidden="true">{name.slice(0, 1)}</span>}</span>
}

export function IngredientsSection({ data, updateData, onEdit }: { data: AppData; updateData: UpdateData; onEdit: (item: Ingredient | null) => void }) {
  return <section className="manage-section">
    <div className="section-heading"><div><p className="eyebrow">基础资料</p><h2>食材</h2></div><button className="small-add" onClick={() => onEdit(null)}><Plus />新增食材</button></div>
    <div className="manage-list">{data.ingredients.map((item) => <div key={item.id}>
      <MediaThumb image={item.image} name={item.name} /><div><strong>{item.name}</strong><small>{item.category}</small></div>
      <label className="switch"><input type="checkbox" checked={item.enabled} onChange={(event) => updateData((current) => ({ ...current, ingredients: current.ingredients.map((entry) => entry.id === item.id ? { ...entry, enabled: event.target.checked } : entry) }))} /><span /></label>
      <button className="icon-button compact" onClick={() => onEdit(item)} aria-label={`编辑${item.name}`}><Edit3 /></button>
      <button className="icon-button compact danger" onClick={() => { if (window.confirm(`删除食材“${item.name}”？相关菜谱中的引用也会被移除。`)) updateData((current) => ({ ...current, ingredients: current.ingredients.filter((entry) => entry.id !== item.id), recipes: current.recipes.map((recipe) => ({ ...recipe, required: recipe.required.filter((p) => p.ingredientId !== item.id), optional: recipe.optional.filter((p) => p.ingredientId !== item.id) })) }), '食材已删除') }} aria-label={`删除${item.name}`}><Trash2 /></button>
    </div>)}</div>
  </section>
}

export function PickDishSection({ data, updateData, onEdit }: { data: AppData; updateData: UpdateData; onEdit: (item: PickDishItem | null) => void }) {
  return <section className="manage-section">
    <div className="section-heading"><div><p className="eyebrow">自由搭配</p><h2>火锅、水煮菜和卤菜</h2></div><button className="small-add" onClick={() => onEdit(null)}><Plus />新增</button></div>
    <div className="manage-list">{data.pickDishItems.map((item) => <div key={item.id}>
      <MediaThumb name={item.name} /><div><strong>{item.name}</strong><small>{item.categories.join('、')} · {item.unit}</small></div>
      <label className="switch"><input type="checkbox" checked={item.enabled} onChange={(event) => updateData((current) => ({ ...current, pickDishItems: current.pickDishItems.map((entry) => entry.id === item.id ? { ...entry, enabled: event.target.checked } : entry) }))} /><span /></label>
      <button className="icon-button compact" onClick={() => onEdit(item)} aria-label={`编辑${item.name}`}><Edit3 /></button>
      <button className="icon-button compact danger" onClick={() => { if (window.confirm(`删除自选菜“${item.name}”？`)) updateData((current) => ({ ...current, pickDishItems: current.pickDishItems.filter((entry) => entry.id !== item.id) }), '自选菜已删除') }} aria-label={`删除${item.name}`}><Trash2 /></button>
    </div>)}</div>
  </section>
}

export function MenuSection({ data, updateData, editRecipe, editPlan }: { data: AppData; updateData: UpdateData; editRecipe: (item: Recipe | null) => void; editPlan: (item: MealPlan | null) => void }) {
  return <section className="manage-section">
    <div className="section-heading"><div><p className="eyebrow">菜单资料</p><h2>菜品和套餐</h2></div><span className="count-pill">{data.recipes.length} 菜 · {data.mealPlans.length} 套</span></div>
    <div className="subsection-heading"><h3>菜品</h3><button className="small-add" onClick={() => editRecipe(null)}><Plus />新增菜品</button></div>
    <div className="manage-list">{data.recipes.map((item) => <div key={item.id}><MediaThumb image={item.image} name={item.name} /><div><strong>{item.name}</strong><small>{item.minutes} 分钟 · {item.difficulty}</small></div><button className="icon-button compact" onClick={() => editRecipe(item)} aria-label={`编辑${item.name}`}><Edit3 /></button><button className="icon-button compact danger" onClick={() => { if (window.confirm(`删除菜品“${item.name}”？包含它的套餐也会同步更新。`)) updateData((current) => ({ ...current, recipes: current.recipes.filter((entry) => entry.id !== item.id), mealPlans: current.mealPlans.map((plan) => ({ ...plan, recipeIds: plan.recipeIds.filter((id) => id !== item.id) })).filter((plan) => plan.recipeIds.length) }), '菜品已删除') }} aria-label={`删除${item.name}`}><Trash2 /></button></div>)}</div>
    <div className="subsection-heading"><h3>套餐</h3><button className="small-add" onClick={() => editPlan(null)}><Plus />新增套餐</button></div>
    <div className="manage-list">{data.mealPlans.map((item) => <div key={item.id}><MediaThumb image={item.image} name={item.name} /><div><strong>{item.name}</strong><small>{item.recipeIds.length} 道菜 · {item.tags.join('、') || '暂无标签'}</small></div><button className="icon-button compact" onClick={() => editPlan(item)} aria-label={`编辑${item.name}`}><Edit3 /></button><button className="icon-button compact danger" onClick={() => { if (window.confirm(`删除套餐“${item.name}”？`)) updateData((current) => ({ ...current, mealPlans: current.mealPlans.filter((entry) => entry.id !== item.id) }), '套餐已删除') }} aria-label={`删除${item.name}`}><Trash2 /></button></div>)}</div>
  </section>
}

export function HistorySection({ data, updateData, onEdit }: { data: AppData; updateData: UpdateData; onEdit: (item: MealHistory | null) => void }) {
  return <section className="manage-section">
    <div className="section-heading"><div><p className="eyebrow">最近吃过</p><h2>用餐记录</h2></div><button className="small-add" onClick={() => onEdit(null)}><Plus />新增记录</button></div>
    {data.history.length > 0 && <button className="clear-history" onClick={() => { if (window.confirm('确定清除全部用餐历史吗？此操作无法撤销。')) updateData((current) => ({ ...current, history: [] }), '历史记录已清除') }}><Trash2 />清除全部记录</button>}
    {data.history.length === 0 ? <div className="inline-empty"><History /><p>还没有记录，可以手动新增或在选定晚餐后自动记录。</p></div> : <div className="timeline">{data.history.map((item) => <div key={item.id}>
      <span /><div><strong>{item.name}</strong><small><Clock3 />{new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(item.eatenAt))}</small></div>
      <button className="icon-button compact" onClick={() => onEdit(item)} aria-label={`编辑${item.name}`}><Edit3 /></button>
      <button className="icon-button compact danger" onClick={() => { if (window.confirm(`删除“${item.name}”这条记录？`)) updateData((current) => ({ ...current, history: current.history.filter((entry) => entry.id !== item.id) }), '记录已删除') }} aria-label={`删除${item.name}`}><Trash2 /></button>
    </div>)}</div>}
  </section>
}
