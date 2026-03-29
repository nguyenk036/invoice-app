import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';

import AuthPage from './pages/Auth';
import HomePage from './pages/Home';
import ClientsPage from './pages/Clients';
import Invoices from './pages/Invoices';
import Quotes from './pages/Quotes';
import Settings from './pages/Settings';
import InvoiceDetailPage from './pages/InvoiceDetails';

const queryClient = new QueryClient();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    // Get current session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // Listen for sign-in / sign-out events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Still checking — show nothing to avoid flash
  if (session === undefined) return null;

  // Not signed in — redirect to login
  if (session === null) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route
            path="/"
            element={
              <AuthGuard>
                <HomePage />
              </AuthGuard>
            }
          />
          <Route
            path="/clients"
            element={
              <AuthGuard>
                <ClientsPage />
              </AuthGuard>
            }
          />
          <Route
            path="/invoices"
            element={
              <AuthGuard>
                <Invoices />
              </AuthGuard>
            }
          />
          <Route
            path="/quotes"
            element={
              <AuthGuard>
                <Quotes />
              </AuthGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthGuard>
                <Settings />
              </AuthGuard>
            }
          />
          <Route
            path="/invoices/:id"
            element={
              <AuthGuard>
                <InvoiceDetailPage />
              </AuthGuard>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
