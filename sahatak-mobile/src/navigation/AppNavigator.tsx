import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useApp } from '../context/AppContext';

import { AuthLoadingScreen } from '../components/auth/AuthLoadingScreen';
import { LoginScreen } from '../components/auth/LoginScreen';
import { SignupScreen } from '../components/auth/SignupScreen';

import { BottomTabNavigator } from './BottomTabNavigator';
import { DoctorListScreen } from '../components/doctors/DoctorListScreen';
import { DoctorDetailScreen } from '../components/doctors/DoctorDetailScreen';
import { BookingFlowModal } from '../components/booking/BookingFlowModal';
import { VideoConsultationScreen } from '../components/consultation/VideoConsultationScreen';
import { DoctorChatScreen } from '../components/chat/DoctorChatScreen';
import { PharmacyScreen } from '../components/pharmacy/PharmacyScreen';
import { MedicineDetailScreen } from '../components/pharmacy/MedicineDetailScreen';
import { CartScreen } from '../components/pharmacy/CartScreen';
import { ClinicsMapScreen } from '../components/map/ClinicsMapScreen';
import { MedicalCheckupScreen } from '../components/checkup/MedicalCheckupScreen';
import { MedicalRecordsScreen } from '../components/records/MedicalRecordsScreen';
import { MyAppointmentsScreen } from '../components/appointments/MyAppointmentsScreen';
import { NotificationsScreen } from '../components/notifications/NotificationsScreen';
import { ProfileScreen } from '../components/profile/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { isAuthLoading, isAuthenticated } = useApp();

  if (isAuthLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {!isAuthenticated ? (
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen name="DoctorList" component={DoctorListScreen} />
          <Stack.Screen name="DoctorDetail" component={DoctorDetailScreen} />
          <Stack.Screen
            name="BookingFlow"
            component={BookingFlowModal}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="VideoConsultation"
            component={VideoConsultationScreen}
            options={{ presentation: 'fullScreenModal' }}
          />
          <Stack.Screen name="DoctorChat" component={DoctorChatScreen} />
          <Stack.Screen name="Pharmacy" component={PharmacyScreen} />
          <Stack.Screen name="MedicineDetail" component={MedicineDetailScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="ClinicsMap" component={ClinicsMapScreen} />
          <Stack.Screen name="MedicalCheckup" component={MedicalCheckupScreen} />
          <Stack.Screen name="MedicalRecords" component={MedicalRecordsScreen} />
          <Stack.Screen name="MyAppointments" component={MyAppointmentsScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};


