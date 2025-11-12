/**
 * Configuration API pour l'application Blood-Link
 * Contient l'URL de base du backend et les configurations pour les requêtes
 */

// URL de base du backend
export const API_BASE_URL = 'https://inf-4077-blood-link-backend.onrender.com';

// Endpoints de l'API (selon documentation backend)
export const API_ENDPOINTS = {
  // Authentification
  REGISTER: '/apiBloodlink/registers/',
  LOGIN: '/apiBloodlink/logins/',
  LOGOUT: '/apiBloodlink/logout/',
  USERS: '/apiBloodlink/users/',

  // Provider (Donneur de sang)
  PROVIDERS: '/apiBloodlink/providers/',
  PROVIDER_DETAIL: (id: string) => `/apiBloodlink/providers/${id}/`,

  // Doctor (Médecin)
  DOCTORS: '/apiBloodlink/doctors/',
  DOCTOR_DETAIL: (id: string) => `/apiBloodlink/doctors/${id}/`,

  // BloodBank (Banque de sang)
  BLOOD_BANKS: '/apiBloodlink/bloodBanks/',
  BLOOD_BANK_DETAIL: (id: string) => `/apiBloodlink/bloodBanks/${id}/`,

  // BloodRequest (Demande de sang)
  BLOOD_REQUESTS: '/apiBloodlink/bloodRequests/',
  BLOOD_REQUEST_DETAIL: (id: string) => `/apiBloodlink/bloodRequests/${id}/`,
  VALIDATE_BLOOD_REQUEST: (id: string) => `/apiBloodlink/requests/${id}/validate/`,

  // BloodBag (Poche de sang)
  BLOOD_BAGS: '/apiBloodlink/blood_bags/',
  BLOOD_BAG_DETAIL: (id: string) => `/apiBloodlink/blood_bags/${id}/`,

  // BloodTransaction (Transaction de sang)
  BLOOD_TRANSACTIONS_GET: '/apiBloodlink/getbloodTransactions/',
  BLOOD_TRANSACTIONS_POST: '/apiBloodlink/postbloodTransactions/',
  BLOOD_TRANSACTION_DETAIL: (id: string) => `/apiBloodlink/bloodTransactions/${id}/`,

  // Alerts (Alertes)
  ALERTS: '/apiBloodlink/alerts/',
  ALERT_DETAIL: (id: string) => `/apiBloodlink/alerts/${id}/`,
  ALERT_REPLY: (id: string) => `/apiBloodlink/alerts/${id}/reply/`,
  RECEIVE_ALERTS: '/apiBloodlink/receiveAlertes/',
  RECEIVE_ALERT_DETAIL: (id: string) => `/apiBloodlink/receiveAlertes/${id}/`,
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