import apiClient, { unwrap } from './client';
import type { ApiEnvelope } from './client';

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

// ── Real EHR endpoints (Sahatak-2 backend, routes/ehr.py) ──────────────────
// The backend accepts the User ID in the URL and resolves it to the Patient
// profile ID internally (ehr.py get_patient_vital_signs / get_patient_diagnoses).

export interface DiagnosisApiRecord {
  id: number;
  primary_diagnosis: string;
  severity?: string | null;
  status?: string | null;
  clinical_findings?: string | null;
  treatment_plan?: string | null;
  follow_up_required?: boolean;
  follow_up_date?: string | null;
  follow_up_notes?: string | null;
  resolved?: boolean;
  diagnosis_date: string;
  doctor_name?: string | null;
  appointment_id?: number | null;
  [key: string]: unknown;
}

export interface VitalSignApiRecord {
  id: number;
  systolic_bp?: number | null;
  diastolic_bp?: number | null;
  blood_pressure?: string | null;
  heart_rate?: number | null;
  temperature?: number | null;
  respiratory_rate?: number | null;
  oxygen_saturation?: number | null;
  height?: number | null;
  weight?: number | null;
  bmi?: number | null;
  pain_scale?: number | null;
  pain_location?: string | null;
  notes?: string | null;
  measured_at: string;
  recorded_by?: string | null;
  [key: string]: unknown;
}

/** GET /api/ehr/diagnoses/patient/<user_id> — doctor-created diagnoses (medical reports). */
export async function fetchPatientDiagnosesApi(
  patientUserId: number | string,
): Promise<DiagnosisApiRecord[]> {
  const response = await apiClient.get<ApiEnvelope<{ diagnoses: DiagnosisApiRecord[] }>>(
    `/ehr/diagnoses/patient/${patientUserId}`,
  );
  return unwrap(response)?.diagnoses ?? [];
}

/** GET /api/ehr/vital-signs/patient/<user_id> — ordered most-recent-first by the backend. */
export async function fetchPatientVitalSignsApi(
  patientUserId: number | string,
  days: number = 365,
  limit: number = 50,
): Promise<VitalSignApiRecord[]> {
  const response = await apiClient.get<ApiEnvelope<{ vital_signs: VitalSignApiRecord[] }>>(
    `/ehr/vital-signs/patient/${patientUserId}?days=${days}&limit=${limit}`,
  );
  return unwrap(response)?.vital_signs ?? [];
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