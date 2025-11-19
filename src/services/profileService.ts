/**
 * Service pour gérer les profils des utilisateurs (providers, doctors, banks)
 * Version Firebase - Remplace les appels REST par Firebase Firestore
 */

import { firestoreService } from './firestoreService';
import { firebaseAuthService } from './firebaseAuthService';
import { CreateProviderDTO, CreateDoctorDTO, CreateBloodBankDTO, Provider, Doctor, BloodBank } from '../models';
import { FirebaseProvider, FirebaseDoctor, FirebaseBloodBank, FirebaseAccount } from '../types/firebase.types';
import firestore from '@react-native-firebase/firestore';

/**
 * Convertir un FirebaseProvider en Provider (format ancien)
 */
const convertFirebaseProviderToProvider = (fp: FirebaseProvider): Provider => {
  return {
    id: fp.id,
    user: {
      id: fp.uid,
      username: fp.username,
      email: fp.email,
      password: '',
      role: 'provider',
    },
    name: fp.name || fp.username,
    sexe: fp.sexe || 'M',
    date_birth: fp.dateBirth ? fp.dateBirth.toDate().toISOString().split('T')[0] : null,
    email: fp.email,
    phone_number: fp.phoneNumber || '',
    blood_group: fp.bloodGroup || 'A',
    rhesus: fp.rhesus || '+',
    last_give: fp.lastGive ? fp.lastGive.toDate().toISOString().split('T')[0] : null,
    historique_medical: fp.historiqueMedical,
  };
};

/**
 * Convertir un FirebaseDoctor en Doctor (format ancien)
 */
const convertFirebaseDoctorToDoctor = (fd: FirebaseDoctor): Doctor => {
  return {
    id: fd.id,
    blood_requests: [],
    bank_id: fd.bloodBankId || '',
    name: fd.name || fd.username,
    grade: fd.grade || 'INT',
    speciality: fd.speciality || 'GP',
    user: fd.uid,
    blood_bank: fd.bloodBankId,
  };
};

/**
 * Convertir un FirebaseBloodBank en BloodBank (format ancien)
 */
const convertFirebaseBloodBankToBloodBank = (fb: FirebaseBloodBank): BloodBank => {
  return {
    id: fb.id,
    transactions: [],
    user: {
      id: fb.uid,
      username: fb.username,
      email: fb.email,
      password: '',
      role: 'bank',
    },
    name: fb.name || fb.username,
    password: '',
    location: fb.location || '',
    blood_bags: [],
  };
};

const ensureProviderDocumentExists = async (account: FirebaseAccount) => {
  if (account.role !== 'provider') {
    throw new Error('Le compte connecté n\'est pas un provider');
  }

  const existing = await firestoreService.getProvider(account.uid);
  if (!existing) {
    await firestoreService.createProvider({
      uid: account.uid,
      username: account.username,
      email: account.email,
      role: account.role,
      fcmToken: account.fcmToken,
      emailVerified: account.emailVerified,
      isActive: account.isActive,
    });
  }
};

const ensureDoctorDocumentExists = async (account: FirebaseAccount) => {
  if (account.role !== 'doctor') {
    throw new Error('Le compte connecté n\'est pas un doctor');
  }

  const existing = await firestoreService.getDoctor(account.uid);
  if (!existing) {
    await firestoreService.createDoctor({
      uid: account.uid,
      username: account.username,
      email: account.email,
      role: account.role,
      fcmToken: account.fcmToken,
      emailVerified: account.emailVerified,
      isActive: account.isActive,
    });
  }
};

const ensureBloodBankDocumentExists = async (account: FirebaseAccount) => {
  if (account.role !== 'bank') {
    throw new Error('Le compte connecté n\'est pas une banque de sang');
  }

  const existing = await firestoreService.getBloodBank(account.uid);
  if (!existing) {
    await firestoreService.createBloodBank({
      uid: account.uid,
      username: account.username,
      email: account.email,
      role: account.role,
      fcmToken: account.fcmToken,
      emailVerified: account.emailVerified,
      isActive: account.isActive,
    });
  }
};

/**
 * Service pour les profils Provider
 */
export const providerProfileService = {
  /**
   * Met à jour le profil d'un provider
   * Si providerId est null, crée un nouveau profil pour l'utilisateur connecté
   */
  updateProfile: async (providerId: string | null, data: Partial<CreateProviderDTO>, token: string): Promise<Provider> => {
    try {
      const currentAccount = await firebaseAuthService.getCurrentUser();
      if (!currentAccount) {
        throw new Error('Utilisateur non connecté');
      }

      await ensureProviderDocumentExists(currentAccount);

      const targetId = providerId || currentAccount.uid;

      const updateData: Partial<FirebaseProvider> = {};
      if (data.name) updateData.name = data.name;
      if (data.sexe) updateData.sexe = data.sexe;
      if (data.date_birth) updateData.dateBirth = firestore.Timestamp.fromDate(new Date(data.date_birth));
      if (data.email) updateData.email = data.email;
      if (data.phone_number) updateData.phoneNumber = data.phone_number;
      if (data.blood_group) updateData.bloodGroup = data.blood_group;
      if (data.rhesus) updateData.rhesus = data.rhesus;
      if (data.historique_medical) updateData.historiqueMedical = data.historique_medical;

      await firestoreService.updateProvider(targetId, updateData);

      const updated = await firestoreService.getProvider(targetId);
      if (!updated) {
        throw new Error('Profil non trouvé après mise à jour');
      }

      return convertFirebaseProviderToProvider(updated);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil provider:', error);
      throw error;
    }
  },

  /**
   * Récupère le profil d'un provider
   */
  getProfile: async (providerId: string, token: string): Promise<Provider> => {
    try {
      const provider = await firestoreService.getProvider(providerId);
      if (!provider) {
        throw new Error('Profil provider non trouvé');
      }
      return convertFirebaseProviderToProvider(provider);
    } catch (error: any) {
      console.error('Erreur lors de la récupération du profil provider:', error);
      throw error;
    }
  },

  /**
   * Liste tous les providers
   */
  getAllProviders: async (token?: string): Promise<Provider[]> => {
    try {
      // Pour Firebase, on doit faire une requête personnalisée
      // Pour l'instant, on retourne un tableau vide car cette méthode n'est utilisée
      // que pour trouver le profil de l'utilisateur connecté
      const currentUser = await firebaseAuthService.getCurrentUser();
      if (!currentUser) {
        return [];
      }

      const provider = await firestoreService.getProvider(currentUser.uid);
      if (!provider) {
        return [];
      }

      return [convertFirebaseProviderToProvider(provider)];
    } catch (error: any) {
      console.error('Erreur lors de la récupération des providers:', error);
      return [];
    }
  },
};

/**
 * Service pour les profils Doctor
 */
export const doctorProfileService = {
  /**
   * Met à jour le profil d'un docteur
   */
  updateProfile: async (doctorId: string | null, data: Partial<CreateDoctorDTO>, token: string): Promise<Doctor> => {
    try {
      const currentAccount = await firebaseAuthService.getCurrentUser();
      if (!currentAccount) {
        throw new Error('Utilisateur non connecté');
      }

      await ensureDoctorDocumentExists(currentAccount);

      const targetId = doctorId || currentAccount.uid;

      const updateData: Partial<FirebaseDoctor> = {};
      if (data.name) updateData.name = data.name;
      if (data.grade) updateData.grade = data.grade;
      if (data.speciality) updateData.speciality = data.speciality;
      if (data.blood_bank !== undefined) updateData.bloodBankId = data.blood_bank;

      await firestoreService.updateDoctor(targetId, updateData);

      const updated = await firestoreService.getDoctor(targetId);
      if (!updated) {
        throw new Error('Profil non trouvé après mise à jour');
      }

      return convertFirebaseDoctorToDoctor(updated);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil doctor:', error);
      throw error;
    }
  },

  /**
   * Récupère le profil d'un docteur
   */
  getProfile: async (doctorId: string, token: string): Promise<Doctor> => {
    try {
      const doctor = await firestoreService.getDoctor(doctorId);
      if (!doctor) {
        throw new Error('Profil doctor non trouvé');
      }
      return convertFirebaseDoctorToDoctor(doctor);
    } catch (error: any) {
      console.error('Erreur lors de la récupération du profil doctor:', error);
      throw error;
    }
  },

  /**
   * Liste tous les docteurs
   */
  getAllDoctors: async (token?: string): Promise<Doctor[]> => {
    try {
      const currentAccount = await firebaseAuthService.getCurrentUser();
      if (!currentAccount) {
        return [];
      }

      const doctor = await firestoreService.getDoctor(currentAccount.uid);
      if (!doctor) {
        return [];
      }

      return [convertFirebaseDoctorToDoctor(doctor)];
    } catch (error: any) {
      console.error('Erreur lors de la récupération des doctors:', error);
      return [];
    }
  },
};

/**
 * Service pour les profils BloodBank
 */
export const bloodBankProfileService = {
  /**
   * Met à jour le profil d'une banque de sang
   */
  updateProfile: async (bankId: string | null, data: Partial<CreateBloodBankDTO>, token: string): Promise<BloodBank> => {
    try {
      const currentAccount = await firebaseAuthService.getCurrentUser();
      if (!currentAccount) {
        throw new Error('Utilisateur non connecté');
      }

      await ensureBloodBankDocumentExists(currentAccount);

      const targetId = bankId || currentAccount.uid;

      const updateData: Partial<FirebaseBloodBank> = {};
      if (data.name) updateData.name = data.name;
      if (data.location) updateData.location = data.location;

      await firestoreService.updateBloodBank(targetId, updateData);

      const updated = await firestoreService.getBloodBank(targetId);
      if (!updated) {
        throw new Error('Profil non trouvé après mise à jour');
      }

      return convertFirebaseBloodBankToBloodBank(updated);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil bank:', error);
      throw error;
    }
  },

  /**
   * Récupère le profil d'une banque de sang
   */
  getProfile: async (bankId: string, token: string): Promise<BloodBank> => {
    try {
      const bank = await firestoreService.getBloodBank(bankId);
      if (!bank) {
        throw new Error('Profil bank non trouvé');
      }
      return convertFirebaseBloodBankToBloodBank(bank);
    } catch (error: any) {
      console.error('Erreur lors de la récupération du profil bank:', error);
      throw error;
    }
  },

  /**
   * Liste toutes les banques de sang
   */
  getAllBloodBanks: async (token?: string): Promise<BloodBank[]> => {
    try {
      const currentAccount = await firebaseAuthService.getCurrentUser();
      if (!currentAccount) {
        return [];
      }

      const bank = await firestoreService.getBloodBank(currentAccount.uid);
      if (!bank) {
        return [];
      }

      return [convertFirebaseBloodBankToBloodBank(bank)];
    } catch (error: any) {
      console.error('Erreur lors de la récupération des banks:', error);
      return [];
    }
  },
};
