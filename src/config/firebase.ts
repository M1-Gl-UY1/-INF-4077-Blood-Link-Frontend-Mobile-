/**
 * Configuration Firebase pour l'application Blood-Link
 * Initialisation de Firebase et export des services
 */

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

/**
 * Instance Firebase Auth
 * Gère l'authentification des utilisateurs
 */
export const firebaseAuth = auth();

/**
 * Instance Firestore
 * Gère la base de données Firestore
 *
 * Note: Pour utiliser la base de données "bloodlinkdb", vous devez la configurer
 * dans la console Firebase. Par défaut, Firestore utilise la database par défaut.
 */
export const firebaseFirestore = firestore();

/**
 * Collections Firestore
 * Définit les noms des collections dans la base de données
 */
export const FIREBASE_COLLECTIONS = {
  PROVIDERS: 'providers',
  DOCTORS: 'doctors',
  BLOOD_BANKS: 'bloodBanks',
  BLOOD_REQUESTS: 'bloodRequests',
  BLOOD_BAGS: 'bloodBags',
  BLOOD_TRANSACTIONS: 'bloodTransactions',
  ALERTS: 'alerts',
  ALERT_RESPONSES: 'alertResponses',
} as const;

/**
 * Configuration des erreurs Firebase en français
 */
export const getFirebaseErrorMessage = (error: any): string => {
  const errorCode = error?.code || '';

  const errorMessages: Record<string, string> = {
    // Erreurs d'authentification
    'auth/email-already-in-use': 'Cette adresse email est déjà utilisée',
    'auth/invalid-email': 'Adresse email invalide',
    'auth/operation-not-allowed': 'Opération non autorisée',
    'auth/weak-password': 'Le mot de passe est trop faible',
    'auth/user-disabled': 'Ce compte a été désactivé',
    'auth/user-not-found': 'Aucun compte ne correspond à ces identifiants',
    'auth/wrong-password': 'Mot de passe incorrect',
    'auth/invalid-credential': 'Identifiants invalides',
    'auth/too-many-requests': 'Trop de tentatives. Veuillez réessayer plus tard',
    'auth/network-request-failed': 'Erreur de connexion. Vérifiez votre connexion internet',

    // Erreurs Firestore
    'firestore/permission-denied': 'Vous n\'avez pas les permissions nécessaires',
    'firestore/not-found': 'Document non trouvé',
    'firestore/already-exists': 'Ce document existe déjà',
    'firestore/resource-exhausted': 'Quota dépassé',
    'firestore/unavailable': 'Service temporairement indisponible',
  };

  return errorMessages[errorCode] || error?.message || 'Une erreur est survenue';
};

/**
 * Vérifie si Firebase est correctement initialisé
 */
export const isFirebaseInitialized = (): boolean => {
  try {
    return firebaseAuth !== null && firebaseFirestore !== null;
  } catch (error) {
    console.error('Erreur lors de la vérification de Firebase:', error);
    return false;
  }
};
