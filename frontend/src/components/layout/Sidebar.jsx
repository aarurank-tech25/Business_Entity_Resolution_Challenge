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
  ShieldCheck,
  Radio,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Server,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const { apiStatus, isMockMode, toggleMockMode } = useApp();

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
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                <span>EntityResolve</span>
                <span className="text-indigo-400 font-extrabold text-xs px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-800/50">
                  AI
                </span>
              </div>
              <div className="text-[11px] text-slate-400 tracking-wide font-normal">
                Business Entity Resolution
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Mode Notice Badge if active */}
        {isMockMode && (
          <div className="mx-3 mt-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2 text-amber-300 text-xs">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span className="truncate">Demo Preview Active</span>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
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
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-smooth ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
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
        <div className="mx-3 my-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-[11px]">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="font-medium">System Pipeline</span>
            <span className="text-[10px] text-indigo-400">S1 ↔ S2, S3</span>
          </div>
          <div className="text-[10px] text-slate-400 leading-relaxed">
            Candidate Blocking • ML Scoring • Decision
          </div>
        </div>

        {/* Bottom Section: API Status & User Profile */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-3">
          {/* API Connection Indicator */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-slate-900/80 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  apiStatus === 'connected'
                    ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                    : apiStatus === 'checking'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-rose-400'
                }`}
              />
              <span className="text-slate-300 text-[11px]">
                {apiStatus === 'connected'
                  ? 'API Connected'
                  : apiStatus === 'checking'
                  ? 'Connecting...'
                  : 'API Offline'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">FastAPI</span>
          </div>

          {/* User Profile Card */}
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-inner">
              M4
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-slate-200 truncate">
                Member 4
              </div>
              <div className="text-[10px] text-slate-400 truncate">
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
