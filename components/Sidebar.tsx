
import React from 'react';
import { DashboardTab } from '../types';

interface SidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems: { id: DashboardTab; label: string; icon: string }[] = [
    { id: 'roadmap', label: 'Learning Path', icon: 'fa-route' },
    { id: 'interviews', label: 'Mock Sessions', icon: 'fa-microphone-lines' },
    { id: 'analysis', label: 'Skill Analytics', icon: 'fa-bullseye' },
    { id: 'news', label: 'Tech Pulse', icon: 'fa-bolt-lightning' },
    { id: 'settings', label: 'Preferences', icon: 'fa-sliders' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 h-screen fixed top-0 left-0 p-6 flex flex-col z-20">
      <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => onTabChange('roadmap')}>
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <i className="fas fa-code text-lg"></i>
        </div>
        <span className="font-extrabold text-xl tracking-tight text-slate-800">DevLevelUp</span>
      </div>

      <nav className="space-y-1 flex-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
          >
            <i className={`fas ${item.icon} w-5`}></i>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="bg-slate-900 rounded-2xl p-4 text-white relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Focus</p>
          <p className="text-sm font-bold truncate">System Design Intro</p>
          <div className="mt-3 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">4 / 12 Topics</span>
            <span className="text-indigo-400">33%</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
            <div className="bg-indigo-500 h-full w-1/3"></div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 px-2 border-t border-slate-100 pt-6">
          <img src="https://picsum.photos/40" alt="User" className="w-8 h-8 rounded-full ring-2 ring-slate-100" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">Alex Dev</p>
            <p className="text-[10px] text-slate-400 truncate">Junior Developer</p>
          </div>
          <button className="text-slate-400 hover:text-rose-500 transition-colors">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
