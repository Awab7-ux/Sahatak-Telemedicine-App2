import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  FileText,
  RotateCcw,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { AppointmentStatus, Appointment } from '../../types';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/styles';

export const MyAppointmentsScreen: React.FC = () => {
  const {
    appointments,
    cancelAppointment,
    navigateTo,
    setActiveAppointment,
    isRtl,
    t,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<AppointmentStatus>('upcoming');

  const filtered = appointments.filter((apt) => apt.status === activeFilter);

  const handleJoinCall = (apt: Appointment) => {
    setActiveAppointment(apt);
    navigateTo('video_consultation');
  };

  const handleChat = (apt: Appointment) => {
    navigateTo('chat_doctor', { chatDoctor: apt.doctor });
  };

  return (
    <View style={styles.container}>
      <Header
        title="My Appointments"
        titleAr="مواعيدي الطبية"
        rightAction="none"
      />

      {/* Tabs Filter */}
      <View style={styles.tabsSection}>
        <View style={[styles.tabsRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          {(['upcoming', 'completed', 'cancelled'] as AppointmentStatus[]).map((status) => {
            const isActive = activeFilter === status;
            const count = appointments.filter((a) => a.status === status).length;
            const labels = {
              upcoming: { en: 'Upcoming', ar: 'القادمة' },
              completed: { en: 'Completed', ar: 'المكتملة' },
              cancelled: { en: 'Cancelled', ar: 'الملغاة' },
            };

            return (
              <TouchableOpacity
                key={status}
                activeOpacity={0.7}
                onPress={() => setActiveFilter(status)}
                style={[
                  styles.filterTab,
                  isActive && styles.filterTabActive,
                  { flexDirection: isRtl ? 'row-reverse' : 'row' },
                ]}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    isActive && styles.filterTabTextActive,
                  ]}
                >
                  {t(labels[status].en, labels[status].ar)}
                </Text>
                <Text
                  style={[
                    styles.countBadge,
                    isActive ? { color: Colors.primarySubtle } : { color: Colors.slate[400] },
                  ]}
                >
                  ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Appointment Cards */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Calendar size={36} color={Colors.slate[400]} />
            </View>
            <Text style={styles.emptyText}>
              {t(`No ${activeFilter} appointments found.`, `لا توجد مواعيد ${activeFilter === 'upcoming' ? 'قادمة' : 'مسجلة'}.`)}
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigateTo('doctors')}
              style={styles.bookNowBtn}
            >
              <Text style={styles.bookNowText}>{t('Book a Doctor Now', 'حجز موعد مع طبيب')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((apt) => (
            <View key={apt.id} style={styles.aptCard}>
              <View style={[styles.aptCardHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <Text style={styles.aptIdText}>#{apt.id}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    apt.status === 'upcoming'
                      ? styles.statusUpcoming
                      : apt.status === 'completed'
                      ? styles.statusCompleted
                      : styles.statusCancelled,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      apt.status === 'upcoming'
                        ? { color: Colors.primaryDark }
                        : apt.status === 'completed'
                        ? { color: Colors.accentDark }
                        : { color: Colors.dangerDark },
                    ]}
                  >
                    {apt.status === 'upcoming'
                      ? t('Confirmed', 'مؤكد')
                      : apt.status === 'completed'
                      ? t('Completed', 'مكتمل')
                      : t('Cancelled', 'ملغي')}
                  </Text>
                </View>
              </View>

              {/* Doctor Details */}
              <View style={[styles.doctorRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <Image source={{ uri: apt.doctor.avatar }} style={styles.doctorAvatar} />
                <View style={[styles.doctorInfo, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
                  <Text numberOfLines={1} style={styles.doctorName}>
                    {t(apt.doctor.name, apt.doctor.nameAr)}
                  </Text>
                  <Text numberOfLines={1} style={styles.doctorSpecialty}>
                    {t(apt.doctor.specialty, apt.doctor.specialtyAr)}
                  </Text>
                  <View style={[styles.scheduleRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <Calendar size={13} color={Colors.primary} />
                    <Text style={styles.scheduleText}>{apt.date}</Text>
                    <Text style={styles.dotSep}>•</Text>
                    <Clock size={13} color={Colors.primary} />
                    <Text style={styles.scheduleText}>{apt.timeSlot.split('-')[0]}</Text>
                  </View>
                </View>
              </View>

              {/* Consultation Type Info */}
              <View style={[styles.modeRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <Text style={styles.modeLabel}>{t('Consultation Mode', 'نوع الاستشارة')}:</Text>
                <View style={[styles.modeValueRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  {apt.consultationType === 'video' && (
                    <Video size={14} color={Colors.primary} />
                  )}
                  {apt.consultationType === 'chat' && (
                    <MessageSquare size={14} color={Colors.accent} />
                  )}
                  <Text style={styles.modeValueText}>
                    {apt.consultationType.toUpperCase()} {t('Consultation', 'استشارة')}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={[styles.cardActionsRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                {apt.status === 'upcoming' && (
                  <>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => handleJoinCall(apt)}
                      style={[styles.joinBtn, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
                    >
                      <Video size={16} color={Colors.white} />
                      <Text style={styles.joinBtnText}>{t('Join Video Call', 'دخول الاستشارة')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleChat(apt)}
                      style={styles.chatIconBtn}
                    >
                      <MessageSquare size={16} color={Colors.slate[700]} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => cancelAppointment(apt.id)}
                      style={styles.cancelBtn}
                    >
                      <Text style={styles.cancelText}>{t('Cancel', 'إلغاء')}</Text>
                    </TouchableOpacity>
                  </>
                )}

                {apt.status === 'completed' && (
                  <>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => navigateTo('medical_records')}
                      style={[styles.viewReportBtn, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
                    >
                      <FileText size={15} color={Colors.primaryDark} />
                      <Text style={styles.viewReportText}>
                        {t('View Prescription & Report', 'عرض الروشتة والتقرير')}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => navigateTo('doctor_detail', { doctor: apt.doctor })}
                      style={styles.rebookBtn}
                    >
                      <RotateCcw size={16} color={Colors.slate[700]} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabsSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate[100],
  },
  tabsRow: {
    gap: 8,
  },
  filterTab: {
    flex: 1,
    backgroundColor: Colors.slate[100],
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate[600],
  },
  filterTabTextActive: {
    color: Colors.white,
  },
  countBadge: {
    fontSize: 10,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    ...Shadows.sm,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: Colors.slate[500],
    textAlign: 'center',
  },
  bookNowBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  bookNowText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  aptCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    ...Shadows.sm,
    gap: 12,
  },
  aptCardHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aptIdText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.slate[400],
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusUpcoming: {
    backgroundColor: Colors.primarySubtle,
  },
  statusCompleted: {
    backgroundColor: Colors.accentLight,
  },
  statusCancelled: {
    backgroundColor: Colors.dangerLight,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  doctorRow: {
    alignItems: 'center',
    gap: 12,
  },
  doctorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.slate[100],
  },
  doctorInfo: {
    flex: 1,
    gap: 2,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.slate[900],
  },
  doctorSpecialty: {
    fontSize: 12,
    color: Colors.slate[500],
  },
  scheduleRow: {
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  scheduleText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  dotSep: {
    color: Colors.slate[300],
  },
  modeRow: {
    backgroundColor: Colors.slate[50],
    borderRadius: 12,
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeLabel: {
    fontSize: 11,
    color: Colors.slate[500],
  },
  modeValueRow: {
    alignItems: 'center',
    gap: 6,
  },
  modeValueText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.slate[800],
  },
  cardActionsRow: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.slate[100],
    paddingTop: 10,
  },
  joinBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  joinBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  chatIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: Colors.dangerLight,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.danger,
  },
  viewReportBtn: {
    flex: 1,
    backgroundColor: Colors.primarySubtle,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  viewReportText: {
    color: Colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  rebookBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
});

