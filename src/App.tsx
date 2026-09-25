import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Commandes } from './pages/Commandes';
import { Livreurs } from './pages/Livreurs';
import { ImportExport } from './pages/ImportExport';
import { Rapport } from './pages/Rapport';
import { Diagnostic } from './pages/Diagnostic';
import { Login } from './pages/Login';
import { fetchCommandes, subscribeToDataChanges } from './lib/dataStore';

function MainLayout({ pendingCount }: { pendingCount: number }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#0c1322] text-[#0b1c30] dark:text-[#eaf1ff] flex transition-colors duration-200">
      {/* Persistent Sidebar for Desktop (240px wide), Slide-over on mobile/tablet */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingOrdersCount={pendingCount}
      />

      {/* Main Area: offset by 240px on md screens */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/commandes" element={<Commandes />} />
            <Route path="/livreurs" element={<Livreurs />} />
            <Route path="/import-export" element={<ImportExport />} />
            <Route path="/rapport" element={<Rapport />} />
            <Route path="/diagnostic" element={<Diagnostic />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [pendingCount, setPendingCount] = useState(0);

  const updateCounts = async () => {
    const list = await fetchCommandes();
    const count = list.filter((c) => c.statut === 'en_attente').length;
    setPendingCount(count);
  };

  useEffect(() => {
    updateCounts();
    const unsubscribe = subscribeToDataChanges(updateCounts);
    return () => unsubscribe();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Standalone Login Page matching reference image conex.jpg */}
            <Route path="/login" element={<Login />} />

            {/* Standard Dashboard & Ops Layout */}
            <Route path="/*" element={<MainLayout pendingCount={pendingCount} />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
