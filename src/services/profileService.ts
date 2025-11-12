/**
 * Service pour gérer les profils des utilisateurs (providers, doctors, banks)
 */

import { api } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { CreateProviderDTO, CreateDoctorDTO, CreateBloodBankDTO, Provider, Doctor, BloodBank } from '../models';

/**
 * Service pour les profils Provider
 */
export const providerProfileService = {
  /**
   * Met à jour le profil d'un provider
   */
  updateProfile: async (providerId: string, data: Partial<CreateProviderDTO>, token: string): Promise<Provider> => {
    return api.put<Provider>(API_ENDPOINTS.PROVIDER_DETAIL(providerId), data, token);
  },

  /**
   * Récupère le profil d'un provider
   */
  getProfile: async (providerId: string, token: string): Promise<Provider> => {
    return api.get<Provider>(API_ENDPOINTS.PROVIDER_DETAIL(providerId), token);
  },

  /**
   * Liste tous les providers
   */
  getAllProviders: async (token?: string): Promise<Provider[]> => {
    return api.get<Provider[]>(API_ENDPOINTS.PROVIDERS, token);
  },
};

/**
 * Service pour les profils Doctor
 */
export const doctorProfileService = {
  /**
   * Met à jour le profil d'un docteur
   */
  updateProfile: async (doctorId: string, data: Partial<CreateDoctorDTO>, token: string): Promise<Doctor> => {
    return api.put<Doctor>(API_ENDPOINTS.DOCTOR_DETAIL(doctorId), data, token);
  },

  /**
   * Récupère le profil d'un docteur
   */
  getProfile: async (doctorId: string, token: string): Promise<Doctor> => {
    return api.get<Doctor>(API_ENDPOINTS.DOCTOR_DETAIL(doctorId), token);
  },

  /**
   * Liste tous les docteurs
   */
  getAllDoctors: async (token?: string): Promise<Doctor[]> => {
    return api.get<Doctor[]>(API_ENDPOINTS.DOCTORS, token);
  },
};

/**
 * Service pour les profils BloodBank
 */
export const bloodBankProfileService = {
  /**
   * Met à jour le profil d'une banque de sang
   */
  updateProfile: async (bankId: string, data: Partial<CreateBloodBankDTO>, token: string): Promise<BloodBank> => {
    return api.put<BloodBank>(API_ENDPOINTS.BLOOD_BANK_DETAIL(bankId), data, token);
  },

  /**
   * Récupère le profil d'une banque de sang
   */
  getProfile: async (bankId: string, token: string): Promise<BloodBank> => {
    return api.get<BloodBank>(API_ENDPOINTS.BLOOD_BANK_DETAIL(bankId), token);
  },

  /**
   * Liste toutes les banques de sang
   */
  getAllBloodBanks: async (token?: string): Promise<BloodBank[]> => {
    return api.get<BloodBank[]>(API_ENDPOINTS.BLOOD_BANKS, token);
  },
};
