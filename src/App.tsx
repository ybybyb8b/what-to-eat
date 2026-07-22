import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { HomePage } from './pages/HomePage'
import { IngredientPage } from './pages/IngredientPage'
import { ManagePage } from './pages/ManagePage'
import { PlanDetailPage } from './pages/PlanDetailPage'
import { RecommendationsPage } from './pages/RecommendationsPage'
import { ShoppingPage } from './pages/ShoppingPage'
import { TakeoutPage } from './pages/TakeoutPage'

export default function App(){return <Routes><Route element={<AppShell/>}><Route index element={<HomePage/>}/><Route path="takeout" element={<TakeoutPage/>}/><Route path="ingredients" element={<IngredientPage/>}/><Route path="recommendations" element={<RecommendationsPage/>}/><Route path="plan/:id" element={<PlanDetailPage/>}/><Route path="shopping" element={<ShoppingPage/>}/><Route path="manage" element={<ManagePage/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Route></Routes>}
