import '@mantine/core/styles.css'
import './assets/main.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { HashRouter, Route, Routes } from 'react-router-dom'
import ClientManagement from './pages/ClientManagement'
import { MantineProvider } from '@mantine/core'
import CreateEditClient from './pages/CreateEditClient'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider>
      <HashRouter basename="/">
        <Routes>
          <Route index path="/" element={<App />} />
          <Route path="/clients" element={<ClientManagement />} />
          <Route path="/clients/create" element={<CreateEditClient />} />
        </Routes>
      </HashRouter>
    </MantineProvider>
  </React.StrictMode>
)
