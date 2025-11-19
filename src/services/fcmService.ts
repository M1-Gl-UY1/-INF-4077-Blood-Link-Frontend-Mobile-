/**
 * Service dédié à la gestion des tokens FCM
 */

import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

class FcmService {
  /**
   * Demande les permissions (iOS) et récupère le token FCM de l'appareil
   */
  async getDeviceToken(): Promise<string | null> {
    try {
      const authorizationStatus = await messaging().requestPermission();
      const enabled =
        authorizationStatus === FirebaseMessagingTypes.AuthorizationStatus.AUTHORIZED ||
        authorizationStatus === FirebaseMessagingTypes.AuthorizationStatus.PROVISIONAL ||
        authorizationStatus === FirebaseMessagingTypes.AuthorizationStatus.NOT_DETERMINED;

      if (!enabled) {
        return null;
      }

      const token = await messaging().getToken();
      return token;
    } catch (error) {
      console.error('Erreur lors de la récupération du token FCM:', error);
      return null;
    }
  }
}

export const fcmService = new FcmService();

