/**
 * Service d'authentification pour gérer la connexion et l'inscription
 * Version Firebase - Remplace les appels REST par Firebase
 */

import { firebaseAuthService } from './firebaseAuthService';
import { firestoreService } from './firestoreService';
import {
  LoginDTO,
  LoginResponse,
  RegisterDTO,
  UserResponse,
} from '../models';

/**
 * Service d'authentification (compatible avec l'ancienne API)
 * Utilise Firebase en arrière-plan
 */
export const authService = {
  /**
   * Connexion d'un utilisateur
   * @param credentials - Email et mot de passe
   * @returns Token JWT (Firebase ID token)
   */
  login: async (credentials: LoginDTO): Promise<LoginResponse> => {
    try {
      // Connexion avec Firebase
      await firebaseAuthService.login(credentials.email, credentials.password);

      // Récupérer le token Firebase
      const token = await firebaseAuthService.getIdToken();

      if (!token) {
        throw new Error('Impossible de récupérer le token d\'authentification');
      }

      // Retourner au format LoginResponse pour compatibilité
      return {
        jwt: token,
      };
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  },

  /**
   * Inscription d'un nouvel utilisateur
   * @param data - Données d'inscription (username, email, password, role)
   * @returns Informations de l'utilisateur créé
   */
  register: async (data: RegisterDTO): Promise<UserResponse> => {
    try {
      // Créer le compte Firebase Auth et le document utilisateur
      const firebaseUser = await firebaseAuthService.register({
        email: data.email,
        password: data.password,
        username: data.username,
        role: data.role,
      });

      // Retourner au format UserResponse pour compatibilité
      return {
        id: firebaseUser.uid,
        username: firebaseUser.username,
        email: firebaseUser.email,
        role: firebaseUser.role,
      };
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  },

  /**
   * Récupération des informations de l'utilisateur connecté
   * @param token - Token JWT (ignoré, on utilise Firebase Auth)
   * @returns Informations de l'utilisateur
   */
  getCurrentUser: async (token: string): Promise<UserResponse> => {
    try {
      const firebaseUser = await firebaseAuthService.getCurrentUser();

      if (!firebaseUser) {
        throw new Error('Aucun utilisateur connecté');
      }

      // Retourner au format UserResponse pour compatibilité
      return {
        id: firebaseUser.uid,
        username: firebaseUser.username,
        email: firebaseUser.email,
        role: firebaseUser.role,
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  },

  /**
   * Déconnexion d'un utilisateur
   * @param token - Token JWT (ignoré)
   */
  logout: async (token: string): Promise<{ message: string }> => {
    try {
      await firebaseAuthService.logout();

      return {
        message: 'Déconnexion réussie',
      };
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  },
};