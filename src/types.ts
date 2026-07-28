export type IngredientCategory = '肉蛋' | '蔬菜' | '主食' | '豆制品' | '其他'
export type Difficulty = '简单' | '中等' | '进阶'
export type RecipeTag = '省时间' | '少洗锅' | '清淡' | '一锅完成'
export type TakeoutCategory = string
export type PickDishCategory = '火锅' | '水煮菜' | '卤菜'

export interface Portion { ingredientId: string; amount: number; unit: string }
export interface Substitution { ingredientId: string; alternatives: string[] }

export interface Ingredient {
  id: string
  name: string
  category: IngredientCategory
  emoji: string
  image?: string
  enabled: boolean
}

export interface Recipe {
  id: string
  name: string
  description: string
  required: Portion[]
  optional: Portion[]
  substitutions: Substitution[]
  pantry: Portion[]
  steps: string[]
  minutes: number
  difficulty: Difficulty
  tags: RecipeTag[]
  color: string
  image?: string
}

export interface MealPlan {
  id: string
  name: string
  recipeIds: string[]
  reason: string
  tags: RecipeTag[]
  image?: string
}

export interface TakeoutOption {
  id: string
  name: string
  category: TakeoutCategory
  price: number
  minutes: number
  lastEatenAt?: string
  color: string
  image?: string
}

export interface PickDishItem {
  id: string
  name: string
  categories: PickDishCategory[]
  unit: string
  enabled: boolean
}

export interface MealHistory {
  id: string
  kind: 'recipe' | 'mealPlan' | 'takeout'
  itemId: string
  name: string
  eatenAt: string
}

export interface UserPreference {
  itemId: string
  favorite: boolean
  rejectedCount: number
}

export interface ShoppingItem {
  id: string
  name: string
  amount: number
  unit: string
  status: 'needed' | 'have' | 'bought'
  custom?: boolean
}

export interface AppSettings {
  groceryUrl: string
  takeoutCategories: string[]
}

export interface AppData {
  version: 1
  ingredients: Ingredient[]
  recipes: Recipe[]
  mealPlans: MealPlan[]
  takeouts: TakeoutOption[]
  pickDishItems: PickDishItem[]
  history: MealHistory[]
  preferences: UserPreference[]
  shopping: ShoppingItem[]
  settings: AppSettings
}
