/**
 * Contexte d'authentification pour gérer l'état global de l'utilisateur
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { LoginDTO, RegisterDTO, UserResponse } from '../models';
import {
  saveToken,
  getToken,
  saveUser,
  getUser,
  clearAllData
} from '../utils/storage';

// Interface pour le contexte d'authentification
interface AuthContextData {
  user: UserResponse | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginDTO) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

// Création du contexte
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Props du provider
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider du contexte d'authentification
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Charge les informations d'authentification stockées au démarrage
   */
  const loadStoredAuth = async () => {
    try {
      setIsLoading(true);
      const storedToken = await getToken();
      const storedUser = await getUser();

      if (storedToken && storedUser) {
        // Vérifie que le token est toujours valide
        try {
          const currentUser = await authService.getCurrentUser(storedToken);
          setToken(storedToken);
          setUser(currentUser);
          setIsAuthenticated(true);
        } catch (error) {
          // Token invalide ou expiré, on nettoie
          await clearAllData();
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données d\'authentification:', error);
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Connexion de l'utilisateur
   */
  const login = async (credentials: LoginDTO) => {
    try {
      setIsLoading(true);

      // Appel à l'API de connexion
      const response = await authService.login(credentials);
      const jwtToken = response.jwt;

      // Récupération des informations de l'utilisateur
      const userData = await authService.getCurrentUser(jwtToken);

      // Sauvegarde dans le stockage local
      await saveToken(jwtToken);
      await saveUser(userData);

      // Mise à jour de l'état
      setToken(jwtToken);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Inscription d'un nouvel utilisateur
   */
  const register = async (data: RegisterDTO) => {
    try {
      setIsLoading(true);

      // Appel à l'API d'inscription
      const userData = await authService.register(data);

      // Après l'inscription, on connecte automatiquement l'utilisateur
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

      // Appel à l'API de déconnexion si on a un token
      if (token) {
        try {
          await authService.logout(token);
        } catch (error) {
          console.error('Erreur lors de la déconnexion API:', error);
          // On continue quand même avec la déconnexion locale
        }
      }

      // Nettoyage du stockage local
      await clearAllData();

      // Réinitialisation de l'état
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Chargement des données d'authentification au montage du composant
  useEffect(() => {
    loadStoredAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        loadStoredAuth,
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
