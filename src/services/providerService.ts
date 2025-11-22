/**
 * Service Provider (Donneur de sang)
 * Gère toutes les opérations liées aux donneurs et leurs réponses aux alertes
 */

import { firebaseFirestore, FIREBASE_COLLECTIONS, getFirebaseErrorMessage } from '../config/firebase';
import firestore from '@react-native-firebase/firestore';
import {
  FirebaseProvider,
  FirebaseAlert,
  FirebaseAlertResponse,
  FirebaseBloodBank,
} from '../types/firebase.types';

// ============================================
// TYPES SPÉCIFIQUES AU PROVIDER
// ============================================

export interface ProviderStats {
  totalDonations: number;
  pendingResponses: number;
  acceptedResponses: number;
  completedDonations: number;
}

export interface ProviderDonationHistory {
  id: string;
  alertId: string;
  bankName: string;
  bloodGroup: string;
  rhesus: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  responseDate: any;
  completedDate?: any;
}

// ============================================
// SERVICE PROVIDER
// ============================================

class ProviderService {
  /**
   * Récupérer le profil du provider par UID
   */
  async getProviderProfile(uid: string): Promise<FirebaseProvider | null> {
    try {
      const doc = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.PROVIDERS)
        .doc(uid)
        .get();

      if (doc.exists) {
        return doc.data() as FirebaseProvider;
      }

      const snapshot = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.PROVIDERS)
        .where('uid', '==', uid)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      return snapshot.docs[0].data() as FirebaseProvider;
    } catch (error: any) {
      console.error('Erreur lors de la récupération du profil provider:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Mettre à jour le profil du provider
   */
  async updateProviderProfile(providerId: string, data: Partial<FirebaseProvider>): Promise<void> {
    try {
      await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.PROVIDERS)
        .doc(providerId)
        .update({
          ...data,
          updatedAt: firestore.Timestamp.now(),
        });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Mettre à jour la disponibilité du provider
   */
  async updateAvailability(providerId: string, isAvailable: boolean): Promise<void> {
    try {
      await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.PROVIDERS)
        .doc(providerId)
        .update({
          isAvailable,
          updatedAt: firestore.Timestamp.now(),
        });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la disponibilité:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer toutes les alertes actives
   */
  async getActiveAlerts(): Promise<FirebaseAlert[]> {
    try {
      const snapshot = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.ALERTS)
        .where('status', '==', 'active')
        .orderBy('alertDate', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as FirebaseAlert));
    } catch (error: any) {
      console.error('Erreur lors de la récupération des alertes:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer les alertes compatibles avec le groupe sanguin du provider
   */
  async getCompatibleAlerts(bloodGroup: string, rhesus: string): Promise<FirebaseAlert[]> {
    try {
      // Récupérer toutes les alertes actives puis filtrer
      const snapshot = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.ALERTS)
        .where('status', '==', 'active')
        .orderBy('alertDate', 'desc')
        .get();

      const alerts = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as FirebaseAlert));

      // Filtrer par compatibilité sanguine
      return alerts.filter(alert => {
        // Logique de compatibilité sanguine simplifiée
        if (alert.bloodGroup === bloodGroup && alert.rhesus === rhesus) {
          return true;
        }
        // Le groupe O- est donneur universel
        if (bloodGroup === 'O' && rhesus === '-') {
          return true;
        }
        // Le groupe O+ peut donner aux groupes positifs
        if (bloodGroup === 'O' && rhesus === '+' && alert.rhesus === '+') {
          return true;
        }
        return false;
      });
    } catch (error: any) {
      console.error('Erreur lors de la récupération des alertes compatibles:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Répondre à une alerte
   */
  async respondToAlert(
    alertId: string,
    providerId: string,
    providerName: string,
    notes?: string
  ): Promise<FirebaseAlertResponse> {
    try {
      // Vérifier si le provider n'a pas déjà répondu
      const existingResponse = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.ALERT_RESPONSES)
        .where('alertId', '==', alertId)
        .where('providerId', '==', providerId)
        .limit(1)
        .get();

      if (!existingResponse.empty) {
        throw new Error('Vous avez déjà répondu à cette alerte');
      }

      const responseRef = firebaseFirestore.collection(FIREBASE_COLLECTIONS.ALERT_RESPONSES).doc();
      const now = firestore.Timestamp.now();

      const response: FirebaseAlertResponse = {
        id: responseRef.id,
        alertId,
        providerId,
        providerName,
        status: 'pending',
        responseDate: now,
        notes: notes || null,
        createdAt: now,
        updatedAt: now,
      };

      await responseRef.set(response);

      // Incrémenter le compteur de réponses de l'alerte
      await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.ALERTS)
        .doc(alertId)
        .update({
          responseCount: firestore.FieldValue.increment(1),
          updatedAt: now,
        });

      return response;
    } catch (error: any) {
      console.error('Erreur lors de la réponse à l\'alerte:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer les réponses du provider
   */
  async getProviderResponses(providerId: string): Promise<FirebaseAlertResponse[]> {
    try {
      const snapshot = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.ALERT_RESPONSES)
        .where('providerId', '==', providerId)
        .orderBy('responseDate', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as FirebaseAlertResponse));
    } catch (error: any) {
      console.error('Erreur lors de la récupération des réponses:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer l'historique des dons (réponses complétées)
   */
  async getDonationHistory(providerId: string): Promise<ProviderDonationHistory[]> {
    try {
      const responsesSnapshot = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.ALERT_RESPONSES)
        .where('providerId', '==', providerId)
        .where('status', '==', 'completed')
        .orderBy('responseDate', 'desc')
        .get();

      const donationHistories: ProviderDonationHistory[] = [];

      for (const doc of responsesSnapshot.docs) {
        const response = doc.data() as FirebaseAlertResponse;

        // Récupérer les détails de l'alerte
        const alertDoc = await firebaseFirestore
          .collection(FIREBASE_COLLECTIONS.ALERTS)
          .doc(response.alertId)
          .get();

        if (alertDoc.exists) {
          const alert = alertDoc.data() as FirebaseAlert;
          donationHistories.push({
            id: doc.id,
            alertId: response.alertId,
            bankName: alert.bankName,
            bloodGroup: alert.bloodGroup,
            rhesus: alert.rhesus,
            status: response.status,
            responseDate: response.responseDate,
          });
        }
      }

      return donationHistories;
    } catch (error: any) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer les statistiques du provider
   */
  async getProviderStats(providerId: string): Promise<ProviderStats> {
    try {
      const snapshot = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.ALERT_RESPONSES)
        .where('providerId', '==', providerId)
        .get();

      const responses = snapshot.docs.map(doc => doc.data() as FirebaseAlertResponse);

      return {
        totalDonations: responses.filter(r => r.status === 'completed').length,
        pendingResponses: responses.filter(r => r.status === 'pending').length,
        acceptedResponses: responses.filter(r => r.status === 'accepted').length,
        completedDonations: responses.filter(r => r.status === 'completed').length,
      };
    } catch (error: any) {
      console.error('Erreur lors du calcul des statistiques:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Souscrire aux alertes actives en temps réel
   */
  subscribeToActiveAlerts(callback: (alerts: FirebaseAlert[]) => void): () => void {
    return firebaseFirestore
      .collection(FIREBASE_COLLECTIONS.ALERTS)
      .where('status', '==', 'active')
      .orderBy('alertDate', 'desc')
      .onSnapshot(
        (snapshot) => {
          const alerts = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          } as FirebaseAlert));
          callback(alerts);
        },
        (error) => {
          console.error('Erreur lors de l\'écoute des alertes:', error);
        }
      );
  }

  /**
   * Souscrire aux réponses du provider en temps réel
   */
  subscribeToProviderResponses(
    providerId: string,
    callback: (responses: FirebaseAlertResponse[]) => void
  ): () => void {
    return firebaseFirestore
      .collection(FIREBASE_COLLECTIONS.ALERT_RESPONSES)
      .where('providerId', '==', providerId)
      .orderBy('responseDate', 'desc')
      .onSnapshot(
        (snapshot) => {
          const responses = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          } as FirebaseAlertResponse));
          callback(responses);
        },
        (error) => {
          console.error('Erreur lors de l\'écoute des réponses:', error);
        }
      );
  }

  /**
   * Récupérer une alerte par ID
   */
  async getAlertById(alertId: string): Promise<FirebaseAlert | null> {
    try {
      const doc = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.ALERTS)
        .doc(alertId)
        .get();

      if (!doc.exists) {
        return null;
      }

      return {
        ...doc.data(),
        id: doc.id,
      } as FirebaseAlert;
    } catch (error: any) {
      console.error('Erreur lors de la récupération de l\'alerte:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer une banque de sang par ID
   */
  async getBloodBankById(bankId: string): Promise<FirebaseBloodBank | null> {
    try {
      const doc = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.BLOOD_BANKS)
        .doc(bankId)
        .get();

      if (!doc.exists) {
        return null;
      }

      return doc.data() as FirebaseBloodBank;
    } catch (error: any) {
      console.error('Erreur lors de la récupération de la banque:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Mettre à jour le token FCM du provider
   */
  async updateFcmToken(providerId: string, fcmToken: string | null): Promise<void> {
    try {
      await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.PROVIDERS)
        .doc(providerId)
        .update({
          fcmToken: fcmToken || null,
          updatedAt: firestore.Timestamp.now(),
        });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du token FCM:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Mettre à jour la date du dernier don
   */
  async updateLastDonation(providerId: string): Promise<void> {
    try {
      await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.PROVIDERS)
        .doc(providerId)
        .update({
          lastGive: firestore.Timestamp.now(),
          updatedAt: firestore.Timestamp.now(),
        });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du dernier don:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }
}

// Export d'une instance unique du service
export const providerService = new ProviderService();
