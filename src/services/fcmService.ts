/**
 * Service FCM compatible React Native Firebase v22+
 */

import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

class FcmService {
  private token: string | null = null;

  /**
   * Demande les permissions de notification (Android + iOS)
   */
  async requestPermission(): Promise<boolean> {
    try {
      // Android 13+ require system permission
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn("Permission système Android refusée");
          return false;
        }
      }

      const authorizationStatus = await messaging().requestPermission();

      const enabled =
        authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL;

      console.log('Permission FCM:', authorizationStatus, 'Enabled:', enabled);
      return enabled;
    } catch (error) {
      console.error('Erreur requestPermission:', error);
      return false;
    }
  }

  /**
   * Vérifie les permissions 
   */
  async hasPermission(): Promise<boolean> {
    try {
      const authorizationStatus = await messaging().requestPermission();

      return (
        authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    } catch (error) {
      console.error('Erreur hasPermission:', error);
      return false;
    }
  }

  /**
   * Récupère le token FCM
   */
  async getDeviceToken(): Promise<string | null> {
    try {
      let permission = await this.hasPermission();
      if (!permission) {
        permission = await this.requestPermission();
      }

      if (!permission) {
        console.warn('FCM: Permissions refusées');
        return null;
      }

      // Android: enregistrer le device
      if (Platform.OS === 'android') {
        await messaging().registerDeviceForRemoteMessages();
      }

      const token = await messaging().getToken();

      if (token) {
        this.token = token;
        console.log('FCM Token récupéré:', token);
      } else {
        console.warn('FCM: Token vide');
      }

      return token;
    } catch (error) {
      console.error('Erreur getDeviceToken:', error);
      return null;
    }
  }

  getCachedToken(): string | null {
    return this.token;
  }

  /**
   * Token refresh listener
   */
  onTokenRefresh(callback: (token: string) => void): () => void {
    return messaging().onTokenRefresh((token) => {
      this.token = token;
      console.log('Nouveau token FCM (refresh):', token);
      callback(token);
    });
  }

  /**
   * Message foreground
   */
  onMessage(callback: (message: FirebaseMessagingTypes.RemoteMessage) => void): () => void {
    return messaging().onMessage(async (remoteMessage) => {
      console.log('FCM foreground message:', remoteMessage);
      callback(remoteMessage);
    });
  }

  /**
   * App ouverte depuis une notification en background
   */
  onNotificationOpenedApp(callback: (message: FirebaseMessagingTypes.RemoteMessage) => void): () => void {
    return messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification opened app:', remoteMessage);
      callback(remoteMessage);
    });
  }

  /**
   * App ouverte depuis une notification quand elle était fermée
   */
  async getInitialNotification(): Promise<FirebaseMessagingTypes.RemoteMessage | null> {
    try {
      const msg = await messaging().getInitialNotification();
      if (msg) {
        console.log('App lancée via notification:', msg);
      }
      return msg;
    } catch (error) {
      console.error('Erreur getInitialNotification:', error);
      return null;
    }
  }

  /**
   * Topics (toujours valides)
   */
  async subscribeToTopic(topic: string): Promise<void> {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`Abonné au topic: ${topic}`);
    } catch (error) {
      console.error(`Erreur subscribeToTopic(${topic}):`, error);
    }
  }

  async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`Désabonné du topic: ${topic}`);
    } catch (error) {
      console.error(`Erreur unsubscribeFromTopic(${topic}):`, error);
    }
  }
}

export const fcmService = new FcmService();
