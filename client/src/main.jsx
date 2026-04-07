import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#111827',
          color: '#f9fafb',
          border: '1px solid #1f2937',
          borderRadius: '12px',
        },
        success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
      }}
    />
  </StrictMode>,
)