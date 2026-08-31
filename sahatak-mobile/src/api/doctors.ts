import { apiClient, unwrapData } from './client';
import { Doctor, DoctorCategory } from '../types';
import { DOCTORS, DOCTOR_CATEGORIES } from '../data/mockData';

// -------------------------------------------------------
// Transform the backend Doctor object → mobile Doctor type
// -------------------------------------------------------
function transformBackendDoctor(d: any): Doctor {
  const user = d.user ?? {};
  const participation = d.participation_info ?? {};
  // Build availability days array (the backend provides availability through a separate endpoint)
  return {
    id: String(d.id ?? d.doctor_id ?? ''),
    name: user.full_name ?? d.full_name ?? '',
    nameAr: user.full_name ?? d.full_name ?? '',
    specialty: d.specialty ?? '',
    specialtyAr: d.specialty ?? '',
    category: d.specialty ?? '',
    avatar: user.profile_picture ?? d.profile_picture ?? '',
    rating: d.average_rating ?? d.rating ?? 4.5,
    reviewsCount: d.total_reviews ?? d.reviews_count ?? 0,
    experienceYears: d.years_of_experience ?? 0,
    patientsCount: d.total_patients ?? 0,
    fee: participation.consultation_fee ?? d.consultation_fee ?? 0,
    feeFormatted: `SAR ${participation.consultation_fee ?? d.consultation_fee ?? 0}`,
    feeFormattedAr: `${participation.consultation_fee ?? d.consultation_fee ?? 0} ر.س`,
    clinicName: d.hospital_affiliation ?? '',
    clinicNameAr: d.hospital_affiliation ?? '',
    location: user.city ?? '',
    locationAr: user.city ?? '',
    about: d.bio ?? '',
    aboutAr: d.bio ?? '',
    isVerified: d.verification_status === 'approved' || d.is_verified === true,
    availableDays: [],   // Fetched separately via /api/appointments/doctors/:id/availability
    timeSlots: [],
  };
}

// -------------------------------------------------------
// API functions
// -------------------------------------------------------

export const fetchDoctorsApi = async (params?: { category?: string; specialty?: string; query?: string }): Promise<Doctor[]> => {
  try {
    // Endpoint: GET /api/users/doctors?page=1&per_page=20&specialty=...
    const apiParams: Record<string, any> = { page: 1, per_page: 50 };
    if (params?.specialty) apiParams.specialty = params.specialty;
    if (params?.category && params.category !== 'all') apiParams.specialty = params.category;

    const response = await apiClient.get('/users/doctors', { params: apiParams });
    const envelope = unwrapData<{ doctors?: any[]; items?: any[] } | any[]>(response.data);

    // Backend may return { doctors: [...] } or array directly
    let rawDoctors: any[] = [];
    if (Array.isArray(envelope)) {
      rawDoctors = envelope;
    } else if (Array.isArray((envelope as any)?.doctors)) {
      rawDoctors = (envelope as any).doctors;
    } else if (Array.isArray((envelope as any)?.items)) {
      rawDoctors = (envelope as any).items;
    }

    if (rawDoctors.length > 0) {
      let result = rawDoctors.map(transformBackendDoctor);

      // Client-side filter by query if provided
      if (params?.query) {
        const q = params.query.toLowerCase();
        result = result.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.specialty.toLowerCase().includes(q)
        );
      }
      return result;
    }
    // Fallback to local mock data
    return applyMockFilters(params);
  } catch {
    return applyMockFilters(params);
  }
};

export const fetchDoctorByIdApi = async (id: string): Promise<Doctor | null> => {
  try {
    // Endpoint: GET /api/users/doctors/:id
    const response = await apiClient.get(`/users/doctors/${id}`);
    const inner = unwrapData<any>(response.data);
    return inner ? transformBackendDoctor(inner) : null;
  } catch {
    return DOCTORS.find((d) => d.id === id) || null;
  }
};

export const fetchDoctorCategoriesApi = async (): Promise<DoctorCategory[]> => {
  try {
    // Endpoint: GET /api/users/specialties
    const response = await apiClient.get('/users/specialties');
    const inner = unwrapData<any>(response.data);

    const specialties: string[] = Array.isArray(inner)
      ? inner
      : Array.isArray(inner?.specialties)
      ? inner.specialties
      : [];

    if (specialties.length > 0) {
      // Map specialty strings to DoctorCategory objects
      return specialties.map((spec: string, idx: number) => ({
        id: spec.toLowerCase().replace(/\s+/g, '-'),
        name: spec,
        nameAr: spec,
        iconName: 'medical-bag',
        color: '#0A6EBD',
        bgColor: '#E8F4FD',
      }));
    }
    return DOCTOR_CATEGORIES;
  } catch {
    return DOCTOR_CATEGORIES;
  }
};

// -------------------------------------------------------
// Helper: apply mock filters (used when backend unavailable)
// -------------------------------------------------------
function applyMockFilters(params?: { category?: string; query?: string }): Doctor[] {
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
