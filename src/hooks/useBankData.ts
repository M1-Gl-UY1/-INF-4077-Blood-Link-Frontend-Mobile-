/**
 * Hook personnalisé pour gérer les données de la banque de sang
 * Centralise la logique de récupération et mise à jour des données
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContextFirebase';
import { firestoreService } from '../services/firestoreService';
import { alertService } from '../services/alertService';
import {
  FirebaseBloodBank,
  FirebaseAlert,
  FirebaseAlertResponse,
  FirebaseBloodRequest,
} from '../types/firebase.types';
import { AlertWithResponses } from '../services/alertService';

interface UseBankDataReturn {
  // Données
  bankProfile: FirebaseBloodBank | null;
  activeAlerts: FirebaseAlert[];
  alertsWithResponses: AlertWithResponses[];
  pendingRequests: FirebaseBloodRequest[];

  // États
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Actions
  refreshData: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshAlerts: () => Promise<void>;
  refreshRequests: () => Promise<void>;
}

export const useBankData = (): UseBankDataReturn => {
  const { user } = useAuth();

  // États des données
  const [bankProfile, setBankProfile] = useState<FirebaseBloodBank | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<FirebaseAlert[]>([]);
  const [alertsWithResponses, setAlertsWithResponses] = useState<AlertWithResponses[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FirebaseBloodRequest[]>([]);

  // États de chargement
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupérer le profil de la banque
  const refreshProfile = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const profile = await firestoreService.getBloodBankByUid(user.uid);
      setBankProfile(profile);
    } catch (err: any) {
      console.error('Erreur lors de la récupération du profil:', err);
      setError(err.message);
    }
  }, [user?.uid]);

  // Récupérer les alertes actives
  const refreshAlerts = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const [alerts, alertsResponses] = await Promise.all([
        alertService.getActiveAlertsByBank(user.uid),
        alertService.getAlertsWithPendingResponses(user.uid),
      ]);
      setActiveAlerts(alerts);
      setAlertsWithResponses(alertsResponses);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des alertes:', err);
      setError(err.message);
    }
  }, [user?.uid]);

  // Récupérer les demandes en attente
  const refreshRequests = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const requests = await firestoreService.getPendingBloodRequestsByBank(user.uid);
      setPendingRequests(requests);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des demandes:', err);
      setError(err.message);
    }
  }, [user?.uid]);

  // Rafraîchir toutes les données
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      await Promise.all([refreshProfile(), refreshAlerts(), refreshRequests()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshProfile, refreshAlerts, refreshRequests]);

  // Chargement initial des données
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await Promise.all([refreshProfile(), refreshAlerts(), refreshRequests()]);
      } catch (err: any) {
        console.error('Erreur lors du chargement initial:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [user?.uid, refreshProfile, refreshAlerts, refreshRequests]);

  // Écouter les changements en temps réel sur les alertes
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = alertService.subscribeToActiveAlertsByBank(user.uid, (alerts) => {
      setActiveAlerts(alerts);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return {
    bankProfile,
    activeAlerts,
    alertsWithResponses,
    pendingRequests,
    isLoading,
    isRefreshing,
    error,
    refreshData,
    refreshProfile,
    refreshAlerts,
    refreshRequests,
  };
};
