import apiClient, { ApiEnvelope, unwrap } from './client';
import { Appointment, ConsultationType, AppointmentStatus, Doctor } from '../types';
import { RawDoctor, transformBackendDoctor } from './doctors';

interface RawAppointment {
  id: number | string;
  doctor_id?: number | string;
  patient_id?: number | string;
  doctor?: RawDoctor;
  appointment_date?: string;
  time_slot?: string;
  appointment_type?: string;
  status?: string;
  reason_for_visit?: string;
  symptoms?: string;
  notes?: string;
  consultation_fee?: number;
  service_fee?: number;
  total_fee?: number;
  meeting_link?: string;
  prescription_id?: string;
  patient_name?: string;
  patient_age?: number;
  patient_gender?: string;
  created_at?: string;
  [key: string]: unknown;
}

const STATUS_MAP: Record<string, AppointmentStatus> = {
  confirmed: 'upcoming',
  pending: 'upcoming',
  scheduled: 'upcoming',
  completed: 'completed',
  cancelled: 'cancelled',
  canceled: 'cancelled',
};

const TYPE_MAP: Record<string, ConsultationType> = {
  video: 'video',
  audio: 'audio',
  chat: 'chat',
  clinic: 'clinic',
};

export function transformBackendAppointment(
  raw: RawAppointment,
  fallbackDoctor?: Doctor,
): Appointment {
  const doctor: Doctor =
    (raw.doctor && transformBackendDoctor(raw.doctor)) ||
    fallbackDoctor || {
      id: String(raw.doctor_id ?? ''),
      name: '',
      nameAr: '',
      specialty: '',
      specialtyAr: '',
      category: '',
      avatar: '',
      rating: 0,
      reviewsCount: 0,
      experienceYears: 0,
      patientsCount: 0,
      fee: raw.consultation_fee ?? 0,
      feeFormatted: `${raw.consultation_fee ?? 0} SDG`,
      feeFormattedAr: `${raw.consultation_fee ?? 0} جنيه`,
      clinicName: '',
      clinicNameAr: '',
      location: '',
      locationAr: '',
      about: '',
      aboutAr: '',
      isVerified: false,
      availableDays: [],
      timeSlots: [],
    };

  const consultationFee = raw.consultation_fee ?? 0;
  const serviceFee = raw.service_fee ?? 0;
  const totalFee = raw.total_fee ?? consultationFee + serviceFee;

  return {
    id: String(raw.id),
    doctorId: String(raw.doctor_id ?? doctor.id),
    doctor,
    date: raw.appointment_date ?? '',
    timeSlot: raw.time_slot ?? '',
    consultationType: TYPE_MAP[raw.appointment_type ?? ''] ?? 'video',
    status: STATUS_MAP[raw.status ?? ''] ?? 'upcoming',
    patientName: raw.patient_name ?? '',
    patientAge: raw.patient_age ?? 0,
    patientGender: raw.patient_gender ?? '',
    symptoms: raw.symptoms ?? raw.reason_for_visit ?? '',
    consultationFee,
    serviceFee,
    totalFee,
    formattedFee: `${totalFee} SDG`,
    formattedFeeAr: `${totalFee} جنيه`,
    bookedAt: raw.created_at ?? new Date().toISOString(),
    prescriptionId: raw.prescription_id,
    notes: raw.notes,
    meetingLink: raw.meeting_link,
    appointmentDate: raw.appointment_date ?? '',
  };
}

export interface DoctorAvailabilitySlot {
  start: string;
  end: string;
  datetime: string;
  available: boolean;
}

export interface DoctorAvailabilityResponse {
  date: string;
  doctor_id: number;
  doctor_name: string;
  available_slots: DoctorAvailabilitySlot[];
}

export interface CreateAppointmentPayload {
  doctor_id: number;
  appointment_date: string;
  appointment_type: 'video' | 'audio' | 'chat';
  symptoms?: string;
  reason_for_visit?: string;
  notes?: string;
}

type AppointmentInput = Partial<Appointment> & Partial<CreateAppointmentPayload>;

function buildAppointmentDate(payload: AppointmentInput): string {
  if (payload.appointmentDate) return payload.appointmentDate;
  if ('appointment_date' in payload && payload.appointment_date) return payload.appointment_date;

  if (payload.date) {
    const time = payload.timeSlot?.match(/\d{1,2}:\d{2}/)?.[0] ?? '09:00';
    const meridiem = payload.timeSlot?.match(/\b(AM|PM)\b/i)?.[1].toUpperCase();
    const normalizedTime = meridiem ? `${time} ${meridiem}` : time;
    const parsed = new Date(`${payload.date} ${normalizedTime}`);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }

  return new Date(Date.now() + 86400000).toISOString();
}

function buildAppointmentRequestBody(
  payload: AppointmentInput,
): CreateAppointmentPayload {
  const appointmentType = payload.consultationType ?? payload.appointment_type;
  const normalizedType = appointmentType === 'audio' || appointmentType === 'chat'
    ? appointmentType
    : 'video';
  const symptoms = payload.symptoms ?? payload.reason_for_visit;

  return {
    doctor_id: Number(payload.doctor_id ?? payload.doctorId ?? payload.doctor?.id),
    appointment_date: buildAppointmentDate(payload),
    appointment_type: normalizedType,
    reason_for_visit: symptoms,
    symptoms,
    notes: payload.notes,
  };
}

export async function fetchAppointmentsApi(): Promise<Appointment[]> {
  const response = await apiClient.get<ApiEnvelope<RawAppointment[] | { appointments: RawAppointment[] }>>('/appointments/');
  const data = unwrap(response);
  const raw = Array.isArray(data) ? data : (data?.appointments ?? []);
  return raw.map((r) => transformBackendAppointment(r));
}

export async function createAppointmentApi(
  payload: AppointmentInput,
  fallbackDoctor?: Doctor,
): Promise<Appointment> {
  const body = buildAppointmentRequestBody(payload);

  const response = await apiClient.post<
    ApiEnvelope<RawAppointment | { appointment: RawAppointment }>
  >('/appointments/', body);
  const data = unwrap(response);
  const raw =
    data && typeof data === 'object' && 'appointment' in data && data.appointment
      ? (data.appointment as RawAppointment)
      : (data as RawAppointment);

  const doc = fallbackDoctor || (payload as Partial<Appointment>).doctor;
  return transformBackendAppointment(raw, doc);
}

export async function cancelAppointmentApi(
  appointmentId: number | string,
): Promise<Appointment> {
  const response = await apiClient.put<ApiEnvelope<RawAppointment>>(`/appointments/${appointmentId}/cancel`);
  return transformBackendAppointment(unwrap(response));
}

export async function fetchDoctorAvailabilityApi(
  doctorId: number | string,
  date: string,
): Promise<DoctorAvailabilitySlot[]> {
  try {
    const response = await apiClient.get<
      ApiEnvelope<DoctorAvailabilityResponse | { available_slots: DoctorAvailabilitySlot[] }>
    >(`/appointments/doctors/${doctorId}/availability`, { params: { date } });
    const data = unwrap(response);
    if (!data) return [];
    if ('available_slots' in data && Array.isArray(data.available_slots)) {
      return data.available_slots;
    }
    return [];
  } catch (error) {
    console.warn(`[fetchDoctorAvailabilityApi] Failed to fetch slots for doctor ${doctorId} on ${date}:`, error);
    return [];
  }
}

export async function joinVideoConsultationApi(
  appointmentId: number | string,
): Promise<Record<string, unknown>> {
  const response = await apiClient.post<ApiEnvelope<Record<string, unknown>>>(`/appointments/${appointmentId}/video/join`);
  return unwrap(response);
}
