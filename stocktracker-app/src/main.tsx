import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import StockTracker from './stock-tracker-app.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StockTracker />
  </StrictMode>,
)
