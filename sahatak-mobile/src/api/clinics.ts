import { apiClient } from './client';
import { ClinicLocation } from '../types';
import { CLINIC_LOCATIONS } from '../data/mockData';

export const fetchClinicsApi = async (): Promise<ClinicLocation[]> => {
  try {
    const response = await apiClient.get('/clinics');
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return CLINIC_LOCATIONS;
  } catch {
    return CLINIC_LOCATIONS;
  }
};

