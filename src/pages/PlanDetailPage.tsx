import { ArrowRight, Clock3, RefreshCw, ShoppingBasket } from 'lucide-react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../components/UI'
import { buildShoppingList, mergePortions } from '../logic/shopping'
import { pantryNames } from '../data/seed'
import { useApp } from '../state/AppContext'

export function PlanDetailPage(){
  const {id}=useParams();const navigate=useNavigate();const {data,setSelectedPlanId,setShopping}=useApp();const plan=data.mealPlans.find((item)=>item.id===id);if(!plan)return <Navigate to="/recommendations" replace/>
  const recipes=plan.recipeIds.map((recipeId)=>data.recipes.find((recipe)=>recipe.id===recipeId)).filter((recipe):recipe is NonNullable<typeof recipe>=>Boolean(recipe));const portions=mergePortions(recipes.flatMap((recipe)=>[...recipe.required,...recipe.optional]));const minutes=Math.max(...recipes.map((recipe)=>recipe.minutes));
  const toShopping=()=>{setSelectedPlanId(plan.id);setShopping(buildShoppingList(plan,data.recipes,data.ingredients));navigate('/shopping')}
  return <div className="sub-page plan-page"><PageHeader title="今晚的晚餐方案"/>
    <section className="plan-hero"><span className="eyebrow">两人份 · 今晚菜单</span><h1>{plan.name}</h1><p>{plan.reason}</p><div><span><Clock3/>约 {minutes} 分钟</span><span>难度：{recipes.some((recipe)=>recipe.difficulty==='中等')?'中等':'简单'}</span></div></section>
    <section className="detail-card"><h2>包含的菜品</h2>{recipes.map((recipe,index)=><article className="recipe-row" key={recipe.id}>{recipe.image?<img className="recipe-thumb" src={recipe.image} alt=""/>:<span className={`dish-dot tone-${index+1}`}>{index+1}</span>}<div><strong>{recipe.name}</strong><p>{recipe.description}</p></div><span>{recipe.minutes} 分钟</span></article>)}</section>
    <section className="detail-card"><h2>两人份食材</h2><div className="portion-grid">{portions.map((portion)=><div key={`${portion.ingredientId}-${portion.unit}`}><span>{data.ingredients.find((item)=>item.id===portion.ingredientId)?.name??portion.ingredientId}</span><strong>{portion.amount}{portion.unit}</strong></div>)}</div><p className="muted-note">家中常备：{pantryNames.join('、')}</p></section>
    <section className="detail-card"><h2>简要制作步骤</h2>{recipes.map((recipe)=><div className="steps" key={recipe.id}><h3>{recipe.name}</h3>{recipe.steps.map((step,index)=><div key={step}><span>{index+1}</span><p>{step}</p></div>)}</div>)}</section>
    <section className="detail-card"><h2>可以替换或省略</h2>{recipes.flatMap((recipe)=>recipe.substitutions.map((item)=><p key={`${recipe.id}-${item.ingredientId}`} className="replace-row"><strong>{data.ingredients.find((ingredient)=>ingredient.id===item.ingredientId)?.name}</strong><ArrowRight/> {item.alternatives.join(' / ')}</p>))}{recipes.every((recipe)=>recipe.substitutions.length===0)&&<p className="muted-note">可选食材都可以省略，不影响主菜完成。</p>}</section>
    <div className="sticky-action dual-action"><button className="secondary-button" onClick={()=>navigate('/recommendations')}><RefreshCw/>重新选择</button><button className="primary-button" onClick={toShopping}>生成采购清单<ShoppingBasket/></button></div>
  </div>
}
