import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  FileText,
  Stethoscope,
  ClipboardList,
  Pill,
  ArrowRight,
  CalendarPlus,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  WifiOff,
  ShieldAlert,
  CalendarX2,
  CalendarCheck2,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import {
  DiagnosisApiRecord,
  Prescription,
  fetchPatientDiagnosesApi,
  fetchPrescriptionsApi,
} from '../../api/records';
import { ApiError } from '../../api/client';
import { Appointment } from '../../types';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/styles';
import { SkeletonBlock } from '../ui/Skeleton';

/**
 * Care Summary â€” post-consultation "Understand" stage screen.
 *
 * IA order (fixed): Consultation Info â†’ Doctor Info â†’ Clinical Info â†’
 * Prescription â†’ Next Steps â†’ Follow-Up. Sections are collapsed by default.
 *
 * HARD RULE: only fields literally returned by the backend endpoints are
 * rendered (Diagnosis.to_dict, ConsultationSession.to_dict fields,
 * Prescription items). Nothing is generated, inferred, or summarized.
 *
 * All 11 states are handled explicitly:
 *  1. completed (full data)      7. cancelled appointment
 *  2. notes pending              8. loading
 *  3. prescription available     9. API failure + retry
 *  4. no prescription           10. offline
 *  5. follow-up available       11. unauthorized
 *  6. follow-up unavailable
 */

export interface SummaryData {
  appointment: Appointment | null;
  diagnosis: DiagnosisApiRecord | null;
  prescriptions: Prescription[];
}

type ErrorKind = 'unauthorized' | 'offline' | 'failure' | null;

function classifyError(err: unknown): ErrorKind {
  if (err instanceof ApiError) {
    if (err.status === 401 || err.status === 403) return 'unauthorized';
    if (err.status === null || err.message === 'Network Error') return 'offline';
    return 'failure';
  }
  return 'failure';
}
export const CareSummaryScreen: React.FC<{
  route?: { params?: { appointmentId?: string } };
}> = ({ route }) => {
  const { user, appointments, navigateTo, isRtl, t } = useApp();
  const appointmentId = route?.params?.appointmentId;

  const [loading, setLoading] = useState(true);
  const [errorKind, setErrorKind] = useState<ErrorKind>(null);
  const [data, setData] = useState<SummaryData>({
    appointment: null,
    diagnosis: null,
    prescriptions: [],
  });
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    if (!user?.id) {
      setErrorKind('unauthorized');
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorKind(null);
    try {
      const [diagnoses, prescriptions] = await Promise.all([
        fetchPatientDiagnosesApi(user.id),
        fetchPrescriptionsApi(),
      ]);

      const appointment =
        appointments.find((a) => String(a.id) === String(appointmentId ?? '')) ?? null;

      // Match a doctor-created diagnosis to this appointment when possible;
      // otherwise use the most recent diagnosis (backend returns newest first).
      const diagnosis =
        (appointmentId
          ? diagnoses.find((d) => String(d.appointment_id ?? '') === String(appointmentId))
          : undefined) ??
        diagnoses[0] ??
        null;

      const appointmentRxId = appointment?.prescriptionId;
      const rx = prescriptions.filter((p) => {
        const rxApptId = (p as { appointment_id?: unknown }).appointment_id;
        if (appointment && rxApptId != null) {
          return String(rxApptId) === String(appointment.id);
        }
        if (appointmentRxId) {
          return String(p.id) === String(appointmentRxId);
        }
        return false;
      });

      setData({ appointment, diagnosis, prescriptions: rx });
    } catch (err) {
      setErrorKind(classifyError(err));
    } finally {
      setLoading(false);
    }
  }, [user?.id, appointments, appointmentId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const Section: React.FC<{
    id: string;
    icon: React.ReactNode;
    title: string;
    titleAr: string;
    summary?: string;
    children: React.ReactNode;
  }> = ({ id, icon, title, titleAr, summary, children }) => {
    const open = !!openSections[id];
    return (
      <View style={styles.sectionCard}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => toggle(id)}
          style={[styles.sectionHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={t(title, titleAr)}
        >
          {icon}
          <View style={[styles.sectionHeaderTextWrap, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
            <Text style={styles.sectionTitle}>{t(title, titleAr)}</Text>
            {summary ? <Text numberOfLines={1} style={styles.sectionSummary}>{summary}</Text> : null}
          </View>
          {open ? (
            <ChevronUp size={18} color={Colors.slate[500]} />
          ) : (
            <ChevronDown size={18} color={Colors.slate[500]} />
          )}
        </TouchableOpacity>
        {open ? <View style={styles.sectionBody}>{children}</View> : null}
      </View>
    );
  };

  // â”€â”€ 8. Loading â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Care Summary" titleAr="Ù…Ù„Ø®Øµ Ø§Ù„Ø±Ø¹Ø§ÙŠØ©" rightAction="none" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View
            accessible
            accessibilityRole="text"
            accessibilityLiveRegion="polite"
            accessibilityLabel={t('Loading your care summary', 'Ø¬Ø§Ø±Ù ØªØ­Ù…ÙŠÙ„ Ù…Ù„Ø®Øµ Ø§Ù„Ø±Ø¹Ø§ÙŠØ©')}
            style={styles.loadingWrap}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.sectionCard}>
                <SkeletonBlock width="55%" height={18} />
                <SkeletonBlock width="85%" height={13} />
                <SkeletonBlock width="70%" height={13} />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // â”€â”€ 10. Offline / 9. API failure / 11. Unauthorized â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (errorKind) {
    const offline = errorKind === 'offline';
    const unauthorized = errorKind === 'unauthorized';
    return (
      <View style={styles.container}>
        <Header title="Care Summary" titleAr="Ù…Ù„Ø®Øµ Ø§Ù„Ø±Ø¹Ø§ÙŠØ©" rightAction="none" />
        <View style={styles.centerState}>
          <View style={styles.stateIconWrap}>
            {offline ? (
              <WifiOff size={34} color={Colors.slate[500]} />
            ) : unauthorized ? (
              <ShieldAlert size={34} color={Colors.danger} />
            ) : (
              <FileText size={34} color={Colors.slate[500]} />
            )}
          </View>
          <Text style={styles.stateTitle}>
            {offline
              ? t('You appear to be offline', 'ÙŠØ¨Ø¯Ùˆ Ø£Ù†Ùƒ ØºÙŠØ± Ù…ØªØµÙ„ Ø¨Ø§Ù„Ø¥Ù†ØªØ±Ù†Øª')
              : unauthorized
              ? t('You are not authorized to view this', 'Ù„Ø§ ØªÙ…Ù„Ùƒ ØµÙ„Ø§Ø­ÙŠØ© Ø¹Ø±Ø¶ Ù‡Ø°Ø§ Ø§Ù„Ù…Ø­ØªÙˆÙ‰')
              : t('Something went wrong', 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ù…Ø§')}
          </Text>
          <Text style={styles.stateSub}>
            {offline
              ? t(
                  'Your care summary will load once you are back online. Nothing was lost.',
                  'Ø³ÙŠØªÙ… ØªØ­Ù…ÙŠÙ„ Ù…Ù„Ø®Øµ Ø§Ù„Ø±Ø¹Ø§ÙŠØ© Ø¹Ù†Ø¯ Ø¹ÙˆØ¯Ø© Ø§Ù„Ø§ØªØµØ§Ù„. Ù„Ù… ÙŠØªÙ… ÙÙ‚Ø¯Ø§Ù† Ø£ÙŠ Ø´ÙŠØ¡.',
                )
              : unauthorized
              ? t(
                  'Please sign in with your patient account to view your care summary.',
                  'ÙŠØ±Ø¬Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨Ø­Ø³Ø§Ø¨Ùƒ ÙƒÙ…Ø±ÙŠØ¶ Ù„Ø¹Ø±Ø¶ Ù…Ù„Ø®Øµ Ø§Ù„Ø±Ø¹Ø§ÙŠØ©.',
                )
              : t(
                  'We could not load your care summary right now. Please try again.',
                  'Ù„Ù… Ù†ØªÙ…ÙƒÙ† Ù…Ù† ØªØ­Ù…ÙŠÙ„ Ù…Ù„Ø®Øµ Ø§Ù„Ø±Ø¹Ø§ÙŠØ© Ø§Ù„Ø¢Ù†. Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.',
                )}
          </Text>
          {!unauthorized && (
            <TouchableOpacity activeOpacity={0.85} onPress={load} style={styles.retryBtn}>
              <RefreshCw size={16} color={Colors.white} />
              <Text style={styles.retryText}>{t('Try Again', 'Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø©')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  const appointment = data.appointment;
  const diagnosis = data.diagnosis;
  const prescriptions = data.prescriptions;
  const cancelled = appointment?.status === 'cancelled';

  const hasClinical =
    !!(diagnosis?.primary_diagnosis || diagnosis?.clinical_findings || diagnosis?.treatment_plan);
  const hasRx = prescriptions.length > 0 || !!diagnosis?.prescription;

  // Follow-up: derived ONLY from real backend flags. Advisory â€” the booking
  // API remains the real gate for whether a follow-up can actually be booked.
  const followUpRequired = Boolean(diagnosis?.follow_up_required);
  const followUpDate = diagnosis?.follow_up_date ?? null;
  const hasUpcomingWithSameDoctor =
    !!appointment &&
    appointments.some((a) => a.status === 'upcoming' && a.doctorId === appointment.doctorId);
  const followUpAvailable = followUpRequired && !hasUpcomingWithSameDoctor && !cancelled;

  // â”€â”€ 7. Cancelled â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (cancelled) {
    return (
      <View style={styles.container}>
        <Header title="Care Summary" titleAr="Ù…Ù„Ø®Øµ Ø§Ù„Ø±Ø¹Ø§ÙŠØ©" rightAction="none" />
        <View style={styles.centerState}>
          <View style={[styles.stateIconWrap, { backgroundColor: Colors.dangerLight }]}>
            <CalendarX2 size={34} color={Colors.danger} />
          </View>
          <Text style={styles.stateTitle}>
            {t('This appointment was cancelled', 'ØªÙ… Ø¥Ù„ØºØ§Ø¡ Ù‡Ø°Ø§ Ø§Ù„Ù…ÙˆØ¹Ø¯')}
          </Text>
          <Text style={styles.stateSub}>
            {t(
              'There is no care summary for a cancelled appointment. You can book a new consultation anytime.',
              'Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù…Ù„Ø®Øµ Ø±Ø¹Ø§ÙŠØ© Ù„Ù…ÙˆØ¹Ø¯ Ù…Ù„ØºÙŠ. ÙŠÙ…ÙƒÙ†Ùƒ Ø­Ø¬Ø² Ø§Ø³ØªØ´Ø§Ø±Ø© Ø¬Ø¯ÙŠØ¯Ø© ÙÙŠ Ø£ÙŠ ÙˆÙ‚Øª.',
            )}
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigateTo('doctors')}
            style={styles.retryBtn}
          >
            <Text style={styles.retryText}>{t('Find a Doctor', 'Ø§Ø¨Ø­Ø« Ø¹Ù† Ø·Ø¨ÙŠØ¨')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // â”€â”€ 2. Notes pending â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!hasClinical) {
    return (
      <View style={styles.container}>
        <Header title="Care Summary" titleAr="Ù…Ù„Ø®Øµ Ø§Ù„Ø±Ø¹Ø§ÙŠØ©" rightAction="none" />
        <View style={styles.centerState}>
          <View style={[styles.stateIconWrap, { backgroundColor: Colors.accentLight }]}>
            <ClipboardList size={34} color={Colors.accent} />
          </View>
          <Text style={styles.stateTitle}>
            {t('Your doctor is still preparing the notes', 'Ø·Ø¨ÙŠØ¨Ùƒ Ù…Ø§ Ø²Ø§Ù„ ÙŠÙØ¹Ø¯Ù‘ Ø§Ù„ØªÙ‚Ø±ÙŠØ±')}
          </Text>
          <Text style={styles.stateSub}>
            {t(
              'Your care summary will appear here as soon as your doctor adds the consultation notes. We will not show anything until then.',
              'Ø³ÙŠØ¸Ù‡Ø± Ù…Ù„Ø®Øµ Ø§Ù„Ø±Ø¹Ø§ÙŠØ© Ù‡Ù†Ø§ Ø¨Ù…Ø¬Ø±Ø¯ Ø£Ù† ÙŠØ¶ÙŠÙ Ø§Ù„Ø·Ø¨ÙŠØ¨ Ù…Ù„Ø§Ø­Ø¸Ø§Øª Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø©. Ù„Ù† Ù†Ø¹Ø±Ø¶ Ø£ÙŠ Ø´ÙŠØ¡ Ù‚Ø¨Ù„ Ø°Ù„Ùƒ.',
            )}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Care Summary" titleAr="Ù…Ù„Ø®Øµ Ø§Ù„Ø±Ø¹Ø§ÙŠØ©" rightAction="none" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. Completed banner */}
        <View style={[styles.doneBanner, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <CalendarCheck2 size={18} color={Colors.accent} />
          <Text style={styles.doneText}>
            {t('Consultation completed â€” here is your summary.', 'Ø§ÙƒØªÙ…Ù„Øª Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø© â€” Ù‡Ø°Ø§ Ù…Ù„Ø®ØµÙ‡Ø§.')}
          </Text>
        </View>

        {/* Consultation Info */}
        <Section id="consultation" icon={<FileText size={18} color={Colors.primary} />}
          title="Consultation Info" titleAr="Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø©">
          <Row label="Date" labelAr="Ø§Ù„ØªØ§Ø±ÙŠØ®" value={appointment?.date ?? ''} />
          <Row label="Time" labelAr="Ø§Ù„ÙˆÙ‚Øª" value={appointment?.timeSlot ?? ''} />
          <Row label="Type" labelAr="Ø§Ù„Ù†ÙˆØ¹" value={(appointment?.consultationType ?? '').toUpperCase()} />
          <Row label="Status" labelAr="Ø§Ù„Ø­Ø§Ù„Ø©" value={t('Completed', 'Ù…ÙƒØªÙ…Ù„')} />
          <Row
            label="Reason for visit"
            labelAr="Ø³Ø¨Ø¨ Ø§Ù„Ø²ÙŠØ§Ø±Ø©"
            value={appointment?.symptoms || t('Not provided', 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯')}
          />
        </Section>

        {/* Doctor Info */}
        <Section id="doctor" icon={<Stethoscope size={18} color={Colors.primary} />}
          title="Doctor Info" titleAr="Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø·Ø¨ÙŠØ¨">
          <Row label="Doctor" labelAr="Ø§Ù„Ø·Ø¨ÙŠØ¨" value={t(appointment?.doctor.name ?? diagnosis?.doctor_name ?? '', appointment?.doctor.nameAr ?? '')} />
          <Row label="Specialty" labelAr="Ø§Ù„ØªØ®ØµØµ" value={t(appointment?.doctor.specialty ?? '', appointment?.doctor.specialtyAr ?? '')} />
          <Row label="Clinic" labelAr="Ø§Ù„Ø¹ÙŠØ§Ø¯Ø©" value={t(appointment?.doctor.clinicName ?? '', appointment?.doctor.clinicNameAr ?? '')} />
          <Row label="Fee" labelAr="Ø§Ù„Ø£ØªØ¹Ø§Ø¨" value={appointment ? t(appointment.formattedFee, appointment.formattedFeeAr) : ''} />
        </Section>

        {/* Clinical Info â€” only real fields from Diagnosis.to_dict */}
        <Section id="clinical" icon={<ClipboardList size={18} color={Colors.primary} />}
          title="Clinical Info" titleAr="Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø·Ø¨ÙŠØ©"
          summary={diagnosis?.primary_diagnosis ?? undefined}>
          <Row label="Diagnosis" labelAr="Ø§Ù„ØªØ´Ø®ÙŠØµ" value={diagnosis?.primary_diagnosis ?? ''} />
          {diagnosis?.clinical_findings ? (
            <Row label="Clinical findings" labelAr="Ø§Ù„ÙØ­ÙˆØµØ§Øª Ø§Ù„Ø³Ø±ÙŠØ±ÙŠØ©" value={diagnosis.clinical_findings} />
          ) : null}
          {diagnosis?.treatment_plan ? (
            <Row label="Treatment plan" labelAr="Ø®Ø·Ø© Ø§Ù„Ø¹Ù„Ø§Ø¬" value={diagnosis.treatment_plan} />
          ) : null}
          <Row label="Recorded on" labelAr="ØªØ§Ø±ÙŠØ® Ø§Ù„ØªØ³Ø¬ÙŠÙ„" value={(diagnosis?.diagnosis_date ?? '').slice(0, 10)} />
        </Section>

        {/* Prescription â€” 3/4 states */}
        <Section id="prescription" icon={<Pill size={18} color={Colors.primary} />}
          title="Prescription" titleAr="Ø§Ù„ÙˆØµÙØ© Ø§Ù„Ø·Ø¨ÙŠØ©"
          summary={hasRx ? t(`${prescriptions.length} item(s)`, `${prescriptions.length} Ø¹Ù†ØµØ±`) : t('None', 'Ù„Ø§ ÙŠÙˆØ¬Ø¯')}>
          {hasRx ? (
            <>
              {prescriptions.map((p) => (
                <View key={String(p.id)} style={styles.rxItem}>
                  <Text style={styles.rxName}>{t(p.medication_name ?? '', p.medication_name ?? '')}</Text>
                  {p.dosage ? <Text style={styles.rxLine}>{t('Dosage', 'Ø§Ù„Ø¬Ø±Ø¹Ø©')}: {p.dosage}</Text> : null}
                  {p.frequency ? <Text style={styles.rxLine}>{t('Frequency', 'Ø§Ù„ØªÙƒØ±Ø§Ø±')}: {p.frequency}</Text> : null}
                  {p.duration ? <Text style={styles.rxLine}>{t('Duration', 'Ø§Ù„Ù…Ø¯Ø©')}: {p.duration}</Text> : null}
                  {p.instructions ? <Text style={styles.rxLine}>{t('Instructions', 'Ø§Ù„ØªØ¹Ù„ÙŠÙ…Ø§Øª')}: {p.instructions}</Text> : null}
                </View>
              ))}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigateTo('medical_records')}
                style={[styles.inlineBtn, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
              >
                <Text style={styles.inlineBtnText}>{t('View in Medical Records', 'Ø¹Ø±Ø¶ ÙÙŠ Ø§Ù„Ø³Ø¬Ù„ Ø§Ù„Ø·Ø¨ÙŠ')}</Text>
                {isRtl ? null : <ArrowRight size={14} color={Colors.primary} />}
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.emptySectionText}>
              {t(
                'No prescription was issued for this consultation.',
                'Ù„Ù… ÙŠØªÙ… Ø¥ØµØ¯Ø§Ø± ÙˆØµÙØ© Ø·Ø¨ÙŠØ© Ù„Ù‡Ø°Ù‡ Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø©.',
              )}
            </Text>
          )}
        </Section>

        {/* Next Steps â€” from treatment_plan / clinical_findings only */}
        <Section id="next_steps" icon={<ClipboardList size={18} color={Colors.primary} />}
          title="Next Steps" titleAr="Ø§Ù„Ø®Ø·ÙˆØ§Øª Ø§Ù„ØªØ§Ù„ÙŠØ©">
          <Text style={styles.bodyText}>
            {diagnosis?.treatment_plan ||
              diagnosis?.clinical_findings ||
              t(
                'Your doctor has not added any next steps yet.',
                'Ù„Ù… ÙŠØ¶Ù Ø·Ø¨ÙŠØ¨Ùƒ Ø£ÙŠ Ø®Ø·ÙˆØ§Øª ØªØ§Ù„ÙŠØ© Ø¨Ø¹Ø¯.',
              )}
          </Text>
        </Section>

        {/* Follow-Up â€” 5/6 states, real flags only, CTA inline */}
        <Section id="follow_up" icon={<CalendarPlus size={18} color={Colors.primary} />}
          title="Follow-Up" titleAr="Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø©">
          {followUpRequired ? (
            <>
              {followUpDate ? (
                <Row label="Recommended date" labelAr="Ø§Ù„ØªØ§Ø±ÙŠØ® Ø§Ù„Ù…ÙˆØµÙ‰ Ø¨Ù‡" value={String(followUpDate).slice(0, 10)} />
              ) : null}
              {diagnosis?.follow_up_notes ? (
                <Row label="Doctor's note" labelAr="Ù…Ù„Ø§Ø­Ø¸Ø© Ø§Ù„Ø·Ø¨ÙŠØ¨" value={diagnosis.follow_up_notes} />
              ) : null}
              {followUpAvailable ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    if (appointment) {
                      navigateTo('doctor_detail', { doctor: appointment.doctor });
                    } else {
                      navigateTo('doctors');
                    }
                  }}
                  style={[styles.followUpBtn, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
                >
                  <CalendarPlus size={16} color={Colors.white} />
                  <Text style={styles.followUpBtnText}>
                    {appointment
                      ? t(
                          `Book a follow-up with Dr. ${appointment.doctor.name}`,
                          `Ø§Ø­Ø¬Ø² Ù…ÙˆØ¹Ø¯ Ù…ØªØ§Ø¨Ø¹Ø© Ù…Ø¹ ${appointment.doctor.nameAr}`,
                        )
                      : t('Book a Follow-Up', 'Ø§Ø­Ø¬Ø² Ù…ÙˆØ¹Ø¯ Ù…ØªØ§Ø¨Ø¹Ø©')}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.bodyText}>
                  {hasUpcomingWithSameDoctor
                    ? t(
                        'A follow-up is already booked with this doctor.',
                        'Ù„Ø¯ÙŠÙƒ Ù…ÙˆØ¹Ø¯ Ù…ØªØ§Ø¨Ø¹Ø© Ù…Ø­Ø¬ÙˆØ² Ø¨Ø§Ù„ÙØ¹Ù„ Ù…Ø¹ Ù‡Ø°Ø§ Ø§Ù„Ø·Ø¨ÙŠØ¨.',
                      )
                    : t(
                        'No follow-up slots are currently available with this doctor.',
                        'Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…ÙˆØ§Ø¹ÙŠØ¯ Ù…ØªØ§Ø¨Ø¹Ø© Ù…ØªØ§Ø­Ø© Ø­Ø§Ù„ÙŠØ§Ù‹ Ù…Ø¹ Ù‡Ø°Ø§ Ø§Ù„Ø·Ø¨ÙŠØ¨.',
                      )}
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.bodyText}>
              {t(
                'Your doctor did not request a follow-up for this consultation.',
                'Ù„Ù… ÙŠØ·Ù„Ø¨ Ø·Ø¨ÙŠØ¨Ùƒ Ù…ÙˆØ¹Ø¯ Ù…ØªØ§Ø¨Ø¹Ø© Ù„Ù‡Ø°Ù‡ Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø©.',
              )}
            </Text>
          )}
        </Section>
      </ScrollView>
    </View>
  );
};

const Row: React.FC<{ label: string; labelAr: string; value: string }> = ({ label, labelAr, value }) => {
  const { t, isRtl } = useApp();
  if (!value) return null;
  return (
    <View style={[styles.row, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
      <Text style={styles.rowLabel}>{t(label, labelAr)}</Text>
      <Text style={[styles.rowValue, { textAlign: isRtl ? 'left' : 'right' }]}>{value}</Text>
    </View>
  );
};

export default CareSummaryScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 60 },
  loadingWrap: { gap: 12 },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    padding: 14,
    gap: 10,
    ...Shadows.sm,
  },
  sectionHeader: { alignItems: 'center', gap: 10 },
  sectionHeaderTextWrap: { flex: 1, gap: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: Colors.slate[900] },
  sectionSummary: { fontSize: 11, color: Colors.slate[500] },
  sectionBody: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.slate[100],
    paddingTop: 10,
  },
  row: { gap: 8 },
  rowLabel: { fontSize: 12, fontWeight: '700', color: Colors.slate[500], minWidth: 100 },
  rowValue: { flex: 1, fontSize: 13, color: Colors.slate[900], fontWeight: '600' },
  bodyText: { fontSize: 13, color: Colors.slate[700], lineHeight: 19 },
  emptySectionText: { fontSize: 13, color: Colors.slate[500], lineHeight: 19 },
  rxItem: { backgroundColor: Colors.slate[50], borderRadius: 12, padding: 10, gap: 3 },
  rxName: { fontSize: 13, fontWeight: '800', color: Colors.slate[900] },
  rxLine: { fontSize: 12, color: Colors.slate[600] },
  inlineBtn: {
    alignSelf: 'flex-start',
    gap: 6,
    alignItems: 'center',
    backgroundColor: Colors.primarySubtle,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  inlineBtnText: { color: Colors.primary, fontSize: 12, fontWeight: '700' },
  followUpBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  followUpBtnText: { color: Colors.white, fontSize: 13, fontWeight: '800' },
  doneBanner: {
    backgroundColor: Colors.accentLight,
    borderRadius: 14,
    padding: 12,
    gap: 8,
    alignItems: 'center',
  },
  doneText: { flex: 1, fontSize: 13, fontWeight: '700', color: Colors.accentDark },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    gap: 12,
  },
  stateIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateTitle: { fontSize: 17, fontWeight: '800', color: Colors.slate[900], textAlign: 'center' },
  stateSub: { fontSize: 13, color: Colors.slate[500], textAlign: 'center', lineHeight: 19 },
  retryBtn: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 6,
  },
  retryText: { color: Colors.white, fontSize: 13, fontWeight: '800' },
});
