import apiClient, { ApiEnvelope, unwrap } from './client';
import { Doctor } from '../types';

// ---------------------------------------------------------------------------
// Raw shape actually returned by the backend for a doctor record.
// ---------------------------------------------------------------------------
export interface RawDoctor {
  id: number | string;
  full_name?: string;
  full_name_ar?: string;
  specialty?: string;
  specialty_ar?: string;
  years_of_experience?: number;
  consultation_fee?: number;
  rating?: number;
  reviews_count?: number;
  patients_count?: number;
  bio?: string;
  bio_ar?: string;
  profile_picture?: string;
  clinic_name?: string;
  clinic_name_ar?: string;
  user_id?: number | string;
  user?: { full_name?: string; language_preference?: string; profile_picture?: string };
  city?: string;
  city_ar?: string;
  is_verified?: boolean;
  participation_type?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Converts a raw backend doctor object into the rich bilingual Doctor shape
// the rest of the app (cards, booking flow, favorites) expects.
//
// ASSUMPTION: several fields the UI expects (category, availableDays,
// timeSlots, and Arabic variants of specialty/bio/clinic/city) are NOT
// present in the raw backend payload seen so far. They get safe fallbacks
// below (empty arrays / mirrored English text) so the app doesn't crash —
// but empty availableDays/timeSlots means the booking calendar shows no
// slots until a real backend field or endpoint for this is confirmed.
// Currency assumed "SDG" — change if the backend uses a different one.
// ---------------------------------------------------------------------------
export function transformBackendDoctor(raw: RawDoctor): Doctor {
  const fee = Number(raw.consultation_fee ?? 0);
  // CONFIRMED against the live API: the doctor's display name lives at
  // `user.full_name` (nested object added by routes/users.py) — there is NO
  // top-level `full_name` field. Reading it top-level left every doctor's
  // name empty and broke client-side search entirely.
  const fullName: string =
    (raw as { user?: { full_name?: string } }).user?.full_name ??
    raw.full_name ??
    '';

  return {
    id: String(raw.id),
    name: fullName,
    nameAr: fullName,
    specialty: raw.specialty ?? '',
    specialtyAr: raw.specialty_ar ?? raw.specialty ?? '',
    category: raw.specialty ?? 'general', // ASSUMPTION: no distinct category field from backend
    avatar: raw.profile_picture ?? '',
    rating: raw.rating ?? 0,
    reviewsCount: raw.reviews_count ?? 0,
    experienceYears: raw.years_of_experience ?? 0,
    patientsCount: raw.patients_count ?? 0,
    fee,
    feeFormatted: `${fee} SDG`,
    feeFormattedAr: `${fee} جنيه`,
    clinicName: raw.clinic_name ?? '',
    clinicNameAr: raw.clinic_name_ar ?? raw.clinic_name ?? '',
    location: raw.city ?? '',
    locationAr: raw.city_ar ?? raw.city ?? '',
    about: raw.bio ?? '',
    aboutAr: raw.bio_ar ?? raw.bio ?? '',
    isVerified: raw.is_verified ?? false,
    participationType: raw.participation_type,
    isFavorite: false,
    userId: raw.user_id != null ? String(raw.user_id) : undefined,
    availableDays: [], // TODO: wire up once the availability endpoint/shape is confirmed
    timeSlots: [],
  };
}

export function normalizeSearchText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '') // remove Arabic tashkeel
    .replace(/^(\s*د\s*\.|\s*دكتور\s*|\s*dr\s*\.?\s*)/i, '') // strip title prefix
    .trim();
}

const BILINGUAL_ALIASES: [string[], string[]][] = [
  [['hosam', 'hossam', 'hesham', 'hisham'], ['هشام', 'حسام']],
  [['ahmed', 'ahmad'], ['احمد']],
  [['mohamed', 'mohammed', 'muhammad', 'muhammed'], ['محمد']],
  [['ali'], ['علي']],
  [['omer', 'omar'], ['عمر']],
  [['osman', 'othman'], ['عثمان']],
  [['khalid', 'khaled'], ['خالد']],
  [['hassan', 'hasan'], ['حسن']],
  [['hussein', 'hussien'], ['حسين']],
  [['mona'], ['مني', 'منى']],
  [['imad', 'emad'], ['عماد']],
  [['nasir', 'nasser'], ['ناصر']],
  [['taha'], ['طه']],
  [['sami'], ['سامي']],
  [['samir'], ['سمير']],
  [['amjad'], ['امجد']],
  [['amir'], ['امير']],
  [['mansour'], ['منصور']],
  [['solafa', 'sulafa'], ['سلافه']],
  [['israa'], ['اسراء']],
  [['abdullah', 'abdel', 'abdul'], ['عبد']],
  [['rania'], ['رانيا']],
  [['salma'], ['سلمي', 'سلمى']],
  [['fatima', 'fatma'], ['فاطمه']],
  [['layla', 'laila'], ['ليلي', 'ليلى']],
  [['sara', 'sarah'], ['ساره']],
];

/**
 * Robust bilingual search matching:
 * - Normalizes Arabic diacritics and alternate letterforms (أ/إ/آ -> ا, ة -> ه, ى -> ي)
 * - Strips doctor prefixes ('Dr.', 'د.')
 * - Bridges English transliterations with Arabic names (e.g. 'Hosam' matches 'د. هشام محمد عبد الرحمن')
 */
export function matchDoctorSearch(doc: Doctor, query: string): boolean {
  if (!query || !query.trim()) return true;

  const normQuery = normalizeSearchText(query);
  const normName = normalizeSearchText(doc.name);
  const normNameAr = normalizeSearchText(doc.nameAr);
  const normSpec = normalizeSearchText(doc.specialty);
  const normSpecAr = normalizeSearchText(doc.specialtyAr);

  // Direct normalized substring match
  if (
    normName.includes(normQuery) ||
    normNameAr.includes(normQuery) ||
    normSpec.includes(normQuery) ||
    normSpecAr.includes(normQuery)
  ) {
    return true;
  }

  // Bilingual alias match (English <-> Arabic phonetic mapping)
  for (const [enList, arList] of BILINGUAL_ALIASES) {
    const queryMatchesEn = enList.some((word) => normQuery.includes(word));
    const queryMatchesAr = arList.some((word) =>
      normQuery.includes(normalizeSearchText(word)),
    );

    if (queryMatchesEn) {
      if (
        arList.some(
          (ar) =>
            normName.includes(normalizeSearchText(ar)) ||
            normNameAr.includes(normalizeSearchText(ar)),
        )
      ) {
        return true;
      }
    }

    if (queryMatchesAr) {
      if (
        enList.some((en) => normName.includes(en) || normNameAr.includes(en)) ||
        arList.some(
          (ar) =>
            normName.includes(normalizeSearchText(ar)) ||
            normNameAr.includes(normalizeSearchText(ar)),
        )
      ) {
        return true;
      }
    }
  }

  return false;
}

export async function fetchDoctorsApi(options?: {
  page?: number;
  perPage?: number;
  specialty?: string;
}): Promise<Doctor[]> {
  // CONFIRMED against the live API + routes/users.py: the endpoint accepts
  // ONLY page / per_page / specialty / participation_type — there is no
  // name/search parameter (search is intentionally client-side). The backend
  // caps per_page at 50, so we fetch ALL pages by checking pagination.has_next.
  const perPage = options?.perPage ?? 50;
  const all: RawDoctor[] = [];
  let page = options?.page ?? 1;
  let hasNext = true;

  while (hasNext && page <= 10) {
    const response = await apiClient.get<ApiEnvelope<any>>(
      '/users/doctors',
      {
        params: {
          page,
          per_page: perPage,
          ...(options?.specialty ? { specialty: options.specialty } : {}),
        },
      },
    );
    const data = unwrap(response);
    const raw: RawDoctor[] = Array.isArray(data)
      ? data
      : (data?.doctors ?? []);
    all.push(...raw);

    // Backend returns { doctors: [...], pagination: { has_next, page, pages, per_page, total } }
    const pagination = data?.pagination;
    hasNext = pagination?.has_next ?? data?.has_next ?? false;
    page += 1;
  }

  return all.map(transformBackendDoctor);
}

export async function fetchDoctorByIdApi(doctorId: number | string): Promise<Doctor> {
  const response = await apiClient.get<ApiEnvelope<RawDoctor>>(
    `/users/doctors/${doctorId}`,
  );
  return transformBackendDoctor(unwrap(response));
}

export async function fetchSpecialtiesApi(): Promise<unknown[]> {
  const response = await apiClient.get<ApiEnvelope<unknown[] | { specialties: unknown[] }>>(
    '/users/specialties',
  );
  const data = unwrap(response);
  return Array.isArray(data) ? data : ((data as any)?.specialties ?? []);
}