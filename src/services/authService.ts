/**
 * Service d'authentification pour gérer la connexion et l'inscription
 */

import { api } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import {
  LoginDTO,
  LoginResponse,
  CreateProviderDTO,
  CreateDoctorDTO,
  CreateBloodBankDTO,
  User,
} from '../models';

/**
 * Service d'authentification
 */
export const authService = {
  /**
   * Connexion d'un utilisateur
   */
  login: async (credentials: LoginDTO): Promise<LoginResponse> => {
    return api.post<LoginResponse>(API_ENDPOINTS.LOGIN, credentials);
  },

  /**
   * Inscription d'un Provider (Donneur de sang)
   */
  registerProvider: async (data: CreateProviderDTO): Promise<User> => {
    return api.post<User>(API_ENDPOINTS.REGISTER, {
      ...data,
      role: 'provider',
    });
  },

  /**
   * Inscription d'un Doctor (Médecin)
   */
  registerDoctor: async (data: CreateDoctorDTO): Promise<User> => {
    return api.post<User>(API_ENDPOINTS.REGISTER, {
      ...data,
      role: 'doctor',
    });
  },

  /**
   * Inscription d'une BloodBank (Banque de sang)
   */
  registerBloodBank: async (data: CreateBloodBankDTO): Promise<User> => {
    return api.post<User>(API_ENDPOINTS.REGISTER, {
      ...data,
      role: 'blood_bank',
    });
  },

  /**
   * Déconnexion d'un utilisateur
   */
  logout: async (token: string): Promise<void> => {
    return api.post<void>(API_ENDPOINTS.LOGOUT, {}, token);
  },
};