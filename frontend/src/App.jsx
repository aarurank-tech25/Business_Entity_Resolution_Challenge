import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ToastContainer from './components/common/ToastContainer';

// Pages
import Dashboard from './pages/Dashboard';
import Datasets from './pages/Datasets';
import RunMatching from './pages/RunMatching';
import Candidates from './pages/Candidates';
import Results from './pages/Results';
import ModelInsights from './pages/ModelInsights';
import Settings from './pages/Settings';

export function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 flex">
          {/* Left Sidebar */}
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
            {/* Top Fixed/Sticky Header */}
            <Header onOpenSidebar={() => setSidebarOpen(true)} />

            {/* Routed View Container */}
            <main className="flex-1 min-w-0">
              <Routes>
                {/* Redirect '/' to '/dashboard' */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/datasets" element={<Datasets />} />
                <Route path="/run-matching" element={<RunMatching />} />
                <Route path="/candidates" element={<Candidates />} />
                <Route path="/results" element={<Results />} />
                <Route path="/model-insights" element={<ModelInsights />} />
                <Route path="/settings" element={<Settings />} />
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>

            {/* Enterprise Dashboard Footer */}
            <footer className="px-6 py-4 border-t border-purple-100 bg-white/80 text-xs text-purple-900/60 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-purple-950">EntityResolve AI</span> &bull; Business Entity Resolution System
              </div>
              <div className="flex items-center gap-4 text-purple-500">
                <span>Dhinesh (Member 4) &bull; React Frontend Lead</span>
                <span>FastAPI REST Integration</span>
              </div>
            </footer>
          </div>
        </div>

        {/* Global Toast Notifications Stack */}
        <ToastContainer />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
