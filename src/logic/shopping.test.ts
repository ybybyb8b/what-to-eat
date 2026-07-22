import { describe, expect, it } from 'vitest'
import { seedIngredients, seedMealPlans, seedRecipes } from '../data/seed'
import { buildShoppingList, mergePortions } from './shopping'

describe('采购清单', () => {
  it('合并相同食材和单位的数量', () => {
    expect(mergePortions([{ingredientId:'egg',amount:2,unit:'个'},{ingredientId:'egg',amount:1,unit:'个'}])).toEqual([{ingredientId:'egg',amount:3,unit:'个'}])
  })

  it('合并套餐内所有菜品的采购需求', () => {
    const list=buildShoppingList(seedMealPlans[0],seedRecipes,seedIngredients)
    expect(list.find((item)=>item.name==='西红柿')?.amount).toBe(2)
    expect(list.find((item)=>item.name==='鸡蛋')?.amount).toBe(2)
    expect(list.find((item)=>item.name==='鸡腿')?.amount).toBe(3)
  })
})
