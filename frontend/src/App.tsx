import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';

// Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { Chat } from './pages/Chat';
import { Documents } from './pages/Documents';
import { Profile } from './pages/Profile';
import { SettingsPage } from './pages/Settings';
import { About } from './pages/About';

const MainWorkspace: React.FC<{ activeTab: string; onSelectTab: (tab: string) => void }> = ({ activeTab, onSelectTab }) => {
  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} onSelectTab={onSelectTab} />
      <div className="main-content">
        <Navbar currentTab={activeTab} onSelectTab={onSelectTab} />

        <div className="content-scrollable">
          {activeTab === 'dashboard' && <Dashboard onNavigate={onSelectTab} />}
          {activeTab === 'chat' && <Chat />}
          {activeTab === 'documents' && <Documents />}
          {activeTab === 'profile' && <Profile />}
          {activeTab === 'settings' && <SettingsPage />}
          {activeTab === 'about' && <About />}
        </div>

        <Footer />
      </div>
    </div>
  );
};

export const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [authPage, setAuthPage] = useState<'landing' | 'login' | 'register' | 'forgot'>('landing');

  return (
    <ProtectedRoute
      fallback={
        authPage === 'landing' ? (
          <Landing onNavigate={(p) => setAuthPage(p as any)} />
        ) : authPage === 'login' ? (
          <Login onNavigate={(p) => setAuthPage(p as any)} />
        ) : authPage === 'register' ? (
          <Register onNavigate={(p) => setAuthPage(p as any)} />
        ) : (
          <ForgotPassword onNavigate={(p) => setAuthPage(p as any)} />
        )
      }
    >
      <MainWorkspace activeTab={currentTab} onSelectTab={setCurrentTab} />
    </ProtectedRoute>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};
