import React, { useState } from 'react';
import { Leaf, CheckCircle2, AlertCircle, Sparkles, Send, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import { submitCustomerInterest } from '../services/firestoreService';
import { CustomerInterest } from '../types';

interface TryEcoCleanFormProps {
  onSuccessNavigate?: () => void;
}

export const TryEcoCleanForm: React.FC<TryEcoCleanFormProps> = ({ onSuccessNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    ageGroup: '25-34',
    location: '',
    email: '',
    phone: '',
    currentlyUsesCleaner: 'Yes, regularly',
    currentBrand: '',
    ecoFriendlinessImportance: 5,
    willingnessToTry: 'Definitely will try',
    preferredBuyingFactor: '100% Non-Toxic & Safe for Family',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!formData.name.trim() || formData.name.length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      setErrorMessage('Please enter a valid phone number.');
      return;
    }
    if (!formData.location.trim()) {
      setErrorMessage('Please provide your city or locality.');
      return;
    }

    try {
      setLoading(true);
      await submitCustomerInterest({
        name: formData.name.trim(),
        ageGroup: formData.ageGroup,
        location: formData.location.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        currentlyUsesCleaner: formData.currentlyUsesCleaner,
        currentBrand: formData.currentBrand.trim() || 'Not specified',
        ecoFriendlinessImportance: Number(formData.ecoFriendlinessImportance),
        willingnessToTry: formData.willingnessToTry,
        preferredBuyingFactor: formData.preferredBuyingFactor,
        createdAt: new Date().toISOString(),
      });

      setSubmitted(true);
    } catch (err: unknown) {
      console.error('Failed to submit customer lead:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to save customer interest to Firestore. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      ageGroup: '25-34',
      location: '',
      email: '',
      phone: '',
      currentlyUsesCleaner: 'Yes, regularly',
      currentBrand: '',
      ecoFriendlinessImportance: 5,
      willingnessToTry: 'Definitely will try',
      preferredBuyingFactor: '100% Non-Toxic & Safe for Family',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero Intro */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Venture Trial Program • ₹99 Natural Surface Cleaner</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Try <span className="text-emerald-600">EcoClean</span> at Home
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Say goodbye to toxic fumes and harsh synthetic chemicals. Experience powerful plant-based cleaning
          that is safe for kids, pets, and our planet.
        </p>
      </div>

      {submitted ? (
        <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 p-8 sm:p-12 text-center transform transition-all">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 text-emerald-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You for Your Interest!</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6 text-sm sm:text-base">
            Your request for an EcoClean trial has been securely recorded to **Firebase Firestore**. Our founder team will get in touch with you shortly.
          </p>
          <div className="p-4 bg-emerald-50/80 rounded-xl max-w-md mx-auto mb-8 border border-emerald-200 text-left text-xs sm:text-sm text-emerald-900">
            <div className="font-semibold mb-1 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Submission Verified in Firestore</span>
            </div>
            <p className="text-emerald-700">
              Your details are safely stored in the <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">customer_interests</code> collection and will persist permanently across sessions.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              Submit Another Interest
            </button>
            {onSuccessNavigate && (
              <button
                onClick={onSuccessNavigate}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors text-sm flex items-center justify-center space-x-2 shadow-sm"
              >
                <span>View Real-Time Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Leaf className="w-5 h-5" />
              <span className="font-semibold text-base">Customer Validation Survey & Free Sample</span>
            </div>
            <span className="text-xs font-medium bg-white/20 px-2.5 py-1 rounded-md">
              Collection: customer_interests
            </span>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-800 text-sm">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Unable to submit:</div>
                  <div>{errorMessage}</div>
                </div>
              </div>
            )}

            {/* Personal Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Age Group
                </label>
                <select
                  value={formData.ageGroup}
                  onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                >
                  <option value="18-24">18-24 years</option>
                  <option value="25-34">25-34 years</option>
                  <option value="35-44">35-44 years</option>
                  <option value="45-54">45-54 years</option>
                  <option value="55+">55+ years</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="ananya@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">Protected by Admin-Only access rules</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">Kept strictly private</span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  City / Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indiranagar, Bengaluru or Mumbai"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center space-x-1.5">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <span>Cleaning Habits & Preferences</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Currently Uses Surface Cleaner?
                  </label>
                  <select
                    value={formData.currentlyUsesCleaner}
                    onChange={(e) => setFormData({ ...formData, currentlyUsesCleaner: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                  >
                    <option value="Yes, daily">Yes, daily</option>
                    <option value="Yes, regularly">Yes, regularly (2-3 times/week)</option>
                    <option value="Occasionally">Occasionally</option>
                    <option value="Rarely / Never">Rarely / Never</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Current Cleaner Brand
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lizol, Colin, Dettol, Homemade"
                    value={formData.currentBrand}
                    onChange={(e) => setFormData({ ...formData, currentBrand: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Importance of Eco-Friendliness (1 to 5)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={formData.ecoFriendlinessImportance}
                      onChange={(e) =>
                        setFormData({ ...formData, ecoFriendlinessImportance: Number(e.target.value) })
                      }
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <span className="font-bold text-emerald-700 text-sm min-w-[2.5rem] px-2 py-1 bg-emerald-50 rounded border border-emerald-200 text-center">
                      {formData.ecoFriendlinessImportance}/5
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                    <span>Not important</span>
                    <span>Extremely important</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Willingness to Try EcoClean
                  </label>
                  <select
                    value={formData.willingnessToTry}
                    onChange={(e) => setFormData({ ...formData, willingnessToTry: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                  >
                    <option value="Definitely will try">Definitely will try</option>
                    <option value="Very likely">Very likely</option>
                    <option value="Interested if free sample">Interested if free sample</option>
                    <option value="Neutral">Neutral</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Primary Buying Decision Factor
                  </label>
                  <select
                    value={formData.preferredBuyingFactor}
                    onChange={(e) => setFormData({ ...formData, preferredBuyingFactor: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                  >
                    <option value="100% Non-Toxic & Safe for Family">100% Non-Toxic & Safe for Family & Pets</option>
                    <option value="Superior Cleaning & Stain Removal">Superior Cleaning & Stain Removal Power</option>
                    <option value="Affordable Venture Price (₹99 for 500ml)">Affordable Venture Price (₹99 for 500ml)</option>
                    <option value="Refreshing Natural Citrus Fragrance">Refreshing Natural Citrus Fragrance</option>
                    <option value="Zero Waste & Biodegradable Packaging">Zero Waste & Biodegradable Packaging</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-gray-500 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Data stored permanently in Cloud Firestore</span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving to Firestore...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit & Request Trial Sample</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
