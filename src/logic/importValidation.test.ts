import { describe, expect, it } from 'vitest'
import { seedData } from '../data/seed'
import { validateImport } from './importValidation'

describe('导入数据校验', () => {
  it('接受完整的版本 1 数据', () => expect(validateImport(seedData)).toBe(true))
  it('拒绝版本错误或关键字段缺失的数据', () => {
    expect(validateImport({...seedData,version:2})).toBe(false)
    expect(validateImport({version:1,ingredients:[]})).toBe(false)
    expect(validateImport(null)).toBe(false)
  })
})
