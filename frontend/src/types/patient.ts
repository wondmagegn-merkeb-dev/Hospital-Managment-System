export interface Patient {
  id: string; // UUID
  patient_code: string;
  user_id: string | null;
  
  // Personal Information
  first_name: string;
  last_name: string;
  middle_name: string | null;
  gender: 'Male' | 'Female' | 'Other' | null;
  date_of_birth: string; // ISO date string
  blood_group: string | null;
  marital_status: string | null;
  nationality: string | null;
  
  // Identification
  national_id: string | null;
  passport_number: string | null;
  
  // Contact Information
  email: string | null;
  phone: string | null;
  
  // Address
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  
  // Status
  is_active: boolean;
  registered_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
  
  // Related Data
  emergency_contacts?: EmergencyContact[];
  insurances?: Insurance[];
  documents?: Document[];
  status_history?: StatusHistory[];
}

export interface EmergencyContact {
  id: string; // UUID
  patient_id: string; // UUID
  contact_name: string;
  contact_relationship: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  created_at: string; // ISO datetime string
}

export interface Insurance {
  id: string; // UUID
  patient_id: string; // UUID
  provider_name: string;
  policy_number: string;
  coverage_percentage: number | null;
  coverage_limit: number | null;
  valid_from: string | null; // ISO date string
  valid_to: string | null; // ISO date string
  is_primary: boolean;
  created_at: string; // ISO datetime string
}

export interface Document {
  id: string; // UUID
  patient_id: string; // UUID
  document_type: string | null;
  file_url: string;
  uploaded_by: string | null; // UUID
  uploaded_at: string; // ISO datetime string
}

export interface StatusHistory {
  id: string; // UUID
  patient_id: string; // UUID
  status: string;
  changed_by: string | null; // UUID
  changed_at: string; // ISO datetime string
}

export interface PatientCreate {
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  gender?: 'Male' | 'Female' | 'Other' | null;
  date_of_birth: string; // ISO date string
  blood_group?: string | null;
  marital_status?: string | null;
  nationality?: string | null;
  national_id?: string | null;
  passport_number?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  user_id?: string | null;
  emergency_contacts?: EmergencyContactCreate[];
  insurances?: InsuranceCreate[];
}

export interface PatientUpdate {
  first_name?: string;
  last_name?: string;
  middle_name?: string | null;
  gender?: 'Male' | 'Female' | 'Other' | null;
  date_of_birth?: string; // ISO date string
  blood_group?: string | null;
  marital_status?: string | null;
  nationality?: string | null;
  national_id?: string | null;
  passport_number?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  is_active?: boolean;
  user_id?: string | null;
}

export interface EmergencyContactCreate {
  contact_name: string;
  contact_relationship?: string | null;
  phone: string;
  email?: string | null;
  address?: string | null;
}

export interface EmergencyContactUpdate {
  contact_name?: string;
  contact_relationship?: string | null;
  phone?: string;
  email?: string | null;
  address?: string | null;
}

export interface InsuranceCreate {
  provider_name: string;
  policy_number: string;
  coverage_percentage?: number | null;
  coverage_limit?: number | null;
  valid_from?: string | null; // ISO date string
  valid_to?: string | null; // ISO date string
  is_primary?: boolean;
}

export interface InsuranceUpdate {
  provider_name?: string;
  policy_number?: string;
  coverage_percentage?: number | null;
  coverage_limit?: number | null;
  valid_from?: string | null; // ISO date string
  valid_to?: string | null; // ISO date string
  is_primary?: boolean;
}

export interface DocumentCreate {
  document_type?: string | null;
  file_url: string;
}

export interface StatusHistoryCreate {
  status: string;
}

export interface PaginatedPatientsResponse {
  data: Patient[];
  total: number;
}
