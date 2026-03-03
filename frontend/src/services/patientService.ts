import api from './api';
import type {
  Patient,
  PatientCreate,
  PatientUpdate,
  PaginatedPatientsResponse,
  EmergencyContact,
  EmergencyContactCreate,
  EmergencyContactUpdate,
  Insurance,
  InsuranceCreate,
  InsuranceUpdate,
  Document,
  DocumentCreate,
  StatusHistory,
  StatusHistoryCreate,
} from '../types/patient';

export const getPatientsPaginated = async (
  page: number = 1,
  pageSize: number = 10,
  sortColumn?: string | null,
  sortDirection?: 'asc' | 'desc' | null,
  search?: string
): Promise<PaginatedPatientsResponse> => {
  const params: Record<string, string> = {
    page: page.toString(),
    page_size: pageSize.toString(),
  };

  if (search) {
    params.search = search;
  }

  if (sortColumn && sortDirection) {
    params.sort_column = sortColumn;
    params.sort_direction = sortDirection;
  }

  const response = await api.get<PaginatedPatientsResponse>('/patient/', { params });
  return response.data;
};

export const getPatientById = async (patientId: string): Promise<Patient> => {
  const response = await api.get<Patient>(`/patient/${patientId}`);
  return response.data;
};

export const createPatient = async (patientData: PatientCreate): Promise<Patient> => {
  const response = await api.post<Patient>('/patient/', patientData);
  return response.data;
};

export const updatePatient = async (patientId: string, patientData: PatientUpdate): Promise<Patient> => {
  const response = await api.put<Patient>(`/patient/${patientId}`, patientData);
  return response.data;
};

export const deletePatient = async (patientId: string): Promise<void> => {
  await api.delete(`/patient/${patientId}`);
};

// Emergency Contact Operations
export const addEmergencyContact = async (
  patientId: string,
  contactData: EmergencyContactCreate
): Promise<EmergencyContact> => {
  const response = await api.post<EmergencyContact>(
    `/patient/${patientId}/emergency-contacts`,
    contactData
  );
  return response.data;
};

export const updateEmergencyContact = async (
  contactId: string,
  contactData: EmergencyContactUpdate
): Promise<EmergencyContact> => {
  const response = await api.put<EmergencyContact>(
    `/patient/emergency-contacts/${contactId}`,
    contactData
  );
  return response.data;
};

export const deleteEmergencyContact = async (contactId: string): Promise<void> => {
  await api.delete(`/patient/emergency-contacts/${contactId}`);
};

// Insurance Operations
export const addInsurance = async (
  patientId: string,
  insuranceData: InsuranceCreate
): Promise<Insurance> => {
  const response = await api.post<Insurance>(
    `/patient/${patientId}/insurances`,
    insuranceData
  );
  return response.data;
};

export const updateInsurance = async (
  insuranceId: string,
  insuranceData: InsuranceUpdate
): Promise<Insurance> => {
  const response = await api.put<Insurance>(
    `/patient/insurances/${insuranceId}`,
    insuranceData
  );
  return response.data;
};

export const deleteInsurance = async (insuranceId: string): Promise<void> => {
  await api.delete(`/patient/insurances/${insuranceId}`);
};

// Document Operations
export const addDocument = async (
  patientId: string,
  documentData: DocumentCreate
): Promise<Document> => {
  const response = await api.post<Document>(
    `/patient/${patientId}/documents`,
    documentData
  );
  return response.data;
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  await api.delete(`/patient/documents/${documentId}`);
};

// Status History Operations
export const updatePatientStatus = async (
  patientId: string,
  statusData: StatusHistoryCreate
): Promise<StatusHistory> => {
  const response = await api.post<StatusHistory>(
    `/patient/${patientId}/status`,
    statusData
  );
  return response.data;
};
