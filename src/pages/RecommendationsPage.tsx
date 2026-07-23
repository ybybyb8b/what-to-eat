import { Check, Clock3, Heart, ShoppingBasket, Sparkles, ThumbsDown, UtensilsCrossed } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/UI'
import { sortMealPlans } from '../logic/recommendation'
import { buildShoppingList } from '../logic/shopping'
import { useApp } from '../state/AppContext'
import type { RecipeTag } from '../types'

const filters:RecipeTag[]=['省时间','少洗锅','清淡','一锅完成']

export function RecommendationsPage(){
  const {data,selectedIngredientIds,setSelectedPlanId,setShopping,setPreference,notify}=useApp();const navigate=useNavigate();const [activeTags,setActiveTags]=useState<RecipeTag[]>([])
  const ranked=useMemo(()=>sortMealPlans(data.mealPlans,data.recipes,selectedIngredientIds,activeTags,data.preferences,data.history),[data,selectedIngredientIds,activeTags])
  const select=(planId:string)=>{const plan=data.mealPlans.find((item)=>item.id===planId);if(!plan)return;setSelectedPlanId(plan.id);setShopping(buildShoppingList(plan,data.recipes,data.ingredients));navigate(`/plan/${plan.id}`)}
  return <div className="sub-page recommendations-page"><PageHeader title="可以这样搭配" subtitle="所有方案都在，只是把更合适的排前面"/>
    <div className="filter-chips" aria-label="推荐筛选">{filters.map((filter)=><button key={filter} aria-pressed={activeTags.includes(filter)} className={activeTags.includes(filter)?'active':''} onClick={()=>setActiveTags(activeTags.includes(filter)?activeTags.filter((item)=>item!==filter):[...activeTags,filter])}>{activeTags.includes(filter)&&<Check/>}{filter}</button>)}</div>
    <div className="recommendation-list">{ranked.map(({plan,score},index)=>{const recipes=plan.recipeIds.map((id)=>data.recipes.find((recipe)=>recipe.id===id)).filter(Boolean);const required=[...new Set(recipes.flatMap((recipe)=>recipe?.required.map((item)=>item.ingredientId)??[]))];const used=required.filter((id)=>selectedIngredientIds.includes(id));const extra=required.filter((id)=>!selectedIngredientIds.includes(id));const pref=data.preferences.find((item)=>item.itemId===plan.id);return <article className={index===0?'recommendation-card featured':'recommendation-card'} key={plan.id}>
      {index===0&&<span className="recommend-badge"><Sparkles/> 推荐</span>}<div className="recommendation-art">{(plan.image??recipes.find((recipe)=>recipe?.image)?.image)?<img src={plan.image??recipes.find((recipe)=>recipe?.image)?.image} alt=""/>:<UtensilsCrossed aria-hidden="true"/>}</div><div className="recommendation-body"><div className="recommendation-title"><div><h2>{plan.name}</h2><p><Clock3/> 约 {Math.max(...recipes.map((recipe)=>recipe?.minutes??0))} 分钟 · {recipes.some((recipe)=>recipe?.difficulty==='中等')?'中等':'简单'}</p></div><span className="score-pill">匹配 {Math.max(0,Math.round(score))}</span></div>
      <div className="ingredient-summary"><span><b>用到已选</b>{used.length?used.map((id)=>data.ingredients.find((item)=>item.id===id)?.name).join('、'):'暂无'}</span><span><b>还需购买</b>{extra.length?extra.map((id)=>data.ingredients.find((item)=>item.id===id)?.name).join('、'):'无需额外核心食材'}</span></div>
      <p className="reason">{plan.reason}</p><div className="card-tags">{[...new Set([...plan.tags,...recipes.flatMap((recipe)=>recipe?.tags??[])])].slice(0,3).map((tag)=><span key={tag}>{tag}</span>)}</div>
      <div className="card-actions"><button className={pref?.favorite?'mini-action active':'mini-action'} aria-label={pref?.favorite?'取消收藏':'收藏'} onClick={()=>{setPreference(plan.id,{favorite:!pref?.favorite});notify(pref?.favorite?'已取消收藏':'已加入收藏')}}><Heart/></button><button className="mini-action" aria-label="不太想吃" onClick={()=>{setPreference(plan.id,{rejectedCount:(pref?.rejectedCount??0)+1});notify('收到，下次会降低推荐')}}><ThumbsDown/></button><button className="primary-button" onClick={()=>select(plan.id)}>选这套 <ShoppingBasket/></button></div></div>
    </article>})}</div>
  </div>
}
