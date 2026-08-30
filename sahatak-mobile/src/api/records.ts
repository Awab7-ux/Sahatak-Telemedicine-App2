import { apiClient } from './client';
import { MedicalRecord } from '../types';
import { MEDICAL_RECORDS } from '../data/mockData';

export const fetchMedicalRecordsApi = async (): Promise<MedicalRecord[]> => {
  try {
    const response = await apiClient.get('/medical-records');
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return MEDICAL_RECORDS;
  } catch {
    return MEDICAL_RECORDS;
  }
};

