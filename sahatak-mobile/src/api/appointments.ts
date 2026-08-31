import { apiClient, unwrapData } from './client';
import { Appointment, Doctor } from '../types';
import { INITIAL_APPOINTMENTS } from '../data/mockData';

// -------------------------------------------------------
// Transform the backend Appointment object → mobile Appointment type
// -------------------------------------------------------
function transformBackendAppointment(a: any): Appointment {
  const doctor = a.doctor ?? a.doctor_info ?? {};
  const doctorUser = doctor.user ?? doctor;

  // Build a minimal Doctor object from the nested appointment data
  const doctorObj: Doctor = {
    id: String(a.doctor_id ?? doctor.id ?? ''),
    name: doctorUser.full_name ?? doctor.full_name ?? '',
    nameAr: doctorUser.full_name ?? doctor.full_name ?? '',
    specialty: doctor.specialty ?? '',
    specialtyAr: doctor.specialty ?? '',
    category: doctor.specialty ?? '',
    avatar: doctorUser.profile_picture ?? '',
    rating: doctor.average_rating ?? 4.5,
    reviewsCount: doctor.total_reviews ?? 0,
    experienceYears: doctor.years_of_experience ?? 0,
    patientsCount: 0,
    fee: a.consultation_fee ?? doctor.consultation_fee ?? 0,
    feeFormatted: `SAR ${a.consultation_fee ?? 0}`,
    feeFormattedAr: `${a.consultation_fee ?? 0} ر.س`,
    clinicName: doctor.hospital_affiliation ?? '',
    clinicNameAr: doctor.hospital_affiliation ?? '',
    location: '',
    locationAr: '',
    about: doctor.bio ?? '',
    aboutAr: doctor.bio ?? '',
    isVerified: doctor.verification_status === 'approved',
    availableDays: [],
    timeSlots: [],
  };

  const apptDate = a.appointment_date ? new Date(a.appointment_date) : null;
  const dateStr = apptDate
    ? apptDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : a.appointment_date ?? '';
  const timeStr = apptDate
    ? apptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '';

  // Map backend status → mobile status
  const statusMap: Record<string, 'upcoming' | 'completed' | 'cancelled'> = {
    scheduled: 'upcoming',
    confirmed: 'upcoming',
    in_progress: 'upcoming',
    completed: 'completed',
    cancelled: 'cancelled',
    no_show: 'cancelled',
  };

  const patient = a.patient ?? a.patient_info ?? {};
  const patientUser = patient.user ?? patient;
  const fee = Number(a.consultation_fee ?? 0);
  const serviceFee = Number(a.service_fee ?? 15);

  return {
    id: String(a.id ?? ''),
    doctorId: String(a.doctor_id ?? ''),
    doctor: doctorObj,
    date: dateStr,
    timeSlot: timeStr,
    consultationType: a.appointment_type ?? 'video',
    status: statusMap[a.status ?? ''] ?? 'upcoming',
    patientName: patientUser.full_name ?? '',
    patientAge: patient.age ?? 0,
    patientGender: patient.gender ?? '',
    symptoms: a.symptoms ?? '',
    consultationFee: fee,
    serviceFee,
    totalFee: fee + serviceFee,
    formattedFee: `SAR ${fee + serviceFee}`,
    formattedFeeAr: `${fee + serviceFee} ر.س`,
    bookedAt: a.created_at ?? a.booked_at ?? new Date().toISOString(),
    notes: a.notes ?? a.reason_for_visit ?? '',
    prescriptionId: a.prescription_id ? String(a.prescription_id) : undefined,
    meetingLink: a.meeting_link ?? undefined,
  };
}

// -------------------------------------------------------
// API functions
// -------------------------------------------------------

export const fetchAppointmentsApi = async (status?: string): Promise<Appointment[]> => {
  try {
    // Endpoint: GET /api/appointments/
    // Automatically scopes to the logged-in user's role (patient or doctor)
    const params: Record<string, any> = {};
    if (status) params.status = status;

    const response = await apiClient.get('/appointments/', { params });
    const inner = unwrapData<{ appointments?: any[]; items?: any[] } | any[]>(response.data);

    let rawAppts: any[] = [];
    if (Array.isArray(inner)) {
      rawAppts = inner;
    } else if (Array.isArray((inner as any)?.appointments)) {
      rawAppts = (inner as any).appointments;
    } else if (Array.isArray((inner as any)?.items)) {
      rawAppts = (inner as any).items;
    }

    return rawAppts.length > 0 ? rawAppts.map(transformBackendAppointment) : INITIAL_APPOINTMENTS;
  } catch {
    return INITIAL_APPOINTMENTS;
  }
};

export const createAppointmentApi = async (data: Partial<Appointment>): Promise<Appointment> => {
  try {
    // Endpoint: POST /api/appointments/
    // Map mobile Appointment fields → backend payload
    const payload: Record<string, any> = {
      doctor_id: data.doctorId || data.doctor?.id,
      appointment_date: data.date || new Date().toISOString(),
      appointment_type: data.consultationType ?? 'video',
      reason_for_visit: data.notes ?? '',
      symptoms: data.symptoms ?? '',
    };

    const response = await apiClient.post('/appointments/', payload);
    const inner = unwrapData<any>(response.data);
    return inner ? transformBackendAppointment(inner) : buildFallbackAppointment(data);
  } catch {
    return buildFallbackAppointment(data);
  }
};

export const cancelAppointmentApi = async (id: string, reason?: string): Promise<boolean> => {
  try {
    // Endpoint: PUT /api/appointments/:id/cancel  (NOT DELETE)
    await apiClient.put(`/appointments/${id}/cancel`, {
      cancellation_reason: reason ?? 'Cancelled by patient',
    });
    return true;
  } catch {
    return false;
  }
};

/**
 * Fetch available time slots for a specific doctor on a given date.
 * Endpoint: GET /api/appointments/doctors/:id/availability?date=YYYY-MM-DD
 */
export const fetchDoctorAvailabilityApi = async (
  doctorId: string,
  date: string
): Promise<{ time: string; available: boolean }[]> => {
  try {
    const response = await apiClient.get(`/appointments/doctors/${doctorId}/availability`, {
      params: { date },
    });
    const inner = unwrapData<any>(response.data);

    // Backend returns { slots: [...], date, ... } or array of { time, is_available }
    const slots: any[] = Array.isArray(inner)
      ? inner
      : Array.isArray(inner?.slots)
      ? inner.slots
      : [];

    return slots.map((s: any) => ({
      time: s.time ?? s.start_time ?? '',
      available: s.is_available ?? s.available ?? true,
    }));
  } catch {
    return [];
  }
};

// -------------------------------------------------------
// Fallback appointment builder (when backend is unreachable)
// -------------------------------------------------------
function buildFallbackAppointment(data: Partial<Appointment>): Appointment {
  return {
    id: `apt-${Date.now()}`,
    doctorId: data.doctorId || 'doc-1',
    doctor: data.doctor!,
    date: data.date || 'Today',
    timeSlot: data.timeSlot || '10:00 AM - 11:00 AM',
    consultationType: data.consultationType || 'video',
    status: 'upcoming',
    patientName: data.patientName || 'Patient',
    patientAge: data.patientAge || 30,
    patientGender: data.patientGender || 'Male',
    symptoms: data.symptoms || '',
    consultationFee: data.consultationFee || 130,
    serviceFee: 15,
    totalFee: (data.consultationFee || 130) + 15,
    formattedFee: `SAR ${(data.consultationFee || 130) + 15}`,
    formattedFeeAr: `${(data.consultationFee || 130) + 15} ر.س`,
    bookedAt: new Date().toISOString(),
  };
}
