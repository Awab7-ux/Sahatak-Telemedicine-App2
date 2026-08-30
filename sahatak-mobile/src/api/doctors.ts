import { apiClient } from './client';
import { Doctor, DoctorCategory } from '../types';
import { DOCTORS, DOCTOR_CATEGORIES } from '../data/mockData';

export const fetchDoctorsApi = async (params?: { category?: string; query?: string }): Promise<Doctor[]> => {
  try {
    const response = await apiClient.get('/doctors', { params });
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return DOCTORS;
  } catch {
    // Graceful fallback to mock data
    let docs = DOCTORS;
    if (params?.category && params.category !== 'all') {
      docs = docs.filter((d) => d.category.toLowerCase() === params.category?.toLowerCase());
    }
    if (params?.query) {
      const q = params.query.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.nameAr.includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          d.specialtyAr.includes(q)
      );
    }
    return docs;
  }
};

export const fetchDoctorByIdApi = async (id: string): Promise<Doctor | null> => {
  try {
    const response = await apiClient.get(`/doctors/${id}`);
    return response.data;
  } catch {
    return DOCTORS.find((d) => d.id === id) || null;
  }
};

export const fetchDoctorCategoriesApi = async (): Promise<DoctorCategory[]> => {
  try {
    const response = await apiClient.get('/doctors/categories');
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return DOCTOR_CATEGORIES;
  } catch {
    return DOCTOR_CATEGORIES;
  }
};

