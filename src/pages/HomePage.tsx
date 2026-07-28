import { ArrowRight, CookingPot, Settings2, Soup } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/UI'
import { useApp } from '../state/AppContext'

export function HomePage() {
  const {data,loading}=useApp()
  const recent=data.history.slice().sort((a,b)=>b.eatenAt.localeCompare(a.eatenAt)).slice(0,3)
  return <div className="home-page">
    <header className="home-header"><div><h1>what to eat</h1><p>先看看今天想怎么吃</p></div><Link className="icon-button" to="/manage" aria-label="数据与设置"><Settings2/></Link></header>
    <section className="choice-stack" aria-label="晚餐方式">
      <Link className="choice-card takeout-choice" to="/takeout"><div><span className="choice-kicker">省时间</span><h2>点外卖</h2><p>快一点吃上热乎饭</p><span className="round-arrow"><ArrowRight/></span></div><img className="food-object takeout-object" src={`${import.meta.env.BASE_URL}assets/takeout.webp`} alt="" aria-hidden="true"/></Link>
      <Link className="choice-card cook-choice" to="/ingredients"><div><span className="choice-kicker">更新鲜</span><h2>买菜做饭</h2><p>选想吃的，搭配今晚菜单</p><span className="round-arrow"><ArrowRight/></span></div><img className="food-object grocery-object" src={`${import.meta.env.BASE_URL}assets/grocery.webp`} alt="" aria-hidden="true"/></Link>
      <Link className="choice-card pick-dish-choice" to="/pick-dishes"><span className="pick-dish-icon"><CookingPot/></span><div><span className="choice-kicker">自由搭配</span><h2>火锅 · 水煮菜 · 卤菜</h2><p>想吃什么，直接加入采购清单</p></div><ArrowRight className="pick-dish-arrow"/></Link>
    </section>
    <section className="recent-section"><div className="section-heading"><div><p className="eyebrow">你的晚餐记忆</p><h2>最近吃过</h2></div>{recent.length>0&&<Link to="/manage">查看全部</Link>}</div>
      {loading?<div className="skeleton-row" aria-label="正在读取记录"><i/><i/><i/></div>:recent.length===0?<EmptyState icon="🥢" title="还没有晚餐记录" description="选定一份外卖或晚餐方案后，这里会替你记住。"/>:<div className="recent-grid">{recent.map((item,index)=><article key={item.id} className={`recent-card food-tone-${index+1}`}><div className="mini-dish"><Soup/></div><strong>{item.name}</strong><span>{new Intl.DateTimeFormat('zh-CN',{month:'short',day:'numeric'}).format(new Date(item.eatenAt))}</span></article>)}</div>}
    </section>
  </div>
}
