import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { AppProvider } from './state/AppContext'
import './styles.css'

registerSW({immediate:true})

createRoot(document.getElementById('root')!).render(<StrictMode><HashRouter><AppProvider><App/></AppProvider></HashRouter></StrictMode>)
