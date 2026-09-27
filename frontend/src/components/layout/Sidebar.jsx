import React from 'react';
import {
  LayoutDashboard,
  Database,
  PlayCircle,
  Layers,
  CheckCircle2,
  LineChart,
  Settings,
  Boxes,
  ExternalLink,
} from 'lucide-react';
import Badge from '../common/Badge';

export const Sidebar = ({ activeTab, onSelectTab }) => {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      desc: 'System health & summary',
    },
    {
      id: 'datasets',
      label: 'Datasets',
      icon: Database,
      desc: 'TSV ingestion & preview',
    },
    {
      id: 'matching',
      label: 'Run Matching',
      icon: PlayCircle,
      desc: 'Pipeline execution & validation',
    },
    {
      id: 'candidates',
      label: 'Candidates',
      icon: Layers,
      desc: 'Blocking & candidate pairs',
    },
    {
      id: 'results',
      label: 'Results',
      icon: CheckCircle2,
      desc: 'Cross-entity matched clusters',
    },
    {
      id: 'insights',
      label: 'Model Insights',
      icon: LineChart,
      desc: 'F0.5, precision & recall',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      desc: 'Configuration & environment',
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 border-r border-slate-800 flex flex-col shrink-0 select-none">
      {/* Brand logo & title */}
      <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
              <span>EntityResolve</span>
              <span className="text-[10px] font-semibold text-purple-400 bg-purple-950/80 px-1 rounded border border-purple-800/50">AI</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">v1.0.0-backend</div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
          Entity Resolution
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group ${
                isActive
                  ? 'bg-purple-600 text-white font-medium shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate leading-tight">{item.label}</div>
                <div
                  className={`text-[10px] truncate leading-tight mt-0.5 ${
                    isActive ? 'text-purple-200' : 'text-slate-300'
                  }`}
                >
                  {item.desc}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Pipeline Status Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-300 uppercase">ML Pipeline</span>
            <Badge variant="purple" size="xs">M1 / M2 Ready</Badge>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Modular contract ready for entity resolution pipeline connection.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
