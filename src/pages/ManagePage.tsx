import { ArchiveRestore, ChevronRight, Database, Download, ExternalLink, Save, Settings2, Upload, UtensilsCrossed } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { HistoryEditor, IngredientEditor, MealPlanEditor, PickDishEditor, RecipeEditor } from '../components/DataEditors'
import { HistorySection, IngredientsSection, MenuSection, PickDishSection } from '../components/ManageSections'
import { validateImport } from '../logic/importValidation'
import { normalizeData } from '../data/db'
import { useApp } from '../state/AppContext'
import type { AppData, Ingredient, MealHistory, MealPlan, PickDishItem, Recipe } from '../types'

type Section = 'ingredients' | 'pickDishes' | 'recipes' | 'history' | 'backup' | 'settings'
type EditorState<T> = T | null | undefined

export function ManagePage() {
  const { data, updateData, notify } = useApp()
  const [section, setSection] = useState<Section>('ingredients')
  const [ingredientEditor, setIngredientEditor] = useState<EditorState<Ingredient>>()
  const [pickDishEditor, setPickDishEditor] = useState<EditorState<PickDishItem>>()
  const [recipeEditor, setRecipeEditor] = useState<EditorState<Recipe>>()
  const [planEditor, setPlanEditor] = useState<EditorState<MealPlan>>()
  const [historyEditor, setHistoryEditor] = useState<EditorState<MealHistory>>()

  const saveItem = <T extends { id: string }>(key: 'ingredients' | 'pickDishItems' | 'recipes' | 'mealPlans' | 'history', value: T, message: string) => {
    updateData((current) => ({ ...current, [key]: [...(current[key] as unknown as T[]).filter((item) => item.id !== value.id), value] }), message)
  }

  return <div className="manage-page">
    <header className="manage-header"><div><p className="eyebrow">what to eat</p><h1>我的晚餐资料</h1><p>每类数据都可以新增、编辑、删除或批量恢复</p></div><Settings2 /></header>
    <Link className="manage-link-card" to="/takeout"><span className="manage-icon orange"><UtensilsCrossed /></span><div><strong>管理外卖候选</strong><small>{data.takeouts.length} 个候选 · 新增、编辑或删除</small></div><ChevronRight /></Link>
    <div className="manage-tabs" role="tablist">{([['ingredients', '食材'], ['pickDishes', '自选菜'], ['recipes', '菜品套餐'], ['history', '记录'], ['backup', '上传备份'], ['settings', '设置']] as [Section, string][]).map(([id, label]) => <button key={id} role="tab" aria-selected={section === id} className={section === id ? 'active' : ''} onClick={() => setSection(id)}>{label}</button>)}</div>

    {section === 'ingredients' && <IngredientsSection data={data} updateData={updateData} onEdit={setIngredientEditor} />}
    {section === 'pickDishes' && <PickDishSection data={data} updateData={updateData} onEdit={setPickDishEditor} />}
    {section === 'recipes' && <MenuSection data={data} updateData={updateData} editRecipe={setRecipeEditor} editPlan={setPlanEditor} />}
    {section === 'history' && <HistorySection data={data} updateData={updateData} onEdit={setHistoryEditor} />}
    {section === 'backup' && <BackupPanel data={data} updateData={updateData} notify={notify} />}
    {section === 'settings' && <SettingsPanel data={data} updateData={updateData} notify={notify} />}

    {ingredientEditor !== undefined && <IngredientEditor initial={ingredientEditor} onClose={() => setIngredientEditor(undefined)} onSave={(value) => { saveItem('ingredients', value, '食材已保存'); setIngredientEditor(undefined) }} />}
    {pickDishEditor !== undefined && <PickDishEditor initial={pickDishEditor} onClose={() => setPickDishEditor(undefined)} onSave={(value) => { saveItem('pickDishItems', value, '自选菜已保存'); setPickDishEditor(undefined) }} />}
    {recipeEditor !== undefined && <RecipeEditor initial={recipeEditor} ingredients={data.ingredients} onClose={() => setRecipeEditor(undefined)} onSave={(value) => { saveItem('recipes', value, '菜品已保存'); setRecipeEditor(undefined) }} />}
    {planEditor !== undefined && <MealPlanEditor initial={planEditor} recipes={data.recipes} onClose={() => setPlanEditor(undefined)} onSave={(value) => { saveItem('mealPlans', value, '套餐已保存'); setPlanEditor(undefined) }} />}
    {historyEditor !== undefined && <HistoryEditor initial={historyEditor} onClose={() => setHistoryEditor(undefined)} onSave={(value) => { saveItem('history', value, '用餐记录已保存'); setHistoryEditor(undefined) }} />}
  </div>
}

function BackupPanel({ data, updateData, notify }: { data: AppData; updateData: (updater: (current: AppData) => AppData, message?: string) => void; notify: (message: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url; anchor.download = `what-to-eat-${new Date().toISOString().slice(0, 10)}.json`; anchor.click()
    URL.revokeObjectURL(url); notify('数据备份已导出')
  }
  const importFile = async (file: File) => {
    try {
      const value: unknown = JSON.parse(await file.text())
      if (!validateImport(value)) return notify('上传失败：JSON 数据格式不符合要求')
      if (window.confirm('上传恢复会覆盖当前全部数据，确定继续吗？')) updateData(() => normalizeData(value), '全部数据已恢复')
    } catch { notify('上传失败：无法读取这个 JSON 文件') }
  }
  return <section className="manage-section">
    <div className="backup-hero"><Database /><h2>批量上传或导出</h2><p>JSON 文件包含食材、自选菜、菜品、套餐、外卖、历史、采购清单和设置。</p></div>
    <button className="action-row" onClick={exportData}><Download /><div><strong>导出全部数据</strong><small>下载 JSON 备份文件</small></div><ChevronRight /></button>
    <button className="action-row" onClick={() => fileRef.current?.click()}><Upload /><div><strong>上传 JSON 恢复</strong><small>选择文件后会校验并二次确认</small></div><ChevronRight /></button>
    <input ref={fileRef} hidden type="file" accept="application/json,.json" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importFile(file); event.target.value = '' }} />
    <div className="backup-note"><ArchiveRestore /><p>单条数据请使用对应的新增、编辑、删除界面；这里适合整批迁移。</p></div>
  </section>
}

function SettingsPanel({ data, updateData, notify }: { data: AppData; updateData: (updater: (current: AppData) => AppData, message?: string) => void; notify: (message: string) => void }) {
  const [url, setUrl] = useState(data.settings.groceryUrl)
  return <section className="manage-section"><div className="section-heading"><div><p className="eyebrow">常用服务</p><h2>买菜平台网址</h2></div></div>
    <form className="settings-form" onSubmit={(event) => { event.preventDefault(); if (url && !/^https?:\/\//i.test(url)) return notify('网址需要以 http:// 或 https:// 开头'); updateData((current) => ({ ...current, settings: { ...current.settings, groceryUrl: url.trim() } }), '设置已保存') }}>
      <label>平台网址<input type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com" /><small>“去买菜”会先复制清单，再打开这个网址。</small></label>
      <button className="primary-button" type="submit"><Save />保存修改</button>
    </form>
    {data.settings.groceryUrl && <a className="test-link" target="_blank" rel="noreferrer" href={data.settings.groceryUrl}><ExternalLink />测试打开</a>}
  </section>
}
