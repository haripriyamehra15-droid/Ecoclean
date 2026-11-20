import React, { useState } from 'react';
import { X, FlaskConical, CheckCircle2, AlertCircle } from 'lucide-react';
import { recordTrial } from '../services/firestoreService';
import { Trial } from '../types';

interface RecordTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialCustomerName?: string;
}

export const RecordTrialModal: React.FC<RecordTrialModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialCustomerName = '',
}) => {
  const [customerName, setCustomerName] = useState(initialCustomerName);
  const [trialDate, setTrialDate] = useState(new Date().toISOString().split('T')[0]);
  const [trialStatus, setTrialStatus] = useState<Trial['trialStatus']>('Active');
  const [purchased, setPurchased] = useState(false);
  const [purchasePrice, setPurchasePrice] = useState(99);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Please provide the customer name.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await recordTrial({
        customerName: customerName.trim(),
        trialDate,
        trialStatus,
        purchased,
        purchasePrice: purchased ? Number(purchasePrice) : 0,
        createdAt: new Date().toISOString(),
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Failed to record trial:', err);
      setError(err instanceof Error ? err.message : 'Error recording trial to Firestore.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden">
        <div className="bg-emerald-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FlaskConical className="w-5 h-5" />
            <h3 className="font-semibold text-base">Record Customer Trial</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-emerald-700 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Patel"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Trial Distribution Date
            </label>
            <input
              type="date"
              value={trialDate}
              onChange={(e) => setTrialDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Trial Status
            </label>
            <select
              value={trialStatus}
              onChange={(e) => setTrialStatus(e.target.value as Trial['trialStatus'])}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="Active">Active (Sample in use)</option>
              <option value="Completed">Completed (Trial finished)</option>
              <option value="Converted">Converted (Bought EcoClean)</option>
              <option value="Dropped">Dropped (Not interested)</option>
            </select>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60 space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="convertedCheck"
                checked={purchased}
                onChange={(e) => {
                  setPurchased(e.target.checked);
                  if (e.target.checked) setTrialStatus('Converted');
                }}
                className="w-4 h-4 text-emerald-600 rounded-sm border-gray-300 focus:ring-emerald-500"
              />
              <label htmlFor="convertedCheck" className="text-xs font-semibold text-emerald-950 cursor-pointer">
                Trial Converted to Paid Purchase
              </label>
            </div>

            {purchased && (
              <div>
                <label className="block text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
                  Purchase Price (₹)
                </label>
                <input
                  type="number"
                  min={1}
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 bg-white text-sm"
                />
              </div>
            )}
          </div>

          <div className="pt-3 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Trial to Firestore'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
