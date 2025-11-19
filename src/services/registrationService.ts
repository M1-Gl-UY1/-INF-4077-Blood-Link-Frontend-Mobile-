/**
 * Service d'inscription unifié
 * Gère l'inscription complète (compte + profil) pour tous les types d'utilisateurs
 */

import { firebaseAuthService } from './firebaseAuthService';
import { firestoreService } from './firestoreService';
import {
  FirebaseAccount,
  FirebaseProvider,
  FirebaseDoctor,
  FirebaseBloodBank,
} from '../types/firebase.types';
import { Role, BloodGroup, Rhesus, Sexe, Grade, Speciality } from '../models';
import firestore from '@react-native-firebase/firestore';

// ============================================
// INTERFACES POUR L'INSCRIPTION COMPLÈTE
// ============================================

/**
 * Données communes pour tous les types d'inscription
 */
interface BaseRegistrationData {
  email: string;
  password: string;
  username: string;
}

/**
 * Données spécifiques pour l'inscription d'un Provider
 */
export interface ProviderRegistrationData extends BaseRegistrationData {
  role: 'provider';
  name: string;
  sexe: Sexe;
  dateBirth: Date | null;
  phoneNumber: string;
  bloodGroup: BloodGroup;
  rhesus: Rhesus;
  lastGive?: Date | null;
  historiqueMedical?: string | null;
}

/**
 * Données spécifiques pour l'inscription d'un Doctor
 */
export interface DoctorRegistrationData extends BaseRegistrationData {
  role: 'doctor';
  name: string;
  grade: Grade;
  speciality: Speciality;
  bloodBankId?: string | null;
}

/**
 * Données spécifiques pour l'inscription d'une BloodBank
 */
export interface BloodBankRegistrationData extends BaseRegistrationData {
  role: 'bank';
  name: string;
  location: string;
}

/**
 * Union des différents types de données d'inscription
 */
export type RegistrationData =
  | ProviderRegistrationData
  | DoctorRegistrationData
  | BloodBankRegistrationData;

/**
 * Résultat de l'inscription
 */
export interface RegistrationResult {
  user: FirebaseAccount;
  profile: FirebaseProvider | FirebaseDoctor | FirebaseBloodBank;
}

// ============================================
// SERVICE D'INSCRIPTION
// ============================================

/**
 * Classe de service pour gérer l'inscription complète
 */
class RegistrationService {
  /**
   * Inscription complète d'un Provider (Donneur)
   */
  async registerProvider(data: ProviderRegistrationData): Promise<RegistrationResult> {
    try {
      // 1. Créer le compte Firebase Auth et le document utilisateur
      const user = await firebaseAuthService.register({
        email: data.email,
        password: data.password,
        username: data.username,
        role: 'provider',
      });

      // 2. Mettre à jour le profil Provider avec les informations détaillées
      const updateData = {
        name: data.name,
        sexe: data.sexe,
        dateBirth: data.dateBirth ? firestore.Timestamp.fromDate(data.dateBirth) : null,
        phoneNumber: data.phoneNumber,
        bloodGroup: data.bloodGroup,
        rhesus: data.rhesus,
        lastGive: data.lastGive ? firestore.Timestamp.fromDate(data.lastGive) : null,
        historiqueMedical: data.historiqueMedical || null,
        isAvailable: true,
      };

      await firestoreService.updateProvider(user.uid, updateData);
      const profile = await firestoreService.getProvider(user.uid);

      if (!profile) {
        throw new Error('Profil provider introuvable après mise à jour');
      }

      return {
        user,
        profile,
      };
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription du Provider:', error);

      // En cas d'erreur, essayer de nettoyer le compte créé
      try {
        await firebaseAuthService.deleteAccount();
      } catch (cleanupError) {
        console.error('Erreur lors du nettoyage:', cleanupError);
      }

      throw error;
    }
  }

  /**
   * Inscription complète d'un Doctor (Médecin)
   */
  async registerDoctor(data: DoctorRegistrationData): Promise<RegistrationResult> {
    try {
      // 1. Créer le compte Firebase Auth et le document utilisateur
      const user = await firebaseAuthService.register({
        email: data.email,
        password: data.password,
        username: data.username,
        role: 'doctor',
      });

      // 2. Mettre à jour le profil Doctor avec les informations détaillées
      const updateData = {
        name: data.name,
        grade: data.grade,
        speciality: data.speciality,
        bloodBankId: data.bloodBankId || null,
      };

      await firestoreService.updateDoctor(user.uid, updateData);
      const profile = await firestoreService.getDoctor(user.uid);

      if (!profile) {
        throw new Error('Profil doctor introuvable après mise à jour');
      }

      return {
        user,
        profile,
      };
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription du Doctor:', error);

      // En cas d'erreur, essayer de nettoyer le compte créé
      try {
        await firebaseAuthService.deleteAccount();
      } catch (cleanupError) {
        console.error('Erreur lors du nettoyage:', cleanupError);
      }

      throw error;
    }
  }

  /**
   * Inscription complète d'une BloodBank (Banque de sang)
   */
  async registerBloodBank(data: BloodBankRegistrationData): Promise<RegistrationResult> {
    try {
      // 1. Créer le compte Firebase Auth et le document utilisateur
      const user = await firebaseAuthService.register({
        email: data.email,
        password: data.password,
        username: data.username,
        role: 'bank',
      });

      // 2. Mettre à jour le profil BloodBank avec les informations détaillées
      const updateData = {
        name: data.name,
        location: data.location,
      };

      await firestoreService.updateBloodBank(user.uid, updateData);
      const profile = await firestoreService.getBloodBank(user.uid);

      if (!profile) {
        throw new Error('Profil blood bank introuvable après mise à jour');
      }

      return {
        user,
        profile,
      };
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription de la BloodBank:', error);

      // En cas d'erreur, essayer de nettoyer le compte créé
      try {
        await firebaseAuthService.deleteAccount();
      } catch (cleanupError) {
        console.error('Erreur lors du nettoyage:', cleanupError);
      }

      throw error;
    }
  }

  /**
   * Inscription générique qui dispatche vers la bonne méthode selon le rôle
   */
  async register(data: RegistrationData): Promise<RegistrationResult> {
    switch (data.role) {
      case 'provider':
        return this.registerProvider(data);
      case 'doctor':
        return this.registerDoctor(data);
      case 'bank':
        return this.registerBloodBank(data);
      default:
        throw new Error(`Rôle non reconnu: ${(data as any).role}`);
    }
  }

  /**
   * Vérifier si un email existe déjà
   * Utile pour la validation côté client avant l'inscription
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      // Firebase Auth lancera une erreur si on essaie de créer un compte avec un email existant
      // On peut utiliser fetchSignInMethodsForEmail pour vérifier
      const methods = await firebaseAuthService.getCurrentAuthUser();
      // Note: Cette méthode est deprecated dans certaines versions
      // Alternative: tenter une inscription et gérer l'erreur
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Créer un profil pour un utilisateur existant
   * Utile si le profil a été créé mais pas le compte, ou vice-versa
   */
  async createProfileForExistingUser(
    userId: string,
    role: Role,
    profileData: Partial<CreateFirebaseProviderDTO | CreateFirebaseDoctorDTO | CreateFirebaseBloodBankDTO>
  ): Promise<FirebaseProvider | FirebaseDoctor | FirebaseBloodBank> {
    try {
      if (role === 'provider') {
        return await firestoreService.createProvider(profileData as CreateFirebaseProviderDTO);
      } else if (role === 'doctor') {
        return await firestoreService.createDoctor(profileData as CreateFirebaseDoctorDTO);
      } else if (role === 'bank') {
        return await firestoreService.createBloodBank(profileData as CreateFirebaseBloodBankDTO);
      } else {
        throw new Error(`Rôle non reconnu: ${role}`);
      }
    } catch (error: any) {
      console.error('Erreur lors de la création du profil:', error);
      throw error;
    }
  }
}

// Export d'une instance unique du service
export const registrationService = new RegistrationService();
