import type { MealHistory, MealPlan, Recipe, RecipeTag, UserPreference } from '../types'

const dayMs = 86_400_000

export function recipeMatch(recipe: Recipe, selectedIds: string[]) {
  const selected = new Set(selectedIds)
  const required = recipe.required.map((item) => item.ingredientId)
  const matched = required.filter((id) => selected.has(id))
  return required.length ? matched.length / required.length : 0
}

export function scoreMealPlan(plan: MealPlan, recipes: Recipe[], selectedIds: string[], activeTags: RecipeTag[], preferences: UserPreference[], history: MealHistory[], now = new Date()) {
  const included = plan.recipeIds.map((id) => recipes.find((recipe) => recipe.id === id)).filter((recipe): recipe is Recipe => Boolean(recipe))
  const allRequired = [...new Set(included.flatMap((recipe) => recipe.required.map((item) => item.ingredientId)))]
  const selected = new Set(selectedIds)
  const matched = allRequired.filter((id) => selected.has(id)).length
  const coverage = allRequired.length ? matched / allRequired.length : 0
  const extraCore = Math.max(0, allRequired.length - matched)
  const minutes = Math.max(...included.map((recipe) => recipe.minutes), 0)
  const tags = new Set([...plan.tags, ...included.flatMap((recipe) => recipe.tags)])
  const tagMatches = activeTags.filter((tag) => tags.has(tag)).length
  const itemIds = new Set([plan.id, ...plan.recipeIds])
  const favoriteBonus = preferences.filter((pref) => itemIds.has(pref.itemId) && pref.favorite).length * 12
  const rejectionPenalty = preferences.filter((pref) => itemIds.has(pref.itemId)).reduce((sum, pref) => sum + pref.rejectedCount * 8, 0)
  const recentPenalty = history.filter((entry) => itemIds.has(entry.itemId)).reduce((sum, entry) => {
    const age = (now.getTime() - new Date(entry.eatenAt).getTime()) / dayMs
    return sum + (age <= 3 ? 24 : age <= 7 ? 12 : age <= 14 ? 5 : 0)
  }, 0)
  return coverage * 100 - extraCore * 9 + tagMatches * 18 + Math.max(0, 35 - minutes) * 0.45 + favoriteBonus - rejectionPenalty - recentPenalty
}

export function sortMealPlans(plans: MealPlan[], recipes: Recipe[], selectedIds: string[], activeTags: RecipeTag[], preferences: UserPreference[], history: MealHistory[], now = new Date()) {
  return [...plans].map((plan) => ({plan, score:scoreMealPlan(plan, recipes, selectedIds, activeTags, preferences, history, now)})).sort((a,b) => b.score - a.score || a.plan.name.localeCompare(b.plan.name, 'zh-CN'))
}
