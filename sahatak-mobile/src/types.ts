export type Language = 'en' | 'ar';

export type ScreenType =
  | 'home'
  | 'doctors'
  | 'doctor_detail'
  | 'booking'
  | 'video_consultation'
  | 'chat_doctor'
  | 'pharmacy'
  | 'medicine_detail'
  | 'clinics_map'
  | 'medical_checkup'
  | 'medical_records'
  | 'notifications'
  | 'my_appointments'
  | 'profile'
  | 'cart';

export type BottomNavTab = 'home' | 'messages' | 'cart' | 'history' | 'profile';

export type ConsultationType = 'video' | 'audio' | 'chat' | 'clinic';

export type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled';

export interface Doctor {
  id: string;
  name: string;
  nameAr: string;
  specialty: string;
  specialtyAr: string;
  category: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  experienceYears: number;
  patientsCount: number;
  fee: number;
  feeFormatted: string;
  feeFormattedAr: string;
  clinicName: string;
  clinicNameAr: string;
  location: string;
  locationAr: string;
  about: string;
  aboutAr: string;
  isVerified: boolean;
  isFavorite?: boolean;
  availableDays: {
    day: string;
    dayAr: string;
    date: string;
    fullDate: string;
    available: boolean;
  }[];
  timeSlots: {
    time: string;
    available: boolean;
  }[];
}

export interface DoctorCategory {
  id: string;
  name: string;
  nameAr: string;
  iconName: string;
  color: string;
  bgColor: string;
}

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  brand: string;
  type: string;
  typeAr: string;
  category: string;
  categoryAr: string;
  image: string;
  price: number;
  priceFormatted: string;
  priceFormattedAr: string;
  packaging?: string;
  rating: number;
  reviewsCount: number;
  shortDesc: string;
  shortDescAr: string;
  about?: string;
  aboutAr?: string;
  description?: string;
  descriptionAr?: string;
  generalUse: string[];
  generalUseAr: string[];
  composition: string;
  compositionAr?: string;
  dosage: string;
  dosageAr: string;
  warnings: string;
  warningsAr: string;
  manufacturer: string;
  manufacturerAr: string;
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctor: Doctor;
  date: string;
  timeSlot: string;
  consultationType: ConsultationType;
  status: AppointmentStatus;
  patientName: string;
  patientAge: number;
  patientGender: string;
  symptoms: string;
  consultationFee: number;
  serviceFee: number;
  totalFee: number;
  formattedFee: string;
  formattedFeeAr: string;
  bookedAt: string;
  prescriptionId?: string;
  notes?: string;
  meetingLink?: string;
}

export interface MedicalCheckupPackage {
  id: string;
  title: string;
  titleAr: string;
  category: string;
  categoryAr: string;
  price: number;
  priceFormatted: string;
  priceFormattedAr: string;
  originalPrice?: string;
  duration: string;
  durationAr: string;
  iconName: string;
  color: string;
  bgColor: string;
  description: string;
  descriptionAr: string;
  includedTests: string[];
  includedTestsAr: string[];
  preparation: string;
  preparationAr: string;
  testsCount?: number;
  features?: string[];
  featuresAr?: string[];
  isHomeSampleAvailable?: boolean;
}

export interface PrescriptionMedicine {
  name: string;
  nameAr: string;
  dosage: string;
  dosageAr: string;
  frequency: string;
  frequencyAr: string;
  duration: string;
  durationAr: string;
  instructions: string;
  instructionsAr: string;
  price?: number;
}

export interface MedicalRecord {
  id: string;
  title: string;
  titleAr: string;
  doctorName: string;
  doctorNameAr: string;
  doctorSpecialty: string;
  doctorSpecialtyAr: string;
  doctorAvatar: string;
  date: string;
  dateAr: string;
  type: 'prescription' | 'lab' | 'report' | 'diagnosis' | 'lab_report' | 'consultation_summary';
  status: 'Active' | 'Completed' | 'Signed';
  statusAr: string;
  diagnosisSummary?: string;
  diagnosisSummaryAr?: string;
  diagnosis?: string;
  diagnosisAr?: string;
  clinicName?: string;
  clinicNameAr?: string;
  medicines?: PrescriptionMedicine[];
  labResults?: {
    testName: string;
    result: string;
    referenceRange: string;
    status: 'normal' | 'attention';
  }[];
  fileSize: string;
  facility?: string;
  facilityAr?: string;
}

export interface ClinicLocation {
  id: string;
  name: string;
  nameAr: string;
  type: 'hospital' | 'clinic' | 'pharmacy' | 'lab';
  typeLabel?: string;
  typeLabelAr?: string;
  typeAr?: string;
  address: string;
  addressAr: string;
  distance: string;
  distanceKm?: number;
  latitude?: number;
  longitude?: number;
  rating: number;
  reviewsCount?: number;
  openStatus?: string;
  openStatusAr?: string;
  isOpen?: boolean;
  isOpenNow?: boolean;
  phone: string;
  emergencyAvailable?: boolean;
  isEmergency24?: boolean;
  coordinates?: { x: number; y: number };
  image: string;
  services?: string[];
  servicesAr?: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  timestamp: string;
  timestampAr: string;
  type: 'appointment' | 'message' | 'prescription' | 'payment' | 'health' | 'chat' | 'medicine';
  read: boolean;
  actionScreen?: ScreenType;
}

export interface ChatMessage {
  id: string;
  sender: 'patient' | 'doctor';
  text?: string;
  timestamp: string;
  type?: 'text' | 'image' | 'prescription' | 'report' | 'voice';
  mediaUrl?: string;
  prescriptionData?: PrescriptionMedicine[];
  reportTitle?: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  nameAr: string;
  phone: string;
  email: string;
  avatar: string;
  bloodType?: string;
  bloodGroup?: string;
  age: number;
  gender: string;
  genderAr: string;
  height: string;
  weight: string;
  emergencyContact?: string;
  insuranceProvider: string;
  insuranceProviderAr?: string;
  policyNumber?: string;
  insurancePolicyNumber?: string;
  location: string;
  locationAr: string;
}

