# Configuration des Cloud Functions BloodLink

Ce document explique comment configurer et déployer les Cloud Functions Firebase pour l'application BloodLink.

## Prérequis

1. **Node.js** version 18 ou supérieure
2. **Firebase CLI** installé globalement
3. Un projet Firebase avec Firestore et Cloud Messaging activés

## Installation de Firebase CLI

Si vous n'avez pas encore Firebase CLI, installez-le :

```bash
npm install -g firebase-tools
```

## Configuration du projet

### 1. Se connecter à Firebase

```bash
firebase login
```

### 2. Initialiser Firebase dans le projet (si pas déjà fait)

Depuis la racine du projet Blood-Link :

```bash
firebase init
```

Sélectionnez :
- **Functions** : Configurer Cloud Functions
- **Firestore** : Configurer les règles Firestore (optionnel)

Choisissez votre projet Firebase existant (`ilios-2f459`).

### 3. Installer les dépendances des fonctions

```bash
cd firebase/functions
npm install
```

## Déploiement des Cloud Functions

### Déployer toutes les fonctions

```bash
cd firebase/functions
npm run deploy
```

Ou depuis la racine du projet :

```bash
firebase deploy --only functions
```

### Déployer une fonction spécifique

```bash
firebase deploy --only functions:onAlertCreated
```

## Fonctions disponibles

### Triggers Firestore

| Fonction | Déclencheur | Description |
|----------|-------------|-------------|
| `onAlertCreated` | Création d'une alerte | Envoie des notifications push à tous les providers disponibles |
| `onAlertResponseCreated` | Réponse à une alerte | Notifie la banque de sang qu'un donneur a répondu |
| `onAlertResponseUpdated` | Mise à jour de réponse | Notifie le provider quand sa réponse est acceptée |
| `onBloodRequestCreated` | Demande de sang | Notifie la banque de sang d'une nouvelle demande d'un médecin |
| `onBloodRequestUpdated` | Mise à jour demande | Notifie le médecin du statut de sa demande |

### Fonction programmée

| Fonction | Planification | Description |
|----------|---------------|-------------|
| `cleanupExpiredAlerts` | Tous les jours à minuit | Annule automatiquement les alertes de plus de 7 jours |

### Fonction HTTP (test)

| Fonction | URL | Description |
|----------|-----|-------------|
| `testNotification` | POST | Teste l'envoi de notification (développement uniquement) |

## Tester localement

### Démarrer l'émulateur Firebase

```bash
cd firebase/functions
npm run serve
```

Cela démarre l'émulateur Functions à l'adresse `http://localhost:5001`.

### Voir les logs

```bash
npm run logs
```

Ou dans la console Firebase.

## Structure des notifications

### Alerte créée (vers providers)

```json
{
  "title": "🩸 Alerte Urgent - Sang O+",
  "body": "Hôpital Central recherche un donneur...",
  "data": {
    "type": "blood_alert",
    "alertId": "xxx",
    "bloodGroup": "O",
    "rhesus": "+",
    "urgencyLevel": "high"
  }
}
```

### Réponse reçue (vers banque)

```json
{
  "title": "👤 Nouveau donneur disponible!",
  "body": "Jean Dupont a répondu à votre alerte...",
  "data": {
    "type": "alert_response",
    "alertId": "xxx",
    "responseId": "yyy",
    "providerId": "zzz"
  }
}
```

## Configuration Android

Assurez-vous que votre fichier `android/app/src/main/AndroidManifest.xml` contient :

```xml
<meta-data
    android:name="com.google.firebase.messaging.default_notification_channel_id"
    android:value="blood_alerts" />
```

Et créez le canal de notification dans votre code React Native ou natif.

## Dépannage

### Les notifications ne sont pas reçues

1. Vérifiez que les tokens FCM sont bien enregistrés dans Firestore
2. Vérifiez les logs des Cloud Functions dans la console Firebase
3. Assurez-vous que l'app a les permissions de notification

### Erreur de déploiement

1. Vérifiez que vous êtes connecté à Firebase (`firebase login`)
2. Vérifiez la version de Node.js (doit être 18+)
3. Supprimez `node_modules` et `package-lock.json` puis réinstallez

### Les fonctions ne se déclenchent pas

1. Vérifiez que les documents sont bien créés dans les bonnes collections
2. Vérifiez les règles de sécurité Firestore
3. Consultez les logs dans la console Firebase

## Coûts

Les Cloud Functions sont facturées selon l'utilisation :
- **Invocations** : Les 2 premiers millions par mois sont gratuits
- **Temps de calcul** : 400 000 Go-secondes gratuites par mois
- **Réseau** : 5 Go sortants gratuits par mois

Pour une app de taille moyenne, vous devriez rester dans le tier gratuit.

## Support

En cas de problème, consultez :
- [Documentation Firebase Functions](https://firebase.google.com/docs/functions)
- [Documentation FCM](https://firebase.google.com/docs/cloud-messaging)
