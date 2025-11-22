/**
 * Hooks personnalisés pour les données du Provider (Donneur)
 * Gère le chargement et la mise à jour en temps réel des données
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContextFirebase';
import { providerService, ProviderStats, ProviderDonationHistory } from '../services/providerService';
import { FirebaseProvider, FirebaseAlert, FirebaseAlertResponse } from '../types/firebase.types';

// ============================================
// HOOK POUR LE PROFIL DU PROVIDER
// ============================================

export const useProviderProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<FirebaseProvider | null>(null);
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
      const providerProfile = await providerService.getProviderProfile(user.uid);
      setProfile(providerProfile);
    } catch (err: any) {
      console.error('Erreur chargement profil provider:', err);
      setError(err.message || 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateProfile = async (data: Partial<FirebaseProvider>) => {
    if (!profile?.id) {
      throw new Error('Profil non trouvé');
    }

    await providerService.updateProviderProfile(profile.id, data);
    await loadProfile();
  };

  const updateAvailability = async (isAvailable: boolean) => {
    if (!profile?.id) {
      throw new Error('Profil non trouvé');
    }

    await providerService.updateAvailability(profile.id, isAvailable);
    setProfile(prev => prev ? { ...prev, isAvailable } : null);
  };

  return {
    profile,
    loading,
    error,
    refreshProfile: loadProfile,
    updateProfile,
    updateAvailability,
  };
};

// ============================================
// HOOK POUR LES ALERTES ACTIVES
// ============================================

export const useActiveAlerts = () => {
  const [alerts, setAlerts] = useState<FirebaseAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = providerService.subscribeToActiveAlerts((newAlerts) => {
      setAlerts(newAlerts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    alerts,
    loading,
    error,
  };
};

// ============================================
// HOOK POUR LES RÉPONSES DU PROVIDER
// ============================================

export const useProviderResponses = () => {
  const { user } = useAuth();
  const [responses, setResponses] = useState<FirebaseAlertResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = providerService.subscribeToProviderResponses(user.uid, (newResponses) => {
      setResponses(newResponses);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const respondToAlert = async (alertId: string, providerName: string, notes?: string) => {
    if (!user?.uid) {
      throw new Error('Utilisateur non connecté');
    }

    return await providerService.respondToAlert(alertId, user.uid, providerName, notes);
  };

  return {
    responses,
    loading,
    error,
    respondToAlert,
  };
};

// ============================================
// HOOK POUR L'HISTORIQUE DES DONS
// ============================================

export const useDonationHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<ProviderDonationHistory[]>([]);
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
      const donationHistory = await providerService.getDonationHistory(user.uid);
      setHistory(donationHistory);
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
// HOOK POUR LES STATISTIQUES DU PROVIDER
// ============================================

export const useProviderStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProviderStats>({
    totalDonations: 0,
    pendingResponses: 0,
    acceptedResponses: 0,
    completedDonations: 0,
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
      const providerStats = await providerService.getProviderStats(user.uid);
      setStats(providerStats);
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
// HOOK COMBINÉ POUR TOUTES LES DONNÉES PROVIDER
// ============================================

export const useProviderData = () => {
  const profileHook = useProviderProfile();
  const alertsHook = useActiveAlerts();
  const responsesHook = useProviderResponses();
  const statsHook = useProviderStats();

  const isLoading = profileHook.loading || alertsHook.loading;

  const refreshAll = useCallback(async () => {
    await Promise.all([
      profileHook.refreshProfile(),
      statsHook.refreshStats(),
    ]);
  }, [profileHook.refreshProfile, statsHook.refreshStats]);

  return {
    profile: profileHook.profile,
    alerts: alertsHook.alerts,
    responses: responsesHook.responses,
    stats: statsHook.stats,
    loading: isLoading,
    error: profileHook.error || alertsHook.error || responsesHook.error,
    refreshAll,
    updateProfile: profileHook.updateProfile,
    updateAvailability: profileHook.updateAvailability,
    respondToAlert: responsesHook.respondToAlert,
  };
};
