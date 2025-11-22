/**
 * Hook personnalisé pour gérer les notifications FCM
 * Gère la demande de permissions, le token et la navigation sur clic
 */

import { useEffect, useCallback, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { useNavigation, NavigationContainerRef } from '@react-navigation/native';
import { fcmService } from '../services/fcmService';
import { providerService } from '../services/providerService';
import { firestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContextFirebase';

// Référence globale pour la navigation
let navigationRef: NavigationContainerRef<any> | null = null;

export const setNavigationRef = (ref: NavigationContainerRef<any>) => {
  navigationRef = ref;
};

export const useNotifications = () => {
  const { user, profile } = useAuth();
  const isInitialized = useRef(false);

  // Sauvegarder le token FCM dans Firestore selon le rôle
  const saveFcmToken = useCallback(async (token: string) => {
    if (!user?.uid || !profile) return;

    try {
      const role = profile.role;

      if (role === 'provider') {
        await providerService.updateFcmToken(user.uid, token);
        console.log('Token FCM sauvegardé pour provider');
      } else if (role === 'doctor') {
        await firestoreService.updateDoctorFcmToken(user.uid, token);
        console.log('Token FCM sauvegardé pour doctor');
      } else if (role === 'bank') {
        await firestoreService.updateBloodBankFcmToken(user.uid, token);
        console.log('Token FCM sauvegardé pour bank');
      }
    } catch (error) {
      console.error('Erreur sauvegarde token FCM:', error);
    }
  }, [user?.uid, profile]);

  // Gérer la navigation quand on clique sur une notification
  const handleNotificationNavigation = useCallback((data: any) => {
    if (!navigationRef || !data) return;

    console.log('Navigation notification data:', data);

    // Selon le type de notification, naviguer vers l'écran approprié
    if (data.type === 'alert' && data.alertId) {
      // Naviguer vers les détails de l'alerte
      navigationRef.navigate('AlertDetails', {
        bloodAlert: {
          id: data.alertId,
          bloodGroup: data.bloodGroup,
          rhesus: data.rhesus,
          bankName: data.bankName,
          message: data.message,
          urgencyLevel: data.urgencyLevel || 'high',
        }
      });
    } else if (data.type === 'response' && data.alertId) {
      // Naviguer vers les réponses aux alertes (pour la banque)
      navigationRef.navigate('BankTabs', { screen: 'AlertResponses' });
    } else if (data.type === 'request') {
      // Naviguer vers les demandes (pour la banque)
      navigationRef.navigate('BankTabs', { screen: 'AlertRequests' });
    }
  }, []);

  // Initialiser les notifications
  const initializeNotifications = useCallback(async () => {
    if (isInitialized.current || !user?.uid) return;

    try {
      // 1. Demander les permissions
      const hasPermission = await fcmService.requestPermission();

      if (!hasPermission) {
        console.warn('Notifications: Permissions non accordées');
        return;
      }

      // 2. Récupérer le token
      const token = await fcmService.getDeviceToken();

      if (token) {
        // 3. Sauvegarder le token dans Firestore
        await saveFcmToken(token);
      }

      // 4. Écouter les messages en foreground
      const unsubscribeMessage = fcmService.onMessage((remoteMessage) => {
        console.log('Message reçu en foreground:', remoteMessage);

        // Afficher une alerte locale
        const notification = remoteMessage.notification;
        if (notification) {
          Alert.alert(
            notification.title || 'Notification',
            notification.body || '',
            [
              { text: 'Ignorer', style: 'cancel' },
              {
                text: 'Voir',
                onPress: () => handleNotificationNavigation(remoteMessage.data),
              },
            ]
          );
        }
      });

      // 5. Écouter quand l'app s'ouvre depuis une notification en background
      const unsubscribeOpenedApp = fcmService.onNotificationOpenedApp((remoteMessage) => {
        console.log('App ouverte depuis notification:', remoteMessage);
        handleNotificationNavigation(remoteMessage.data);
      });

      // 6. Écouter le rafraîchissement du token
      const unsubscribeTokenRefresh = fcmService.onTokenRefresh(async (newToken) => {
        console.log('Token FCM rafraîchi');
        await saveFcmToken(newToken);
      });

      // 7. Vérifier si l'app a été lancée par une notification
      const initialNotification = await fcmService.getInitialNotification();
      if (initialNotification) {
        console.log('App lancée via notification:', initialNotification);
        // Délai pour laisser la navigation s'initialiser
        setTimeout(() => {
          handleNotificationNavigation(initialNotification.data);
        }, 1000);
      }

      isInitialized.current = true;

      // Retourner la fonction de nettoyage
      return () => {
        unsubscribeMessage();
        unsubscribeOpenedApp();
        unsubscribeTokenRefresh();
      };
    } catch (error) {
      console.error('Erreur initialisation notifications:', error);
    }
  }, [user?.uid, saveFcmToken, handleNotificationNavigation]);

  // S'abonner aux topics selon le rôle
  const subscribeToTopics = useCallback(async () => {
    if (!profile) return;

    try {
      const role = profile.role;

      // S'abonner au topic général
      await fcmService.subscribeToTopic('all_users');

      // S'abonner aux topics spécifiques au rôle
      if (role === 'provider') {
        await fcmService.subscribeToTopic('providers');

        // S'abonner au topic du groupe sanguin si disponible
        if (profile.bloodGroup && profile.rhesus) {
          const bloodTopic = `blood_${profile.bloodGroup}${profile.rhesus === '+' ? 'pos' : 'neg'}`;
          await fcmService.subscribeToTopic(bloodTopic);
        }
      } else if (role === 'doctor') {
        await fcmService.subscribeToTopic('doctors');
      } else if (role === 'bank') {
        await fcmService.subscribeToTopic('banks');
      }
    } catch (error) {
      console.error('Erreur abonnement topics:', error);
    }
  }, [profile]);

  // Effet pour initialiser les notifications quand l'utilisateur se connecte
  useEffect(() => {
    if (user?.uid && profile) {
      const cleanup = initializeNotifications();
      subscribeToTopics();

      return () => {
        if (cleanup && typeof cleanup === 'function') {
          cleanup();
        }
      };
    }
  }, [user?.uid, profile, initializeNotifications, subscribeToTopics]);

  return {
    initializeNotifications,
    saveFcmToken,
  };
};

export default useNotifications;
