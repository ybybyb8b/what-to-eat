import { Home, Lightbulb, ListChecks, Settings2 } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../state/AppContext'

const navItems = [
  {to:'/',label:'首页',icon:Home},
  {to:'/ingredients',label:'灵感',icon:Lightbulb},
  {to:'/recommendations',label:'计划',icon:ListChecks},
  {to:'/manage',label:'我的',icon:Settings2}
]

export function AppShell() {
  const {storageError,toast} = useApp()
  const location=useLocation()
  const hideNav=['/ingredients','/recommendations','/plan','/shopping'].some((path)=>location.pathname.startsWith(path))
  return <div className="app-frame">
    {storageError && <div className="storage-alert" role="alert">{storageError}</div>}
    <main className={hideNav?'page no-nav':'page'}><Outlet/></main>
    {!hideNav && <nav className="bottom-nav" aria-label="主要导航">{navItems.map(({to,label,icon:Icon})=><NavLink key={to} to={to} end={to==='/'}><Icon aria-hidden="true"/><span>{label}</span></NavLink>)}</nav>}
    {toast && <div className="toast" role="status">{toast}</div>}
  </div>
}
