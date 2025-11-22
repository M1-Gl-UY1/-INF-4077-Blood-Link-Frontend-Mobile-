/**
 * Service de gestion des alertes de don de sang
 * Gère toutes les opérations liées aux alertes et réponses
 */

import { firebaseFirestore, FIREBASE_COLLECTIONS, getFirebaseErrorMessage } from '../config/firebase';
import firestore from '@react-native-firebase/firestore';
import {
  FirebaseAlert,
  FirebaseAlertResponse,
  FirebaseProvider,
} from '../types/firebase.types';
import { BloodGroup, Rhesus } from '../models';

// Types pour la création d'alertes
export interface CreateAlertDTO {
  bloodBankId: string;
  bankName: string;
  bankLocation?: string;
  bloodGroup: BloodGroup;
  rhesus: Rhesus;
  message: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  // Pour les alertes initiées par un médecin
  initiatedBy?: 'bank' | 'doctor';
  doctorId?: string;
  doctorName?: string;
  hospitalName?: string;
  requestId?: string;
}

// Type pour la création de réponse à une alerte
export interface CreateAlertResponseDTO {
  alertId: string;
  providerId: string;
  providerName: string;
  providerPhone?: string;
  notes?: string;
}

// Type pour les alertes avec informations supplémentaires
export interface AlertWithResponses extends FirebaseAlert {
  responses?: FirebaseAlertResponse[];
}

class AlertService {
  /**
   * Créer une nouvelle alerte de don de sang
   */
  async createAlert(data: CreateAlertDTO): Promise<FirebaseAlert> {
    try {
      const alertRef = firebaseFirestore.collection(FIREBASE_COLLECTIONS.ALERTS).doc();
      const now = firestore.Timestamp.now();

      const alert: FirebaseAlert = {
        id: alertRef.id,
        bloodBankId: data.bloodBankId,
        bankName: data.bankName,
        bankLocation: data.bankLocation || null,
        bloodGroup: data.bloodGroup,
        rhesus: data.rhesus,
        message: data.message,
        urgencyLevel: data.urgencyLevel,
        status: 'active',
        alertDate: now,
        responseCount: 0,
        createdAt: now,
        updatedAt: now,
        // Infos sur l'initiateur
        initiatedBy: data.initiatedBy || 'bank',
        doctorId: data.doctorId || null,
        doctorName: data.doctorName || null,
        hospitalName: data.hospitalName || null,
        requestId: data.requestId || null,
      };

      await alertRef.set(alert);

      console.log('Alerte créée avec succès:', alert.id);
      return alert;
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'alerte:', error);
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

      return snapshot.docs.map(doc => doc.data() as FirebaseAlert);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des alertes actives:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer les alertes d'une banque de sang spécifique
   */
  async getAlertsByBank(bankId: string): Promise<FirebaseAlert[]> {
    try {
      const snapshot = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.ALERTS)
        .where('bloodBankId', '==', bankId)
        .orderBy('alertDate', 'desc')
        .get();

      return snapshot.docs.map(doc => doc.data() as FirebaseAlert);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des alertes de la banque:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer les alertes actives d'une banque de sang
   */
  async getActiveAlertsByBank(bankId: string): Promise<FirebaseAlert[]> {
    try {
      const snapshot = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.ALERTS)
        .where('bloodBankId', '==', bankId)
        .where('status', '==', 'active')
        .orderBy('alertDate', 'desc')
        .get();

      return snapshot.docs.map(doc => doc.data() as FirebaseAlert);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des alertes actives:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer une alerte par son ID
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

      return doc.data() as FirebaseAlert;
    } catch (error: any) {
      console.error('Erreur lors de la récupération de l\'alerte:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Mettre à jour le statut d'une alerte
   */
  async updateAlertStatus(alertId: string, status: 'active' | 'resolved' | 'cancelled'): Promise<void> {
    try {
      await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.ALERTS)
        .doc(alertId)
        .update({
          status,
          updatedAt: firestore.Timestamp.now(),
        });

      console.log(`Statut de l'alerte ${alertId} mis à jour: ${status}`);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du statut de l\'alerte:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Annuler une alerte
   */
  async cancelAlert(alertId: string): Promise<void> {
    return this.updateAlertStatus(alertId, 'cancelled');
  }

  /**
   * Résoudre une alerte (don effectué)
   */
  async resolveAlert(alertId: string): Promise<void> {
    return this.updateAlertStatus(alertId, 'resolved');
  }

  /**
   * Créer une réponse à une alerte (un donneur répond)
   */
  async createAlertResponse(data: CreateAlertResponseDTO): Promise<FirebaseAlertResponse> {
    try {
      const responseRef = firebaseFirestore.collection(FIREBASE_COLLECTIONS.ALERT_RESPONSES).doc();
      const now = firestore.Timestamp.now();

      const alertResponse: FirebaseAlertResponse = {
        id: responseRef.id,
        alertId: data.alertId,
        providerId: data.providerId,
        providerName: data.providerName,
        status: 'pending',
        responseDate: now,
        notes: data.notes || null,
        createdAt: now,
        updatedAt: now,
      };

      // Utiliser une transaction pour créer la réponse et incrémenter le compteur
      await firebaseFirestore.runTransaction(async (transaction) => {
        const alertRef = firebaseFirestore.collection(FIREBASE_COLLECTIONS.ALERTS).doc(data.alertId);
        const alertDoc = await transaction.get(alertRef);

        if (!alertDoc.exists) {
          throw new Error('Alerte non trouvée');
        }

        // Créer la réponse
        transaction.set(responseRef, alertResponse);

        // Incrémenter le compteur de réponses
        transaction.update(alertRef, {
          responseCount: firestore.FieldValue.increment(1),
          updatedAt: now,
        });
      });

      console.log('Réponse à l\'alerte créée:', alertResponse.id);
      return alertResponse;
    } catch (error: any) {
      console.error('Erreur lors de la création de la réponse:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer les réponses à une alerte
   */
  async getAlertResponses(alertId: string): Promise<FirebaseAlertResponse[]> {
    try {
      const snapshot = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.ALERT_RESPONSES)
        .where('alertId', '==', alertId)
        .orderBy('responseDate', 'desc')
        .get();

      return snapshot.docs.map(doc => doc.data() as FirebaseAlertResponse);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des réponses:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer les alertes avec leurs réponses pour une banque
   */
  async getAlertsWithResponsesByBank(bankId: string): Promise<AlertWithResponses[]> {
    try {
      const alerts = await this.getAlertsByBank(bankId);

      const alertsWithResponses = await Promise.all(
        alerts.map(async (alert) => {
          const responses = await this.getAlertResponses(alert.id);
          return { ...alert, responses };
        })
      );

      return alertsWithResponses;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des alertes avec réponses:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer les alertes qui ont reçu des réponses (pour la banque)
   */
  async getAlertsWithPendingResponses(bankId: string): Promise<AlertWithResponses[]> {
    try {
      const alerts = await this.getActiveAlertsByBank(bankId);

      const alertsWithResponses = await Promise.all(
        alerts.map(async (alert) => {
          const responses = await this.getAlertResponses(alert.id);
          return { ...alert, responses };
        })
      );

      // Filtrer pour ne garder que celles avec des réponses en attente
      return alertsWithResponses.filter(alert =>
        alert.responses && alert.responses.some(r => r.status === 'pending')
      );
    } catch (error: any) {
      console.error('Erreur lors de la récupération des alertes avec réponses:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Mettre à jour le statut d'une réponse à une alerte
   */
  async updateAlertResponseStatus(
    responseId: string,
    status: 'pending' | 'accepted' | 'completed' | 'cancelled'
  ): Promise<void> {
    try {
      await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.ALERT_RESPONSES)
        .doc(responseId)
        .update({
          status,
          updatedAt: firestore.Timestamp.now(),
        });

      console.log(`Statut de la réponse ${responseId} mis à jour: ${status}`);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la réponse:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Accepter une réponse à une alerte
   */
  async acceptAlertResponse(responseId: string): Promise<void> {
    return this.updateAlertResponseStatus(responseId, 'accepted');
  }

  /**
   * Marquer une réponse comme complétée (don effectué)
   */
  async completeAlertResponse(responseId: string): Promise<void> {
    return this.updateAlertResponseStatus(responseId, 'completed');
  }

  /**
   * Annuler une réponse
   */
  async cancelAlertResponse(responseId: string): Promise<void> {
    return this.updateAlertResponseStatus(responseId, 'cancelled');
  }

  /**
   * Récupérer les réponses d'un provider (donneur)
   */
  async getResponsesByProvider(providerId: string): Promise<FirebaseAlertResponse[]> {
    try {
      const snapshot = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.ALERT_RESPONSES)
        .where('providerId', '==', providerId)
        .orderBy('responseDate', 'desc')
        .get();

      return snapshot.docs.map(doc => doc.data() as FirebaseAlertResponse);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des réponses du provider:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Vérifier si un provider a déjà répondu à une alerte
   */
  async hasProviderRespondedToAlert(alertId: string, providerId: string): Promise<boolean> {
    try {
      const snapshot = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.ALERT_RESPONSES)
        .where('alertId', '==', alertId)
        .where('providerId', '==', providerId)
        .limit(1)
        .get();

      return !snapshot.empty;
    } catch (error: any) {
      console.error('Erreur lors de la vérification de la réponse:', error);
      return false;
    }
  }

  /**
   * Récupérer tous les providers avec leur token FCM pour les notifications
   * Filtre optionnel par groupe sanguin compatible
   */
  async getProvidersForNotification(
    bloodGroup?: BloodGroup,
    rhesus?: Rhesus
  ): Promise<FirebaseProvider[]> {
    try {
      let query = firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.PROVIDERS)
        .where('isActive', '==', true)
        .where('isAvailable', '==', true);

      // Si on filtre par groupe sanguin compatible
      if (bloodGroup && rhesus) {
        query = query
          .where('bloodGroup', '==', bloodGroup)
          .where('rhesus', '==', rhesus);
      }

      const snapshot = await query.get();

      // Filtrer pour ne garder que ceux avec un token FCM
      const providers = snapshot.docs
        .map(doc => doc.data() as FirebaseProvider)
        .filter(provider => provider.fcmToken !== null && provider.fcmToken !== '');

      return providers;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des providers:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer tous les tokens FCM des providers pour envoyer une notification
   */
  async getAllProviderFcmTokens(): Promise<string[]> {
    try {
      const snapshot = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.PROVIDERS)
        .where('isActive', '==', true)
        .where('isAvailable', '==', true)
        .get();

      const tokens = snapshot.docs
        .map(doc => doc.data() as FirebaseProvider)
        .filter(provider => provider.fcmToken !== null && provider.fcmToken !== '')
        .map(provider => provider.fcmToken as string);

      return tokens;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des tokens FCM:', error);
      return [];
    }
  }

  /**
   * Écouter les changements sur les alertes actives d'une banque (temps réel)
   */
  subscribeToActiveAlertsByBank(
    bankId: string,
    callback: (alerts: FirebaseAlert[]) => void
  ): () => void {
    return firebaseFirestore
      .collection(FIREBASE_COLLECTIONS.ALERTS)
      .where('bloodBankId', '==', bankId)
      .where('status', '==', 'active')
      .orderBy('alertDate', 'desc')
      .onSnapshot(
        (snapshot) => {
          const alerts = snapshot.docs.map(doc => doc.data() as FirebaseAlert);
          callback(alerts);
        },
        (error) => {
          console.error('Erreur lors de l\'écoute des alertes:', error);
        }
      );
  }

  /**
   * Écouter les changements sur toutes les alertes actives (pour les providers)
   */
  subscribeToAllActiveAlerts(callback: (alerts: FirebaseAlert[]) => void): () => void {
    return firebaseFirestore
      .collection(FIREBASE_COLLECTIONS.ALERTS)
      .where('status', '==', 'active')
      .orderBy('alertDate', 'desc')
      .onSnapshot(
        (snapshot) => {
          const alerts = snapshot.docs.map(doc => doc.data() as FirebaseAlert);
          callback(alerts);
        },
        (error) => {
          console.error('Erreur lors de l\'écoute des alertes:', error);
        }
      );
  }

  /**
   * Écouter les réponses à une alerte spécifique (temps réel)
   */
  subscribeToAlertResponses(
    alertId: string,
    callback: (responses: FirebaseAlertResponse[]) => void
  ): () => void {
    return firebaseFirestore
      .collection(FIREBASE_COLLECTIONS.ALERT_RESPONSES)
      .where('alertId', '==', alertId)
      .orderBy('responseDate', 'desc')
      .onSnapshot(
        (snapshot) => {
          const responses = snapshot.docs.map(doc => doc.data() as FirebaseAlertResponse);
          callback(responses);
        },
        (error) => {
          console.error('Erreur lors de l\'écoute des réponses:', error);
        }
      );
  }
}

export const alertService = new AlertService();
