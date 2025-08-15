import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { SidebarProvider } from './contexts/SidebarContext'

// Load dev helpers in development
if (import.meta.env.DEV) {
  import('./utils/testHelpers');
  import('./utils/devApiTest');
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <SidebarProvider>
        <App />
      </SidebarProvider>
    </AuthProvider>
  </StrictMode>,
)
