import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from "next-themes";
import "./i18n"; // 👈 подключаем конфигурацию


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light">
      <App />
    </ThemeProvider>
  </StrictMode>,
)
