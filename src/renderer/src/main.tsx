import './assets/main.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { HashRouter, Route, Routes } from 'react-router-dom'
import ClientManagement from './pages/ClientManagement'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HashRouter basename="/">
      <Routes>
        <Route index path="/" element={<App />} />
        <Route path="/clients" element={<ClientManagement />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
)
