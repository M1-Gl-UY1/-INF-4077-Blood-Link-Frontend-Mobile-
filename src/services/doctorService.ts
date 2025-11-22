/**
 * Service Doctor
 * Gère toutes les opérations liées aux médecins et leurs demandes de sang
 */

import { firebaseFirestore, FIREBASE_COLLECTIONS, getFirebaseErrorMessage } from '../config/firebase';
import firestore from '@react-native-firebase/firestore';
import {
  FirebaseDoctor,
  FirebaseBloodRequest,
  FirebaseBloodBank,
} from '../types/firebase.types';

// ============================================
// TYPES SPÉCIFIQUES AU DOCTOR
// ============================================

export interface CreateBloodRequestDTO {
  doctorId: string;
  doctorName: string;
  bloodBankId: string;
  bankName: string;
  bloodGroup: string;
  rhesus: string;
  quantity: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  patientInfo?: string;
  notes?: string;
}

export interface DoctorStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
}

// ============================================
// SERVICE DOCTOR
// ============================================

class DoctorService {
  /**
   * Récupérer le profil du médecin par UID
   */
  async getDoctorProfile(uid: string): Promise<FirebaseDoctor | null> {
    try {
      const doc = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.DOCTORS)
        .doc(uid)
        .get();

      if (doc.exists) {
        return doc.data() as FirebaseDoctor;
      }

      // Recherche par champ uid si le document n'existe pas directement
      const snapshot = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.DOCTORS)
        .where('uid', '==', uid)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      return snapshot.docs[0].data() as FirebaseDoctor;
    } catch (error: any) {
      console.error('Erreur lors de la récupération du profil médecin:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Mettre à jour le profil du médecin
   */
  async updateDoctorProfile(doctorId: string, data: Partial<FirebaseDoctor>): Promise<void> {
    try {
      await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.DOCTORS)
        .doc(doctorId)
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
   * Récupérer toutes les banques de sang actives
   */
  async getAllBloodBanks(): Promise<FirebaseBloodBank[]> {
    try {
      const snapshot = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.BLOOD_BANKS)
        .where('isActive', '==', true)
        .orderBy('name', 'asc')
        .get();

      return snapshot.docs.map(doc => doc.data() as FirebaseBloodBank);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des banques:', error);
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
   * Créer une demande de sang (en attente de validation par la banque)
   */
  async createBloodRequest(data: CreateBloodRequestDTO): Promise<FirebaseBloodRequest> {
    try {
      const requestRef = firebaseFirestore.collection(FIREBASE_COLLECTIONS.BLOOD_REQUESTS).doc();
      const now = firestore.Timestamp.now();

      const bloodRequest: FirebaseBloodRequest = {
        id: requestRef.id,
        doctorId: data.doctorId,
        doctorName: data.doctorName,
        bloodBankId: data.bloodBankId,
        bankName: data.bankName,
        bloodGroup: data.bloodGroup,
        rhesus: data.rhesus,
        quantity: data.quantity,
        urgencyLevel: data.urgencyLevel,
        patientInfo: data.patientInfo || null,
        notes: data.notes || null,
        status: 'pending', // En attente de validation par la banque
        requestDate: now,
        createdAt: now,
        updatedAt: now,
      };

      await requestRef.set(bloodRequest);

      return bloodRequest;
    } catch (error: any) {
      console.error('Erreur lors de la création de la demande:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer toutes les demandes d'un médecin
   */
  async getDoctorRequests(doctorId: string): Promise<FirebaseBloodRequest[]> {
    try {
      const snapshot = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.BLOOD_REQUESTS)
        .where('doctorId', '==', doctorId)
        .orderBy('requestDate', 'desc')
        .get();

      return snapshot.docs.map(doc => doc.data() as FirebaseBloodRequest);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des demandes:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer les demandes en attente d'un médecin
   */
  async getPendingRequests(doctorId: string): Promise<FirebaseBloodRequest[]> {
    try {
      const snapshot = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.BLOOD_REQUESTS)
        .where('doctorId', '==', doctorId)
        .where('status', '==', 'pending')
        .orderBy('requestDate', 'desc')
        .get();

      return snapshot.docs.map(doc => doc.data() as FirebaseBloodRequest);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des demandes en attente:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer l'historique des demandes (approuvées ou rejetées)
   */
  async getRequestHistory(doctorId: string): Promise<FirebaseBloodRequest[]> {
    try {
      const snapshot = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.BLOOD_REQUESTS)
        .where('doctorId', '==', doctorId)
        .where('status', 'in', ['approved', 'rejected'])
        .orderBy('requestDate', 'desc')
        .get();

      return snapshot.docs.map(doc => doc.data() as FirebaseBloodRequest);
    } catch (error: any) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Annuler une demande de sang (seulement si en attente)
   */
  async cancelRequest(requestId: string): Promise<void> {
    try {
      const doc = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.BLOOD_REQUESTS)
        .doc(requestId)
        .get();

      if (!doc.exists) {
        throw new Error('Demande non trouvée');
      }

      const request = doc.data() as FirebaseBloodRequest;

      if (request.status !== 'pending') {
        throw new Error('Seules les demandes en attente peuvent être annulées');
      }

      await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.BLOOD_REQUESTS)
        .doc(requestId)
        .update({
          status: 'cancelled',
          updatedAt: firestore.Timestamp.now(),
        });
    } catch (error: any) {
      console.error('Erreur lors de l\'annulation de la demande:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer les statistiques du médecin
   */
  async getDoctorStats(doctorId: string): Promise<DoctorStats> {
    try {
      const snapshot = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.BLOOD_REQUESTS)
        .where('doctorId', '==', doctorId)
        .get();

      const requests = snapshot.docs.map(doc => doc.data() as FirebaseBloodRequest);

      return {
        totalRequests: requests.length,
        pendingRequests: requests.filter(r => r.status === 'pending').length,
        approvedRequests: requests.filter(r => r.status === 'approved').length,
        rejectedRequests: requests.filter(r => r.status === 'rejected').length,
      };
    } catch (error: any) {
      console.error('Erreur lors du calcul des statistiques:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Souscrire aux demandes du médecin en temps réel
   */
  subscribeToRequests(
    doctorId: string,
    callback: (requests: FirebaseBloodRequest[]) => void
  ): () => void {
    return firebaseFirestore
      .collection(FIREBASE_COLLECTIONS.BLOOD_REQUESTS)
      .where('doctorId', '==', doctorId)
      .orderBy('requestDate', 'desc')
      .onSnapshot(
        (snapshot) => {
          const requests = snapshot.docs.map(doc => doc.data() as FirebaseBloodRequest);
          callback(requests);
        },
        (error) => {
          console.error('Erreur lors de l\'écoute des demandes:', error);
        }
      );
  }

  /**
   * Souscrire aux demandes en attente du médecin
   */
  subscribeToPendingRequests(
    doctorId: string,
    callback: (requests: FirebaseBloodRequest[]) => void
  ): () => void {
    return firebaseFirestore
      .collection(FIREBASE_COLLECTIONS.BLOOD_REQUESTS)
      .where('doctorId', '==', doctorId)
      .where('status', '==', 'pending')
      .orderBy('requestDate', 'desc')
      .onSnapshot(
        (snapshot) => {
          const requests = snapshot.docs.map(doc => doc.data() as FirebaseBloodRequest);
          callback(requests);
        },
        (error) => {
          console.error('Erreur lors de l\'écoute des demandes en attente:', error);
        }
      );
  }

  /**
   * Mettre à jour le token FCM du médecin
   */
  async updateFcmToken(doctorId: string, fcmToken: string | null): Promise<void> {
    try {
      await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.DOCTORS)
        .doc(doctorId)
        .update({
          fcmToken: fcmToken || null,
          updatedAt: firestore.Timestamp.now(),
        });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du token FCM:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }
}

// Export d'une instance unique du service
export const doctorService = new DoctorService();
