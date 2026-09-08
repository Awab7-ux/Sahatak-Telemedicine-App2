import apiClient, { ApiEnvelope, unwrap } from './client';

export interface MedicalRecords {
  diagnoses?: unknown[];
  vital_signs?: unknown[];
  prescriptions?: unknown[];
  [key: string]: unknown;
}

export interface Prescription {
  id: number;
  medication_name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  created_at?: string;
  [key: string]: unknown;
}

export async function fetchMedicalRecordsApi(): Promise<MedicalRecords> {
  const response = await apiClient.get<ApiEnvelope<MedicalRecords>>('/medical/records');
  return unwrap(response);
}

export async function fetchPrescriptionsApi(): Promise<Prescription[]> {
  const response = await apiClient.get<ApiEnvelope<Prescription[] | { prescriptions: Prescription[] }>>('/prescriptions/');
  const data = unwrap(response);
  return Array.isArray(data) ? data : (data?.prescriptions ?? []);
}