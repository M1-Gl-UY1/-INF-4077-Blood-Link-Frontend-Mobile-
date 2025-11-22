/**
 * Service d'authentification Firebase
 * Gère toutes les opérations d'authentification avec Firebase Auth
 */

import { firebaseAuth, getFirebaseErrorMessage } from '../config/firebase';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { CreateFirebaseUserDTO, FirebaseAccount, FirebaseUserProfile } from '../types/firebase.types';
import { firestoreService } from './firestoreService';
import { fcmService } from './fcmService';

/**
 * Classe de service pour l'authentification Firebase
 */
class FirebaseAuthService {
  private buildAccountFromProfile(profile: FirebaseUserProfile): FirebaseAccount {
    return {
      uid: profile.uid,
      username: profile.username,
      email: profile.email,
      role: profile.role,
      isActive: profile.isActive,
      emailVerified: profile.emailVerified,
      fcmToken: profile.fcmToken,
    };
  }

  /**
   * Inscription d'un nouvel utilisateur
   * Crée un compte Firebase Auth ET un document dans Firestore
   */
  async register(data: CreateFirebaseUserDTO): Promise<FirebaseAccount> {
    try {
      // 1. Créer le compte Firebase Auth
      const userCredential = await firebaseAuth.createUserWithEmailAndPassword(
        data.email,
        data.password
      );

      const { user } = userCredential;

      if (!user) {
        throw new Error('Erreur lors de la création du compte');
      }

      // 2. Mettre à jour le profil avec le username
      await user.updateProfile({
        displayName: data.username,
      });

      // 3. Créer le document profil dans la collection correspondante
      const fcmToken = await fcmService.getDeviceToken();
      const basePayload = {
        uid: user.uid,
        username: data.username,
        email: data.email,
        role: data.role,
        fcmToken,
        emailVerified: user.emailVerified,
        isActive: true,
      } as const;

      let profile: FirebaseUserProfile | null = null;
      if (data.role === 'provider') {
        profile = await firestoreService.createProvider(basePayload);
      } else if (data.role === 'doctor') {
        profile = await firestoreService.createDoctor(basePayload);
      } else if (data.role === 'bank') {
        profile = await firestoreService.createBloodBank(basePayload);
      } else {
        throw new Error(`Rôle inconnu: ${data.role}`);
      }

      // 4. Envoyer l'email de vérification (optionnel)
      await this.sendEmailVerification();

      if (!profile) {
        throw new Error('Impossible de créer le profil de l\'utilisateur');
      }

      return this.buildAccountFromProfile(profile);
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  async login(email: string, password: string): Promise<FirebaseAccount> {
    try {
      // 1. Connexion avec Firebase Auth
      const userCredential = await firebaseAuth.signInWithEmailAndPassword(
        email,
        password
      );

      const { user } = userCredential;

      if (!user) {
        throw new Error('Erreur lors de la connexion');
      }

      // 2. Récupérer les données de l'utilisateur depuis les collections spécifiques
      const profileResult = await firestoreService.getProfileByUid(user.uid);

      if (!profileResult) {
        throw new Error('Profil utilisateur non trouvé');
      }

      const account = this.buildAccountFromProfile(profileResult.profile);

      // 3. Vérifier que le compte est actif
      if (!account.isActive) {
        throw new Error('Ce compte a été désactivé');
      }

      // 4. Mettre à jour le token FCM si nécessaire
      const fcmToken = await fcmService.getDeviceToken();
      if (fcmToken && fcmToken !== account.fcmToken) {
        await firestoreService.updateFcmToken(account.role, account.uid, fcmToken);
        account.fcmToken = fcmToken;
      }

      return account;
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Déconnexion de l'utilisateur
   */
  async logout(): Promise<void> {
    try {
      await firebaseAuth.signOut();
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Récupération de l'utilisateur actuellement connecté
   */
  async getCurrentUser(): Promise<FirebaseAccount | null> {
    try {
      const currentUser = firebaseAuth.currentUser;

      if (!currentUser) {
        return null;
      }

      const profileResult = await firestoreService.getProfileByUid(currentUser.uid);
      if (!profileResult) {
        return null;
      }

      return this.buildAccountFromProfile(profileResult.profile);
    } catch (error: any) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  /**
   * Récupération de l'utilisateur Firebase Auth (sans les données Firestore)
   */
  getCurrentAuthUser(): FirebaseAuthTypes.User | null {
    return firebaseAuth.currentUser;
  }

  /**
   * Envoyer un email de vérification
   */
  async sendEmailVerification(): Promise<void> {
    try {
      const currentUser = firebaseAuth.currentUser;

      if (!currentUser) {
        throw new Error('Aucun utilisateur connecté');
      }

      await currentUser.sendEmailVerification();
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Réinitialisation du mot de passe
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await firebaseAuth.sendPasswordResetEmail(email);
    } catch (error: any) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Mise à jour du mot de passe
   */
  async updatePassword(newPassword: string): Promise<void> {
    try {
      const currentUser = firebaseAuth.currentUser;

      if (!currentUser) {
        throw new Error('Aucun utilisateur connecté');
      }

      await currentUser.updatePassword(newPassword);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Mise à jour de l'email
   */
  async updateEmail(newEmail: string): Promise<void> {
    try {
      const currentUser = firebaseAuth.currentUser;

      if (!currentUser) {
        throw new Error('Aucun utilisateur connecté');
      }

      await currentUser.updateEmail(newEmail);

      const profileResult = await firestoreService.getProfileByUid(currentUser.uid);
      if (!profileResult) {
        return;
      }

      if (profileResult.role === 'provider') {
        await firestoreService.updateProvider(profileResult.profile.id, { email: newEmail });
      } else if (profileResult.role === 'doctor') {
        await firestoreService.updateDoctor(profileResult.profile.id, { email: newEmail });
      } else if (profileResult.role === 'bank') {
        await firestoreService.updateBloodBank(profileResult.profile.id, { email: newEmail });
      }
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de l\'email:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Suppression du compte utilisateur
   */
  async deleteAccount(): Promise<void> {
    try {
      const currentUser = firebaseAuth.currentUser;

      if (!currentUser) {
        throw new Error('Aucun utilisateur connecté');
      }

      const userId = currentUser.uid;

      // 1. Supprimer toutes les données de l'utilisateur dans Firestore
      await firestoreService.deleteUserData(userId);

      // 2. Supprimer le compte Firebase Auth
      await currentUser.delete();
    } catch (error: any) {
      console.error('Erreur lors de la suppression du compte:', error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  /**
   * Observer les changements d'état d'authentification
   */
  onAuthStateChanged(callback: (user: FirebaseAuthTypes.User | null) => void): () => void {
    return firebaseAuth.onAuthStateChanged(callback);
  }

  /**
   * Récupérer le token d'authentification (pour les appels API si nécessaire)
   */
  async getIdToken(forceRefresh: boolean = false): Promise<string | null> {
    try {
      const currentUser = firebaseAuth.currentUser;

      if (!currentUser) {
        return null;
      }

      const token = await currentUser.getIdToken(forceRefresh);
      return token;
    } catch (error: any) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  }
}

// Export d'une instance unique du service
export const firebaseAuthService = new FirebaseAuthService();
