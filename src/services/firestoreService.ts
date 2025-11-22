/**
 * Service Firestore
 * Gère toutes les opérations CRUD sur la base de données Firestore
 */

import { firebaseFirestore, FIREBASE_COLLECTIONS, getFirebaseErrorMessage } from '../config/firebase';
import firestore from '@react-native-firebase/firestore';
import {
  FirebaseProvider,
  FirebaseDoctor,
  FirebaseBloodBank,
  FirebaseBloodBag,
  FirebaseBloodRequest,
  FirebaseBloodTransaction,
  FirebaseAlert,
  FirebaseAlertResponse,
  CreateFirebaseProviderDTO,
  CreateFirebaseDoctorDTO,
  CreateFirebaseBloodBankDTO,
  CreateFirebaseBloodBagDTO,
  CreateFirebaseBloodRequestDTO,
  FirebaseUserProfile,
} from '../types/firebase.types';
import { Role } from '../models';

/**
 * Classe de service pour Firestore
 */
class FirestoreService {
  private getCollectionNameByRole(role: Role): string {
    switch (role) {
      case 'provider':
        return FIREBASE_COLLECTIONS.PROVIDERS;
      case 'doctor':
        return FIREBASE_COLLECTIONS.DOCTORS;
      case 'bank':
        return FIREBASE_COLLECTIONS.BLOOD_BANKS;
      default:
        throw new Error(`Rôle inconnu: ${role}`);
    }
  }

  /**
   * Supprimer toutes les données d'un utilisateur (profil principal)
   */
  async deleteUserData(uid: string): Promise<void> {
    try {
      const profile = await this.getProfileByUid(uid);
      if (!profile) {
        return;
      }

      const collectionName = this.getCollectionNameByRole(profile.role);
      await firebaseFirestore.collection(collectionName).doc(profile.profile.id).delete();
    } catch (error: any) {
      console.error('Erreur lors de la suppression des données utilisateur:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupère le profil de l'utilisateur connecté, quel que soit son rôle
   */
  async getProfileByUid(uid: string): Promise<{ role: Role; profile: FirebaseUserProfile } | null> {
    const provider = await this.getProviderByUid(uid);
    if (provider) {
      return { role: 'provider', profile: provider };
    }

    const doctor = await this.getDoctorByUid(uid);
    if (doctor) {
      return { role: 'doctor', profile: doctor };
    }

    const bank = await this.getBloodBankByUid(uid);
    if (bank) {
      return { role: 'bank', profile: bank };
    }

    return null;
  }

  /**
   * Met à jour le token FCM d'un utilisateur
   */
  async updateFcmToken(role: Role, uid: string, fcmToken: string | null): Promise<void> {
    try {
      const collectionName = this.getCollectionNameByRole(role);
      await firebaseFirestore
        .collection(collectionName)
        .doc(uid)
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
   * Met à jour le token FCM d'un médecin
   */
  async updateDoctorFcmToken(uid: string, fcmToken: string | null): Promise<void> {
    try {
      await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.DOCTORS)
        .doc(uid)
        .update({
          fcmToken: fcmToken || null,
          updatedAt: firestore.Timestamp.now(),
        });
      console.log('Token FCM du médecin mis à jour');
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du token FCM du médecin:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Met à jour le token FCM d'une banque de sang
   */
  async updateBloodBankFcmToken(uid: string, fcmToken: string | null): Promise<void> {
    try {
      await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.BLOOD_BANKS)
        .doc(uid)
        .update({
          fcmToken: fcmToken || null,
          updatedAt: firestore.Timestamp.now(),
        });
      console.log('Token FCM de la banque de sang mis à jour');
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du token FCM de la banque:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  // ============================================
  // OPÉRATIONS SUR LES PROVIDERS (DONNEURS)
  // ============================================

  /**
   * Créer un profil Provider
   */
  async createProvider(data: CreateFirebaseProviderDTO): Promise<FirebaseProvider> {
    try {
      const providerRef = firebaseFirestore.collection(FIREBASE_COLLECTIONS.PROVIDERS).doc(data.uid);
      const now = firestore.Timestamp.now();

      const provider: FirebaseProvider = {
        id: providerRef.id,
        uid: data.uid,
        username: data.username,
        email: data.email,
        role: 'provider',
        fcmToken: data.fcmToken || null,
        isActive: data.isActive ?? true,
        emailVerified: data.emailVerified,
        name: data.name ?? data.username ?? null,
        sexe: data.sexe ?? null,
        dateBirth: data.dateBirth ? firestore.Timestamp.fromDate(data.dateBirth) : null,
        phoneNumber: data.phoneNumber ?? null,
        bloodGroup: data.bloodGroup ?? null,
        rhesus: data.rhesus ?? null,
        lastGive: data.lastGive ? firestore.Timestamp.fromDate(data.lastGive) : null,
        historiqueMedical: data.historiqueMedical ?? null,
        isAvailable: data.isAvailable ?? true,
        createdAt: now,
        updatedAt: now,
      };

      await providerRef.set(provider);

      return provider;
    } catch (error: any) {
      console.error('Erreur lors de la création du profil Provider:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer un Provider par uid
   */
  async getProviderByUid(uid: string): Promise<FirebaseProvider | null> {
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
      console.error('Erreur lors de la récupération du Provider:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer un Provider par ID
   */
  async getProvider(providerId: string): Promise<FirebaseProvider | null> {
    try {
      const doc = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.PROVIDERS)
        .doc(providerId)
        .get();

      if (!doc.exists) {
        return null;
      }

      return doc.data() as FirebaseProvider;
    } catch (error: any) {
      console.error('Erreur lors de la récupération du Provider:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Mettre à jour un Provider
   */
  async updateProvider(providerId: string, data: Partial<FirebaseProvider>): Promise<void> {
    try {
      await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.PROVIDERS)
        .doc(providerId)
        .update({
          ...data,
          updatedAt: firestore.Timestamp.now(),
        });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du Provider:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer tous les Providers disponibles avec un groupe sanguin spécifique
   */
  async getAvailableProvidersByBloodGroup(bloodGroup: string, rhesus: string): Promise<FirebaseProvider[]> {
    try {
      const snapshot = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.PROVIDERS)
        .where('bloodGroup', '==', bloodGroup)
        .where('rhesus', '==', rhesus)
        .where('isAvailable', '==', true)
        .get();

      return snapshot.docs.map(doc => doc.data() as FirebaseProvider);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des Providers:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  // ============================================
  // OPÉRATIONS SUR LES DOCTORS (MÉDECINS)
  // ============================================

  /**
   * Créer un profil Doctor
   */
  async createDoctor(data: CreateFirebaseDoctorDTO): Promise<FirebaseDoctor> {
    try {
      const doctorRef = firebaseFirestore.collection(FIREBASE_COLLECTIONS.DOCTORS).doc(data.uid);
      const now = firestore.Timestamp.now();

      const doctor: FirebaseDoctor = {
        id: doctorRef.id,
        uid: data.uid,
        username: data.username,
        email: data.email,
        role: 'doctor',
        fcmToken: data.fcmToken || null,
        isActive: data.isActive ?? true,
        emailVerified: data.emailVerified,
        name: data.name ?? data.username ?? null,
        grade: data.grade ?? null,
        speciality: data.speciality ?? null,
        bloodBankId: data.bloodBankId ?? null,
        createdAt: now,
        updatedAt: now,
      };

      await doctorRef.set(doctor);

      return doctor;
    } catch (error: any) {
      console.error('Erreur lors de la création du profil Doctor:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer un Doctor par uid
   */
  async getDoctorByUid(uid: string): Promise<FirebaseDoctor | null> {
    try {
      const doc = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.DOCTORS)
        .doc(uid)
        .get();

      if (doc.exists) {
        return doc.data() as FirebaseDoctor;
      }

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
      console.error('Erreur lors de la récupération du Doctor:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer un Doctor par ID
   */
  async getDoctor(doctorId: string): Promise<FirebaseDoctor | null> {
    try {
      const doc = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.DOCTORS)
        .doc(doctorId)
        .get();

      if (!doc.exists) {
        return null;
      }

      return doc.data() as FirebaseDoctor;
    } catch (error: any) {
      console.error('Erreur lors de la récupération du Doctor:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Mettre à jour un Doctor
   */
  async updateDoctor(doctorId: string, data: Partial<FirebaseDoctor>): Promise<void> {
    try {
      await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.DOCTORS)
        .doc(doctorId)
        .update({
          ...data,
          updatedAt: firestore.Timestamp.now(),
        });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du Doctor:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  // ============================================
  // OPÉRATIONS SUR LES BLOOD BANKS (BANQUES DE SANG)
  // ============================================

  /**
   * Créer un profil BloodBank
   */
  async createBloodBank(data: CreateFirebaseBloodBankDTO): Promise<FirebaseBloodBank> {
    try {
      const bankRef = firebaseFirestore.collection(FIREBASE_COLLECTIONS.BLOOD_BANKS).doc(data.uid);
      const now = firestore.Timestamp.now();

      const bloodBank: FirebaseBloodBank = {
        id: bankRef.id,
        uid: data.uid,
        username: data.username,
        email: data.email,
        role: 'bank',
        fcmToken: data.fcmToken || null,
        isActive: data.isActive ?? true,
        emailVerified: data.emailVerified,
        name: data.name ?? data.username ?? null,
        location: data.location ?? null,
        bloodBagCount: data.bloodBagCount ?? 0,
        createdAt: now,
        updatedAt: now,
      };

      await bankRef.set(bloodBank);

      return bloodBank;
    } catch (error: any) {
      console.error('Erreur lors de la création du profil BloodBank:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer une BloodBank par uid
   */
  async getBloodBankByUid(uid: string): Promise<FirebaseBloodBank | null> {
    try {
      const doc = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.BLOOD_BANKS)
        .doc(uid)
        .get();

      if (doc.exists) {
        return doc.data() as FirebaseBloodBank;
      }

      const snapshot = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.BLOOD_BANKS)
        .where('uid', '==', uid)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      return snapshot.docs[0].data() as FirebaseBloodBank;
    } catch (error: any) {
      console.error('Erreur lors de la récupération de la BloodBank:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer une BloodBank par ID
   */
  async getBloodBank(bankId: string): Promise<FirebaseBloodBank | null> {
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
      console.error('Erreur lors de la récupération de la BloodBank:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Mettre à jour une BloodBank
   */
  async updateBloodBank(bankId: string, data: Partial<FirebaseBloodBank>): Promise<void> {
    try {
      await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.BLOOD_BANKS)
        .doc(bankId)
        .update({
          ...data,
          updatedAt: firestore.Timestamp.now(),
        });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la BloodBank:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer toutes les BloodBanks actives
   */
  async getAllBloodBanks(): Promise<FirebaseBloodBank[]> {
    try {
      const snapshot = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.BLOOD_BANKS)
        .where('isActive', '==', true)
        .get();

      return snapshot.docs.map(doc => doc.data() as FirebaseBloodBank);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des BloodBanks:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  // ============================================
  // OPÉRATIONS SUR LES BLOOD BAGS (POCHES DE SANG)
  // ============================================

  /**
   * Créer une poche de sang
   */
  async createBloodBag(data: CreateFirebaseBloodBagDTO): Promise<FirebaseBloodBag> {
    try {
      const bagRef = firebaseFirestore.collection(FIREBASE_COLLECTIONS.BLOOD_BAGS).doc();

      // Calculer la date d'expiration (42 jours après la collecte)
      const expirationDate = new Date(data.collectionDate);
      expirationDate.setDate(expirationDate.getDate() + 42);

      const bloodBag: FirebaseBloodBag = {
        id: bagRef.id,
        providerId: data.providerId,
        providerName: data.providerName,
        bloodGroup: data.bloodGroup,
        rhesus: data.rhesus,
        bloodBankId: data.bloodBankId,
        isAvailable: true,
        collectionDate: firestore.Timestamp.fromDate(data.collectionDate),
        expirationDate: firestore.Timestamp.fromDate(expirationDate),
        createdAt: firestore.Timestamp.now(),
        updatedAt: firestore.Timestamp.now(),
      };

      await bagRef.set(bloodBag);

      // Incrémenter le compteur de poches de la banque
      if (data.bloodBankId) {
        await this.incrementBloodBagCount(data.bloodBankId, 1);
      }

      return bloodBag;
    } catch (error: any) {
      console.error('Erreur lors de la création de la poche de sang:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer les poches de sang disponibles par banque
   */
  async getAvailableBloodBagsByBank(bankId: string): Promise<FirebaseBloodBag[]> {
    try {
      const snapshot = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.BLOOD_BAGS)
        .where('bloodBankId', '==', bankId)
        .where('isAvailable', '==', true)
        .get();

      return snapshot.docs.map(doc => doc.data() as FirebaseBloodBag);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des poches de sang:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Incrémenter/décrémenter le compteur de poches de sang d'une banque
   */
  private async incrementBloodBagCount(bankId: string, increment: number): Promise<void> {
    try {
      const bankRef = firebaseFirestore.collection(FIREBASE_COLLECTIONS.BLOOD_BANKS).doc(bankId);
      await bankRef.update({
        bloodBagCount: firestore.FieldValue.increment(increment),
        updatedAt: firestore.Timestamp.now(),
      });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du compteur de poches:', error);
    }
  }

  // ============================================
  // OPÉRATIONS SUR LES BLOOD REQUESTS (DEMANDES DE SANG)
  // ============================================

  /**
   * Créer une demande de sang
   */
  async createBloodRequest(data: CreateFirebaseBloodRequestDTO): Promise<FirebaseBloodRequest> {
    try {
      const requestRef = firebaseFirestore.collection(FIREBASE_COLLECTIONS.BLOOD_REQUESTS).doc();

      const bloodRequest: FirebaseBloodRequest = {
        id: requestRef.id,
        doctorId: data.doctorId,
        doctorName: data.doctorName,
        bloodBankId: data.bloodBankId,
        bankName: data.bankName,
        bloodGroup: data.bloodGroup,
        rhesus: data.rhesus,
        quantity: data.quantity,
        status: 'pending',
        requestDate: firestore.Timestamp.now(),
        notes: data.notes,
        createdAt: firestore.Timestamp.now(),
        updatedAt: firestore.Timestamp.now(),
      };

      await requestRef.set(bloodRequest);

      return bloodRequest;
    } catch (error: any) {
      console.error('Erreur lors de la création de la demande de sang:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer les demandes de sang par docteur
   */
  async getBloodRequestsByDoctor(doctorId: string): Promise<FirebaseBloodRequest[]> {
    try {
      const snapshot = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.BLOOD_REQUESTS)
        .where('doctorId', '==', doctorId)
        .orderBy('requestDate', 'desc')
        .get();

      return snapshot.docs.map(doc => doc.data() as FirebaseBloodRequest);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des demandes de sang:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer les demandes de sang par banque
   */
  async getBloodRequestsByBank(bankId: string): Promise<FirebaseBloodRequest[]> {
    try {
      const snapshot = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.BLOOD_REQUESTS)
        .where('bloodBankId', '==', bankId)
        .orderBy('requestDate', 'desc')
        .get();

      return snapshot.docs.map(doc => doc.data() as FirebaseBloodRequest);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des demandes de sang:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Mettre à jour le statut d'une demande de sang
   */
  async updateBloodRequestStatus(requestId: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> {
    try {
      await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.BLOOD_REQUESTS)
        .doc(requestId)
        .update({
          status,
          updatedAt: firestore.Timestamp.now(),
        });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du statut de la demande:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupérer les demandes de sang en attente pour une banque
   */
  async getPendingBloodRequestsByBank(bankId: string): Promise<FirebaseBloodRequest[]> {
    try {
      const snapshot = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.BLOOD_REQUESTS)
        .where('bloodBankId', '==', bankId)
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
   * Écouter les demandes de sang d'une banque en temps réel
   */
  subscribeToBloodRequestsByBank(
    bankId: string,
    callback: (requests: FirebaseBloodRequest[]) => void
  ): () => void {
    return firebaseFirestore
      .collection(FIREBASE_COLLECTIONS.BLOOD_REQUESTS)
      .where('bloodBankId', '==', bankId)
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
   * Récupérer tous les providers actifs
   */
  async getAllActiveProviders(): Promise<FirebaseProvider[]> {
    try {
      const snapshot = await firebaseFirestore
        .collection(FIREBASE_COLLECTIONS.PROVIDERS)
        .where('isActive', '==', true)
        .get();

      return snapshot.docs.map(doc => doc.data() as FirebaseProvider);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des providers:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }
}

// Export d'une instance unique du service
export const firestoreService = new FirestoreService();
