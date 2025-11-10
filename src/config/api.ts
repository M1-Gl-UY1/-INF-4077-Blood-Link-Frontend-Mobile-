/**
 * Configuration API pour l'application Blood-Link
 * Contient l'URL de base du backend et les configurations pour les requêtes
 */

// URL de base du backend
export const API_BASE_URL = 'https://inf-4077-blood-link-backend.onrender.com';

// Endpoints de l'API
export const API_ENDPOINTS = {
  // Authentification
  LOGIN: '/apiBloodlink/login',
  REGISTER: '/apiBloodlink/registers',
  LOGOUT: '/apiBloodlink/logout',

  // Provider (Donneur de sang)
  PROVIDERS: '/apiBloodlink/providers',
  PROVIDER_DETAIL: (id: string) => `/apiBloodlink/providers/${id}`,
  PROVIDER_PROFILE: '/apiBloodlink/providers/profile',

  // Doctor (Médecin)
  DOCTORS: '/apiBloodlink/doctors',
  DOCTOR_DETAIL: (id: string) => `/apiBloodlink/doctors/${id}`,
  DOCTOR_PROFILE: '/apiBloodlink/doctors/profile',

  // BloodBank (Banque de sang)
  BLOOD_BANKS: '/apiBloodlink/blood-banks',
  BLOOD_BANK_DETAIL: (id: string) => `/apiBloodlink/blood-banks/${id}`,
  BLOOD_BANK_PROFILE: '/apiBloodlink/blood-banks/profile',

  // BloodRequest (Demande de sang)
  BLOOD_REQUESTS: '/apiBloodlink/blood-requests',
  BLOOD_REQUEST_DETAIL: (id: string) => `/apiBloodlink/blood-requests/${id}`,
  CREATE_BLOOD_REQUEST: '/apiBloodlink/blood-requests/create',

  // BloodBag (Poche de sang)
  BLOOD_BAGS: '/apiBloodlink/blood-bags',
  BLOOD_BAG_DETAIL: (id: string) => `/apiBloodlink/blood-bags/${id}`,
  CREATE_BLOOD_BAG: '/apiBloodlink/blood-bags/create',

  // BloodTransaction (Transaction de sang)
  BLOOD_TRANSACTIONS: '/apiBloodlink/blood-transactions',
  BLOOD_TRANSACTION_DETAIL: (id: string) => `/apiBloodlink/blood-transactions/${id}`,

  // Alerts (Alertes)
  ALERTS: '/apiBloodlink/alerts',
  ALERT_DETAIL: (id: string) => `/apiBloodlink/alerts/${id}`,
  ALERT_RECEIVE: '/apiBloodlink/alerts/receive',
};

// Configuration des headers par défaut
export const getDefaultHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Timeout pour les requêtes (en millisecondes)
export const REQUEST_TIMEOUT = 30000; // 30 secondes

// Configuration pour le retry des requêtes
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 seconde
};