import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Video,
  Phone,
  Building2,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  User,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { DOCTORS } from '../../data/mockData';
import { ConsultationType, Appointment } from '../../types';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/styles';

export const BookingFlowModal: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    selectedDoctor,
    bookingDraft,
    addAppointment,
    navigateTo,
    user,
    isRtl,
    t,
  } = useApp();

  const doctor = bookingDraft.doctor || selectedDoctor || DOCTORS[0];

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [patientName, setPatientName] = useState<string>(user?.name || '');
  const [patientAge, setPatientAge] = useState<string>(user?.age?.toString() || '30');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female'>(
    user?.gender === 'Female' ? 'Female' : 'Male'
  );
  const [symptoms, setSymptoms] = useState<string>('Routine health check and medical consultation.');
  const [consultationType, setConsultationType] = useState<ConsultationType>(
    bookingDraft.consultationType || 'video'
  );
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple' | 'insurance' | 'cash'>('card');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);

  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const consultationFee = doctor.fee;
  const serviceFee = 15;
  const totalFee = consultationFee + serviceFee;

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    try {
      const newAptData: Partial<Appointment> = {
        doctorId: doctor.id,
        doctor: doctor,
        date: bookingDraft.date || 'Thu, 23 Oct 2025',
        timeSlot: bookingDraft.timeSlot || '10:00 AM - 11:00 AM',
        consultationType,
        status: 'upcoming',
        patientName,
        patientAge: parseInt(patientAge, 10) || 30,
        patientGender,
        symptoms,
        consultationFee,
        serviceFee,
        totalFee,
        formattedFee: `SAR ${totalFee}`,
        formattedFeeAr: `${totalFee} ر.س`,
      };

      const created = await addAppointment(newAptData);
      setBookedAppointment(created);
      setIsSuccess(true);
    } catch (e) {
      console.log('Error creating appointment', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess && bookedAppointment) {
    return (
      <View style={[styles.container, styles.successContainer]}>
        <View style={styles.successCard}>
          <View style={styles.successIconCircle}>
            <CheckCircle2 size={48} color={Colors.accent} />
          </View>
          <Text style={styles.successTitle}>
            {t('Appointment Confirmed!', 'تم تأكيد الموعد بنجاح!')}
          </Text>
          <Text style={styles.successSub}>
            {t(
              `Your consultation with ${doctor.name} is booked for ${bookedAppointment.date} at ${bookedAppointment.timeSlot}.`,
              `تم حجز استشارتك مع ${doctor.nameAr} في ${bookedAppointment.date} الساعة ${bookedAppointment.timeSlot}.`
            )}
          </Text>

          <View style={styles.bookedDetailsCard}>
            <View style={[styles.bookedRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <Text style={styles.bookedLabel}>{t('Doctor', 'الطبيب')}:</Text>
              <Text style={styles.bookedValue}>{t(doctor.name, doctor.nameAr)}</Text>
            </View>
            <View style={[styles.bookedRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <Text style={styles.bookedLabel}>{t('Type', 'النوع')}:</Text>
              <Text style={styles.bookedValue}>{consultationType.toUpperCase()}</Text>
            </View>
            <View style={[styles.bookedRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <Text style={styles.bookedLabel}>{t('Total Paid', 'المبلغ')}:</Text>
              <Text style={[styles.bookedValue, { color: Colors.primary, fontWeight: '800' }]}>
                {t(`SAR ${totalFee}`, `${totalFee} ر.س`)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigateTo('my_appointments')}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>
              {t('View My Appointments', 'عرض مواعيدي')}
            </Text>
          </TouchableOpacity>

          {consultationType === 'video' && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigateTo('video_consultation', { appointment: bookedAppointment })}
              style={styles.secondaryBtn}
            >
              <Text style={styles.secondaryBtnText}>
                {t('Test Video Room', 'تجربة غرفة الفيديو')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Book Appointment"
        titleAr="حجز موعد استشارة"
        rightAction="language"
      />

      {/* Progress Steps Indicator */}
      <View style={styles.stepProgressContainer}>
        <View style={[styles.stepRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          {[1, 2, 3].map((s) => {
            const isCompleted = step > s;
            const isCurrent = step === s;
            return (
              <React.Fragment key={s}>
                <View
                  style={[
                    styles.stepCircle,
                    isCompleted && styles.stepCircleCompleted,
                    isCurrent && styles.stepCircleCurrent,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNum,
                      (isCompleted || isCurrent) && styles.stepNumActive,
                    ]}
                  >
                    {s}
                  </Text>
                </View>
                {s < 3 && (
                  <View
                    style={[
                      styles.stepLine,
                      step > s && styles.stepLineCompleted,
                    ]}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>
        <Text style={styles.stepLabel}>
          {step === 1 && t('Step 1: Patient Information', 'الخطوة 1: بيانات المريض')}
          {step === 2 && t('Step 2: Consultation Type', 'الخطوة 2: نوع الاستشارة')}
          {step === 3 && t('Step 3: Payment & Summary', 'الخطوة 3: الدفع والتأكيد')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Doctor Summary Banner */}
        <View style={[styles.docBanner, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <Image source={{ uri: doctor.avatar }} style={styles.docBannerAvatar} />
          <View style={[styles.docBannerInfo, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
            <Text style={styles.docBannerName}>{t(doctor.name, doctor.nameAr)}</Text>
            <Text style={styles.docBannerSpecialty}>{t(doctor.specialty, doctor.specialtyAr)}</Text>
            <View style={[styles.docBannerSchedule, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <Calendar size={12} color={Colors.primary} />
              <Text style={styles.docBannerScheduleText}>
                {bookingDraft.date || 'Thu, 23 Oct 2025'} • {bookingDraft.timeSlot || '10:00 AM'}
              </Text>
            </View>
          </View>
        </View>

        {/* Step 1: Patient Details */}
        {step === 1 && (
          <View style={styles.stepCard}>
            <Text style={[styles.formHeading, { textAlign: isRtl ? 'right' : 'left' }]}>
              {t('Patient Details', 'بيانات المريض')}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { textAlign: isRtl ? 'right' : 'left' }]}>
                {t('Full Name', 'الاسم الكامل')}
              </Text>
              <TextInput
                value={patientName}
                onChangeText={setPatientName}
                style={[styles.textInput, { textAlign: isRtl ? 'right' : 'left' }]}
              />
            </View>

            <View style={[styles.inputRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { textAlign: isRtl ? 'right' : 'left' }]}>
                  {t('Age', 'العمر')}
                </Text>
                <TextInput
                  value={patientAge}
                  onChangeText={setPatientAge}
                  keyboardType="numeric"
                  style={[styles.textInput, { textAlign: isRtl ? 'right' : 'left' }]}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1.5 }]}>
                <Text style={[styles.inputLabel, { textAlign: isRtl ? 'right' : 'left' }]}>
                  {t('Gender', 'الجنس')}
                </Text>
                <View style={[styles.genderRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setPatientGender('Male')}
                    style={[
                      styles.genderBtn,
                      patientGender === 'Male' && styles.genderBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.genderBtnText,
                        patientGender === 'Male' && styles.genderBtnTextActive,
                      ]}
                    >
                      {t('Male', 'ذكر')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setPatientGender('Female')}
                    style={[
                      styles.genderBtn,
                      patientGender === 'Female' && styles.genderBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.genderBtnText,
                        patientGender === 'Female' && styles.genderBtnTextActive,
                      ]}
                    >
                      {t('Female', 'أنثى')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { textAlign: isRtl ? 'right' : 'left' }]}>
                {t('Symptoms / Medical Reason', 'الأعراض أو سبب الاستشارة')}
              </Text>
              <TextInput
                value={symptoms}
                onChangeText={setSymptoms}
                multiline
                numberOfLines={3}
                style={[styles.textArea, { textAlign: isRtl ? 'right' : 'left' }]}
              />
            </View>
          </View>
        )}

        {/* Step 2: Consultation Type */}
        {step === 2 && (
          <View style={styles.stepCard}>
            <Text style={[styles.formHeading, { textAlign: isRtl ? 'right' : 'left' }]}>
              {t('Select Consultation Type', 'اختر نوع الاستشارة')}
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setConsultationType('video')}
              style={[
                styles.typeOption,
                consultationType === 'video' && styles.typeOptionActive,
                { flexDirection: isRtl ? 'row-reverse' : 'row' },
              ]}
            >
              <View style={[styles.typeIconWrap, { backgroundColor: Colors.primarySubtle }]}>
                <Video size={22} color={Colors.primary} />
              </View>
              <View style={[styles.typeInfo, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
                <Text style={styles.typeTitle}>{t('Video Call', 'مكالمة فيديو')}</Text>
                <Text style={styles.typeSub}>{t('HD video with doctor & chat', 'استشارة مرئية مباشرة عالية الدقة')}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setConsultationType('audio')}
              style={[
                styles.typeOption,
                consultationType === 'audio' && styles.typeOptionActive,
                { flexDirection: isRtl ? 'row-reverse' : 'row' },
              ]}
            >
              <View style={[styles.typeIconWrap, { backgroundColor: Colors.accentLight }]}>
                <Phone size={22} color={Colors.accent} />
              </View>
              <View style={[styles.typeInfo, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
                <Text style={styles.typeTitle}>{t('Voice Call', 'مكالمة صوتية')}</Text>
                <Text style={styles.typeSub}>{t('High quality audio consultation', 'استشارة صوتية واضحة')}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setConsultationType('clinic')}
              style={[
                styles.typeOption,
                consultationType === 'clinic' && styles.typeOptionActive,
                { flexDirection: isRtl ? 'row-reverse' : 'row' },
              ]}
            >
              <View style={[styles.typeIconWrap, { backgroundColor: Colors.purpleLight }]}>
                <Building2 size={22} color={Colors.purple} />
              </View>
              <View style={[styles.typeInfo, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
                <Text style={styles.typeTitle}>{t('In-Clinic Visit', 'زيارة العيادة')}</Text>
                <Text style={styles.typeSub}>{t('Meet doctor at physical clinic', 'حضور شخصي إلى مركز العيادات')}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: Payment Method & Fee Breakdown */}
        {step === 3 && (
          <View style={styles.stepCard}>
            <Text style={[styles.formHeading, { textAlign: isRtl ? 'right' : 'left' }]}>
              {t('Payment Method', 'طريقة الدفع')}
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setPaymentMethod('card')}
              style={[
                styles.paymentOption,
                paymentMethod === 'card' && styles.paymentOptionActive,
                { flexDirection: isRtl ? 'row-reverse' : 'row' },
              ]}
            >
              <CreditCard size={20} color={Colors.primary} />
              <Text style={styles.paymentOptionText}>{t('Credit / Debit Card (Mada / Visa)', 'بطاقة مدى / فيزا')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setPaymentMethod('apple')}
              style={[
                styles.paymentOption,
                paymentMethod === 'apple' && styles.paymentOptionActive,
                { flexDirection: isRtl ? 'row-reverse' : 'row' },
              ]}
            >
              <ShieldCheck size={20} color={Colors.accent} />
              <Text style={styles.paymentOptionText}>{t('Apple Pay / Google Pay', 'أبل باي / جوجل باي')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setPaymentMethod('insurance')}
              style={[
                styles.paymentOption,
                paymentMethod === 'insurance' && styles.paymentOptionActive,
                { flexDirection: isRtl ? 'row-reverse' : 'row' },
              ]}
            >
              <ShieldCheck size={20} color={Colors.purple} />
              <Text style={styles.paymentOptionText}>
                {t('Health Insurance (Bupa Gold)', 'التأمين الطبي (بوبا الفئة الذهبية)')}
              </Text>
            </TouchableOpacity>

            {/* Fee Breakdown */}
            <View style={styles.feeBreakdown}>
              <Text style={[styles.feeBreakdownTitle, { textAlign: isRtl ? 'right' : 'left' }]}>
                {t('Payment Summary', 'ملخص الفاتورة')}
              </Text>

              <View style={[styles.feeRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <Text style={styles.feeSubLabel}>{t('Consultation Fee', 'أتعاب الاستشارة')}</Text>
                <Text style={styles.feeSubVal}>SAR {consultationFee}</Text>
              </View>
              <View style={[styles.feeRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <Text style={styles.feeSubLabel}>{t('Platform Service Fee', 'رسوم المنصة والضريبة')}</Text>
                <Text style={styles.feeSubVal}>SAR {serviceFee}</Text>
              </View>
              <View style={[styles.totalFeeRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <Text style={styles.totalFeeLabel}>{t('Total Amount', 'المبلغ الإجمالي')}</Text>
                <Text style={styles.totalFeeVal}>{t(`SAR ${totalFee}`, `${totalFee} ر.س`)}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Navigation Buttons at Bottom */}
      <View
        style={[
          styles.bottomNavButtons,
          {
            paddingBottom: Math.max(insets.bottom, 12),
            flexDirection: isRtl ? 'row-reverse' : 'row',
          },
        ]}
      >
        {step > 1 ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setStep((s) => (s - 1) as any)}
            style={styles.backStepBtn}
          >
            <Text style={styles.backStepText}>{t('Back', 'السابق')}</Text>
          </TouchableOpacity>
        ) : null}

        {step < 3 ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setStep((s) => (s + 1) as any)}
            style={[styles.nextStepBtn, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
          >
            <Text style={styles.nextStepText}>{t('Continue', 'التالي')}</Text>
            <Arrow size={16} color={Colors.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleConfirmBooking}
            disabled={isSubmitting}
            style={styles.confirmBtn}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.confirmBtnText}>
                {t('Pay & Confirm Booking', 'دفع وتأكيد الحجز')}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    ...Shadows.lg,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.slate[900],
    marginBottom: 8,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 13,
    color: Colors.slate[600],
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  bookedDetailsCard: {
    backgroundColor: Colors.slate[50],
    borderRadius: 16,
    padding: 14,
    width: '100%',
    gap: 8,
    marginBottom: 20,
  },
  bookedRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookedLabel: {
    fontSize: 12,
    color: Colors.slate[500],
  },
  bookedValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.slate[800],
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: Colors.primarySubtle,
    borderRadius: 14,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  stepProgressContainer: {
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate[100],
  },
  stepRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleCurrent: {
    backgroundColor: Colors.primary,
  },
  stepCircleCompleted: {
    backgroundColor: Colors.accent,
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate[500],
  },
  stepNumActive: {
    color: Colors.white,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.slate[200],
    marginHorizontal: 8,
  },
  stepLineCompleted: {
    backgroundColor: Colors.accent,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate[800],
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  docBanner: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    marginBottom: 14,
    ...Shadows.sm,
  },
  docBannerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },
  docBannerInfo: {
    flex: 1,
  },
  docBannerName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.slate[900],
  },
  docBannerSpecialty: {
    fontSize: 12,
    color: Colors.slate[500],
  },
  docBannerSchedule: {
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  docBannerScheduleText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  stepCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    ...Shadows.sm,
  },
  formHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.slate[900],
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputRow: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.slate[700],
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: Colors.slate[50],
    borderWidth: 1,
    borderColor: Colors.slate[200],
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    color: Colors.slate[900],
  },
  textArea: {
    backgroundColor: Colors.slate[50],
    borderWidth: 1,
    borderColor: Colors.slate[200],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 70,
    fontSize: 13,
    color: Colors.slate[900],
    textAlignVertical: 'top',
  },
  genderRow: {
    gap: 8,
  },
  genderBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.slate[50],
    borderWidth: 1,
    borderColor: Colors.slate[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderBtnActive: {
    backgroundColor: Colors.primarySubtle,
    borderColor: Colors.primary,
  },
  genderBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.slate[600],
  },
  genderBtnTextActive: {
    color: Colors.primary,
  },
  typeOption: {
    backgroundColor: Colors.slate[50],
    borderWidth: 1.5,
    borderColor: Colors.slate[200],
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  typeOptionActive: {
    backgroundColor: Colors.primaryBg,
    borderColor: Colors.primary,
  },
  typeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeInfo: {
    flex: 1,
  },
  typeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.slate[900],
  },
  typeSub: {
    fontSize: 11,
    color: Colors.slate[500],
    marginTop: 2,
  },
  paymentOption: {
    backgroundColor: Colors.slate[50],
    borderWidth: 1.5,
    borderColor: Colors.slate[200],
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  paymentOptionActive: {
    backgroundColor: Colors.primaryBg,
    borderColor: Colors.primary,
  },
  paymentOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.slate[800],
    flex: 1,
  },
  feeBreakdown: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.slate[100],
  },
  feeBreakdownTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.slate[800],
    marginBottom: 10,
  },
  feeRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  feeSubLabel: {
    fontSize: 12,
    color: Colors.slate[500],
  },
  feeSubVal: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.slate[700],
  },
  totalFeeRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.slate[200],
  },
  totalFeeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.slate[900],
  },
  totalFeeVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  bottomNavButtons: {
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
  backStepBtn: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: Colors.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  backStepText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.slate[700],
  },
  nextStepBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  nextStepText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});

