import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from './types';
import { BottomNav } from '../components/common/BottomNav';

// Tab Screens
import { HomeScreen } from '../components/home/HomeScreen';
import { DoctorChatScreen } from '../components/chat/DoctorChatScreen';
import { CartScreen } from '../components/pharmacy/CartScreen';
import { MyAppointmentsScreen } from '../components/appointments/MyAppointmentsScreen';
import { ProfileScreen } from '../components/profile/ProfileScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={() => <BottomNav />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="MessagesTab" component={DoctorChatScreen} />
      <Tab.Screen name="CartTab" component={CartScreen} />
      <Tab.Screen name="HistoryTab" component={MyAppointmentsScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

