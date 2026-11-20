import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  runTransaction
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { CustomerInterest, ProductFeedback, Trial, Purchase, MetricsSummary } from '../types';

const INTERESTS_COLLECTION = 'customer_interests';
const FEEDBACK_COLLECTION = 'product_feedback';
const TRIALS_COLLECTION = 'trials';
const PURCHASES_COLLECTION = 'purchases';
const METRICS_DOC = doc(db, 'metrics', 'summary');

/**
 * Update the public aggregate metrics document atomically
 */
async function updateMetricsSummary(
  type: 'interest' | 'feedback' | 'trial' | 'purchase',
  payload?: {
    effectiveness?: number;
    satisfaction?: number;
    priceValue?: number;
    repurchaseIntention?: string;
    recommendation?: string;
    quantity?: number;
    totalAmount?: number;
  }
) {
  try {
    await runTransaction(db, async (transaction) => {
      const metricsSnapshot = await transaction.get(METRICS_DOC);
      const data = metricsSnapshot.exists()
        ? (metricsSnapshot.data() as {
            totalInterests: number;
            totalTrials: number;
            totalPurchases: number;
            totalRevenue: number;
            feedbackCount: number;
            sumEffectiveness: number;
            sumSatisfaction: number;
            sumPriceValue: number;
            yesRepurchaseCount: number;
            yesRecommendCount: number;
          })
        : {
            totalInterests: 0,
            totalTrials: 0,
            totalPurchases: 0,
            totalRevenue: 0,
            feedbackCount: 0,
            sumEffectiveness: 0,
            sumSatisfaction: 0,
            sumPriceValue: 0,
            yesRepurchaseCount: 0,
            yesRecommendCount: 0,
          };

      if (type === 'interest') {
        data.totalInterests = (data.totalInterests || 0) + 1;
      } else if (type === 'trial') {
        data.totalTrials = (data.totalTrials || 0) + 1;
      } else if (type === 'purchase') {
        data.totalPurchases = (data.totalPurchases || 0) + 1;
        data.totalRevenue = (data.totalRevenue || 0) + (payload?.totalAmount || 99);
      } else if (type === 'feedback' && payload) {
        data.feedbackCount = (data.feedbackCount || 0) + 1;
        data.sumEffectiveness = (data.sumEffectiveness || 0) + (payload.effectiveness || 0);
        data.sumSatisfaction = (data.sumSatisfaction || 0) + (payload.satisfaction || 0);
        data.sumPriceValue = (data.sumPriceValue || 0) + (payload.priceValue || 0);
        if (payload.repurchaseIntention === 'Yes') {
          data.yesRepurchaseCount = (data.yesRepurchaseCount || 0) + 1;
        }
        if (payload.recommendation === 'Yes') {
          data.yesRecommendCount = (data.yesRecommendCount || 0) + 1;
        }
      }

      const count = data.feedbackCount || 0;
      const computedSummary: MetricsSummary = {
        totalInterests: data.totalInterests,
        totalTrials: data.totalTrials,
        totalPurchases: data.totalPurchases,
        totalRevenue: data.totalRevenue,
        feedbackCount: count,
        avgEffectiveness: count > 0 ? Number((data.sumEffectiveness / count).toFixed(1)) : 0,
        avgSatisfaction: count > 0 ? Number((data.sumSatisfaction / count).toFixed(1)) : 0,
        avgPriceValue: count > 0 ? Number((data.sumPriceValue / count).toFixed(1)) : 0,
        repurchaseIntentionPercent: count > 0 ? Math.round((data.yesRepurchaseCount / count) * 100) : 0,
        recommendationPercent: count > 0 ? Math.round((data.yesRecommendCount / count) * 100) : 0,
        updatedAt: new Date().toISOString(),
      };

      transaction.set(METRICS_DOC, {
        ...data,
        ...computedSummary,
      });
    });
  } catch (error) {
    console.warn('Metrics atomic update warning (rules might restrict or offline):', error);
  }
}

/**
 * Submit "Try EcoClean" customer lead
 */
export async function submitCustomerInterest(data: Omit<CustomerInterest, 'id'>): Promise<string> {
  try {
    const colRef = collection(db, INTERESTS_COLLECTION);
    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
    });
    // Update summary aggregate
    await updateMetricsSummary('interest');
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, INTERESTS_COLLECTION);
    throw error;
  }
}

/**
 * Submit customer feedback form
 */
export async function submitProductFeedback(data: Omit<ProductFeedback, 'id'>): Promise<string> {
  try {
    const colRef = collection(db, FEEDBACK_COLLECTION);
    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
    });
    // Update summary aggregate
    await updateMetricsSummary('feedback', {
      effectiveness: data.effectivenessRating,
      satisfaction: data.overallSatisfaction,
      priceValue: data.priceValueRating,
      repurchaseIntention: data.repurchaseIntention,
      recommendation: data.recommendation,
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, FEEDBACK_COLLECTION);
    throw error;
  }
}

/**
 * Record a trial in Firestore
 */
export async function recordTrial(data: Omit<Trial, 'id'>): Promise<string> {
  try {
    const colRef = collection(db, TRIALS_COLLECTION);
    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
    });
    await updateMetricsSummary('trial');
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, TRIALS_COLLECTION);
    throw error;
  }
}

/**
 * Record a purchase in Firestore
 */
export async function recordPurchase(data: Omit<Purchase, 'id'>): Promise<string> {
  try {
    const colRef = collection(db, PURCHASES_COLLECTION);
    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
    });
    await updateMetricsSummary('purchase', {
      quantity: data.quantity,
      totalAmount: data.totalAmount,
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, PURCHASES_COLLECTION);
    throw error;
  }
}

/**
 * Subscribe to aggregate metrics
 */
export function subscribeToMetrics(
  onUpdate: (data: MetricsSummary | null) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    METRICS_DOC,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as MetricsSummary);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      console.warn('Metrics subscription notification:', error.message);
      if (onError) onError(error);
      else handleFirestoreError(error, OperationType.GET, 'metrics/summary');
    }
  );
}

/**
 * Subscribe to Customer Interests (Admin only)
 */
export function subscribeToCustomerInterests(
  onUpdate: (interests: CustomerInterest[]) => void,
  onError: (err: Error) => void
) {
  const q = query(collection(db, INTERESTS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: CustomerInterest[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<CustomerInterest, 'id'>),
      }));
      onUpdate(items);
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.LIST, INTERESTS_COLLECTION);
    }
  );
}

/**
 * Subscribe to Feedback (Admin/Public)
 */
export function subscribeToProductFeedback(
  onUpdate: (feedbacks: ProductFeedback[]) => void,
  onError: (err: Error) => void
) {
  const q = query(collection(db, FEEDBACK_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: ProductFeedback[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ProductFeedback, 'id'>),
      }));
      onUpdate(items);
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.LIST, FEEDBACK_COLLECTION);
    }
  );
}

/**
 * Subscribe to Trials (Admin only)
 */
export function subscribeToTrials(
  onUpdate: (trials: Trial[]) => void,
  onError: (err: Error) => void
) {
  const q = query(collection(db, TRIALS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Trial[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Trial, 'id'>),
      }));
      onUpdate(items);
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.LIST, TRIALS_COLLECTION);
    }
  );
}

/**
 * Subscribe to Purchases (Admin only)
 */
export function subscribeToPurchases(
  onUpdate: (purchases: Purchase[]) => void,
  onError: (err: Error) => void
) {
  const q = query(collection(db, PURCHASES_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Purchase[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Purchase, 'id'>),
      }));
      onUpdate(items);
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.LIST, PURCHASES_COLLECTION);
    }
  );
}
