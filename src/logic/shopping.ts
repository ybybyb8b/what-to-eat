import type { Ingredient, MealPlan, Recipe, ShoppingItem } from '../types'

export function mergePortions(portions: {ingredientId:string; amount:number; unit:string}[]) {
  const merged = new Map<string, {ingredientId:string; amount:number; unit:string}>()
  for (const portion of portions) {
    const key = `${portion.ingredientId}:${portion.unit}`
    const current = merged.get(key)
    merged.set(key, {...portion, amount:(current?.amount ?? 0) + portion.amount})
  }
  return [...merged.values()]
}

export function buildShoppingList(plan: MealPlan, recipes: Recipe[], ingredients: Ingredient[]): ShoppingItem[] {
  const portions = plan.recipeIds.flatMap((id) => recipes.find((recipe) => recipe.id === id)?.required ?? [])
  return mergePortions(portions).map((item) => ({id:`${item.ingredientId}-${item.unit}`,name:ingredients.find((ingredient) => ingredient.id === item.ingredientId)?.name ?? item.ingredientId,amount:item.amount,unit:item.unit,status:'needed'}))
}
