import { NavigatorScreenParams } from '@react-navigation/native';
import {
  Doctor,
  Product,
  Appointment,
  MedicalRecord,
  MedicalCheckupPackage,
  ClinicLocation,
  ConsultationType,
} from '../types';

export type BottomTabParamList = {
  HomeTab: undefined;
  MessagesTab: { doctor?: Doctor } | undefined;
  CartTab: undefined;
  HistoryTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<BottomTabParamList> | undefined;
  DoctorList: { categoryId?: string; query?: string } | undefined;
  DoctorDetail: { doctor?: Doctor; doctorId?: string } | undefined;
  BookingFlow: { doctor?: Doctor; consultationType?: ConsultationType } | undefined;
  VideoConsultation: { appointment?: Appointment; doctor?: Doctor } | undefined;
  DoctorChat: { doctor?: Doctor; doctorId?: string } | undefined;
  Pharmacy: { categoryId?: string; query?: string } | undefined;
  MedicineDetail: { product?: Product; productId?: string } | undefined;
  Cart: undefined;
  ClinicsMap: { clinic?: ClinicLocation; clinicId?: string } | undefined;
  MedicalCheckup: { package?: MedicalCheckupPackage } | undefined;
  MedicalRecords: { record?: MedicalRecord } | undefined;
  MyAppointments: undefined;
  Notifications: undefined;
  Profile: undefined;
};

