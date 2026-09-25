import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  PlayCircle,
  Users,
  CheckCircle2,
  LineChart,
  Settings,
  Layers,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const { apiStatus, isMockMode } = useApp();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/datasets', label: 'Datasets', icon: Database },
    { to: '/run-matching', label: 'Run Matching', icon: PlayCircle },
    { to: '/candidates', label: 'Candidates', icon: Users },
    { to: '/results', label: 'Results', icon: CheckCircle2 },
    { to: '/model-insights', label: 'Model Insights', icon: LineChart },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-purple-950/20 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-[#F8F5FE] text-purple-950 flex flex-col border-r border-purple-200/70 transition-transform duration-300 ease-in-out shadow-xs ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-purple-200/70 bg-white/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-purple-500/25">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-purple-950 flex items-center gap-1.5">
                <span>EntityResolve</span>
                <span className="text-purple-700 font-extrabold text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 border border-purple-200">
                  AI
                </span>
              </div>
              <div className="text-[11px] text-purple-600/80 tracking-wide font-medium">
                Business Entity Resolution
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 rounded-md text-purple-600 hover:text-purple-950 hover:bg-purple-100"
            aria-label="Close sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Mode Notice Badge if active */}
        {isMockMode && (
          <div className="mx-3 mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-900 text-xs shadow-xs">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-600" />
            <span className="truncate font-medium">Demo Preview Active</span>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-purple-400">
            Platform Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-smooth ${
                    isActive
                      ? 'bg-purple-600 text-white font-semibold shadow-sm shadow-purple-600/25'
                      : 'text-purple-900/75 hover:text-purple-950 hover:bg-purple-100/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* System Architecture Tag */}
        <div className="mx-3 my-2 p-2.5 rounded-xl bg-white/70 border border-purple-200/70 text-[11px] shadow-xs">
          <div className="flex items-center justify-between text-purple-900 mb-1">
            <span className="font-semibold">System Pipeline</span>
            <span className="text-[10px] font-semibold text-purple-600 bg-purple-100 px-1.5 py-0.2 rounded">
              S1 ↔ S2, S3
            </span>
          </div>
          <div className="text-[10px] text-purple-600/80 leading-relaxed font-medium">
            Candidate Blocking • ML Scoring • Decision
          </div>
        </div>

        {/* Bottom Section: API Status & User Profile */}
        <div className="p-3 border-t border-purple-200/70 bg-white/50 space-y-3">
          {/* API Connection Indicator */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white border border-purple-200/80 text-xs shadow-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  apiStatus === 'connected'
                    ? 'bg-emerald-500 shadow-xs shadow-emerald-500/50'
                    : apiStatus === 'checking'
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-rose-500'
                }`}
              />
              <span className="text-purple-950 text-[11px] font-medium">
                {apiStatus === 'connected'
                  ? 'API Connected'
                  : apiStatus === 'checking'
                  ? 'Connecting...'
                  : 'API Offline'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-purple-500 font-semibold">FastAPI</span>
          </div>

          {/* User Profile Card */}
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              M4
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-purple-950 truncate">
                Member 4
              </div>
              <div className="text-[10px] text-purple-600/80 truncate font-medium">
                Frontend / UI-UX Lead
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
