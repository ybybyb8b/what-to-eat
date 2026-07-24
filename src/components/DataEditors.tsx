import { useState, type FormEvent } from 'react'
import { Check } from 'lucide-react'
import { createId } from '../utils/id'
import { Modal } from './UI'
import { ImageField } from './ImageField'
import type { Difficulty, Ingredient, IngredientCategory, MealHistory, MealPlan, Recipe, RecipeTag } from '../types'

const ingredientCategories: IngredientCategory[] = ['肉蛋', '蔬菜', '主食', '豆制品', '其他']
const recipeTags: RecipeTag[] = ['省时间', '少洗锅', '清淡', '一锅完成']

interface EditorProps<T> {
  initial: T | null
  onClose: () => void
  onSave: (value: T) => void
}

export function IngredientEditor({ initial, onClose, onSave }: EditorProps<Ingredient>) {
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<IngredientCategory>(initial?.category ?? '其他')
  const [image, setImage] = useState(initial?.image)
  const [enabled, setEnabled] = useState(initial?.enabled ?? true)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    onSave({ id: initial?.id ?? createId(), name: name.trim(), category, emoji: initial?.emoji ?? '', image, enabled })
  }

  return <Modal title={initial ? '编辑食材' : '新增食材'} onClose={onClose}>
    <form className="form-stack" onSubmit={submit}>
      <label>食材名称<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：西兰花" /></label>
      <label>分类<select value={category} onChange={(event) => setCategory(event.target.value as IngredientCategory)}>{ingredientCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
      <ImageField image={image} onChange={setImage} label="食材图片（可选）" />
      <label className="checkbox-line"><input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />在食材选择页显示</label>
      <button className="primary-button" type="submit">保存食材</button>
    </form>
  </Modal>
}

function ChoiceGrid({ items, selected, onChange }: { items: { id: string; name: string }[]; selected: string[]; onChange: (ids: string[]) => void }) {
  return <div className="choice-check-grid">{items.map((item) => <label className={selected.includes(item.id) ? 'choice-check active' : 'choice-check'} key={item.id}>
    <input className="sr-only" type="checkbox" checked={selected.includes(item.id)} onChange={() => onChange(selected.includes(item.id) ? selected.filter((id) => id !== item.id) : [...selected, item.id])} />
    <span className="choice-check-indicator" aria-hidden="true">{selected.includes(item.id) && <Check />}</span>
    <span>{item.name}</span>
  </label>)}</div>
}

export function RecipeEditor({ initial, ingredients, onClose, onSave }: EditorProps<Recipe> & { ingredients: Ingredient[] }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [minutes, setMinutes] = useState(initial?.minutes ?? 25)
  const [difficulty, setDifficulty] = useState<Difficulty>(initial?.difficulty ?? '简单')
  const [requiredIds, setRequiredIds] = useState(initial?.required.map((item) => item.ingredientId) ?? [])
  const [optionalIds, setOptionalIds] = useState(initial?.optional.map((item) => item.ingredientId) ?? [])
  const [tags, setTags] = useState<RecipeTag[]>(initial?.tags ?? [])
  const [steps, setSteps] = useState(initial?.steps.join('\n') ?? '')
  const [image, setImage] = useState(initial?.image)

  const portions = (ids: string[], existing: Recipe['required']) => ids.map((id) => existing.find((item) => item.ingredientId === id) ?? { ingredientId: id, amount: 1, unit: '份' })
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !requiredIds.length) return
    onSave({
      id: initial?.id ?? createId(), name: name.trim(), description: description.trim(),
      required: portions(requiredIds, initial?.required ?? []), optional: portions(optionalIds, initial?.optional ?? []),
      substitutions: initial?.substitutions ?? [], pantry: initial?.pantry ?? [],
      steps: steps.split('\n').map((item) => item.trim()).filter(Boolean), minutes, difficulty, tags,
      color: initial?.color ?? '#e99458', image
    })
  }

  return <Modal title={initial ? '编辑菜品' : '新增菜品'} onClose={onClose}>
    <form className="form-stack editor-scroll" onSubmit={submit}>
      <label>菜品名称<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：青椒肉丝" /></label>
      <ImageField image={image} onChange={setImage} label="菜品图片（可选）" />
      <label>简短介绍<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="口味和推荐理由" /></label>
      <div className="field-row">
        <label>预计分钟<input type="number" min="1" value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} /></label>
        <label>难度<select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}><option>简单</option><option>中等</option><option>进阶</option></select></label>
      </div>
      <fieldset><legend>必需食材（至少选一种）</legend><ChoiceGrid items={ingredients} selected={requiredIds} onChange={setRequiredIds} /></fieldset>
      <fieldset><legend>可选食材</legend><ChoiceGrid items={ingredients} selected={optionalIds} onChange={setOptionalIds} /></fieldset>
      <fieldset><legend>标签</legend><ChoiceGrid items={recipeTags.map((tag) => ({ id: tag, name: tag }))} selected={tags} onChange={(ids) => setTags(ids as RecipeTag[])} /></fieldset>
      <label>制作步骤<textarea rows={5} value={steps} onChange={(event) => setSteps(event.target.value)} placeholder={'每行一个步骤\n例如：食材切块备用'} /></label>
      <button className="primary-button" type="submit" disabled={!requiredIds.length}>保存菜品</button>
    </form>
  </Modal>
}

export function MealPlanEditor({ initial, recipes, onClose, onSave }: EditorProps<MealPlan> & { recipes: Recipe[] }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [reason, setReason] = useState(initial?.reason ?? '')
  const [recipeIds, setRecipeIds] = useState(initial?.recipeIds ?? [])
  const [tags, setTags] = useState<RecipeTag[]>(initial?.tags ?? [])
  const [image, setImage] = useState(initial?.image)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !recipeIds.length) return
    onSave({ id: initial?.id ?? createId(), name: name.trim(), reason: reason.trim(), recipeIds, tags, image })
  }
  return <Modal title={initial ? '编辑套餐' : '新增套餐'} onClose={onClose}>
    <form className="form-stack editor-scroll" onSubmit={submit}>
      <label>套餐名称<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：家常两菜一汤" /></label>
      <ImageField image={image} onChange={setImage} label="套餐封面（可选）" />
      <label>推荐理由<textarea value={reason} onChange={(event) => setReason(event.target.value)} /></label>
      <fieldset><legend>包含菜品（至少选一道）</legend><ChoiceGrid items={recipes} selected={recipeIds} onChange={setRecipeIds} /></fieldset>
      <fieldset><legend>标签</legend><ChoiceGrid items={recipeTags.map((tag) => ({ id: tag, name: tag }))} selected={tags} onChange={(ids) => setTags(ids as RecipeTag[])} /></fieldset>
      <button className="primary-button" type="submit" disabled={!recipeIds.length}>保存套餐</button>
    </form>
  </Modal>
}

export function HistoryEditor({ initial, onClose, onSave }: EditorProps<MealHistory>) {
  const [name, setName] = useState(initial?.name ?? '')
  const [kind, setKind] = useState<MealHistory['kind']>(initial?.kind ?? 'mealPlan')
  const [date, setDate] = useState((initial?.eatenAt ?? new Date().toISOString()).slice(0, 10))
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    const id = initial?.id ?? createId()
    onSave({ id, itemId: initial?.itemId ?? `manual-${id}`, name: name.trim(), kind, eatenAt: new Date(`${date}T12:00:00`).toISOString() })
  }
  return <Modal title={initial ? '编辑用餐记录' : '新增用餐记录'} onClose={onClose}>
    <form className="form-stack" onSubmit={submit}>
      <label>吃了什么<input required value={name} onChange={(event) => setName(event.target.value)} /></label>
      <div className="field-row">
        <label>类型<select value={kind} onChange={(event) => setKind(event.target.value as MealHistory['kind'])}><option value="mealPlan">晚餐套餐</option><option value="recipe">菜品</option><option value="takeout">外卖</option></select></label>
        <label>日期<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
      </div>
      <button className="primary-button" type="submit">保存记录</button>
    </form>
  </Modal>
}
