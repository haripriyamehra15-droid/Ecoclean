import React from 'react';
import { Leaf, ShieldCheck, Sparkles, UserCheck, LogIn, LogOut, Database } from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signOut } from '../firebase';
import { User } from 'firebase/auth';

interface HeaderProps {
  activeTab: 'try' | 'feedback' | 'dashboard';
  setActiveTab: (tab: 'try' | 'feedback' | 'dashboard') => void;
  currentUser: User | null;
  isAdmin: boolean;
  onAdminToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  isAdmin,
}) => {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.warn('Google sign-in popup notice:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('try')}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white">
              <Leaf className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                  Eco<span className="text-emerald-600">Clean</span>
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  ₹99 Natural Cleaner
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block">
                100% Plant-Based • Safe for Family & Pets
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('try')}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'try'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/70'
              }`}
            >
              Try EcoClean
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'feedback'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/70'
              }`}
            >
              Feedback
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/70'
              }`}
            >
              <span>Dashboard</span>
              {isAdmin && (
                <span className="w-2 h-2 rounded-full bg-emerald-300 ring-2 ring-emerald-500 animate-ping" />
              )}
            </button>
          </nav>

          {/* Auth / Admin Status */}
          <div className="flex items-center space-x-2">
            <div className="hidden md:flex items-center space-x-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-md border border-gray-200">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Firestore Connected</span>
            </div>

            {currentUser ? (
              <div className="flex items-center space-x-2">
                <div className="text-right hidden lg:block">
                  <div className="text-xs font-semibold text-gray-800 truncate max-w-[130px]">
                    {currentUser.displayName || currentUser.email}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium">
                    {isAdmin ? 'Verified Founder Admin' : 'Customer Account'}
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center space-x-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 px-3 py-1.5 rounded-lg border border-gray-300 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Founder Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
