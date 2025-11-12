/**
 * Constantes pour les énumérations de l'application
 * Basées sur la documentation backend
 */

// Grades des docteurs
export const DOCTOR_GRADES = [
  { value: 'INT', label: 'Interne' },
  { value: 'RES', label: 'Résident' },
  { value: 'ASS', label: 'Assistant médical' },
  { value: 'SPC', label: 'Spécialiste' },
  { value: 'CHS', label: 'Chef de service' },
  { value: 'PRF', label: 'Professeur' },
];

// Spécialités des docteurs
export const DOCTOR_SPECIALTIES = [
  { value: 'GP', label: 'Généraliste' },
  { value: 'CD', label: 'Cardiologue' },
  { value: 'NE', label: 'Neurologue' },
  { value: 'OR', label: 'Orthopédiste' },
  { value: 'PD', label: 'Pédiatre' },
];

// Groupes sanguins
export const BLOOD_GROUPS = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'AB', label: 'AB' },
  { value: 'O', label: 'O' },
];

// Rhésus
export const RHESUS_OPTIONS = [
  { value: '+', label: 'Positif (+)' },
  { value: '-', label: 'Négatif (-)' },
];

// Rhésus pour l'API (format différent)
export const RHESUS_API_MAP: { [key: string]: string } = {
  '+': 'POS',
  '-': 'NEG',
};

// Rhésus API vers UI
export const RHESUS_UI_MAP: { [key: string]: string } = {
  'POS': '+',
  'NEG': '-',
};

// Sexe
export const GENDER_OPTIONS = [
  { value: 'M', label: 'Masculin' },
  { value: 'F', label: 'Féminin' },
];

// Statuts des demandes de sang
export const BLOOD_REQUEST_STATUS = [
  { value: 'pending', label: 'En attente' },
  { value: 'approved', label: 'Approuvée' },
  { value: 'rejected', label: 'Rejetée' },
];

// Statuts des alertes
export const ALERT_STATUS = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'SENT', label: 'Envoyée' },
  { value: 'RECEIVED', label: 'Reçue' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'RESOLVED', label: 'Résolue' },
  { value: 'CANCELLED', label: 'Annulée' },
  { value: 'FAILED', label: 'Échouée' },
];
