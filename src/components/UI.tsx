import { ArrowLeft, Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'

export function PageHeader({title,action,subtitle}:{title:string;action?:ReactNode;subtitle?:string}) {
  const navigate=useNavigate()
  return <header className="page-header"><button className="icon-button" onClick={()=>navigate(-1)} aria-label="返回"><ArrowLeft/></button><div><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div><div className="header-action">{action}</div></header>
}

export function SearchField({value,onChange,placeholder='搜索'}:{value:string;onChange:(value:string)=>void;placeholder?:string}) {
  return <label className="search-field"><Search aria-hidden="true"/><span className="sr-only">{placeholder}</span><input value={value} onChange={(event)=>onChange(event.target.value)} placeholder={placeholder}/>{value&&<button onClick={()=>onChange('')} aria-label="清空搜索"><X/></button>}</label>
}

export function EmptyState({icon='🍽️',title,description,action}:{icon?:string;title:string;description:string;action?:ReactNode}) {return <div className="empty-state"><span className="empty-icon" aria-hidden="true">{icon}</span><h2>{title}</h2><p>{description}</p>{action}</div>}

export function Modal({title,children,onClose}:{title:string;children:ReactNode;onClose:()=>void}) {return <div className="modal-backdrop" role="presentation" onMouseDown={(event)=>{if(event.target===event.currentTarget)onClose()}}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header><h2 id="modal-title">{title}</h2><button className="icon-button" onClick={onClose} aria-label="关闭"><X/></button></header>{children}</section></div>}
