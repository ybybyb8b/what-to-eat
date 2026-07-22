import { Check, Copy, ExternalLink, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { PageHeader } from '../components/UI'
import { pantryNames } from '../data/seed'
import { useApp } from '../state/AppContext'
import type { ShoppingItem } from '../types'

export function ShoppingPage(){
  const {data,selectedPlanId,setShopping,notify,addHistory}=useApp();const [newName,setNewName]=useState('');const plan=data.mealPlans.find((item)=>item.id===selectedPlanId)
  if(!plan&&data.shopping.length===0)return <Navigate to="/recommendations" replace/>
  const listText=['两人份采购清单',...data.shopping.filter((item)=>item.status!=='have').map((item)=>`${item.status==='bought'?'✓ ':'□ '}${item.name} ${item.amount}${item.unit}`)].join('\n')
  const copy=async()=>{try{await navigator.clipboard.writeText(listText);notify('采购清单已复制')}catch{notify('复制失败，请长按清单手动复制')}}
  const update=(id:string,changes:Partial<ShoppingItem>)=>setShopping(data.shopping.map((item)=>item.id===id?{...item,...changes}:item))
  const add=()=>{const name=newName.trim();if(!name){notify('请输入采购项目名称');return}setShopping([...data.shopping,{id:crypto.randomUUID(),name,amount:1,unit:'份',status:'needed',custom:true}]);setNewName('');notify('已加入清单')}
  const go=async()=>{await copy();if(!data.settings.groceryUrl){notify('请先在“我的”中设置买菜平台网址');return}addHistory({kind:'mealPlan',itemId:plan?.id??'shopping',name:plan?.name??'晚餐方案'});window.open(data.settings.groceryUrl,'_blank','noopener,noreferrer')}
  return <div className="sub-page shopping-page"><PageHeader title="两人份采购清单" subtitle={plan?.name}/>
    <section className="shopping-card"><div className="shopping-card-header"><span>需要购买</span><small>{data.shopping.filter((item)=>item.status==='bought').length}/{data.shopping.length} 已买到</small></div>{data.shopping.map((item)=><div className={`shopping-row ${item.status}`} key={item.id}><button className="status-check" onClick={()=>update(item.id,{status:item.status==='bought'?'needed':'bought'})} aria-label={`${item.name}${item.status==='bought'?'标记为未购买':'标记为已买到'}`}>{item.status==='bought'&&<Check/>}</button><span>{item.name}</span><label><span className="sr-only">{item.name}数量</span><input type="number" min="0.1" step="0.5" value={item.amount} onChange={(event)=>update(item.id,{amount:Number(event.target.value)})}/>{item.unit}</label><button className="delete-button" onClick={()=>{if(window.confirm(`删除“${item.name}”？`))setShopping(data.shopping.filter((entry)=>entry.id!==item.id))}} aria-label={`删除${item.name}`}><Trash2/></button></div>)}</section>
    <section className="shopping-card pantry-card"><h2>家里可能已有</h2>{pantryNames.map((name)=>{const item=data.shopping.find((entry)=>entry.name===name);const has=item?.status==='have';return <button className={has?'pantry-item active':'pantry-item'} key={name} onClick={()=>{if(item)update(item.id,{status:has?'needed':'have'});else setShopping([...data.shopping,{id:`pantry-${name}`,name,amount:1,unit:'份',status:'have'}])}}><span>{has&&<Check/>}</span>{name}</button>})}</section>
    <section className="shopping-card add-item"><h2>手动增加</h2><div><label className="sr-only" htmlFor="new-shopping-item">采购项目名称</label><input id="new-shopping-item" value={newName} onChange={(event)=>setNewName(event.target.value)} onKeyDown={(event)=>{if(event.key==='Enter')add()}} placeholder="例如：水果"/><button onClick={add}><Plus/>加入</button></div></section>
    <div className="sticky-action dual-action"><button className="secondary-button" onClick={copy}><Copy/>复制清单</button><button className="primary-button" onClick={go}>去买菜<ExternalLink/></button></div>
    {data.shopping.length===0&&<div className="inline-empty"><ShoppingBag/><p>清单还是空的，可以手动添加采购项目。</p></div>}
  </div>
}
