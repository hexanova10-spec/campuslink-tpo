import React, { useState, useRef, useEffect } from 'react';
import {
  Building2, Bell, Sparkles, RefreshCw, Sun, Moon, Menu,
  PanelLeftClose, Search, ChevronDown, ArrowRightLeft, Check
} from 'lucide-react';
import { repo } from '../services/storage';
import { useTheme } from '../context/ThemeContext';

interface TopBarProps {
  currentScreen: number;
  onSelectScreen: (screenId: number) => void;
  openPalette: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onSelectScreen, openPalette }) => {
  const { theme, toggleTheme, isSidebarOpen, toggleSidebar } = useTheme();
  const currentUser = repo.getCurrentUser();
  const institutions = repo.getInstitutions();
  const effectiveInstitution = repo.getEffectiveInstitution();
  const selectedFilter = repo.getSelectedCollegeFilter();
  const notifications = repo.getNotifications();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showCollegeMenu, setShowCollegeMenu] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(new Set());

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const collegeMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) setShowRoleMenu(false);
      if (collegeMenuRef.current && !collegeMenuRef.current.contains(e.target as Node)) setShowCollegeMenu(false);
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) setShowNotifPanel(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const isLight = theme === 'light';
  const unreadCount = notifications.filter(n => !readNotifIds.has(n.id)).length;

  const switchUser = (id: string) => {
    repo.setCurrentUser(id);
    setShowRoleMenu(false);
  };

  const initials = currentUser.name.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();

  return (
    <header className={`sticky top-0 z-40 px-3 sm:px-6 py-2.5 flex items-center justify-between border-b backdrop-blur-xl transition-colors duration-200 ${
      isLight
        ? 'bg-white/80 border-slate-200/80 text-slate-900 shadow-sm shadow-blue-900/5'
        : 'bg-slate-950/70 border-white/10 text-white shadow-md'
    }`}>
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle navigation"
          className={`px-3 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold shadow-sm transition-all cursor-pointer ${
            isSidebarOpen
              ? 'bg-blue-600 border-blue-600 text-white shadow-blue-500/20'
              : isLight
                ? 'bg-white/80 border-blue-200 text-blue-700 hover:bg-blue-50'
                : 'bg-slate-900/80 border-white/10 text-slate-200 hover:border-blue-500/50'
          }`}
        >
          {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <Menu className="w-4 h-4 text-blue-500" />}
          <span className="hidden sm:inline">Menu</span>
        </button>

        <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => onSelectScreen(2)}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-600/30">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="font-extrabold tracking-tight text-base">CAMPUS<span className="text-blue-600">LINK</span></div>
            <span className={`inline-flex mt-0.5 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
              isLight ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-blue-600/20 border-blue-400/30 text-blue-300'
            }`}>TPO</span>
          </div>
        </div>

        <div ref={collegeMenuRef} className={`hidden lg:flex items-center gap-2 ml-2 pl-3 border-l ${
          isLight ? 'border-slate-200' : 'border-white/10'
        }`}>
          {currentUser.role === 'SYSTEM_ADMIN' ? (
            <button
              onClick={() => setShowCollegeMenu(v => !v)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                isLight ? 'bg-white/90 border-slate-200 text-slate-800 hover:border-blue-300' : 'bg-slate-900/90 border-white/10 text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-blue-500" />
              <span className="truncate max-w-[180px]">{selectedFilter ? institutions.find(i => i.id === selectedFilter)?.name : 'All Colleges (Global)'}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
          ) : (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              isLight ? 'bg-white/90 border-slate-200 text-slate-800' : 'bg-slate-900/90 border-white/10 text-slate-200'
            }`}>
              <Building2 className="w-3.5 h-3.5 text-blue-500" />
              <span className="truncate max-w-[180px]">{effectiveInstitution.name}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold">{effectiveInstitution.code}</span>
            </div>
          )}
          {showCollegeMenu && currentUser.role === 'SYSTEM_ADMIN' && (
            <div className={`absolute top-14 left-64 w-72 rounded-2xl p-2 z-50 border shadow-2xl backdrop-blur-2xl ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-white/10 text-white'
            }`}>
              <div className="text-[10px] uppercase font-bold text-blue-600 px-2 py-1">Institutional Scope</div>
              <button onClick={() => { repo.setSelectedCollegeFilter(undefined); setShowCollegeMenu(false); }} className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-blue-50 dark:hover:bg-slate-900">All Institutions (Global Admin)</button>
              {institutions.map(inst => (
                <button key={inst.id} onClick={() => { repo.setSelectedCollegeFilter(inst.id); setShowCollegeMenu(false); }} className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-blue-50 dark:hover:bg-slate-900">
                  <b>{inst.name}</b><span className="block text-[10px] opacity-60">{inst.city}, {inst.state} · {inst.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button onClick={openPalette} className={`w-full h-9 rounded-xl border flex items-center gap-2 px-3 text-xs text-left transition ${
          isLight ? 'bg-white/90 border-slate-200 text-slate-500 hover:border-blue-300' : 'bg-slate-900/80 border-white/10 text-slate-400 hover:border-blue-500/50'
        }`}>
          <Search className="w-4 h-4 text-blue-500" />
          <span className="flex-1">Search students, companies, jobs...</span>
          <kbd className="px-1.5 py-0.5 rounded border text-[9px]">⌘ K</kbd>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button onClick={toggleTheme} className={`flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
          isLight ? 'bg-blue-50/80 border-blue-200 text-blue-700' : 'bg-slate-900/80 border-white/10 text-amber-300'
        }`}>
          {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          <span className="hidden sm:inline">{isLight ? 'Dark Mode' : 'Light Mode'}</span>
        </button>

        <div ref={notifMenuRef} className="relative">
          <button onClick={() => setShowNotifPanel(v => !v)} className={`relative p-2 rounded-xl border cursor-pointer ${
            isLight ? 'bg-white/90 border-slate-200 text-slate-700 hover:text-blue-700' : 'bg-slate-900/80 border-white/10 text-slate-300'
          }`}>
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          {showNotifPanel && (
            <div className={`absolute right-0 mt-2 w-80 rounded-2xl p-3 z-50 border shadow-2xl backdrop-blur-2xl ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-white/10 text-white'
            }`}>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-white/10">
                <span className="font-bold text-xs uppercase tracking-wider">Notifications</span>
                {unreadCount > 0 && <button onClick={() => setReadNotifIds(new Set(notifications.map(n => n.id)))} className="text-[10px] text-blue-600 font-bold">Mark all read</button>}
              </div>
              <div className="max-h-72 overflow-y-auto space-y-2">
                {notifications.slice(0, 5).map(n => (
                  <button key={n.id} onClick={() => { setReadNotifIds(p => new Set([...p, n.id])); onSelectScreen(21); setShowNotifPanel(false); }} className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-blue-50 dark:hover:bg-slate-900 text-xs">
                    <b>{n.title}</b><p className="mt-1 text-[10px] opacity-70 line-clamp-2">{n.content}</p>
                  </button>
                ))}
                {!notifications.length && <div className="py-6 text-center text-xs opacity-50">No notifications</div>}
              </div>
            </div>
          )}
        </div>

        <div ref={roleMenuRef} className="relative">
          <button onClick={() => setShowRoleMenu(v => !v)} className={`flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl border cursor-pointer ${
            isLight ? 'bg-white/90 border-slate-200 hover:border-blue-200' : 'bg-slate-900/80 border-white/10'
          }`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-500 text-white font-black text-xs flex items-center justify-center shadow-md">{initials}</div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{currentUser.role === 'SYSTEM_ADMIN' ? 'System Administrator' : 'College TPO'}</p>
            </div>
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
          </button>
          {showRoleMenu && (
            <div className={`absolute right-0 mt-2 w-80 rounded-2xl p-2 z-50 border shadow-2xl backdrop-blur-2xl ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-white/10 text-white'
            }`}>
              <div className="px-2 py-1 text-[10px] uppercase font-bold text-blue-600">Switch Profile</div>
              {[
                ['user-tpo-apex', 'Mrutyunjya Dash', 'College TPO'],
                ['user-tpo-metro', 'Sisira Kanta Padhi', 'College TPO'],
                ['user-sysadmin', 'Ronali Mohanty', 'System Administrator']
              ].map(([id, name, role]) => (
                <button key={id} onClick={() => switchUser(id)} className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-left transition ${
                  currentUser.id === id ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-50 dark:hover:bg-slate-900'
                }`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${currentUser.id === id ? 'bg-white/20' : 'bg-blue-50 text-blue-700'}`}>
                    {name.split(' ').map(x => x[0]).slice(0,2).join('')}
                  </div>
                  <div><div className="font-bold text-xs">{name}</div><div className="text-[10px] opacity-70">{role}</div></div>
                  {currentUser.id === id && <Check className="w-4 h-4 ml-auto" />}
                </button>
              ))}
              <button onClick={() => { onSelectScreen(1); setShowRoleMenu(false); }} className="w-full mt-2 pt-2 border-t border-slate-200 dark:border-white/10 text-[10px] text-blue-600 font-bold">Open Profile & Role Switcher</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
