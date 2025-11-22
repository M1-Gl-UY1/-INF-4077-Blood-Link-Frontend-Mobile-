/**
 * Utility pour le stockage sécurisé des données avec AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserResponse } from '../models';

// Clés de stockage
const STORAGE_KEYS = {
  TOKEN: '@bloodlink:token',
  USER: '@bloodlink:user',
  REMEMBER_ME: '@bloodlink:remember_me',
};

/**
 * Stocke le token JWT
 */
export const saveToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
  } catch (error) {
    console.error('Erreur lors du stockage du token:', error);
    throw new Error('Impossible de sauvegarder le token');
  }
};

/**
 * Récupère le token JWT
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    return null;
  }
};

/**
 * Supprime le token JWT
 */
export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Erreur lors de la suppression du token:', error);
    throw new Error('Impossible de supprimer le token');
  }
};

/**
 * Stocke les informations de l'utilisateur
 */
export const saveUser = async (user: UserResponse): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Erreur lors du stockage des informations utilisateur:', error);
    throw new Error('Impossible de sauvegarder les informations utilisateur');
  }
};

/**
 * Récupère les informations de l'utilisateur
 */
export const getUser = async (): Promise<UserResponse | null> => {
  try {
    const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Erreur lors de la récupération des informations utilisateur:', error);
    return null;
  }
};

/**
 * Supprime les informations de l'utilisateur
 */
export const removeUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  } catch (error) {
    console.error('Erreur lors de la suppression des informations utilisateur:', error);
    throw new Error('Impossible de supprimer les informations utilisateur');
  }
};

/**
 * Supprime toutes les données de l'application (déconnexion complète)
 */
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.USER,
    ]);
  } catch (error) {
    console.error('Erreur lors de la suppression de toutes les données:', error);
    throw new Error('Impossible de supprimer toutes les données');
  }
};

/**
 * Stocke les préférences "Se souvenir de moi"
 */
export const saveRememberMe = async (rememberMe: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, JSON.stringify(rememberMe));
  } catch (error) {
    console.error('Erreur lors du stockage de la préférence "Se souvenir de moi":', error);
  }
};

/**
 * Récupère les préférences "Se souvenir de moi"
 */
export const getRememberMe = async (): Promise<boolean> => {
  try {
    const rememberMe = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
    return rememberMe ? JSON.parse(rememberMe) : false;
  } catch (error) {
    console.error('Erreur lors de la récupération de la préférence "Se souvenir de moi":', error);
    return false;
  }
};
