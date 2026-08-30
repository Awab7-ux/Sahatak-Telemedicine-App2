import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  Bell,
  Calendar,
  Pill,
  MessageSquare,
  CheckCheck,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/styles';

export const NotificationsScreen: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    navigateTo,
    isRtl,
    t,
  } = useApp();

  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar size={20} color={Colors.primary} />;
      case 'medicine':
      case 'prescription':
        return <Pill size={20} color={Colors.accent} />;
      case 'chat':
        return <MessageSquare size={20} color={Colors.purple} />;
      default:
        return <Bell size={20} color={Colors.warning} />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return Colors.primarySubtle;
      case 'medicine':
      case 'prescription':
        return Colors.accentLight;
      case 'chat':
        return Colors.purpleLight;
      default:
        return Colors.warningLight;
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Notifications"
        titleAr="الإشعارات والتنبيهات"
        rightAction="none"
      />

      {/* Subheader with Mark All Read */}
      <View style={[styles.subHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        <Text style={styles.subHeaderText}>
          {t('Stay updated on your health', 'تابع آخر مستجدات مواعيدك')}
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={markAllNotificationsRead}
          style={[styles.markAllBtn, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
        >
          <CheckCheck size={14} color={Colors.primary} />
          <Text style={styles.markAllText}>{t('Mark all as read', 'تحديد الكل كمقروء')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {notifications.map((n) => (
          <TouchableOpacity
            key={n.id}
            activeOpacity={0.8}
            onPress={() => {
              markNotificationRead(n.id);
              if (n.actionScreen) navigateTo(n.actionScreen);
            }}
            style={[
              styles.notifCard,
              !n.read && styles.notifCardUnread,
              { flexDirection: isRtl ? 'row-reverse' : 'row' },
            ]}
          >
            <View style={[styles.iconWrap, { backgroundColor: getBgColor(n.type) }]}>
              {getIcon(n.type)}
            </View>

            <View style={[styles.notifInfo, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
              <View style={[styles.titleRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.notifTitle, !n.read && styles.notifTitleUnread]}>
                  {t(n.title, n.titleAr)}
                </Text>
                {!n.read && <View style={styles.unreadDot} />}
              </View>

              <Text style={[styles.notifMessage, { textAlign: isRtl ? 'right' : 'left' }]}>
                {t(n.message, n.messageAr)}
              </Text>

              <View style={[styles.notifFooter, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <Text style={styles.notifTime}>{t(n.timestamp, n.timestampAr)}</Text>
                <View style={[styles.viewLink, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <Text style={styles.viewLinkText}>{t('View', 'عرض')}</Text>
                  <Chevron size={12} color={Colors.primary} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  subHeader: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate[100],
  },
  subHeaderText: {
    fontSize: 11,
    color: Colors.slate[500],
  },
  markAllBtn: {
    alignItems: 'center',
    gap: 4,
  },
  markAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  scrollContent: {
    padding: 16,
    gap: 10,
  },
  notifCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    alignItems: 'flex-start',
    gap: 12,
    ...Shadows.sm,
  },
  notifCardUnread: {
    backgroundColor: Colors.primaryBg,
    borderColor: Colors.primarySubtle,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifInfo: {
    flex: 1,
  },
  titleRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.slate[900],
    flex: 1,
  },
  notifTitleUnread: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: 6,
  },
  notifMessage: {
    fontSize: 11,
    color: Colors.slate[600],
    lineHeight: 16,
    marginTop: 4,
  },
  notifFooter: {
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: Colors.slate[100],
    paddingTop: 8,
    marginTop: 8,
  },
  notifTime: {
    fontSize: 10,
    color: Colors.slate[400],
  },
  viewLink: {
    alignItems: 'center',
    gap: 2,
  },
  viewLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
});

