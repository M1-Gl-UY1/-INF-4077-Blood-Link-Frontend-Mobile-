/**
 * Contexte d'authentification Firebase pour gérer l'état global de l'utilisateur
 * Version Firebase - Remplace l'ancien AuthContext qui utilisait le backend REST
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { firebaseAuthService } from '../services/firebaseAuthService';
import { firestoreService } from '../services/firestoreService';
import { FirebaseAccount, FirebaseProvider, FirebaseDoctor, FirebaseBloodBank, FirebaseUserProfile } from '../types/firebase.types';
import { Role, UserResponse } from '../models';
import {
  saveToken,
  getToken,
  saveUser,
  getUser,
  clearAllData
} from '../utils/storage';

// Interface pour les données de connexion
interface LoginData {
  email: string;
  password: string;
}

// Interface pour les données d'inscription de base
interface RegisterBaseData {
  email: string;
  password: string;
  username: string;
  role: Role;
}

// Interface pour le contexte d'authentification
interface AuthContextData {
  user: FirebaseAccount | null;
  profile: FirebaseProvider | FirebaseDoctor | FirebaseBloodBank | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginData) => Promise<void>;
  register: (data: RegisterBaseData) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Création du contexte
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Props du provider
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider du contexte d'authentification Firebase
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const toUserResponse = (account: FirebaseAccount): UserResponse => ({
    id: account.uid,
    username: account.username,
    email: account.email,
    role: account.role,
  });

  const [user, setUser] = useState<FirebaseAccount | null>(null);
  const [profile, setProfile] = useState<FirebaseProvider | FirebaseDoctor | FirebaseBloodBank | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Charger le profil de l'utilisateur en fonction de son rôle
   */
  const loadUserProfile = async (firebaseUser: FirebaseAccount): Promise<void> => {
    try {
      const profileResult = await firestoreService.getProfileByUid(firebaseUser.uid);
      setProfile((profileResult?.profile as FirebaseUserProfile) ?? null);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      setProfile(null);
    }
  };

  /**
   * Rafraîchir le profil de l'utilisateur
   */
  const refreshProfile = async (): Promise<void> => {
    if (!user) return;

    try {
      setIsLoading(true);
      await loadUserProfile(user);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du profil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Charge les informations d'authentification stockées au démarrage
   */
  const loadStoredAuth = async () => {
    try {
      setIsLoading(true);

      // Vérifier s'il y a un utilisateur Firebase Auth connecté
      const currentUser = await firebaseAuthService.getCurrentUser();

      if (currentUser) {
        // Récupérer le token Firebase
        const idToken = await firebaseAuthService.getIdToken();

        if (idToken) {
          setToken(idToken);
          setUser(currentUser);
          setIsAuthenticated(true);

          // Charger le profil de l'utilisateur
          await loadUserProfile(currentUser);

          // Sauvegarder dans le stockage local
          await saveToken(idToken);
          await saveUser(toUserResponse(currentUser));
        }
      } else {
        // Pas d'utilisateur connecté, nettoyer le stockage
        await clearAllData();
        setToken(null);
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données d\'authentification:', error);
      setToken(null);
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Connexion de l'utilisateur
   */
  const login = async (credentials: LoginData) => {
    try {
      setIsLoading(true);

      // 1. Connexion avec Firebase
      const firebaseUser = await firebaseAuthService.login(
        credentials.email,
        credentials.password
      );

      // 2. Récupérer le token Firebase
      const idToken = await firebaseAuthService.getIdToken();

      if (!idToken) {
        throw new Error('Impossible de récupérer le token d\'authentification');
      }

      // 3. Charger le profil de l'utilisateur
      await loadUserProfile(firebaseUser);

      // 4. Sauvegarder dans le stockage local
      await saveToken(idToken);
      await saveUser(toUserResponse(firebaseUser));

      // 5. Mise à jour de l'état
      setToken(idToken);
      setUser(firebaseUser);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Inscription d'un nouvel utilisateur (compte de base uniquement)
   * Le profil (provider/doctor/bloodbank) doit être créé séparément
   */
  const register = async (data: RegisterBaseData) => {
    try {
      setIsLoading(true);

      // 1. Créer le compte Firebase Auth et le document utilisateur
      const firebaseUser = await firebaseAuthService.register({
        email: data.email,
        password: data.password,
        username: data.username,
        role: data.role,
      });

      // 2. Connexion automatique après inscription
      await login({
        email: data.email,
        password: data.password,
      });
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Déconnexion de l'utilisateur
   */
  const logout = async () => {
    try {
      setIsLoading(true);

      // 1. Déconnexion Firebase
      await firebaseAuthService.logout();

      // 2. Nettoyage du stockage local
      await clearAllData();

      // 3. Réinitialisation de l'état
      setToken(null);
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Observer les changements d'état d'authentification Firebase
  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        // Utilisateur connecté
        const firebaseUser = await firebaseAuthService.getCurrentUser();
        if (firebaseUser) {
          setUser(firebaseUser);
          setIsAuthenticated(true);
          await loadUserProfile(firebaseUser);
        }
      } else {
        // Utilisateur déconnecté
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
        await clearAllData();
      }
    });

    // Chargement initial
    loadStoredAuth();

    // Nettoyage
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        loadStoredAuth,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personnalisé pour utiliser le contexte d'authentification
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }

  return context;
};
