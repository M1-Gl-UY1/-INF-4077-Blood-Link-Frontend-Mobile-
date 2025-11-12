/**
 * Service d'authentification pour gérer la connexion et l'inscription
 */

import { api } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import {
  LoginDTO,
  LoginResponse,
  RegisterDTO,
  UserResponse,
} from '../models';

/**
 * Service d'authentification
 */
export const authService = {
  /**
   * Connexion d'un utilisateur
   * @param credentials - Email et mot de passe
   * @returns Token JWT
   */
  login: async (credentials: LoginDTO): Promise<LoginResponse> => {
    return api.post<LoginResponse>(API_ENDPOINTS.LOGIN, credentials);
  },

  /**
   * Inscription d'un nouvel utilisateur
   * @param data - Données d'inscription (username, email, password, role)
   * @returns Informations de l'utilisateur créé
   */
  register: async (data: RegisterDTO): Promise<UserResponse> => {
    return api.post<UserResponse>(API_ENDPOINTS.REGISTER, data);
  },

  /**
   * Récupération des informations de l'utilisateur connecté
   * @param token - Token JWT
   * @returns Informations de l'utilisateur
   */
  getCurrentUser: async (token: string): Promise<UserResponse> => {
    return api.post<UserResponse>(API_ENDPOINTS.USERS, { token });
  },

  /**
   * Déconnexion d'un utilisateur
   * @param token - Token JWT
   */
  logout: async (token: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>(API_ENDPOINTS.LOGOUT, {}, token);
  },
};