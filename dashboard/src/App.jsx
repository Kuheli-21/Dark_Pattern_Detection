import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth } from './routes/RequireAuth';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Overview } from './pages/Overview';
import { History } from './pages/History';
import { WebsiteRiskScores } from './pages/WebsiteRiskScores';

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
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/"
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

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
