import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createPatient,
  updatePatient,
  deletePatient,
  getPatientsPaginated,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  addInsurance,
  updateInsurance,
  deleteInsurance,
  addDocument,
  deleteDocument,
  updatePatientStatus,
} from '../services/patientService';
import type {
  PatientCreate,
  PatientUpdate,
  EmergencyContactCreate,
  EmergencyContactUpdate,
  InsuranceCreate,
  InsuranceUpdate,
  DocumentCreate,
  StatusHistoryCreate,
} from '../types/patient';
import type { SortDirection } from '../components/Table';

// Hook for creating a patient
export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PatientCreate) => createPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

// Hook for updating a patient
export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatientUpdate }) => updatePatient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

// Hook for deleting a patient
export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

// Hook for fetching paginated patients - returns query function
export function usePatientsQuery(searchTerm?: string) {
  return (
    page: number,
    pageSize: number,
    sortColumn?: string | null,
    sortDirection?: SortDirection | null
  ) => {
    return getPatientsPaginated(page, pageSize, sortColumn, sortDirection, searchTerm);
  };
}

// Hook for adding emergency contact
export function useAddEmergencyContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: EmergencyContactCreate }) =>
      addEmergencyContact(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

// Hook for updating emergency contact
export function useUpdateEmergencyContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contactId, data }: { contactId: string; data: EmergencyContactUpdate }) =>
      updateEmergencyContact(contactId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

// Hook for deleting emergency contact
export function useDeleteEmergencyContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contactId: string) => deleteEmergencyContact(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

// Hook for adding insurance
export function useAddInsurance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: InsuranceCreate }) =>
      addInsurance(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

// Hook for updating insurance
export function useUpdateInsurance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ insuranceId, data }: { insuranceId: string; data: InsuranceUpdate }) =>
      updateInsurance(insuranceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

// Hook for deleting insurance
export function useDeleteInsurance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (insuranceId: string) => deleteInsurance(insuranceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

// Hook for adding document
export function useAddDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: DocumentCreate }) =>
      addDocument(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

// Hook for deleting document
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

// Hook for updating patient status
export function useUpdatePatientStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: StatusHistoryCreate }) =>
      updatePatientStatus(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}
