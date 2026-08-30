import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

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
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
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
    </Stack.Navigator>
  );
};

