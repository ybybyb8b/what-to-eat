import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { loadData, requestPersistentStorage, saveData } from '../data/db'
import { seedData } from '../data/seed'
import type { AppData, MealHistory, ShoppingItem, UserPreference } from '../types'

interface AppContextValue {
  data: AppData
  loading: boolean
  storageError: string
  toast: string
  selectedIngredientIds: string[]
  selectedPlanId: string
  setSelectedIngredientIds: (ids:string[]) => void
  setSelectedPlanId: (id:string) => void
  updateData: (updater:(current:AppData)=>AppData, message?:string) => void
  setPreference: (itemId:string, changes:Partial<UserPreference>) => void
  addHistory: (entry:Omit<MealHistory,'id'|'eatenAt'>) => void
  setShopping: (items:ShoppingItem[]) => void
  notify: (message:string) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({children}:{children:ReactNode}) {
  const [data,setData] = useState<AppData>(seedData)
  const [loading,setLoading] = useState(true)
  const [storageError,setStorageError] = useState('')
  const [toast,setToast] = useState('')
  const [selectedIngredientIds,setSelectedIngredientIds] = useState<string[]>([])
  const [selectedPlanId,setSelectedPlanId] = useState('')
  const hydrated = useRef(false)

  useEffect(() => {
    loadData().then((value) => {setData(value); requestPersistentStorage().catch(() => undefined)}).catch(() => setStorageError('本地数据暂时无法读取。你仍可以浏览示例内容，但修改可能不会保存。')).finally(() => {hydrated.current=true;setLoading(false)})
  },[])

  useEffect(() => {
    if (!hydrated.current) return
    const timer = window.setTimeout(() => saveData(data).then(() => setStorageError('')).catch(() => setStorageError('保存失败，请检查浏览器是否允许本地存储，并尽快导出数据备份。')), 120)
    return () => window.clearTimeout(timer)
  },[data])

  const notify = useCallback((message:string) => {setToast(message); window.setTimeout(() => setToast(''),2200)},[])
  const updateData = useCallback((updater:(current:AppData)=>AppData,message?:string) => {setData(updater);if(message) notify(message)},[notify])
  const setPreference = useCallback((itemId:string,changes:Partial<UserPreference>) => updateData((current) => {const existing=current.preferences.find((item)=>item.itemId===itemId) ?? {itemId,favorite:false,rejectedCount:0};return {...current,preferences:[...current.preferences.filter((item)=>item.itemId!==itemId),{...existing,...changes}]}}),[updateData])
  const addHistory = useCallback((entry:Omit<MealHistory,'id'|'eatenAt'>) => updateData((current)=>({...current,history:[{...entry,id:crypto.randomUUID(),eatenAt:new Date().toISOString()},...current.history]}),'已记入最近吃过'),[updateData])
  const setShopping = useCallback((items:ShoppingItem[]) => updateData((current)=>({...current,shopping:items})),[updateData])

  const value=useMemo(()=>({data,loading,storageError,toast,selectedIngredientIds,selectedPlanId,setSelectedIngredientIds,setSelectedPlanId,updateData,setPreference,addHistory,setShopping,notify}),[data,loading,storageError,toast,selectedIngredientIds,selectedPlanId,updateData,setPreference,addHistory,setShopping,notify])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {const value=useContext(AppContext);if(!value)throw new Error('useApp must be used within AppProvider');return value}
