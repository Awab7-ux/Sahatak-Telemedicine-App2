/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MobileContainer } from './components/common/MobileContainer';

// Screens
import { HomeScreen } from './components/home/HomeScreen';
import { DoctorListScreen } from './components/doctors/DoctorListScreen';
import { DoctorDetailScreen } from './components/doctors/DoctorDetailScreen';
import { BookingFlowModal } from './components/booking/BookingFlowModal';
import { VideoConsultationScreen } from './components/consultation/VideoConsultationScreen';
import { DoctorChatScreen } from './components/chat/DoctorChatScreen';
import { PharmacyScreen } from './components/pharmacy/PharmacyScreen';
import { MedicineDetailScreen } from './components/pharmacy/MedicineDetailScreen';
import { CartScreen } from './components/pharmacy/CartScreen';
import { ClinicsMapScreen } from './components/map/ClinicsMapScreen';
import { MedicalCheckupScreen } from './components/checkup/MedicalCheckupScreen';
import { MedicalRecordsScreen } from './components/records/MedicalRecordsScreen';
import { MyAppointmentsScreen } from './components/appointments/MyAppointmentsScreen';
import { NotificationsScreen } from './components/notifications/NotificationsScreen';
import { ProfileScreen } from './components/profile/ProfileScreen';

const MainScreenRouter: React.FC = () => {
  const { screen } = useApp();

  switch (screen) {
    case 'home':
      return <HomeScreen />;
    case 'doctors':
      return <DoctorListScreen />;
    case 'doctor_detail':
      return <DoctorDetailScreen />;
    case 'booking':
      return <BookingFlowModal />;
    case 'video_consultation':
      return <VideoConsultationScreen />;
    case 'chat_doctor':
      return <DoctorChatScreen />;
    case 'pharmacy':
      return <PharmacyScreen />;
    case 'medicine_detail':
      return <MedicineDetailScreen />;
    case 'cart':
      return <CartScreen />;
    case 'clinics_map':
      return <ClinicsMapScreen />;
    case 'medical_checkup':
      return <MedicalCheckupScreen />;
    case 'medical_records':
      return <MedicalRecordsScreen />;
    case 'my_appointments':
      return <MyAppointmentsScreen />;
    case 'notifications':
      return <NotificationsScreen />;
    case 'profile':
      return <ProfileScreen />;
    default:
      return <HomeScreen />;
  }
};

export default function App() {
  return (
    <AppProvider>
      <MobileContainer>
        <MainScreenRouter />
      </MobileContainer>
    </AppProvider>
  );
}
