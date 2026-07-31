import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth } from './routes/RequireAuth';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Overview } from './pages/Overview';
import { History } from './pages/History';
import { WebsiteRiskScores } from './pages/WebsiteRiskScores';

// Lazy-load Landing component so GSAP animation bundle is split from dashboard bundle
const Landing = React.lazy(() => import('./pages/Landing'));

function AppLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Landing Page (Code-split with GSAP animations) */}
        <Route
          path="/"
          element={
            <Suspense
              fallback={
                <div className="flex h-screen items-center justify-center bg-dark-bg text-neon-cyan" style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: '#070a13', color: '#8b5cf6' }}>
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-cyan border-t-transparent" style={{ width: '32px', height: '32px', border: '2px solid #8b5cf6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </div>
              }
            >
              <Landing />
            </Suspense>
          }
        />

        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/overview"
          element={
            <RequireAuth>
              <AppLayout>
                <Overview />
              </AppLayout>
            </RequireAuth>
          }
        />

        <Route
          path="/history"
          element={
            <RequireAuth>
              <AppLayout>
                <History />
              </AppLayout>
            </RequireAuth>
          }
        />

        <Route
          path="/website-scores"
          element={
            <RequireAuth>
              <AppLayout>
                <WebsiteRiskScores />
              </AppLayout>
            </RequireAuth>
          }
        />

        {/* Catch-all redirect to public landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

