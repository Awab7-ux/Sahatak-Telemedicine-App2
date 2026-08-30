import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, MessageSquare, ShoppingCart, Calendar, User } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { BottomNavTab } from '../../types';
import { Colors } from '../../theme/colors';

export const BottomNav: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { activeTab, setActiveTab, cartCount, unreadNotificationsCount, isRtl, t } = useApp();

  const tabs: {
    id: BottomNavTab;
    labelEn: string;
    labelAr: string;
    icon: any;
  }[] = [
    { id: 'home', labelEn: 'Home', labelAr: 'الرئيسية', icon: Home },
    { id: 'messages', labelEn: 'Messages', labelAr: 'الرسائل', icon: MessageSquare },
    { id: 'cart', labelEn: 'Cart', labelAr: 'السلة', icon: ShoppingCart },
    { id: 'history', labelEn: 'History', labelAr: 'مواعيدي', icon: Calendar },
    { id: 'profile', labelEn: 'Profile', labelAr: 'حسابي', icon: User },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          flexDirection: isRtl ? 'row-reverse' : 'row',
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const IconComponent = tab.icon;
        const badgeCount =
          tab.id === 'cart'
            ? cartCount
            : tab.id === 'messages'
            ? unreadNotificationsCount
            : 0;

        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.7}
            onPress={() => setActiveTab(tab.id)}
            style={styles.tabButton}
          >
            <View style={styles.iconWrapper}>
              <IconComponent
                size={22}
                color={isActive ? Colors.primary : Colors.slate[400]}
                strokeWidth={isActive ? 2.4 : 1.8}
              />
              {badgeCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isActive ? Colors.primary : Colors.slate[500],
                  fontWeight: isActive ? '700' : '500',
                },
              ]}
            >
              {t(tab.labelEn, tab.labelAr)}
            </Text>
            {isActive && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.slate[100],
    paddingTop: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 26,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '700',
  },
});

