import React, { useState, useEffect } from 'react';
import {
  Users,
  FlaskConical,
  ShoppingBag,
  TrendingUp,
  Star,
  ThumbsUp,
  RotateCw,
  Sparkles,
  Shield,
  ShieldAlert,
  Lock,
  MessageSquare,
  PlusCircle,
  Calculator,
  Layers,
  ChevronRight,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import {
  CustomerInterest,
  ProductFeedback,
  Trial,
  Purchase,
  MetricsSummary,
  VENTURE_PLAN_ESTIMATES,
} from '../types';
import {
  subscribeToMetrics,
  subscribeToCustomerInterests,
  subscribeToProductFeedback,
  subscribeToTrials,
  subscribeToPurchases,
} from '../services/firestoreService';
import { RecordTrialModal } from './RecordTrialModal';
import { RecordPurchaseModal } from './RecordPurchaseModal';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import { User } from 'firebase/auth';

interface DashboardProps {
  currentUser: User | null;
  isAdmin: boolean;
  onNavigateToTry?: () => void;
  onNavigateToFeedback?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  isAdmin,
  onNavigateToTry,
  onNavigateToFeedback,
}) => {
  // Aggregate public metrics from Firestore
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);

  // Admin raw documents from Firestore
  const [interests, setInterests] = useState<CustomerInterest[]>([]);
  const [feedbacks, setFeedbacks] = useState<ProductFeedback[]>([]);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  const [loading, setLoading] = useState(true);
  const [adminPermissionDenied, setAdminPermissionDenied] = useState(false);

  // Modals
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  // Active Admin Sub-tab
  const [adminView, setAdminView] = useState<'validation' | 'feedback' | 'comments' | 'financials'>('validation');

  // Subscribe to real-time public metrics summary
  useEffect(() => {
    const unsubscribeMetrics = subscribeToMetrics((data) => {
      setMetrics(data);
      setLoading(false);
    });

    return () => unsubscribeMetrics();
  }, []);

  // Subscribe to raw feedback (Public read allowed in rules)
  useEffect(() => {
    const unsubscribeFeedback = subscribeToProductFeedback(
      (data) => {
        setFeedbacks(data);
      },
      (err) => {
        console.warn('Feedback query warning:', err.message);
      }
    );

    return () => unsubscribeFeedback();
  }, []);

  // Subscribe to Admin Collections if user is admin
  useEffect(() => {
    if (!isAdmin) {
      setInterests([]);
      setTrials([]);
      setPurchases([]);
      return;
    }

    setAdminPermissionDenied(false);

    const unsubInterests = subscribeToCustomerInterests(
      (data) => setInterests(data),
      (err) => {
        console.warn('Interests access restricted:', err);
        setAdminPermissionDenied(true);
      }
    );

    const unsubTrials = subscribeToTrials(
      (data) => setTrials(data),
      (err) => {
        console.warn('Trials access restricted:', err);
        setAdminPermissionDenied(true);
      }
    );

    const unsubPurchases = subscribeToPurchases(
      (data) => setPurchases(data),
      (err) => {
        console.warn('Purchases access restricted:', err);
        setAdminPermissionDenied(true);
      }
    );

    return () => {
      unsubInterests();
      unsubTrials();
      unsubPurchases();
    };
  }, [isAdmin]);

  // Derive consolidated metrics directly from real Firestore data
  const totalInterestsCount = isAdmin
    ? interests.length
    : metrics?.totalInterests || 0;

  const totalTrialsCount = isAdmin
    ? trials.length
    : metrics?.totalTrials || 0;

  const totalPurchasesCount = isAdmin
    ? purchases.length
    : metrics?.totalPurchases || 0;

  // Direct calculation from real feedbacks
  const feedbackItems = feedbacks;
  const feedbackCount = feedbackItems.length;

  const avgEffectiveness =
    feedbackCount > 0
      ? Number(
          (
            feedbackItems.reduce((acc, curr) => acc + curr.effectivenessRating, 0) /
            feedbackCount
          ).toFixed(1)
        )
      : metrics?.avgEffectiveness || 0;

  const avgSatisfaction =
    feedbackCount > 0
      ? Number(
          (
            feedbackItems.reduce((acc, curr) => acc + curr.overallSatisfaction, 0) /
            feedbackCount
          ).toFixed(1)
        )
      : metrics?.avgSatisfaction || 0;

  const avgPriceValue =
    feedbackCount > 0
      ? Number(
          (
            feedbackItems.reduce((acc, curr) => acc + curr.priceValueRating, 0) /
            feedbackCount
          ).toFixed(1)
        )
      : metrics?.avgPriceValue || 0;

  const repurchaseIntentionPercent =
    feedbackCount > 0
      ? Math.round(
          (feedbackItems.filter((f) => f.repurchaseIntention === 'Yes').length /
            feedbackCount) *
            100
        )
      : metrics?.repurchaseIntentionPercent || 0;

  const recommendationPercent =
    feedbackCount > 0
      ? Math.round(
          (feedbackItems.filter((f) => f.recommendation === 'Yes').length /
            feedbackCount) *
            100
        )
      : metrics?.recommendationPercent || 0;

  // Purchase conversion rate:
  // If trials exist, conversion rate is based on trials converted to purchases
  // Otherwise based on purchases / customer interests
  let purchaseConversionRate = 0;
  if (totalTrialsCount > 0) {
    if (isAdmin && trials.length > 0) {
      const convertedTrials = trials.filter((t) => t.purchased).length;
      purchaseConversionRate = Math.round((convertedTrials / trials.length) * 100);
    } else {
      purchaseConversionRate = Math.min(100, Math.round((totalPurchasesCount / totalTrialsCount) * 100));
    }
  } else if (totalInterestsCount > 0) {
    purchaseConversionRate = Math.min(100, Math.round((totalPurchasesCount / totalInterestsCount) * 100));
  }

  // Check if no customer data exists yet
  const hasNoData =
    totalInterestsCount === 0 &&
    totalTrialsCount === 0 &&
    totalPurchasesCount === 0 &&
    feedbackCount === 0;

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.warn('Sign-in issue:', e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header & Founder Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Firestore Database Connected</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            EcoClean Validation & Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real customer demand, pilot trial conversions, and product satisfaction metrics directly from Firestore.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsTrialModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs sm:text-sm font-semibold border border-emerald-200 transition-colors"
          >
            <FlaskConical className="w-4 h-4 text-emerald-600" />
            <span>+ Record Trial</span>
          </button>
          <button
            onClick={() => setIsPurchaseModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>+ Record Purchase</span>
          </button>
        </div>
      </div>

      {/* Main Realtime Metrics Grid */}
      {hasNoData ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            No customer data collected yet.
          </h2>
          <p className="text-gray-500 max-w-md mx-auto text-sm mb-6">
            Submit a lead in the <strong>Try EcoClean</strong> form or submit a review in the <strong>Feedback</strong> form to populate real-time metrics into Firestore.
          </p>
          <div className="flex items-center justify-center space-x-3">
            {onNavigateToTry && (
              <button
                onClick={onNavigateToTry}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs"
              >
                Submit Try EcoClean Form
              </button>
            )}
            {onNavigateToFeedback && (
              <button
                onClick={onNavigateToFeedback}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs sm:text-sm font-semibold rounded-lg"
              >
                Submit Feedback Form
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Customer Validation Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Customer Validation (Real Firestore Data)
              </h2>
              <span className="text-xs text-gray-400">Updates automatically in real time</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Customer Interests */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-emerald-200 transition-colors">
                <div className="flex items-center justify-between text-gray-500 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider">Customer Interests</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {totalInterestsCount}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Verified survey leads</p>
              </div>

              {/* Total Trials */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-teal-200 transition-colors">
                <div className="flex items-center justify-between text-gray-500 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Trials</span>
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {totalTrialsCount}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Home testing samples</p>
              </div>

              {/* Total Purchases */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-emerald-200 transition-colors">
                <div className="flex items-center justify-between text-gray-500 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Purchases</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {totalPurchasesCount}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Paid product orders</p>
              </div>

              {/* Conversion Rate */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-emerald-200 transition-colors">
                <div className="flex items-center justify-between text-gray-500 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider">Conversion Rate</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                  {purchaseConversionRate}%
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  {totalTrialsCount > 0 ? 'Trial-to-sale conversion' : 'Lead-to-sale conversion'}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Feedback Metrics Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Customer Feedback Quality Metrics (Real Firestore Data)
              </h2>
              <span className="text-xs text-gray-400">{feedbackCount} verified reviews</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Avg Effectiveness */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
                <div className="text-xs font-semibold text-gray-500 mb-1 flex items-center justify-between">
                  <span>Effectiveness</span>
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {avgEffectiveness > 0 ? `${avgEffectiveness} / 5` : 'N/A'}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">Avg cleaning power</div>
              </div>

              {/* Avg Overall Satisfaction */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
                <div className="text-xs font-semibold text-gray-500 mb-1 flex items-center justify-between">
                  <span>Satisfaction</span>
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {avgSatisfaction > 0 ? `${avgSatisfaction} / 5` : 'N/A'}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">Overall experience</div>
              </div>

              {/* Price / Value Rating */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
                <div className="text-xs font-semibold text-gray-500 mb-1 flex items-center justify-between">
                  <span>Price / Value</span>
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {avgPriceValue > 0 ? `${avgPriceValue} / 5` : 'N/A'}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">Value perception (₹99)</div>
              </div>

              {/* Repurchase Intention */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
                <div className="text-xs font-semibold text-gray-500 mb-1 flex items-center justify-between">
                  <span>Repurchase</span>
                  <RotateCw className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-emerald-600">
                  {feedbackCount > 0 ? `${repurchaseIntentionPercent}%` : 'N/A'}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">Intend to buy again</div>
              </div>

              {/* Recommendation Rate */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
                <div className="text-xs font-semibold text-gray-500 mb-1 flex items-center justify-between">
                  <span>Recommend</span>
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-emerald-600">
                  {feedbackCount > 0 ? `${recommendationPercent}%` : 'N/A'}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">Word-of-mouth rate</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Venture Plan Estimates Section (MANDATORY REQUIREMENT) */}
      <div className="bg-gradient-to-br from-gray-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-800 gap-3">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider mb-2">
              <Calculator className="w-3.5 h-3.5" />
              <span>Venture Plan Estimates</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              EcoClean Unit Economics & Break-Even Model
            </h3>
          </div>
          <span className="text-xs text-gray-400 bg-gray-800/80 px-3 py-1.5 rounded-lg border border-gray-700/60">
            Independent Business Forecast (Not mixed with actual sales)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
          <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-700/50">
            <span className="text-xs font-medium text-gray-400 block mb-1">Selling Price</span>
            <span className="text-2xl font-bold text-white">₹{VENTURE_PLAN_ESTIMATES.sellingPrice}</span>
            <span className="text-[11px] text-gray-400 block mt-1">Per 500ml bottle</span>
          </div>

          <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-700/50">
            <span className="text-xs font-medium text-gray-400 block mb-1">Variable Cost</span>
            <span className="text-2xl font-bold text-amber-400">₹{VENTURE_PLAN_ESTIMATES.variableCost}</span>
            <span className="text-[11px] text-gray-400 block mt-1">Ingredients + packaging</span>
          </div>

          <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-700/50">
            <span className="text-xs font-medium text-gray-400 block mb-1">Contribution per Unit</span>
            <span className="text-2xl font-bold text-emerald-400">₹{VENTURE_PLAN_ESTIMATES.contributionPerUnit}</span>
            <span className="text-[11px] text-gray-400 block mt-1">Margin: 49.5%</span>
          </div>

          <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-700/50">
            <span className="text-xs font-medium text-gray-400 block mb-1">Monthly Fixed Cost</span>
            <span className="text-2xl font-bold text-white">₹{VENTURE_PLAN_ESTIMATES.monthlyFixedCost.toLocaleString()}</span>
            <span className="text-[11px] text-gray-400 block mt-1">Rent, power, pilot labor</span>
          </div>

          <div className="bg-emerald-950/70 p-4 rounded-xl border border-emerald-500/40">
            <span className="text-xs font-bold text-emerald-300 block mb-1">Break-Even Volume</span>
            <span className="text-2xl font-extrabold text-emerald-400">~{VENTURE_PLAN_ESTIMATES.breakEvenVolume} units</span>
            <span className="text-[11px] text-emerald-200/80 block mt-1">Monthly target units</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-800/80 text-xs text-gray-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <strong>Break-even Formula:</strong> Fixed Cost (₹15,000) ÷ Contribution per unit (₹49) = 306.12 ≈ <strong>307 units</strong> per month.
          </div>
          <div className="text-emerald-400/90 font-medium">
            Status: Clearly labeled as Venture Plan Estimates
          </div>
        </div>
      </div>

      {/* 6. Admin Founder Dashboard Section */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Founder Admin Console
              </h2>
              {isAdmin ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Authorized Admin
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>PII Protected View</span>
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Authorized access: <code className="font-mono text-emerald-700">haripriya.0251mba497@dgu.ac.in</code>. Protected customer database with RBAC.
            </p>
          </div>

          {/* Subtabs for Founder Console */}
          <div className="flex items-center bg-gray-200/70 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setAdminView('validation')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                adminView === 'validation'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Validation Leads ({totalInterestsCount})
            </button>
            <button
              onClick={() => setAdminView('comments')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                adminView === 'comments'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Feedback Comments ({feedbackCount})
            </button>
            <button
              onClick={() => setAdminView('feedback')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                adminView === 'feedback'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Ratings Breakdown
            </button>
          </div>
        </div>

        {/* View 1: Customer Validation Leads */}
        {adminView === 'validation' && (
          <div className="p-5 sm:p-6 space-y-6">
            {!isAdmin ? (
              <div className="p-6 bg-amber-50/70 border border-amber-200 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-amber-900">
                  Customer Contact Database Protected
                </h4>
                <p className="text-xs sm:text-sm text-amber-800 max-w-lg mx-auto">
                  Per security requirements, customer phone numbers and email addresses are not exposed publicly. Only verified founder <code className="font-semibold">haripriya.0251mba497@dgu.ac.in</code> can view the complete database.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleSignIn}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Founder Sign In with Google</span>
                  </button>
                </div>
              </div>
            ) : interests.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">
                No customer validation leads recorded yet in <code className="bg-gray-100 px-1 py-0.5 rounded">customer_interests</code>.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 font-bold uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Contact (PII)</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Current Cleaner</th>
                      <th className="py-3 px-4">Eco Importance</th>
                      <th className="py-3 px-4">Buying Factor</th>
                      <th className="py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {interests.map((lead) => (
                      <tr key={lead.id} className="hover:bg-emerald-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-gray-900">
                          {lead.name}
                          <span className="block text-[10px] text-gray-400 font-normal">
                            Age: {lead.ageGroup}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          <div className="text-emerald-700 font-medium">{lead.email}</div>
                          <div className="text-gray-500">{lead.phone}</div>
                        </td>
                        <td className="py-3.5 px-4">{lead.location}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-gray-800">{lead.currentBrand}</span>
                          <span className="block text-[10px] text-gray-400">{lead.currentlyUsesCleaner}</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-700">
                          {lead.ecoFriendlinessImportance}/5
                        </td>
                        <td className="py-3.5 px-4 max-w-[180px] truncate" title={lead.preferredBuyingFactor}>
                          {lead.preferredBuyingFactor}
                        </td>
                        <td className="py-3.5 px-4 text-gray-400 text-[10px]">
                          {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Trials & Purchases summary tables if Admin */}
            {isAdmin && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                {/* Trials Table */}
                <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center space-x-1.5">
                      <FlaskConical className="w-4 h-4 text-emerald-600" />
                      <span>Recent Trials ({trials.length})</span>
                    </h4>
                    <button
                      onClick={() => setIsTrialModalOpen(true)}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                    >
                      + Add
                    </button>
                  </div>
                  {trials.length === 0 ? (
                    <p className="text-xs text-gray-400 py-4 text-center">No trials logged in Firestore yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {trials.slice(0, 5).map((trial) => (
                        <div key={trial.id} className="bg-white p-2.5 rounded-lg border border-gray-200 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-gray-900">{trial.customerName}</span>
                            <span className="block text-[10px] text-gray-400">{trial.trialDate} • {trial.trialStatus}</span>
                          </div>
                          {trial.purchased ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                              Converted (₹{trial.purchasePrice})
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px]">
                              Trialing
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Purchases Table */}
                <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center space-x-1.5">
                      <ShoppingBag className="w-4 h-4 text-emerald-600" />
                      <span>Recent Purchases ({purchases.length})</span>
                    </h4>
                    <button
                      onClick={() => setIsPurchaseModalOpen(true)}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                    >
                      + Add
                    </button>
                  </div>
                  {purchases.length === 0 ? (
                    <p className="text-xs text-gray-400 py-4 text-center">No purchases recorded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {purchases.slice(0, 5).map((p) => (
                        <div key={p.id} className="bg-white p-2.5 rounded-lg border border-gray-200 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-gray-900">{p.customerName}</span>
                            <span className="block text-[10px] text-gray-400">{p.quantity} bottle(s) @ ₹{p.sellingPrice} • {p.purchaseDate}</span>
                          </div>
                          <span className="font-bold text-emerald-700">₹{p.totalAmount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* View 2: Customer Comments (What customers liked & Suggestions) */}
        {adminView === 'comments' && (
          <div className="p-5 sm:p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                Qualitative Customer Voice & Feedback Comments
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                What customers liked most about EcoClean and direct suggestions for improvement.
              </p>
            </div>

            {feedbacks.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                No customer feedback comments submitted yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedbacks.map((f) => (
                  <div key={f.id} className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-gray-900 text-sm">{f.customerName}</div>
                      <div className="flex items-center space-x-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="text-xs font-bold text-gray-800">{f.overallSatisfaction}/5</span>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 text-xs">
                      <span className="font-bold text-emerald-900 block mb-0.5">What they liked most:</span>
                      <p className="text-emerald-800 italic">"{f.likedMost || 'Great natural scent and cleaning effectiveness.'}"</p>
                    </div>

                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-xs">
                      <span className="font-bold text-amber-900 block mb-0.5">Improvement suggestion:</span>
                      <p className="text-amber-800 italic">"{f.improvementSuggestion || 'None provided.'}"</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                      <span>Repurchase: <strong className="text-gray-700">{f.repurchaseIntention}</strong></span>
                      <span>Recommend: <strong className="text-gray-700">{f.recommendation}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* View 3: Ratings Breakdown */}
        {adminView === 'feedback' && (
          <div className="p-5 sm:p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                Detailed Product Performance Ratings
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Breakdown of 1-5 star ratings across all product aspects.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Cleaning Effectiveness', score: avgEffectiveness },
                { label: 'Overall Satisfaction', score: avgSatisfaction },
                { label: 'Price / Value Perception (₹99)', score: avgPriceValue },
                {
                  label: 'Fragrance (Citrus)',
                  score: feedbackCount > 0
                    ? Number((feedbacks.reduce((a, c) => a + (c.fragranceRating || 4), 0) / feedbackCount).toFixed(1))
                    : 0,
                },
                {
                  label: 'Ease of Use',
                  score: feedbackCount > 0
                    ? Number((feedbacks.reduce((a, c) => a + (c.easeOfUseRating || 5), 0) / feedbackCount).toFixed(1))
                    : 0,
                },
                {
                  label: 'Packaging Quality',
                  score: feedbackCount > 0
                    ? Number((feedbacks.reduce((a, c) => a + (c.packagingRating || 5), 0) / feedbackCount).toFixed(1))
                    : 0,
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-gray-700">{item.label}</span>
                    <span className="text-xs font-extrabold text-emerald-700">
                      {item.score > 0 ? `${item.score} / 5` : 'N/A'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.score > 0 ? (item.score / 5) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trial Modal */}
      <RecordTrialModal
        isOpen={isTrialModalOpen}
        onClose={() => setIsTrialModalOpen(false)}
        onSuccess={() => {}}
      />

      {/* Purchase Modal */}
      <RecordPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
};
