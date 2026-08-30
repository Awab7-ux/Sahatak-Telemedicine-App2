import { apiClient } from './client';
import { Appointment } from '../types';
import { INITIAL_APPOINTMENTS } from '../data/mockData';

export const fetchAppointmentsApi = async (status?: string): Promise<Appointment[]> => {
  try {
    const response = await apiClient.get('/appointments', { params: { status } });
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return INITIAL_APPOINTMENTS;
  } catch {
    return INITIAL_APPOINTMENTS;
  }
};

export const createAppointmentApi = async (data: Partial<Appointment>): Promise<Appointment> => {
  try {
    const response = await apiClient.post('/appointments', data);
    return response.data;
  } catch {
    // Return created object locally as fallback
    const mockAppt: Appointment = {
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
    return mockAppt;
  }
};

export const cancelAppointmentApi = async (id: string): Promise<boolean> => {
  try {
    await apiClient.delete(`/appointments/${id}`);
    return true;
  } catch {
    return true;
  }
};

