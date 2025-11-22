/**
 * Types TypeScript pour Firebase
 * Adaptations des modèles existants pour Firebase
 */

import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { BloodGroup, Rhesus, Sexe, Role, Grade, Speciality, RequestStatus } from '../models';

// ============================================
// TYPES DE BASE FIREBASE
// ============================================

/**
 * Type de base pour les documents Firestore
 * Tous les documents ont un ID et des timestamps
 */
export interface FirebaseDocument {
  id: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}

/**
 * Données de compte partagées par tous les utilisateurs
 * Ces informations sont maintenant stockées dans chaque collection spécifique
 */
export interface FirebaseAccount {
  uid: string;
  username: string;
  email: string;
  role: Role;
  isActive: boolean;
  emailVerified: boolean;
  fcmToken: string | null;
}

// ============================================
// PROFILS UTILISATEURS FIREBASE
// ============================================

/**
 * Profil Provider (Donneur de sang) dans Firestore
 * Stocké dans la collection 'providers'
 */
export interface FirebaseProvider extends FirebaseDocument, FirebaseAccount {
  role: 'provider';
  name: string | null;
  sexe: Sexe | null;
  dateBirth: FirebaseFirestoreTypes.Timestamp | null;
  phoneNumber: string | null;
  bloodGroup: BloodGroup | null;
  rhesus: Rhesus | null;
  lastGive: FirebaseFirestoreTypes.Timestamp | null;
  historiqueMedical: string | null;
  isAvailable: boolean;
}

/**
 * Profil Doctor (Médecin) dans Firestore
 * Stocké dans la collection 'doctors'
 */
export interface FirebaseDoctor extends FirebaseDocument, FirebaseAccount {
  role: 'doctor';
  name: string | null;
  grade: Grade | null;
  speciality: Speciality | null;
  bloodBankId: string | null;
}

/**
 * Profil BloodBank (Banque de sang) dans Firestore
 * Stocké dans la collection 'bloodBanks'
 */
export interface FirebaseBloodBank extends FirebaseDocument, FirebaseAccount {
  role: 'bank';
  name: string | null;
  location: string | null;
  bloodBagCount: number;
}

export type FirebaseUserProfile = FirebaseProvider | FirebaseDoctor | FirebaseBloodBank;

// ============================================
// DONNÉES TRANSACTIONNELLES FIREBASE
// ============================================

/**
 * Poche de sang dans Firestore
 * Stocké dans la collection 'bloodBags'
 */
export interface FirebaseBloodBag extends FirebaseDocument {
  providerId: string; // Référence au provider
  providerName: string;
  bloodGroup: BloodGroup;
  rhesus: Rhesus;
  bloodBankId: string | null; // Référence à la banque qui possède la poche
  isAvailable: boolean;
  collectionDate: FirebaseFirestoreTypes.Timestamp;
  expirationDate: FirebaseFirestoreTypes.Timestamp;
}

/**
 * Demande de sang dans Firestore
 * Stocké dans la collection 'bloodRequests'
 */
export interface FirebaseBloodRequest extends FirebaseDocument {
  doctorId: string; // Référence au docteur
  doctorName: string;
  bloodBankId: string | null; // Référence à la banque
  bankName: string | null;
  bloodGroup: BloodGroup;
  rhesus: Rhesus;
  quantity: number;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
  patientInfo?: string | null;
  status: RequestStatus;
  requestDate: FirebaseFirestoreTypes.Timestamp;
  notes: string | null;
}

/**
 * Transaction de sang dans Firestore
 * Stocké dans la collection 'bloodTransactions'
 */
export interface FirebaseBloodTransaction extends FirebaseDocument {
  providerId: string; // Référence au provider
  providerName: string;
  bloodBankId: string; // Référence à la banque
  bankName: string;
  bloodBagId: string; // Référence à la poche de sang
  transactionDate: FirebaseFirestoreTypes.Timestamp;
  transactionType: 'donation' | 'distribution'; // Type de transaction
}

/**
 * Alerte dans Firestore
 * Stocké dans la collection 'alerts'
 */
export interface FirebaseAlert extends FirebaseDocument {
  bloodBankId: string; // Référence à la banque qui envoie l'alerte
  bankName: string;
  bankLocation?: string; // Localisation de la banque
  bloodGroup: BloodGroup;
  rhesus: Rhesus;
  message: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'cancelled';
  alertDate: FirebaseFirestoreTypes.Timestamp;
  responseCount: number; // Nombre de réponses reçues
  // Informations sur l'initiateur de l'alerte
  initiatedBy: 'bank' | 'doctor'; // Qui a initié l'alerte
  doctorId?: string; // Si initié par un médecin
  doctorName?: string; // Nom du médecin
  hospitalName?: string; // Nom de l'hôpital du médecin
  requestId?: string; // Référence à la demande de sang approuvée
}

/**
 * Réponse à une alerte dans Firestore
 * Stocké dans la collection 'alertResponses'
 */
export interface FirebaseAlertResponse extends FirebaseDocument {
  alertId: string; // Référence à l'alerte
  providerId: string; // Référence au provider qui répond
  providerName: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  responseDate: FirebaseFirestoreTypes.Timestamp;
  notes: string | null;
}

// ============================================
// DTOs POUR LES OPÉRATIONS FIREBASE
// ============================================

/**
 * DTO pour créer un nouvel utilisateur
 */
export interface CreateFirebaseUserDTO {
  email: string;
  password: string;
  username: string;
  role: Role;
}

interface BaseProfilePayload {
  uid: string;
  username: string;
  email: string;
  role: Role;
  fcmToken: string | null;
  emailVerified: boolean;
  isActive?: boolean;
}

/**
 * DTO pour créer un profil Provider
 */
export interface CreateFirebaseProviderDTO extends BaseProfilePayload {
  name?: string | null;
  sexe?: Sexe | null;
  dateBirth?: Date | null;
  phoneNumber?: string | null;
  bloodGroup?: BloodGroup | null;
  rhesus?: Rhesus | null;
  lastGive?: Date | null;
  historiqueMedical?: string | null;
  isAvailable?: boolean;
}

/**
 * DTO pour créer un profil Doctor
 */
export interface CreateFirebaseDoctorDTO extends BaseProfilePayload {
  name?: string | null;
  grade?: Grade | null;
  speciality?: Speciality | null;
  bloodBankId?: string | null;
}

/**
 * DTO pour créer un profil BloodBank
 */
export interface CreateFirebaseBloodBankDTO extends BaseProfilePayload {
  name?: string | null;
  location?: string | null;
  bloodBagCount?: number;
}

/**
 * DTO pour créer une poche de sang
 */
export interface CreateFirebaseBloodBagDTO {
  providerId: string;
  providerName: string;
  bloodGroup: BloodGroup;
  rhesus: Rhesus;
  bloodBankId: string | null;
  collectionDate: Date;
}

/**
 * DTO pour créer une demande de sang
 */
export interface CreateFirebaseBloodRequestDTO {
  doctorId: string;
  doctorName: string;
  bloodBankId: string | null;
  bankName: string | null;
  bloodGroup: BloodGroup;
  rhesus: Rhesus;
  quantity: number;
  notes: string | null;
}
