import React, { useState } from 'react';
import { Star, CheckCircle2, AlertCircle, MessageSquareQuote, Send, ArrowRight } from 'lucide-react';
import { submitProductFeedback } from '../services/firestoreService';

interface FeedbackFormProps {
  onSuccessNavigate?: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSuccessNavigate }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    effectivenessRating: 5,
    easeOfUseRating: 5,
    fragranceRating: 4,
    packagingRating: 5,
    priceValueRating: 5,
    overallSatisfaction: 5,
    repurchaseIntention: 'Yes',
    recommendation: 'Yes',
    likedMost: '',
    improvementSuggestion: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const renderStarPicker = (
    label: string,
    field: 'effectivenessRating' | 'easeOfUseRating' | 'fragranceRating' | 'packagingRating' | 'priceValueRating' | 'overallSatisfaction',
    value: number
  ) => {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors">
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 sm:mb-0">
          {label}
        </span>
        <div className="flex items-center space-x-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setFormData({ ...formData, [field]: star })}
              className="p-1 text-gray-300 hover:text-amber-400 focus:outline-hidden transition-colors"
            >
              <Star
                className={`w-6 h-6 ${
                  star <= value
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          <span className="text-xs font-bold text-gray-700 ml-2 w-8 text-right">
            {value}/5
          </span>
        </div>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.customerName.trim() || formData.customerName.length < 2) {
      setErrorMessage('Please enter your name.');
      return;
    }

    try {
      setLoading(true);
      await submitProductFeedback({
        customerName: formData.customerName.trim(),
        effectivenessRating: Number(formData.effectivenessRating),
        easeOfUseRating: Number(formData.easeOfUseRating),
        fragranceRating: Number(formData.fragranceRating),
        packagingRating: Number(formData.packagingRating),
        priceValueRating: Number(formData.priceValueRating),
        overallSatisfaction: Number(formData.overallSatisfaction),
        repurchaseIntention: formData.repurchaseIntention,
        recommendation: formData.recommendation,
        likedMost: formData.likedMost.trim() || 'Great cleaning experience',
        improvementSuggestion: formData.improvementSuggestion.trim() || 'Keep it up!',
        createdAt: new Date().toISOString(),
      });

      setSubmitted(true);
    } catch (err: unknown) {
      console.error('Failed to submit feedback:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to record feedback to Firestore. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      customerName: '',
      effectivenessRating: 5,
      easeOfUseRating: 5,
      fragranceRating: 4,
      packagingRating: 5,
      priceValueRating: 5,
      overallSatisfaction: 5,
      repurchaseIntention: 'Yes',
      recommendation: 'Yes',
      likedMost: '',
      improvementSuggestion: '',
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
          <MessageSquareQuote className="w-3.5 h-3.5 text-emerald-600" />
          <span>Product Experience & Validation</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          EcoClean <span className="text-emerald-600">Product Feedback</span>
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-lg mx-auto">
          Help us build India's premier sustainable cleaner. Your ratings directly guide our formulation and product development.
        </p>
      </div>

      {submitted ? (
        <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 text-emerald-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Feedback Recorded Successfully!</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6 text-sm">
            Your review and ratings have been saved to the <code className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-semibold">product_feedback</code> Firestore collection. The dashboard calculations have updated automatically.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              Submit Another Review
            </button>
            {onSuccessNavigate && (
              <button
                onClick={onSuccessNavigate}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors text-sm flex items-center justify-center space-x-2 shadow-sm"
              >
                <span>View Updated Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white flex items-center justify-between">
            <span className="font-semibold text-base">Customer Satisfaction & Rating Form</span>
            <span className="text-xs font-medium bg-white/20 px-2.5 py-1 rounded-md">
              Collection: product_feedback
            </span>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-800 text-sm">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Unable to submit feedback:</div>
                  <div>{errorMessage}</div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Verma"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>

            {/* Ratings Section */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Performance & Quality Ratings (1 to 5 Stars)
              </h3>
              {renderStarPicker('Cleaning Effectiveness', 'effectivenessRating', formData.effectivenessRating)}
              {renderStarPicker('Overall Satisfaction', 'overallSatisfaction', formData.overallSatisfaction)}
              {renderStarPicker('Price / Value Perception (₹99)', 'priceValueRating', formData.priceValueRating)}
              {renderStarPicker('Natural Citrus Fragrance', 'fragranceRating', formData.fragranceRating)}
              {renderStarPicker('Ease of Use (Spray Mechanism)', 'easeOfUseRating', formData.easeOfUseRating)}
              {renderStarPicker('Eco Packaging Quality', 'packagingRating', formData.packagingRating)}
            </div>

            {/* Repurchase & Recommendation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Repurchase Intention (at ₹99)
                </label>
                <select
                  value={formData.repurchaseIntention}
                  onChange={(e) => setFormData({ ...formData, repurchaseIntention: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                >
                  <option value="Yes">Yes, definitely</option>
                  <option value="Maybe">Maybe / Undecided</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Would you recommend to friends?
                </label>
                <select
                  value={formData.recommendation}
                  onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                >
                  <option value="Yes">Yes, highly likely</option>
                  <option value="Maybe">Maybe</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            {/* Qualitative Feedback */}
            <div className="space-y-4 pt-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  What did you like most about EcoClean?
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Great shine on kitchen counters without chemical smell, safe for my toddler..."
                  value={formData.likedMost}
                  onChange={(e) => setFormData({ ...formData, likedMost: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Suggestions for Improvement
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Offer larger 1-liter refill packs, lemongrass scent option..."
                  value={formData.improvementSuggestion}
                  onChange={(e) => setFormData({ ...formData, improvementSuggestion: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
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
                    <span>Submit Product Feedback</span>
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
