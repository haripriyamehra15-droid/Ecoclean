/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, testConnection } from './firebase';
import { Header } from './components/Header';
import { TryEcoCleanForm } from './components/TryEcoCleanForm';
import { FeedbackForm } from './components/FeedbackForm';
import { Dashboard } from './components/Dashboard';
import { Leaf, ShieldCheck, Sparkles, CheckCircle2, Lock } from 'lucide-react';

const ADMIN_EMAIL = 'haripriya.0251mba497@dgu.ac.in';

export default function App() {
  const [activeTab, setActiveTab] = useState<'try' | 'feedback' | 'dashboard'>('try');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isFounderMode, setIsFounderMode] = useState<boolean>(false);

  useEffect(() => {
    // Validate Firestore server connection on startup
    testConnection();

    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setIsFounderMode(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // Authorized if user is signed in with admin email or has founder mode active
  const isAdmin =
    (currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) || isFounderMode;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-gray-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Banner for Founder / Environment info */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4 text-center border-b border-emerald-800 flex items-center justify-center space-x-2">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
        <span>
          EcoClean Pilot Validation • Connected to permanent <strong>Firebase Firestore</strong> database
        </span>
        <span className="hidden sm:inline text-emerald-400">•</span>
        <button
          onClick={() => setIsFounderMode(!isFounderMode)}
          className="underline hover:text-white font-medium ml-1 cursor-pointer"
        >
          {isFounderMode ? 'Switch to Customer View' : 'Toggle Founder Admin Access'}
        </button>
      </div>

      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        isAdmin={isAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'try' && (
          <TryEcoCleanForm onSuccessNavigate={() => setActiveTab('dashboard')} />
        )}

        {activeTab === 'feedback' && (
          <FeedbackForm onSuccessNavigate={() => setActiveTab('dashboard')} />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            currentUser={currentUser}
            isAdmin={isAdmin}
            onNavigateToTry={() => setActiveTab('try')}
            onNavigateToFeedback={() => setActiveTab('feedback')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex items-center justify-center space-x-2 text-gray-800 font-semibold">
            <Leaf className="w-4 h-4 text-emerald-600" />
            <span>EcoClean Sustainable Cleaning Venture</span>
          </div>
          <p className="max-w-md mx-auto text-gray-500">
            Formulated with plant-derived non-toxic surfactants. Zero synthetic chlorine, ammonia, or phthalates.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-gray-400 pt-2 border-t border-gray-100 max-w-lg mx-auto">
            <span>Firestore Collections: customer_interests • product_feedback • trials • purchases</span>
            <span>Founder Admin: {ADMIN_EMAIL}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
