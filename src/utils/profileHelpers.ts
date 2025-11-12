/**
 * Helpers pour gérer les profils après l'inscription
 */

import { providerProfileService, doctorProfileService, bloodBankProfileService } from '../services/profileService';
import { UserResponse, Provider, Doctor, BloodBank } from '../models';

/**
 * Trouve l'ID du profil Provider pour un user donné
 */
export const findProviderProfileId = async (userId: string, token: string): Promise<string | null> => {
  try {
    const providers = await providerProfileService.getAllProviders(token);
    const myProvider = providers.find((p: Provider) => p.user?.id === userId);
    return myProvider?.id || null;
  } catch (error) {
    console.error('Erreur lors de la recherche du profil provider:', error);
    return null;
  }
};

/**
 * Trouve l'ID du profil Doctor pour un user donné
 */
export const findDoctorProfileId = async (userId: string, token: string): Promise<string | null> => {
  try {
    const doctors = await doctorProfileService.getAllDoctors(token);
    const myDoctor = doctors.find((d: Doctor) => d.user && typeof d.user === 'object' && (d.user as any).id === userId);
    return myDoctor?.id || null;
  } catch (error) {
    console.error('Erreur lors de la recherche du profil doctor:', error);
    return null;
  }
};

/**
 * Trouve l'ID du profil BloodBank pour un user donné
 */
export const findBloodBankProfileId = async (userId: string, token: string): Promise<string | null> => {
  try {
    const banks = await bloodBankProfileService.getAllBloodBanks(token);
    const myBank = banks.find((b: BloodBank) => b.user?.id === userId);
    return myBank?.id || null;
  } catch (error) {
    console.error('Erreur lors de la recherche du profil bank:', error);
    return null;
  }
};
