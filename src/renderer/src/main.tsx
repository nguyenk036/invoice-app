import './assets/main.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { HashRouter, Route, Routes } from 'react-router-dom'
import ClientManagement from './pages/ClientManagement'
import Layout from './layout'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Layout>
      <HashRouter basename="/">
        <Routes>
          <Route index path="/" element={<App />} />
          <Route path="/clients" element={<ClientManagement />} />
        </Routes>
      </HashRouter>
    </Layout>
  </React.StrictMode>
)
