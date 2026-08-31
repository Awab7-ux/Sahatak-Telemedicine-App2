import { apiClient, unwrapData } from './client';
import { MedicalRecord, PrescriptionMedicine } from '../types';
import { MEDICAL_RECORDS } from '../data/mockData';

// -------------------------------------------------------
// Transform a backend Prescription → MedicalRecord
// -------------------------------------------------------
function transformPrescription(p: any): MedicalRecord {
  const doctor = p.doctor ?? p.doctor_info ?? {};
  const doctorUser = doctor.user ?? doctor;

  const medicines: PrescriptionMedicine[] = (p.medications ?? p.medicines ?? []).map((m: any) => ({
    name: m.medication_name ?? m.name ?? '',
    nameAr: m.medication_name ?? m.name ?? '',
    dosage: m.dosage ?? '',
    dosageAr: m.dosage ?? '',
    frequency: m.frequency ?? '',
    frequencyAr: m.frequency ?? '',
    duration: m.duration ?? '',
    durationAr: m.duration ?? '',
    instructions: m.instructions ?? '',
    instructionsAr: m.instructions ?? '',
  }));

  return {
    id: String(p.id ?? ''),
    title: p.diagnosis ?? 'Prescription',
    titleAr: p.diagnosis ?? 'وصفة طبية',
    doctorName: doctorUser.full_name ?? doctor.full_name ?? '',
    doctorNameAr: doctorUser.full_name ?? doctor.full_name ?? '',
    doctorSpecialty: doctor.specialty ?? '',
    doctorSpecialtyAr: doctor.specialty ?? '',
    doctorAvatar: doctorUser.profile_picture ?? '',
    date: p.created_at ? new Date(p.created_at).toLocaleDateString('en-US') : '',
    dateAr: p.created_at ? new Date(p.created_at).toLocaleDateString('ar-SA') : '',
    type: 'prescription',
    status: p.status === 'active' ? 'Active' : 'Completed',
    statusAr: p.status === 'active' ? 'نشط' : 'منتهي',
    diagnosisSummary: p.notes ?? '',
    diagnosisSummaryAr: p.notes ?? '',
    medicines,
    fileSize: '',
  };
}

// -------------------------------------------------------
// Transform a backend EHR/Medical Record → MedicalRecord
// -------------------------------------------------------
function transformMedicalRecord(r: any): MedicalRecord {
  const doctor = r.doctor ?? r.doctor_info ?? {};
  const doctorUser = doctor.user ?? doctor;

  return {
    id: String(r.id ?? ''),
    title: r.diagnosis ?? r.record_type ?? 'Medical Record',
    titleAr: r.diagnosis ?? r.record_type ?? 'سجل طبي',
    doctorName: doctorUser.full_name ?? '',
    doctorNameAr: doctorUser.full_name ?? '',
    doctorSpecialty: doctor.specialty ?? '',
    doctorSpecialtyAr: doctor.specialty ?? '',
    doctorAvatar: doctorUser.profile_picture ?? '',
    date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-US') : '',
    dateAr: r.created_at ? new Date(r.created_at).toLocaleDateString('ar-SA') : '',
    type: 'diagnosis',
    status: 'Completed',
    statusAr: 'منتهي',
    diagnosisSummary: r.notes ?? r.description ?? '',
    diagnosisSummaryAr: r.notes ?? r.description ?? '',
    fileSize: '',
  };
}

// -------------------------------------------------------
// API functions
// -------------------------------------------------------

export const fetchMedicalRecordsApi = async (): Promise<MedicalRecord[]> => {
  try {
    // Fetch from both prescriptions and EHR in parallel
    const [prescriptionsRes, ehrRes] = await Promise.allSettled([
      apiClient.get('/prescriptions/'),
      apiClient.get('/medical/records'),
    ]);

    const records: MedicalRecord[] = [];

    if (prescriptionsRes.status === 'fulfilled') {
      const inner = unwrapData<any>(prescriptionsRes.value.data);
      const rawList: any[] = Array.isArray(inner)
        ? inner
        : Array.isArray(inner?.prescriptions)
        ? inner.prescriptions
        : Array.isArray(inner?.items)
        ? inner.items
        : [];
      records.push(...rawList.map(transformPrescription));
    }

    if (ehrRes.status === 'fulfilled') {
      const inner = unwrapData<any>(ehrRes.value.data);
      const rawList: any[] = Array.isArray(inner)
        ? inner
        : Array.isArray(inner?.records)
        ? inner.records
        : Array.isArray(inner?.items)
        ? inner.items
        : [];
      records.push(...rawList.map(transformMedicalRecord));
    }

    return records.length > 0 ? records : MEDICAL_RECORDS;
  } catch {
    return MEDICAL_RECORDS;
  }
};
