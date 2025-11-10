/**
 * Modèles de données pour l'application Blood-Link
 * Basé sur la documentation Swagger du backend
 * Backend URL: https://inf-4077-blood-link-backend.onrender.com
 */

// ============================================
// MODÈLE DE BASE - USER
// ============================================

/**
 * Interface User - Classe de base pour tous les acteurs
 */
export interface User {
  id?: string;
  username: string;
  email: string;
  password: string;
  role: string;
}

// ============================================
// MODÈLES DES ACTEURS
// ============================================

/**
 * Interface Provider (Donneur de sang)
 * Hérite de User
 */
export interface Provider {
  id?: string;
  user: User;
  name: string;
  sexe: string;
  date_birth: string | null;
  email: string;
  phone_number: string;
  blood_group: string;
  rhesus: string;
  last_give: string | null;
  historique_medical: string | null;
}

/**
 * Interface Doctor (Médecin)
 * Hérite de User
 */
export interface Doctor {
  id?: string;
  blood_requests?: BloodRequest[];
  bank_id: string;
  name: string;
  grade: string;
  speciality: string;
  user: string;
  blood_bank: string | null;
}

/**
 * Interface BloodBank (Banque de sang)
 * Hérite de User
 */
export interface BloodBank {
  id?: string;
  transactions?: BloodTransaction[];
  user: User;
  name: string;
  password: string;
  location: string;
  blood_bags: string[];
}

// ============================================
// MODÈLES TRANSACTIONNELS
// ============================================

/**
 * Interface BloodBag (Poche de sang)
 */
export interface BloodBag {
  id?: string;
  providerFor_name: string;
  blood_group: string;
  rhesus: string;
  provider: string;
}

/**
 * Interface BloodRequest (Demande de sang)
 */
export interface BloodRequest {
  id?: string;
  doctor_name: string;
  bank_name: string;
  user: User;
  date_request: string;
  blood_group: string;
  rhesus: string;
  quantity: number;
  status: string;
  docteur: string;
  bank: string | null;
}

/**
 * Interface BloodTransaction (Transaction de sang)
 */
export interface BloodTransaction {
  id?: string;
  provider_name: string;
  bank_name: string;
  date: string;
  provider: string;
  bank: string;
  blood_bag: string;
}

/**
 * Interface AlertReceiveSerializers (Alerte)
 */
export interface AlertReceiveSerializers {
  id?: string;
  provider_name: string | null;
  alert_status: string;
  date: string;
  status: string;
  provider: string | null;
  alert: string;
}

// ============================================
// TYPES POUR LES ENUMS
// ============================================

export type BloodGroup = 'A' | 'B' | 'AB' | 'O';
export type Rhesus = '+' | '-';
export type Sexe = 'M' | 'F';
export type Role = 'provider' | 'doctor' | 'blood_bank';
export type RequestStatus = 'pending' | 'approved' | 'rejected';
export type AlertStatus = 'sent' | 'received' | 'read' | 'responded';

// ============================================
// TYPES POUR LES REQUÊTES API (DTO)
// ============================================

/**
 * DTO pour la création d'un utilisateur Provider
 */
export interface CreateProviderDTO {
  username: string;
  email: string;
  password: string;
  name: string;
  sexe: Sexe;
  date_birth?: string;
  phone_number: string;
  blood_group: BloodGroup;
  rhesus: Rhesus;
  last_give?: string;
  historique_medical?: string;
}

/**
 * DTO pour la création d'un utilisateur Doctor
 */
export interface CreateDoctorDTO {
  username: string;
  email: string;
  password: string;
  name: string;
  grade: string;
  speciality: string;
  bank_id: string;
}

/**
 * DTO pour la création d'un utilisateur BloodBank
 */
export interface CreateBloodBankDTO {
  username: string;
  email: string;
  password: string;
  name: string;
  location: string;
}

/**
 * DTO pour la création d'une demande de sang
 */
export interface CreateBloodRequestDTO {
  blood_group: BloodGroup;
  rhesus: Rhesus;
  quantity: number;
  bank?: string;
}

/**
 * DTO pour la création d'une poche de sang
 */
export interface CreateBloodBagDTO {
  providerFor_name: string;
  blood_group: BloodGroup;
  rhesus: Rhesus;
  provider: string;
}

/**
 * DTO pour la connexion
 */
export interface LoginDTO {
  username: string;
  password: string;
}

/**
 * Réponse de connexion
 */
export interface LoginResponse {
  token: string;
  user: User;
  role: Role;
}
