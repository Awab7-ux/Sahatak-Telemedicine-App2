import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ShieldCheck,
  Star,
  Users,
  Award,
  CreditCard,
  MapPin,
  Clock,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { DOCTORS } from '../../data/mockData';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/styles';

export const DoctorDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    selectedDoctor,
    favorites,
    toggleFavoriteDoctor,
    navigateTo,
    setBookingDraft,
    isRtl,
    t,
  } = useApp();

  const doctor = selectedDoctor || DOCTORS[0];
  const isFav = favorites.includes(doctor.id);

  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(
    doctor.timeSlots.find((s) => s.available)?.time || doctor.timeSlots[0].time
  );

  const currentDay = doctor.availableDays[selectedDayIdx] || doctor.availableDays[0];

  const handleStartBooking = () => {
    setBookingDraft({
      doctorId: doctor.id,
      doctor: doctor,
      date: currentDay.fullDate,
      timeSlot: selectedTimeSlot,
      consultationType: 'video',
      consultationFee: doctor.fee,
      serviceFee: 15,
      totalFee: doctor.fee + 15,
    });
    navigateTo('booking');
  };

  return (
    <View style={styles.container}>
      {/* Floating Header */}
      <Header
        showBack={true}
        rightAction="favorite"
        isFavorite={isFav}
        onToggleFavorite={() => toggleFavoriteDoctor(doctor.id)}
        transparent={true}
        whiteText={true}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Blue Doctor Profile Hero Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroInner}>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: doctor.avatar }} style={styles.avatarImg} />
            </View>

            <View style={[styles.heroNameRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <Text style={styles.doctorName}>
                {t(doctor.name, doctor.nameAr)}
              </Text>
              {doctor.isVerified && (
                <ShieldCheck size={18} color="#38bdf8" />
              )}
            </View>

            <Text style={styles.doctorSpecialty}>
              {t(doctor.specialty, doctor.specialtyAr)}
            </Text>

            <View style={[styles.heroMetaRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View style={[styles.heroMetaItem, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <Star size={14} color="#fde047" fill="#fde047" />
                <Text style={styles.heroMetaBold}>{doctor.rating}</Text>
                <Text style={styles.heroMetaMuted}>({doctor.reviewsCount})</Text>
              </View>
              <Text style={styles.heroDot}>•</Text>
              <View style={[styles.heroMetaItem, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <MapPin size={13} color="#bae6fd" />
                <Text numberOfLines={1} style={styles.heroMetaMuted}>
                  {t(doctor.location, doctor.locationAr)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 4 Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statsRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <View style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.primarySubtle }]}>
                <Award size={18} color={Colors.primary} />
              </View>
              <Text style={styles.statLabel}>{t('Experience', 'الخبرة')}</Text>
              <Text style={styles.statValue}>{doctor.experienceYears}+ {t('Yrs', 'سنة')}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.accentLight }]}>
                <Users size={18} color={Colors.accent} />
              </View>
              <Text style={styles.statLabel}>{t('Patients', 'المرضى')}</Text>
              <Text style={styles.statValue}>{doctor.patientsCount}+</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.warningLight }]}>
                <Star size={18} color={Colors.warning} fill={Colors.warning} />
              </View>
              <Text style={styles.statLabel}>{t('Rating', 'التقييم')}</Text>
              <Text style={styles.statValue}>{doctor.rating}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.purpleLight }]}>
                <CreditCard size={18} color={Colors.purple} />
              </View>
              <Text style={styles.statLabel}>{t('Fee', 'الكشف')}</Text>
              <Text numberOfLines={1} style={[styles.statValue, { color: Colors.primary, fontSize: 11 }]}>
                {t(doctor.feeFormatted, doctor.feeFormattedAr)}
              </Text>
            </View>
          </View>
        </View>

        {/* About Doctor */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: isRtl ? 'right' : 'left' }]}>
            {t('About Doctor', 'نبذة عن الطبيب')}
          </Text>
          <View style={styles.aboutCard}>
            <Text style={[styles.aboutText, { textAlign: isRtl ? 'right' : 'left' }]}>
              {t(doctor.about, doctor.aboutAr)}
            </Text>
            <View style={[styles.clinicRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View style={styles.clinicDot} />
              <Text style={styles.clinicLabel}>{t('Associated with', 'مستشفى الممارسة')}:</Text>
              <Text style={styles.clinicName}>{t(doctor.clinicName, doctor.clinicNameAr)}</Text>
            </View>
          </View>
        </View>

        {/* Available Schedule */}
        <View style={styles.section}>
          <View style={[styles.scheduleHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <Text style={styles.sectionTitle}>
              {t('Available Schedule', 'المواعيد المتاحة')}
            </Text>
            <Text style={styles.monthText}>October 2025</Text>
          </View>

          {/* Date Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.dateScroll, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
          >
            {doctor.availableDays.map((dayObj, idx) => {
              const isSelected = selectedDayIdx === idx;
              return (
                <TouchableOpacity
                  key={dayObj.date}
                  activeOpacity={0.7}
                  onPress={() => setSelectedDayIdx(idx)}
                  disabled={!dayObj.available}
                  style={[
                    styles.datePill,
                    isSelected && styles.datePillSelected,
                    !dayObj.available && styles.datePillDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.dateDayText,
                      isSelected && { color: Colors.primarySubtle },
                      !dayObj.available && { color: Colors.slate[400] },
                    ]}
                  >
                    {t(dayObj.day, dayObj.dayAr)}
                  </Text>
                  <Text
                    style={[
                      styles.dateNumText,
                      isSelected && { color: Colors.white },
                      !dayObj.available && { color: Colors.slate[400] },
                    ]}
                  >
                    {dayObj.date.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Time Slots */}
          <View style={styles.timeSlotsContainer}>
            <Text style={[styles.slotsHeading, { textAlign: isRtl ? 'right' : 'left' }]}>
              {t('Available Slots for', 'الأوقات المتاحة ليوم')}{' '}
              {t(currentDay.day, currentDay.dayAr)}, {currentDay.date}
            </Text>

            {doctor.timeSlots.map((slot) => {
              const isSelected = selectedTimeSlot === slot.time;
              return (
                <TouchableOpacity
                  key={slot.time}
                  activeOpacity={0.7}
                  onPress={() => slot.available && setSelectedTimeSlot(slot.time)}
                  disabled={!slot.available}
                  style={[
                    styles.slotBtn,
                    isSelected && slot.available && styles.slotBtnSelected,
                    !slot.available && styles.slotBtnDisabled,
                    { flexDirection: isRtl ? 'row-reverse' : 'row' },
                  ]}
                >
                  <View style={[styles.slotTimeRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <Clock size={16} color={isSelected ? Colors.primary : Colors.slate[400]} />
                    <Text
                      style={[
                        styles.slotTimeText,
                        isSelected && { color: Colors.primaryDark, fontWeight: '700' },
                      ]}
                    >
                      {slot.time}
                    </Text>
                  </View>

                  <View style={[styles.slotStatusRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: slot.available ? Colors.accent : Colors.slate[400] },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: slot.available ? Colors.accentDark : Colors.slate[400] },
                      ]}
                    >
                      {slot.available ? t('Available', 'متاح') : t('Booked', 'محجوز')}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View
        style={[
          styles.bottomActionBar,
          {
            paddingBottom: Math.max(insets.bottom, 12),
            flexDirection: isRtl ? 'row-reverse' : 'row',
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigateTo('chat_doctor', { chatDoctor: doctor })}
          style={styles.chatActionBtn}
        >
          <MessageSquare size={20} color={Colors.slate[700]} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleStartBooking}
          style={styles.bookActionBtn}
        >
          <Text style={styles.bookActionBtnText}>
            {t('Book Appointment', 'احجز موعدك الآن')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroCard: {
    backgroundColor: '#0284c7',
    paddingTop: 70,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInner: {
    alignItems: 'center',
  },
  avatarWrap: {
    width: 100,
    height: 100,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  heroNameRow: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
  },
  doctorSpecialty: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e0f2fe',
    marginBottom: 8,
  },
  heroMetaRow: {
    alignItems: 'center',
    gap: 8,
  },
  heroMetaItem: {
    alignItems: 'center',
    gap: 4,
  },
  heroMetaBold: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  heroMetaMuted: {
    fontSize: 12,
    color: '#bae6fd',
  },
  heroDot: {
    color: 'rgba(255,255,255,0.5)',
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginTop: -20,
    zIndex: 10,
  },
  statsRow: {
    justifyContent: 'space-between',
  },
  statCard: {
    width: '23%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.slate[100],
    ...Shadows.sm,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.slate[400],
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate[900],
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.slate[900],
    marginBottom: 10,
  },
  aboutCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    ...Shadows.sm,
  },
  aboutText: {
    fontSize: 13,
    color: Colors.slate[600],
    lineHeight: 20,
  },
  clinicRow: {
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.slate[100],
    paddingTop: 10,
    marginTop: 12,
  },
  clinicDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  clinicLabel: {
    fontSize: 11,
    color: Colors.slate[500],
  },
  clinicName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.slate[800],
    flexShrink: 1,
  },
  scheduleHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  monthText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  dateScroll: {
    gap: 10,
    paddingBottom: 6,
  },
  datePill: {
    width: 58,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.slate[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Shadows.md,
  },
  datePillDisabled: {
    backgroundColor: Colors.slate[100],
    borderColor: Colors.slate[200],
    opacity: 0.6,
  },
  dateDayText: {
    fontSize: 11,
    color: Colors.slate[500],
    fontWeight: '500',
  },
  dateNumText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.slate[900],
    marginTop: 2,
  },
  timeSlotsContainer: {
    marginTop: 14,
    gap: 8,
  },
  slotsHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate[700],
    marginBottom: 4,
  },
  slotBtn: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.slate[200],
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotBtnSelected: {
    backgroundColor: Colors.primaryBg,
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  slotBtnDisabled: {
    backgroundColor: Colors.slate[50],
    borderColor: Colors.slate[200],
    opacity: 0.6,
  },
  slotTimeRow: {
    alignItems: 'center',
    gap: 8,
  },
  slotTimeText: {
    fontSize: 13,
    color: Colors.slate[800],
    fontWeight: '600',
  },
  slotStatusRow: {
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.slate[100],
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
    alignItems: 'center',
    ...Shadows.lg,
  },
  chatActionBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookActionBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});

