import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { SplashScreen } from './components/common/SplashScreen';
import { LoginModal } from './components/auth/LoginModal';
import { StudentDashboard } from './components/student/StudentDashboard';
import { StaffScanner } from './components/staff/StaffScanner';
import { StaffHistory } from './components/staff/StaffHistory';
import { HodVpSection } from './components/staff/HodVpSection';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DigitalIDCard } from './components/student/DigitalIDCard';
import { INITIAL_STUDENTS } from './data/mockData';
import { 
  ShieldCheck, 
  QrCode, 
  Clock, 
  UserCheck, 
  Sparkles, 
  Building2, 
  CreditCard,
  Camera,
  Terminal,
  RotateCcw
} from 'lucide-react';

function AppContent() {
  const { user, role, isAuthenticated } = useAuth();
  
  const [showSplash, setShowSplash] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'id-card' | 'scanner' | 'history' | 'hod-vp' | 'fines'>('dashboard');

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Header
        onOpenLoginModal={() => setShowLoginModal(true)}
        activeTab={activeTab}
        setActiveTab={(t) => setActiveTab(t as any)}
      />

      {/* Main Container */}
      <main className="flex-1 pb-16">
        
        {/* Navigation Bar for Active Role */}
        <div className="bg-white/60 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between overflow-x-auto">
            
            <div className="flex items-center gap-1 sm:gap-2">
              
              {/* STUDENT TABS */}
              {role === 'STUDENT' && (
                <>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'dashboard'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>My Dashboard & Fines</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('id-card')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'id-card'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Digital ID & Secure QR</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('hod-vp')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'hod-vp'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>HOD & VP Circulars & Gallery</span>
                  </button>
                </>
              )}

              {/* STAFF / SECURITY TABS */}
              {role === 'STAFF' && (
                <>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'dashboard'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Gatehouse QR Scanner</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'history'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Scan Audit History</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('hod-vp')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'hod-vp'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>HOD & VP Photo Gallery</span>
                  </button>
                </>
              )}

              {/* ADMIN TABS */}
              {role === 'ADMIN' && (
                <>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'dashboard'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Admin Operations Dashboard</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('hod-vp')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'hod-vp'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>HOD & VP Photo Gallery</span>
                  </button>
                </>
              )}

            </div>

            {/* Re-play splash animation button */}
            <button
              onClick={() => setShowSplash(true)}
              className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Intro Intro</span>
            </button>

          </div>
        </div>

        {/* View Content Rendering */}
        <div className="pt-6">
          {role === 'STUDENT' && (
            <div className="py-6 px-4">
              {activeTab === 'dashboard' && <StudentDashboard />}
              {activeTab === 'id-card' && (
                <div className="max-w-md mx-auto py-8">
                  <DigitalIDCard student={INITIAL_STUDENTS[0]} />
                </div>
              )}
              {activeTab === 'hod-vp' && <HodVpSection />}
            </div>
          )}

          {role === 'STAFF' && (
            <div className="py-6 px-4">
              {activeTab === 'dashboard' && <StaffScanner />}
              {activeTab === 'history' && <StaffHistory />}
              {activeTab === 'hod-vp' && <HodVpSection />}
            </div>
          )}

          {role === 'ADMIN' && (
            <div className="py-6">
              {activeTab === 'dashboard' && <AdminDashboard />}
              {activeTab === 'hod-vp' && <HodVpSection />}
            </div>
          )}
        </div>

      </main>

      {/* Login Modal Popup */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 SHOV College Digital Identity System • Institutional OAuth2 Gateway</p>
          <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-400">
            <span>VERIFY</span>
            <span>•</span>
            <span>IDENTIFY</span>
            <span>•</span>
            <span>SECURE</span>
            <span>•</span>
            <span>QR CODE</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
