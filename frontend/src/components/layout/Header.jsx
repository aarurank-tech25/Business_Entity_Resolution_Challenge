import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  ChevronRight,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header = ({ onOpenSidebar }) => {
  const location = useLocation();
  const { apiStatus, isMockMode, toggleMockMode, apiBaseUrl, checkApi } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Map route to title & breadcrumb
  const routeMeta = {
    '/dashboard': { title: 'Entity Resolution Dashboard', section: 'Overview' },
    '/datasets': { title: 'Datasets Management', section: 'Data Ingestion' },
    '/run-matching': { title: 'Run Entity Matching', section: 'Pipeline Execution' },
    '/candidates': { title: 'Candidate Analysis', section: 'Pair Inspection' },
    '/results': { title: 'Matching Results', section: 'Evaluation & Output' },
    '/model-insights': { title: 'Model Insights', section: 'Model Analytics' },
    '/settings': { title: 'System Settings', section: 'Configuration' },
  };

  const currentMeta = routeMeta[location.pathname] || {
    title: 'Entity Resolution',
    section: 'Platform',
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xs border-b border-purple-100 h-16 px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile hamburger & Page Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-purple-700 hover:bg-purple-50 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-purple-400 font-medium">
            <span>EntityResolve AI</span>
            <ChevronRight className="w-3 h-3 text-purple-300" />
            <span className="text-purple-700 font-semibold">{currentMeta.section}</span>
          </div>
          <h1 className="text-base lg:text-lg font-bold text-slate-900 leading-tight">
            {currentMeta.title}
          </h1>
        </div>
      </div>

      {/* Right: Quick actions, Status, Search, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Development Mock Mode Toggle Button */}
        <button
          onClick={() => toggleMockMode()}
          title="Toggle between Live API and Development Preview Mock Data"
          className={`hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
            isMockMode
              ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              : 'bg-purple-50/60 text-purple-800 border-purple-200 hover:bg-purple-100/60'
          }`}
        >
          {isMockMode ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="font-semibold">Demo Mode: Mock Data</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="font-medium">Live API Mode</span>
            </>
          )}
        </button>

        {/* Backend Connection Status Badge */}
        <div
          onClick={checkApi}
          title={`FastAPI Backend: ${apiBaseUrl} (Click to re-ping)`}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50/80 border border-purple-200 text-xs text-purple-900 cursor-pointer hover:bg-purple-100/80 transition-colors"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              apiStatus === 'connected'
                ? 'bg-emerald-500'
                : apiStatus === 'checking'
                ? 'bg-amber-500 animate-ping'
                : 'bg-rose-500'
            }`}
          />
          <span className="font-semibold text-[11px]">
            {apiStatus === 'connected' ? 'API Online' : apiStatus === 'checking' ? 'Checking...' : 'API Offline'}
          </span>
        </div>

        {/* Global Quick Search button / overlay */}
        <div className="relative">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 text-purple-700 hover:text-purple-950 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
            aria-label="Search records"
          >
            <Search className="w-4 h-4" />
          </button>

          {showSearch && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-purple-200 p-3 z-30 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-purple-100 text-xs font-semibold text-slate-800">
                <span>Quick Record Search</span>
                <button onClick={() => setShowSearch(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Entity ID or Business Name..."
                className="w-full text-xs px-3 py-2 bg-purple-50/30 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                autoFocus
              />
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Jump to Candidates</span>
                <Link
                  to={`/candidates${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`}
                  onClick={() => setShowSearch(false)}
                  className="text-purple-600 hover:underline font-semibold"
                >
                  View in Candidates →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-purple-700 hover:text-purple-950 hover:bg-purple-50 rounded-lg transition-colors relative cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-600 rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-purple-200 p-3 z-30">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-purple-100 text-xs font-semibold text-slate-800">
                <span>System Notifications</span>
                <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-purple-50/80 border border-purple-200/80">
                  <div className="font-semibold text-purple-950">Entity Matching Pipeline</div>
                  <p className="text-[11px] text-purple-800 mt-0.5">Ready for execution once Source 1, 2, 3 are uploaded.</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="font-medium text-slate-800">FastAPI Integration Ready</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">REST client configured for endpoint bindings.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-purple-100">
          <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            D
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-800 leading-none">Dhinesh</div>
            <div className="text-[10px] text-purple-600 mt-0.5 leading-none font-medium">Member 4 • Frontend</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
