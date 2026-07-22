import { describe, expect, it } from 'vitest'
import { seedMealPlans, seedRecipes } from '../data/seed'
import { recipeMatch, scoreMealPlan, sortMealPlans } from './recommendation'
import type { MealHistory } from '../types'

describe('推荐逻辑', () => {
  it('根据所选食材计算匹配度', () => {
    const recipe=seedRecipes.find((item)=>item.id==='potato-chicken')!
    expect(recipeMatch(recipe,['chicken-leg'])).toBe(.5)
    expect(recipeMatch(recipe,['chicken-leg','potato'])).toBe(1)
  })

  it('优先排列食材覆盖率更高的方案', () => {
    const result=sortMealPlans(seedMealPlans,seedRecipes,['chicken-leg','tomato','egg'],[],[],[])
    expect(result[0].plan.id).toBe('plan-1')
    expect(result[0].score).toBeGreaterThan(result.at(-1)!.score)
  })

  it('最近吃过的菜品会降权', () => {
    const plan=seedMealPlans[0]
    const now=new Date('2026-07-22T12:00:00.000Z')
    const history:MealHistory[]=[{id:'h1',kind:'mealPlan',itemId:plan.id,name:plan.name,eatenAt:'2026-07-21T12:00:00.000Z'}]
    const normal=scoreMealPlan(plan,seedRecipes,['chicken-leg','potato','tomato','egg'],[],[],[],now)
    const recent=scoreMealPlan(plan,seedRecipes,['chicken-leg','potato','tomato','egg'],[],[],history,now)
    expect(recent).toBeLessThan(normal)
    expect(normal-recent).toBe(24)
  })
})
