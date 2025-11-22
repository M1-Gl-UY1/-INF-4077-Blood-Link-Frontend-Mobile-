/**
 * Hook personnalisé pour les données du médecin
 * Gère le chargement et la mise à jour en temps réel des données
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContextFirebase';
import { doctorService, DoctorStats, CreateBloodRequestDTO } from '../services/doctorService';
import { FirebaseDoctor, FirebaseBloodRequest, FirebaseBloodBank } from '../types/firebase.types';

// ============================================
// HOOK POUR LE PROFIL DU MÉDECIN
// ============================================

export const useDoctorProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<FirebaseDoctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const doctorProfile = await doctorService.getDoctorProfile(user.uid);
      setProfile(doctorProfile);
    } catch (err: any) {
      console.error('Erreur chargement profil médecin:', err);
      setError(err.message || 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateProfile = async (data: Partial<FirebaseDoctor>) => {
    if (!profile?.id) {
      throw new Error('Profil non trouvé');
    }

    await doctorService.updateDoctorProfile(profile.id, data);
    await loadProfile();
  };

  return {
    profile,
    loading,
    error,
    refreshProfile: loadProfile,
    updateProfile,
  };
};

// ============================================
// HOOK POUR LES BANQUES DE SANG
// ============================================

export const useBloodBanks = () => {
  const [bloodBanks, setBloodBanks] = useState<FirebaseBloodBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBloodBanks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const banks = await doctorService.getAllBloodBanks();
      setBloodBanks(banks);
    } catch (err: any) {
      console.error('Erreur chargement banques:', err);
      setError(err.message || 'Erreur lors du chargement des banques');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBloodBanks();
  }, [loadBloodBanks]);

  return {
    bloodBanks,
    loading,
    error,
    refreshBloodBanks: loadBloodBanks,
  };
};

// ============================================
// HOOK POUR LES DEMANDES DE SANG
// ============================================

export const useDoctorRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<FirebaseBloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Écoute en temps réel des demandes
    const unsubscribe = doctorService.subscribeToRequests(user.uid, (newRequests) => {
      setRequests(newRequests);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const createRequest = async (data: Omit<CreateBloodRequestDTO, 'doctorId' | 'doctorName'>, doctorName: string) => {
    if (!user?.uid) {
      throw new Error('Utilisateur non connecté');
    }

    return await doctorService.createBloodRequest({
      ...data,
      doctorId: user.uid,
      doctorName,
    });
  };

  const cancelRequest = async (requestId: string) => {
    await doctorService.cancelRequest(requestId);
  };

  return {
    requests,
    loading,
    error,
    createRequest,
    cancelRequest,
  };
};

// ============================================
// HOOK POUR LES DEMANDES EN ATTENTE
// ============================================

export const usePendingRequests = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<FirebaseBloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Écoute en temps réel des demandes en attente
    const unsubscribe = doctorService.subscribeToPendingRequests(user.uid, (newRequests) => {
      setPendingRequests(newRequests);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const cancelRequest = async (requestId: string) => {
    await doctorService.cancelRequest(requestId);
  };

  return {
    pendingRequests,
    loading,
    error,
    cancelRequest,
  };
};

// ============================================
// HOOK POUR L'HISTORIQUE DES DEMANDES
// ============================================

export const useRequestHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<FirebaseBloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const requests = await doctorService.getRequestHistory(user.uid);
      setHistory(requests);
    } catch (err: any) {
      console.error('Erreur chargement historique:', err);
      setError(err.message || 'Erreur lors du chargement de l\'historique');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    history,
    loading,
    error,
    refreshHistory: loadHistory,
  };
};

// ============================================
// HOOK POUR LES STATISTIQUES DU MÉDECIN
// ============================================

export const useDoctorStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DoctorStats>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const doctorStats = await doctorService.getDoctorStats(user.uid);
      setStats(doctorStats);
    } catch (err: any) {
      console.error('Erreur chargement statistiques:', err);
      setError(err.message || 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refreshStats: loadStats,
  };
};

// ============================================
// HOOK COMBINÉ POUR TOUTES LES DONNÉES DOCTOR
// ============================================

export const useDoctorData = () => {
  const profileHook = useDoctorProfile();
  const requestsHook = useDoctorRequests();
  const statsHook = useDoctorStats();

  const isLoading = profileHook.loading || requestsHook.loading || statsHook.loading;

  const refreshAll = useCallback(async () => {
    await Promise.all([
      profileHook.refreshProfile(),
      statsHook.refreshStats(),
    ]);
  }, [profileHook.refreshProfile, statsHook.refreshStats]);

  return {
    profile: profileHook.profile,
    requests: requestsHook.requests,
    stats: statsHook.stats,
    loading: isLoading,
    error: profileHook.error || requestsHook.error || statsHook.error,
    refreshAll,
    updateProfile: profileHook.updateProfile,
    createRequest: requestsHook.createRequest,
    cancelRequest: requestsHook.cancelRequest,
  };
};
