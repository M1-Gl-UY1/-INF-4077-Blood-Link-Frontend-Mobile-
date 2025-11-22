# Guide d'installation et d'utilisation de Firebase pour Blood-Link

Ce guide vous explique comment finaliser la configuration Firebase et utiliser le nouveau système d'authentification.

## 📋 Table des matières

1. [Installation des dépendances](#installation-des-dépendances)
2. [Configuration Android](#configuration-android)
3. [Configuration iOS (optionnel)](#configuration-ios)
4. [Configuration Firestore](#configuration-firestore)
5. [Utilisation dans l'application](#utilisation-dans-lapplication)
6. [Structure de la base de données](#structure-de-la-base-de-données)
7. [Migration depuis l'ancien backend](#migration-depuis-lancien-backend)

---

## 🚀 Installation des dépendances

Les dépendances Firebase ont déjà été ajoutées au `package.json`. Installez-les avec :

```bash
npm install
```

Packages installés :
- `@react-native-firebase/app` - Core Firebase
- `@react-native-firebase/auth` - Authentification
- `@react-native-firebase/firestore` - Base de données
- `@react-native-firebase/storage` - Stockage de fichiers (bonus)
- `@react-native-firebase/messaging` - Notifications push (bonus)
- `@react-native-firebase/functions` - Cloud Functions (bonus)

---

## 📱 Configuration Android

Le fichier `google-services.json` est déjà présent dans `android/`. Vérifiez qu'il est bien configuré :

### 1. Vérifier android/build.gradle

Ajoutez le plugin Google Services :

```gradle
buildscript {
    dependencies {
        // ... autres dépendances
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

### 2. Vérifier android/app/build.gradle

En bas du fichier, ajoutez :

```gradle
apply plugin: 'com.google.gms.google-services'
```

### 3. Activer Multidex (si nécessaire)

Dans `android/app/build.gradle` :

```gradle
android {
    defaultConfig {
        multiDexEnabled true
    }
}

dependencies {
    implementation 'androidx.multidex:multidex:2.0.1'
}
```

### 4. Rebuild le projet

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

---

## 🍎 Configuration iOS (optionnel)

Si vous développez pour iOS :

1. Téléchargez `GoogleService-Info.plist` depuis la console Firebase
2. Placez-le dans `ios/BloodLink/`
3. Ouvrez `ios/BloodLink.xcworkspace` dans Xcode
4. Ajoutez le fichier au projet (clic droit > Add Files)
5. Installez les pods :

```bash
cd ios
pod install
cd ..
```

---

## 🗄️ Configuration Firestore

### 1. Activer Firestore dans la console Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com)
2. Sélectionnez votre projet `ilios-2f459`
3. Dans le menu, cliquez sur **Firestore Database**
4. Cliquez sur **Créer une base de données**
5. Choisissez **Mode production** (nous configurerons les règles après)
6. Sélectionnez l'emplacement (ex: `europe-west1` pour l'Europe)

### 2. Configuration des règles de sécurité

Dans **Firestore Database > Règles**, remplacez par :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Fonction pour vérifier si l'utilisateur est authentifié
    function isSignedIn() {
      return request.auth != null;
    }

    // Fonction pour vérifier si l'utilisateur accède à ses propres données
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Collection users
    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if isOwner(userId);
    }

    // Collection providers
    match /providers/{providerId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() &&
        resource.data.userId == request.auth.uid;
    }

    // Collection doctors
    match /doctors/{doctorId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() &&
        resource.data.userId == request.auth.uid;
    }

    // Collection bloodBanks
    match /bloodBanks/{bankId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() &&
        resource.data.userId == request.auth.uid;
    }

    // Collection bloodRequests
    match /bloodRequests/{requestId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isSignedIn();
      allow delete: if isSignedIn() &&
        resource.data.doctorId == request.auth.uid;
    }

    // Collection bloodBags
    match /bloodBags/{bagId} {
      allow read: if isSignedIn();
      allow create, update: if isSignedIn();
      allow delete: if false; // Ne jamais supprimer les poches (traçabilité)
    }

    // Collection bloodTransactions
    match /bloodTransactions/{transactionId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if false; // Transactions immuables
    }

    // Collection alerts
    match /alerts/{alertId} {
      allow read: if isSignedIn();
      allow create, update: if isSignedIn();
      allow delete: if isSignedIn() &&
        resource.data.bloodBankId == request.auth.uid;
    }

    // Collection alertResponses
    match /alertResponses/{responseId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isSignedIn() &&
        resource.data.providerId == request.auth.uid;
      allow delete: if false;
    }
  }
}
```

### 3. Activer Firebase Authentication

1. Dans Firebase Console > **Authentication**
2. Cliquez sur **Commencer**
3. Activez **Email/Password** comme méthode de connexion

---

## 💻 Utilisation dans l'application

### 1. Remplacer l'ancien AuthContext

Dans `App.tsx` (ou votre fichier principal), remplacez :

```typescript
// ANCIEN
import { AuthProvider } from './src/contexts/AuthContext';

// NOUVEAU
import { AuthProvider } from './src/contexts/AuthContextFirebase';
```

### 2. Exemple d'inscription d'un Provider (Donneur)

```typescript
import { registrationService } from './src/services';

const handleRegisterProvider = async () => {
  try {
    const result = await registrationService.registerProvider({
      // Données de base
      email: 'donneur@example.com',
      password: 'motdepasse123',
      username: 'jeandupon',
      role: 'provider',

      // Données spécifiques au provider
      name: 'Jean Dupont',
      sexe: 'M',
      dateBirth: new Date('1990-01-15'),
      phoneNumber: '+237690000000',
      bloodGroup: 'A',
      rhesus: '+',
      lastGive: null,
      historiqueMedical: 'Aucun antécédent',
    });

    console.log('Inscription réussie:', result);
  } catch (error) {
    console.error('Erreur:', error.message);
  }
};
```

### 3. Exemple d'inscription d'un Doctor (Médecin)

```typescript
import { registrationService } from './src/services';

const handleRegisterDoctor = async () => {
  try {
    const result = await registrationService.registerDoctor({
      // Données de base
      email: 'docteur@example.com',
      password: 'motdepasse123',
      username: 'drmarie',
      role: 'doctor',

      // Données spécifiques au docteur
      name: 'Dr. Marie Nguema',
      grade: 'SPC', // Spécialiste
      speciality: 'CD', // Cardiologie
      bloodBankId: null, // À associer plus tard
    });

    console.log('Inscription réussie:', result);
  } catch (error) {
    console.error('Erreur:', error.message);
  }
};
```

### 4. Exemple d'inscription d'une BloodBank (Banque)

```typescript
import { registrationService } from './src/services';

const handleRegisterBloodBank = async () => {
  try {
    const result = await registrationService.registerBloodBank({
      // Données de base
      email: 'banque@example.com',
      password: 'motdepasse123',
      username: 'banquecentrale',
      role: 'bank',

      // Données spécifiques à la banque
      name: 'Banque Centrale de Sang',
      location: 'Yaoundé, Cameroun',
    });

    console.log('Inscription réussie:', result);
  } catch (error) {
    console.error('Erreur:', error.message);
  }
};
```

### 5. Utiliser le hook useAuth

```typescript
import { useAuth } from './src/contexts/AuthContextFirebase';

function MyComponent() {
  const { user, profile, isAuthenticated, login, logout } = useAuth();

  const handleLogin = async () => {
    try {
      await login({
        email: 'user@example.com',
        password: 'password123',
      });
    } catch (error) {
      console.error('Erreur de connexion:', error.message);
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <View>
      <Text>Bienvenue {user?.username}</Text>
      <Text>Rôle: {user?.role}</Text>
      {profile && (
        <Text>Profil: {profile.name}</Text>
      )}
      <Button title="Déconnexion" onPress={logout} />
    </View>
  );
}
```

---

## 📊 Structure de la base de données

### Collections Firestore

```
bloodlinkdb (database)
├── users/
│   └── {userId}
│       ├── uid: string
│       ├── username: string
│       ├── email: string
│       ├── role: 'provider' | 'doctor' | 'bank'
│       ├── isActive: boolean
│       ├── emailVerified: boolean
│       ├── createdAt: Timestamp
│       └── updatedAt: Timestamp
│
├── providers/
│   └── {providerId}
│       ├── userId: string (ref)
│       ├── name: string
│       ├── sexe: 'M' | 'F'
│       ├── dateBirth: Timestamp
│       ├── email: string
│       ├── phoneNumber: string
│       ├── bloodGroup: 'A' | 'B' | 'AB' | 'O'
│       ├── rhesus: '+' | '-'
│       ├── lastGive: Timestamp
│       ├── historiqueMedical: string
│       ├── isAvailable: boolean
│       ├── createdAt: Timestamp
│       └── updatedAt: Timestamp
│
├── doctors/
│   └── {doctorId}
│       ├── userId: string (ref)
│       ├── name: string
│       ├── grade: Grade
│       ├── speciality: Speciality
│       ├── bloodBankId: string (ref)
│       ├── isActive: boolean
│       ├── createdAt: Timestamp
│       └── updatedAt: Timestamp
│
├── bloodBanks/
│   └── {bankId}
│       ├── userId: string (ref)
│       ├── name: string
│       ├── location: string
│       ├── isActive: boolean
│       ├── bloodBagCount: number
│       ├── createdAt: Timestamp
│       └── updatedAt: Timestamp
│
├── bloodBags/
├── bloodRequests/
├── bloodTransactions/
├── alerts/
└── alertResponses/
```

---

## 🔄 Migration depuis l'ancien backend

### Étapes de migration

1. **Conserver l'ancien code temporairement** : Les anciens fichiers `AuthContext.tsx`, `authService.ts`, `api.ts` sont conservés pour référence

2. **Mettre à jour progressivement** :
   - Commencez par les écrans d'authentification
   - Puis migrez les écrans de profil
   - Enfin, migrez les fonctionnalités métier (demandes, alertes, etc.)

3. **Tester en parallèle** : Vous pouvez tester Firebase sans supprimer l'ancien système

4. **Supprimer l'ancien code** : Une fois tout migré et testé, supprimez les anciens fichiers

### Différences principales

| Ancien système (REST API) | Nouveau système (Firebase) |
|---------------------------|----------------------------|
| JWT tokens | Firebase ID tokens |
| API REST endpoints | Firestore queries |
| Stockage AsyncStorage | Firestore + AsyncStorage |
| Backend custom sur Render | Firebase (géré par Google) |
| Authentification manuelle | Firebase Authentication |

---

## 🔒 Bonnes pratiques de sécurité

1. **Ne jamais exposer les clés API** : Le fichier `google-services.json` contient des clés. Ne le partagez pas publiquement.

2. **Utiliser les règles Firestore** : Configurez toujours les règles de sécurité Firestore.

3. **Valider côté client ET serveur** : Firebase valide côté serveur avec les règles.

4. **Gérer les erreurs** : Utilisez les messages d'erreur fournis par `getFirebaseErrorMessage()`.

5. **Rate limiting** : Activez la protection contre les abus dans Firebase Console > Authentication > Settings.

---

## 📝 Notes importantes

- **Database par défaut** : Firestore utilise la database `(default)`. Le nom "bloodlinkdb" mentionné sera utilisé comme préfixe logique dans le code, mais Firestore ne supporte qu'une seule database par projet en mode gratuit.

- **Indexes Firestore** : Si vous voyez des erreurs de "missing index", Firestore vous donnera un lien pour créer l'index automatiquement.

- **Offline support** : Firestore supporte le mode hors ligne par défaut !

- **Cost optimization** : En mode gratuit, vous avez :
  - 50K lectures/jour
  - 20K écritures/jour
  - 1 GB stockage

---

## 🆘 Dépannage

### Erreur "google-services.json not found"

Vérifiez que le fichier est bien dans `android/app/google-services.json`.

### Erreur "Firestore is not enabled"

Activez Firestore dans la console Firebase (voir section Configuration Firestore).

### Erreur "Firebase App not initialized"

Vérifiez que vous avez bien appliqué le plugin dans `android/app/build.gradle` :
```gradle
apply plugin: 'com.google.gms.google-services'
```

### L'authentification ne fonctionne pas

1. Vérifiez que Email/Password est activé dans Firebase Console > Authentication
2. Vérifiez les règles Firestore
3. Vérifiez les logs avec `npx react-native log-android`

---

## 📚 Ressources

- [Documentation React Native Firebase](https://rnfirebase.io/)
- [Documentation Firestore](https://firebase.google.com/docs/firestore)
- [Documentation Firebase Auth](https://firebase.google.com/docs/auth)
- [Console Firebase](https://console.firebase.google.com)

---

**Bon développement ! 🚀**
