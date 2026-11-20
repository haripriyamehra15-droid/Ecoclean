export interface CustomerInterest {
  id?: string;
  name: string;
  ageGroup: string;
  location: string;
  email: string;
  phone: string;
  currentlyUsesCleaner: string;
  currentBrand: string;
  ecoFriendlinessImportance: number;
  willingnessToTry: string;
  preferredBuyingFactor: string;
  createdAt: string;
}

export interface ProductFeedback {
  id?: string;
  customerName: string;
  effectivenessRating: number;
  easeOfUseRating: number;
  fragranceRating: number;
  packagingRating: number;
  priceValueRating: number;
  overallSatisfaction: number;
  repurchaseIntention: string;
  recommendation: string;
  likedMost: string;
  improvementSuggestion: string;
  createdAt: string;
}

export interface Trial {
  id?: string;
  customerName: string;
  trialDate: string;
  trialStatus: 'Active' | 'Completed' | 'Converted' | 'Dropped';
  purchased: boolean;
  purchasePrice: number;
  createdAt: string;
}

export interface Purchase {
  id?: string;
  customerName: string;
  quantity: number;
  sellingPrice: number;
  totalAmount: number;
  purchaseDate: string;
  createdAt: string;
}

export interface MetricsSummary {
  totalInterests: number;
  totalTrials: number;
  totalPurchases: number;
  totalRevenue: number;
  feedbackCount: number;
  avgEffectiveness: number;
  avgSatisfaction: number;
  avgPriceValue: number;
  repurchaseIntentionPercent: number;
  recommendationPercent: number;
  updatedAt: string;
}

export interface VenturePlanEstimates {
  sellingPrice: number; // ₹99
  variableCost: number; // ₹50
  contributionPerUnit: number; // ₹49
  monthlyFixedCost: number; // ₹15,000
  breakEvenVolume: number; // ~307 units
}

export const VENTURE_PLAN_ESTIMATES: VenturePlanEstimates = {
  sellingPrice: 99,
  variableCost: 50,
  contributionPerUnit: 49,
  monthlyFixedCost: 15000,
  breakEvenVolume: 307,
};
