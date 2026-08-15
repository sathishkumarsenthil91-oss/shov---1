import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShovLogo } from './ShovLogo';
import { UserRole } from '../../types';
import { 
  Sun, 
  Moon, 
  Bell, 
  ShieldCheck, 
  UserCheck, 
  ShieldAlert, 
  LogOut, 
  Sparkles,
  ChevronDown,
  CheckCircle2,
  X
} from 'lucide-react';

interface HeaderProps {
  onOpenLoginModal?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLoginModal, activeTab, setActiveTab }) => {
  const { 
    user, 
    role, 
    isAuthenticated, 
    darkMode, 
    toggleDarkMode, 
    switchRole, 
    logout, 
    notifications,
    removeNotification 
  } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const roleBadges: Record<UserRole, { label: string; color: string; icon: React.ReactNode }> = {
    ADMIN: { label: 'ADMINISTRATOR', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
    STAFF: { label: 'STAFF / SECURITY', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    STUDENT: { label: 'STUDENT', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', icon: <UserCheck className="w-3.5 h-3.5" /> },
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Left: Branding Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center cursor-pointer" onClick={() => setActiveTab?.('dashboard')}>
            <ShovLogo size="sm" showTagline={false} lightText={darkMode} />
          </div>
          <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            COLLEGE ID
          </span>
        </div>

        {/* Center: Quick Demo Role Switcher */}
        {isAuthenticated && (
          <div className="hidden sm:flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-inner">
            {(['STUDENT', 'STAFF', 'ADMIN'] as UserRole[]).map((r) => {
              const active = role === r;
              return (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    if (setActiveTab) setActiveTab('dashboard');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    active 
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md border border-slate-200/60 dark:border-slate-700' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {roleBadges[r].icon}
                  <span>{r === 'STAFF' ? 'Staff/Security' : r}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Right Action Icons: Dark Mode Toggle, Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Dark Mode Switcher with tooltip */}
          <button
            onClick={toggleDarkMode}
            title={darkMode ? "Switch to Light Mode" : "Switch to Late-Night Study Dark Mode"}
            className="p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200/60 dark:border-slate-800 relative group"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
            <span className="absolute right-0 top-12 hidden group-hover:block whitespace-nowrap bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded-lg shadow-xl z-50">
              {darkMode ? "Day Mode" : "Late-Night Study Dark Mode"}
            </span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200/60 dark:border-slate-800 relative"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900 animate-ping" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-medium">
                    {notifications.length} New
                  </span>
                </div>

                <div className="mt-3 max-h-64 overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-center text-slate-500 py-6">No new notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                        </div>
                        <button
                          onClick={() => removeNotification(n.id)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile or Login Button */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all border border-slate-200/60 dark:border-slate-800"
              >
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                  alt={user.name}
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-blue-500/30"
                />
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">{user.name}</p>
                  <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{role}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleBadges[role].color}">
                      {roleBadges[role].icon}
                      <span>{roleBadges[role].label}</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (setActiveTab) setActiveTab('dashboard');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                    >
                      Dashboard Overview
                    </button>
                    {role === 'STUDENT' && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          if (setActiveTab) setActiveTab('id-card');
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                      >
                        My Digital ID Card
                      </button>
                    )}
                    {(role === 'STAFF' || role === 'ADMIN') && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          if (setActiveTab) setActiveTab('hod-vp');
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-500/10 rounded-xl flex items-center justify-between"
                      >
                        <span>HOD & VP Gallery</span>
                        <Sparkles className="w-3 h-3 text-blue-500" />
                      </button>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              Sign In
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
