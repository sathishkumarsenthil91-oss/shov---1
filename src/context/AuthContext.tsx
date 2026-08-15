import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import { verifyOtpApi } from '../services/api';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  time: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  darkMode: boolean;
  notifications: NotificationItem[];
  toggleDarkMode: () => void;
  loginWithPhone: (phone: string) => Promise<{ success: boolean; testOtp?: string }>;
  verifyOtp: (phone: string, otp: string, selectedRole?: UserRole) => Promise<boolean>;
  loginWithGoogle: (selectedRole?: UserRole) => Promise<boolean>;
  switchRole: (newRole: UserRole) => void;
  logout: () => void;
  addNotification: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeNotification: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('shov_auth_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[2]; // Default demo student
  });

  const [role, setRole] = useState<UserRole>(() => {
    return user ? user.role : 'STUDENT';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedDark = localStorage.getItem('shov_dark_mode');
    return savedDark !== null ? JSON.parse(savedDark) : true;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Digital ID Active',
      message: 'Your campus digital ID card (SHOV-2023-CS-001) is active for Academic Year 2026-27.',
      type: 'info',
      time: 'Just now'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);

  // Synchronize dark mode class on html document
  useEffect(() => {
    localStorage.setItem('shov_dark_mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const addNotification = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const item: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setNotifications(prev => [item, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const loginWithPhone = async (phone: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      setIsLoading(false);
      return { success: true, testOtp: data.testOtp || '123456' };
    } catch {
      setIsLoading(false);
      return { success: true, testOtp: '123456' };
    }
  };

  const verifyOtp = async (phone: string, otp: string, selectedRole: UserRole = 'STUDENT') => {
    setIsLoading(true);
    try {
      const data = await verifyOtpApi(phone, otp, selectedRole);
      if (data.success && data.user) {
        const loggedUser: User = { ...data.user, role: selectedRole };
        setUser(loggedUser);
        setRole(selectedRole);
        localStorage.setItem('shov_auth_user', JSON.stringify(loggedUser));
        setIsLoading(false);
        addNotification('Authentication Successful', `Welcome back, ${loggedUser.name}!`, 'success');
        return true;
      }
    } catch (e) {
      console.warn('Verify OTP failed:', e);
    }
    setIsLoading(false);
    return false;
  };

  const loginWithGoogle = async (selectedRole: UserRole = 'STUDENT') => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800)); // Smooth OAuth simulate delay
    const targetUser = INITIAL_USERS.find(u => u.role === selectedRole) || INITIAL_USERS[2];
    const loggedUser = { ...targetUser, role: selectedRole };
    setUser(loggedUser);
    setRole(selectedRole);
    localStorage.setItem('shov_auth_user', JSON.stringify(loggedUser));
    setIsLoading(false);
    addNotification('Google Sign-In Success', `Signed in as ${loggedUser.email}`, 'success');
    return true;
  };

  const switchRole = (newRole: UserRole) => {
    const matchedUser = INITIAL_USERS.find(u => u.role === newRole) || {
      ...INITIAL_USERS[0],
      role: newRole,
      name: `Demo ${newRole} User`
    };
    setUser(matchedUser);
    setRole(newRole);
    localStorage.setItem('shov_auth_user', JSON.stringify(matchedUser));
    addNotification('Switched Role', `Current view: ${newRole} Mode`, 'info');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('shov_auth_user');
    addNotification('Signed Out', 'You have been safely logged out.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        isLoading,
        darkMode,
        notifications,
        toggleDarkMode,
        loginWithPhone,
        verifyOtp,
        loginWithGoogle,
        switchRole,
        logout,
        addNotification,
        removeNotification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
