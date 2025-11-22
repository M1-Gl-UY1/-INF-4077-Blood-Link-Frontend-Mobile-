/**
 * Firebase Cloud Functions pour BloodLink
 * Gère les notifications push et les automatisations
 * Compatible avec Firebase Functions v2
 */

const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onRequest } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

// Initialiser Firebase Admin
initializeApp();

const db = getFirestore();
const messaging = getMessaging();

/**
 * Envoie une notification push à un appareil spécifique
 */
async function sendPushNotification(token, title, body, data = {}) {
  try {
    const message = {
      token,
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'blood_alerts',
          priority: 'high',
          defaultSound: true,
          defaultVibrateTimings: true,
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title,
              body,
            },
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await messaging.send(message);
    console.log('Notification envoyée avec succès:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envoie des notifications à plusieurs appareils
 */
async function sendMultipleNotifications(tokens, title, body, data = {}) {
  if (!tokens || tokens.length === 0) {
    console.log('Aucun token FCM fourni');
    return { success: false, error: 'No tokens provided' };
  }

  // Filtrer les tokens valides
  const validTokens = tokens.filter(token => token && token.length > 0);

  if (validTokens.length === 0) {
    console.log('Aucun token FCM valide');
    return { success: false, error: 'No valid tokens' };
  }

  const message = {
    notification: {
      title,
      body,
    },
    data: {
      ...data,
      click_action: 'FLUTTER_NOTIFICATION_CLICK',
    },
    android: {
      priority: 'high',
      notification: {
        channelId: 'blood_alerts',
        priority: 'high',
        defaultSound: true,
        defaultVibrateTimings: true,
      },
    },
    apns: {
      payload: {
        aps: {
          alert: {
            title,
            body,
          },
          sound: 'default',
          badge: 1,
        },
      },
    },
    tokens: validTokens,
  };

  try {
    const response = await messaging.sendEachForMulticast(message);
    console.log(`Notifications envoyées: ${response.successCount} succès, ${response.failureCount} échecs`);

    // Logger les erreurs pour debugging
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`Erreur pour le token ${idx}:`, resp.error);
        }
      });
    }

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications:', error);
    return { success: false, error: error.message };
  }
}

/**
 * TRIGGER: Quand une nouvelle alerte est créée
 * Envoie des notifications à tous les providers disponibles
 */
exports.onAlertCreated = onDocumentCreated('alerts/{alertId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log('Pas de données dans l\'événement');
    return null;
  }

  const alert = snapshot.data();
  const alertId = event.params.alertId;

  console.log(`Nouvelle alerte créée: ${alertId}`, alert);

  try {
    // Récupérer tous les providers actifs et disponibles
    const providersSnapshot = await db
      .collection('providers')
      .where('isActive', '==', true)
      .where('isAvailable', '==', true)
      .get();

    if (providersSnapshot.empty) {
      console.log('Aucun provider disponible');
      return null;
    }

    // Extraire les tokens FCM
    const tokens = [];
    providersSnapshot.docs.forEach(doc => {
      const provider = doc.data();
      if (provider.fcmToken) {
        tokens.push(provider.fcmToken);
      }
    });

    console.log(`${tokens.length} providers à notifier`);

    if (tokens.length === 0) {
      console.log('Aucun token FCM disponible');
      return null;
    }

    // Préparer le message de notification
    const urgencyLabels = {
      low: 'Faible',
      medium: 'Moyen',
      high: 'Urgent',
      critical: 'CRITIQUE',
    };

    const urgencyLabel = urgencyLabels[alert.urgencyLevel] || 'Urgent';
    const title = `🩸 Alerte ${urgencyLabel} - Sang ${alert.bloodGroup}${alert.rhesus}`;
    const body = `${alert.bankName} recherche un donneur. ${alert.message ? alert.message.substring(0, 100) : ''}...`;

    // Envoyer les notifications
    const result = await sendMultipleNotifications(tokens, title, body, {
      type: 'blood_alert',
      alertId,
      bloodGroup: alert.bloodGroup || '',
      rhesus: alert.rhesus || '',
      urgencyLevel: alert.urgencyLevel || 'high',
    });

    console.log('Résultat des notifications:', result);

    // Mettre à jour l'alerte avec le nombre de notifications envoyées
    await snapshot.ref.update({
      notificationsSent: result.successCount || 0,
      notificationsFailedCount: result.failureCount || 0,
    });

    return result;
  } catch (error) {
    console.error('Erreur dans onAlertCreated:', error);
    return null;
  }
});

/**
 * TRIGGER: Quand un provider répond à une alerte
 * Notifie la banque de sang
 */
exports.onAlertResponseCreated = onDocumentCreated('alertResponses/{responseId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log('Pas de données dans l\'événement');
    return null;
  }

  const response = snapshot.data();
  const responseId = event.params.responseId;

  console.log(`Nouvelle réponse à l'alerte: ${responseId}`, response);

  try {
    // Récupérer l'alerte associée
    const alertDoc = await db.collection('alerts').doc(response.alertId).get();

    if (!alertDoc.exists) {
      console.log('Alerte non trouvée');
      return null;
    }

    const alert = alertDoc.data();

    // Récupérer la banque de sang
    const bankDoc = await db.collection('bloodBanks').doc(alert.bloodBankId).get();

    if (!bankDoc.exists) {
      console.log('Banque de sang non trouvée');
      return null;
    }

    const bank = bankDoc.data();

    if (!bank.fcmToken) {
      console.log('La banque n\'a pas de token FCM');
      return null;
    }

    // Envoyer la notification à la banque
    const title = '👤 Nouveau donneur disponible!';
    const body = `${response.providerName} a répondu à votre alerte pour du sang ${alert.bloodGroup}${alert.rhesus}`;

    const result = await sendPushNotification(bank.fcmToken, title, body, {
      type: 'alert_response',
      alertId: response.alertId,
      responseId,
      providerId: response.providerId,
    });

    console.log('Notification à la banque envoyée:', result);

    return result;
  } catch (error) {
    console.error('Erreur dans onAlertResponseCreated:', error);
    return null;
  }
});

/**
 * TRIGGER: Quand une réponse est acceptée
 * Notifie le provider que sa réponse a été acceptée
 */
exports.onAlertResponseUpdated = onDocumentUpdated('alertResponses/{responseId}', async (event) => {
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();
  const responseId = event.params.responseId;

  // Vérifier si le statut a changé vers 'accepted'
  if (beforeData.status === afterData.status || afterData.status !== 'accepted') {
    return null;
  }

  console.log(`Réponse acceptée: ${responseId}`);

  try {
    // Récupérer le provider
    const providerDoc = await db.collection('providers').doc(afterData.providerId).get();

    if (!providerDoc.exists) {
      console.log('Provider non trouvé');
      return null;
    }

    const provider = providerDoc.data();

    if (!provider.fcmToken) {
      console.log('Le provider n\'a pas de token FCM');
      return null;
    }

    // Récupérer l'alerte pour avoir les détails de la banque
    const alertDoc = await db.collection('alerts').doc(afterData.alertId).get();

    if (!alertDoc.exists) {
      console.log('Alerte non trouvée');
      return null;
    }

    const alert = alertDoc.data();

    // Envoyer la notification au provider
    const title = '✅ Votre don a été accepté!';
    const body = `${alert.bankName} a accepté votre proposition de don. Veuillez vous rendre à la banque de sang.`;

    const result = await sendPushNotification(provider.fcmToken, title, body, {
      type: 'response_accepted',
      alertId: afterData.alertId,
      responseId,
      bankName: alert.bankName || '',
    });

    console.log('Notification au provider envoyée:', result);

    return result;
  } catch (error) {
    console.error('Erreur dans onAlertResponseUpdated:', error);
    return null;
  }
});

/**
 * TRIGGER: Quand une demande de sang est créée par un médecin
 * Notifie la banque de sang concernée
 */
exports.onBloodRequestCreated = onDocumentCreated('bloodRequests/{requestId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log('Pas de données dans l\'événement');
    return null;
  }

  const request = snapshot.data();
  const requestId = event.params.requestId;

  console.log(`Nouvelle demande de sang: ${requestId}`, request);

  if (!request.bloodBankId) {
    console.log('Pas de banque de sang spécifiée');
    return null;
  }

  try {
    // Récupérer la banque de sang
    const bankDoc = await db.collection('bloodBanks').doc(request.bloodBankId).get();

    if (!bankDoc.exists) {
      console.log('Banque de sang non trouvée');
      return null;
    }

    const bank = bankDoc.data();

    if (!bank.fcmToken) {
      console.log('La banque n\'a pas de token FCM');
      return null;
    }

    // Envoyer la notification
    const title = '🏥 Nouvelle demande de sang';
    const body = `Dr. ${request.doctorName} demande ${request.quantity} poche(s) de ${request.bloodGroup}${request.rhesus}`;

    const result = await sendPushNotification(bank.fcmToken, title, body, {
      type: 'blood_request',
      requestId,
      doctorId: request.doctorId || '',
      bloodGroup: request.bloodGroup || '',
      rhesus: request.rhesus || '',
    });

    console.log('Notification à la banque envoyée:', result);

    return result;
  } catch (error) {
    console.error('Erreur dans onBloodRequestCreated:', error);
    return null;
  }
});

/**
 * TRIGGER: Quand une demande de sang est mise à jour (approuvée/rejetée)
 * Notifie le médecin
 */
exports.onBloodRequestUpdated = onDocumentUpdated('bloodRequests/{requestId}', async (event) => {
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();
  const requestId = event.params.requestId;

  // Vérifier si le statut a changé
  if (beforeData.status === afterData.status) {
    return null;
  }

  console.log(`Demande mise à jour: ${requestId}, nouveau statut: ${afterData.status}`);

  try {
    // Récupérer le médecin
    const doctorDoc = await db.collection('doctors').doc(afterData.doctorId).get();

    if (!doctorDoc.exists) {
      console.log('Médecin non trouvé');
      return null;
    }

    const doctor = doctorDoc.data();

    if (!doctor.fcmToken) {
      console.log('Le médecin n\'a pas de token FCM');
      return null;
    }

    // Préparer le message selon le statut
    let title, body;

    if (afterData.status === 'approved') {
      title = '✅ Demande approuvée';
      body = `Votre demande de sang ${afterData.bloodGroup}${afterData.rhesus} a été approuvée par ${afterData.bankName}`;
    } else if (afterData.status === 'rejected') {
      title = '❌ Demande rejetée';
      body = `Votre demande de sang ${afterData.bloodGroup}${afterData.rhesus} a été rejetée par ${afterData.bankName}`;
    } else {
      return null;
    }

    const result = await sendPushNotification(doctor.fcmToken, title, body, {
      type: 'request_status_update',
      requestId,
      status: afterData.status,
    });

    console.log('Notification au médecin envoyée:', result);

    return result;
  } catch (error) {
    console.error('Erreur dans onBloodRequestUpdated:', error);
    return null;
  }
});

/**
 * Fonction HTTP pour tester les notifications (à utiliser pendant le développement)
 */
exports.testNotification = onRequest(async (req, res) => {
  // Vérifier la méthode
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    res.status(400).json({ error: 'Missing required fields: token, title, body' });
    return;
  }

  try {
    const result = await sendPushNotification(token, title, body, { type: 'test' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Fonction programmée: Nettoyer les alertes expirées (plus de 7 jours)
 * S'exécute tous les jours à minuit
 */
exports.cleanupExpiredAlerts = onSchedule('0 0 * * *', async (event) => {
  console.log('Nettoyage des alertes expirées...');

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  try {
    // Récupérer les alertes actives de plus de 7 jours
    const alertsSnapshot = await db
      .collection('alerts')
      .where('status', '==', 'active')
      .where('alertDate', '<', Timestamp.fromDate(sevenDaysAgo))
      .get();

    if (alertsSnapshot.empty) {
      console.log('Aucune alerte expirée à nettoyer');
      return null;
    }

    // Mettre à jour les alertes comme expirées
    const batch = db.batch();
    alertsSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        status: 'cancelled',
        updatedAt: FieldValue.serverTimestamp(),
        cancelReason: 'expired',
      });
    });

    await batch.commit();
    console.log(`${alertsSnapshot.size} alertes expirées nettoyées`);

    return null;
  } catch (error) {
    console.error('Erreur lors du nettoyage:', error);
    return null;
  }
});
