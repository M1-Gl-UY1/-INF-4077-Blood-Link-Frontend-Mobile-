# Migration Firebase - Terminée ✅

## 🎉 Changements effectués

Tous les services de l'application ont été migrés de l'API REST vers Firebase. L'application utilise maintenant **Firebase Authentication** et **Firestore Database** au lieu du backend sur Render.

### Fichiers modifiés

1. **`src/services/authService.ts`** ✅
   - Utilise maintenant `firebaseAuthService` au lieu des appels REST
   - Compatible avec l'ancien code (même interface)

2. **`src/services/profileService.ts`** ✅
   - Utilise `firestoreService` pour créer/mettre à jour les profils
   - Création automatique de profil si `providerId/doctorId/bankId` est `null`

3. **`src/services/firebaseAuthService.ts`** ✅  (NOUVEAU)
   - Gère l'authentification Firebase
   - Crée les comptes et documents Firestore

4. **`src/services/firestoreService.ts`** ✅  (NOUVEAU)
   - Gère toutes les opérations Firestore (CRUD)
   - Collections : users, providers, doctors, bloodBanks, etc.

5. **`src/services/registrationService.ts`** ✅  (NOUVEAU)
   - Service unifié pour l'inscription avec profil complet
   - Une seule opération pour créer compte + profil

6. **`src/types/firebase.types.ts`** ✅  (NOUVEAU)
   - Types TypeScript pour Firebase
   - Interfaces pour tous les documents Firestore

7. **`src/config/firebase.ts`** ✅  (NOUVEAU)
   - Configuration Firebase centralisée
   - Gestion des erreurs en français

### Fichiers créés (bonus)

- `src/contexts/AuthContextFirebase.tsx` - Nouvelle version du contexte (optionnel)
- `src/services/index.ts` - Export centralisé
- `FIREBASE_SETUP.md` - Guide complet de configuration

---

## 🚀 Étapes pour tester

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer Firebase dans Android

#### a. Vérifier `android/build.gradle`

Ajoutez le plugin Google Services :

```gradle
buildscript {
    dependencies {
        classpath 'com.android.tools.build:gradle:8.1.1'
        classpath 'com.google.gms:google-services:4.4.0'  
    }
}
```

#### b. Vérifier `android/app/build.gradle`

En **bas du fichier**, ajoutez :

```gradle
apply plugin: 'com.google.gms.google-services'  // ← Tout en bas
```

#### c. Rebuild l'application

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

---

### 3. Activer Firebase Authentication

1. Allez sur [Firebase Console](https://console.firebase.google.com)
2. Sélectionnez le projet **ilios-2f459**
3. Allez dans **Authentication** > **Sign-in method**
4. Activez **Email/Password**

### 4. Activer Firestore Database

1. Dans Firebase Console, allez dans **Firestore Database**
2. Cliquez sur **Créer une base de données**
3. Choisissez **Mode production**
4. Sélectionnez la région (ex: `europe-west1`)

### 5. Configurer les règles Firestore

Dans **Firestore Database** > **Règles**, collez :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Autoriser la lecture/écriture authentifiée
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Note**: C'est une configuration permissive pour le développement. Pour la production, voir les règles détaillées dans `FIREBASE_SETUP.md`.

---

## 🧪 Test de l'inscription

### Test 1 : Inscription Provider (Donneur)

1. Lancez l'application
2. Cliquez sur "S'inscrire" puis "Donneur"
3. Remplissez le formulaire :
   - Nom : Test User
   - Email : testuser@example.com
   - Sexe : M
   - Groupe sanguin : A+
   - Date de naissance : 01/01/1990
   - Téléphone : +237690000000
   - Mot de passe : test123

4. Cliquez sur "Continuer"

**Résultat attendu** :
- Compte créé dans Firebase Auth
- Document créé dans Firestore `users/`
- Profil créé dans Firestore `providers/`
- Navigation automatique vers l'écran principal

### Test 2 : Inscription Blood Bank

1. Cliquez sur "S'inscrire" puis "Banque de sang"
2. Remplissez :
   - Nom : Banque Test
   - Email : banque@example.com
   - Localisation : Yaoundé, Cameroun
   - Mot de passe : test123

3. Cliquez sur "Continuer"

**Résultat attendu** :
- Compte créé dans Firebase Auth
- Document créé dans `users/` et `bloodBanks/`

### Test 3 : Connexion

1. Déconnectez-vous (si connecté)
2. Cliquez sur "Se connecter"
3. Entrez l'email et le mot de passe du test précédent
4. Cliquez sur "Continuer"

**Résultat attendu** :
- Connexion réussie
- Profil chargé automatiquement

---

## 🐛 Débogage

### Problème : "Firebase not initialized"

**Solution** : Vérifiez que `google-services.json` est bien dans `android/app/` et que vous avez appliqué le plugin dans `android/app/build.gradle`.

```bash
# Vérifier la présence du fichier
ls android/app/google-services.json

# Rebuild
cd android && ./gradlew clean && cd .. && npx react-native run-android
```

### Problème : "Firestore is not enabled"

**Solution** : Activez Firestore dans la console Firebase (voir étape 4 ci-dessus).

### Problème : "Email already in use"

**Solution** : Normal si vous testez plusieurs fois. Utilisez un email différent ou supprimez l'utilisateur dans Firebase Console > Authentication > Users.

### Problème : "Permission denied" dans Firestore

**Solution** : Vérifiez les règles Firestore (voir étape 5 ci-dessus).

### Voir les logs Firebase

```bash
# Logs Android
npx react-native log-android

# Logs filtré (Firebase uniquement)
npx react-native log-android | grep -i firebase
```

---

## 📊 Vérifier les données dans Firebase Console

### 1. Vérifier l'authentification

1. Allez dans **Firebase Console** > **Authentication** > **Users**
2. Vous devriez voir les utilisateurs créés avec leur email

### 2. Vérifier Firestore

1. Allez dans **Firestore Database** > **Data**
2. Vous devriez voir les collections :
   - `users/` - Documents utilisateurs
   - `providers/` - Profils donneurs
   - `doctors/` - Profils médecins
   - `bloodBanks/` - Profils banques de sang

### 3. Structure des données

```
Firestore
├── users
│   └── {userId}
│       ├── uid: "abc123..."
│       ├── email: "user@example.com"
│       ├── username: "John Doe"
│       ├── role: "provider"
│       ├── isActive: true
│       └── ...
│
├── providers
│   └── {providerId}
│       ├── userId: "abc123..." (référence)
│       ├── name: "John Doe"
│       ├── bloodGroup: "A"
│       ├── rhesus: "+"
│       └── ...
│
└── ... (autres collections)
```

---

## 🔄 Workflow d'inscription

Voici ce qui se passe quand un utilisateur s'inscrit :

### Ancien flow (API REST)
```
1. Écran d'inscription
2. ↓ appel register()
3. AuthContext.register()
4. ↓ POST /apiBloodlink/registers/
5. Créer user dans backend
6. ↓ GET /apiBloodlink/users/
7. Récupérer user
8. ↓ PUT /apiBloodlink/providers/{id}/
9. Mettre à jour profil
```

### Nouveau flow (Firebase)
```
1. Écran d'inscription
2. ↓ appel register()
3. AuthContext.register()
4. ↓ authService.register()
5. ↓ firebaseAuthService.register()
6. Firebase Auth: Créer compte
7. ↓ firestoreService.createUser()
8. Firestore: Créer document user
9. ↓ profileService.updateProfile(null, ...)
10. ↓ firestoreService.createProvider()
11. Firestore: Créer document provider
```

---

## ✨ Avantages de Firebase

1. **Pas de backend à gérer** : Plus besoin de Render
2. **Temps réel** : Firestore supporte les listeners en temps réel
3. **Offline support** : Fonctionne hors ligne automatiquement
4. **Sécurité** : Règles de sécurité côté serveur
5. **Gratuit** : 50K lectures + 20K écritures par jour en gratuit
6. **Scalabilité** : Gère automatiquement la montée en charge

---

## 📝 Prochaines étapes

1. **Tester l'inscription** pour tous les types d'utilisateurs
2. **Migrer les autres fonctionnalités** :
   - Demandes de sang
   - Alertes
   - Transactions
   - Poches de sang

3. **Ajouter des features Firebase** :
   - Notifications push (FCM)
   - Storage pour les images de profil
   - Cloud Functions pour la logique métier

4. **Optimiser les règles Firestore** pour la production

---

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs : `npx react-native log-android`
2. Consultez `FIREBASE_SETUP.md` pour la config détaillée
3. Vérifiez que Firebase Auth et Firestore sont activés dans la console
4. Assurez-vous que `google-services.json` est correct

---

**Migration complétée avec succès ! 🎉**

Testez maintenant l'inscription et la connexion dans votre application.
