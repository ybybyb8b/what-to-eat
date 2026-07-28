import type { AppData } from '../types'

export function validateImport(input: unknown): input is AppData {
  if (!input || typeof input !== 'object') return false
  const value = input as Record<string, unknown>
  if (value.version !== 1) return false
  const arrays = ['ingredients','recipes','mealPlans','takeouts','history','preferences','shopping']
  if (!arrays.every((key) => Array.isArray(value[key]))) return false
  if (value.pickDishItems !== undefined && !Array.isArray(value.pickDishItems)) return false
  if (!value.settings || typeof value.settings !== 'object') return false
  return (value.ingredients as unknown[]).every((item) => Boolean(item && typeof item === 'object' && typeof (item as Record<string,unknown>).id === 'string' && typeof (item as Record<string,unknown>).name === 'string'))
    && (value.recipes as unknown[]).every((item) => Boolean(item && typeof item === 'object' && Array.isArray((item as Record<string,unknown>).required) && Array.isArray((item as Record<string,unknown>).steps)))
}
