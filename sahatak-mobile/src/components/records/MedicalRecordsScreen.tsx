import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  FileText,
  Download,
  ShoppingBag,
  ShieldCheck,
  X,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { MEDICAL_RECORDS } from '../../data/mockData';
import { MedicalRecord } from '../../types';
import {
  fetchPatientDiagnosesApi,
  fetchPatientVitalSignsApi,
  DiagnosisApiRecord,
  VitalSignApiRecord,
} from '../../api/records';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/styles';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { buildMedicalRecordHtml } from '../../utils/reportHtml';

export const MedicalRecordsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { navigateTo, addToCart, products, isRtl, t, user } = useApp();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null);

  const tabs = [
    { id: 'all', labelEn: 'All Documents', labelAr: 'الكل' },
    { id: 'prescription', labelEn: 'Prescriptions', labelAr: 'الوصفات الطبية' },
    { id: 'lab_report', labelEn: 'Lab Reports', labelAr: 'التحاليل المخبرية' },
    { id: 'consultation_summary', labelEn: 'Doctor Reports', labelAr: 'تقارير الاستشارات' },
    { id: 'vitals', labelEn: 'Vital Signs', labelAr: 'العلامات الحيوية' },
  ];

  // ── Real backend data (doctor-created diagnoses + vital signs) ──────────
  const [apiDiagnoses, setApiDiagnoses] = useState<DiagnosisApiRecord[]>([]);
  const [apiVitals, setApiVitals] = useState<VitalSignApiRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user?.id) {
        setLoadingRecords(false);
        return;
      }
      setLoadingRecords(true);
      setFetchError(null);
      try {
        const [diagnoses, vitals] = await Promise.all([
          fetchPatientDiagnosesApi(user.id),
          fetchPatientVitalSignsApi(user.id),
        ]);
        if (!cancelled) {
          setApiDiagnoses(diagnoses);
          setApiVitals(vitals);
        }
      } catch (e: any) {
        // Surface the error so it is observable during testing; include the
        // HTTP status code (present on ApiError) so we know exactly which
        // endpoint failed and why (e.g. 403 = access denied, 401 = token).
        const status: number | null = e?.status ?? null;
        const msg: string = e?.message ?? String(e);
        console.error(
          `[MedicalRecords] Failed to load records (HTTP ${status ?? 'N/A'}):`,
          msg,
          e,
        );
        if (!cancelled) {
          setFetchError(
            status !== null
              ? `Could not load your medical records (server error ${status}). Please try again.`
              : `Could not load your medical records. Please check your connection and try again.`,
          );
        }
      } finally {
        if (!cancelled) setLoadingRecords(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Map backend Diagnosis records (doctor's medical reports) into the
  // screen's MedicalRecord shape. Fields come from Diagnosis.to_dict()
  // (Sahatak-2/backend/models.py): primary_diagnosis, clinical_findings,
  // treatment_plan, diagnosis_date, doctor_name...
  const realRecords: MedicalRecord[] = useMemo(
    () =>
      apiDiagnoses.map((d) => ({
        id: `DX-${d.id}`,
        title: 'Medical Report',
        titleAr: 'تقرير طبي',
        doctorName: d.doctor_name ?? 'Doctor',
        doctorNameAr: d.doctor_name ?? 'الطبيب',
        doctorSpecialty: '',
        doctorSpecialtyAr: '',
        doctorAvatar: '',
        facility: 'Sahatak Clinic',
        facilityAr: 'عيادات صحتك',
        date: (d.diagnosis_date || '').slice(0, 10),
        dateAr: (d.diagnosis_date || '').slice(0, 10),
        type: 'consultation_summary',
        status: d.resolved ? 'Completed' : 'Active',
        statusAr: d.resolved ? 'مكتمل' : 'نشط',
        diagnosisSummary: d.primary_diagnosis,
        diagnosisSummaryAr: d.primary_diagnosis,
        diagnosis: [
          d.clinical_findings ? `Clinical findings: ${d.clinical_findings}` : '',
          d.treatment_plan ? `Treatment plan: ${d.treatment_plan}` : '',
          d.follow_up_required && d.follow_up_date
            ? `Follow-up required on ${d.follow_up_date.slice(0, 10)}`
            : '',
        ]
          .filter(Boolean)
          .join('\n'),
        diagnosisAr: undefined,
        fileSize: '',
      })),
    [apiDiagnoses],
  );

  // Real data wins; bundled demo records are only used as a fallback when
  // the API returned nothing (or failed) so the screen is never blank.
  const records = realRecords.length > 0 ? realRecords : MEDICAL_RECORDS;

  const filteredRecords = records.filter(
    (rec) => activeTab === 'all' || rec.type === activeTab,
  );

  const formatVitalDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(isRtl ? 'ar' : 'en', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const handleOrderPrescription = (_rec: MedicalRecord) => {
    addToCart(products[0], 1);
    navigateTo('cart');
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (record: MedicalRecord) => {
    if (record.type !== 'prescription' && record.type !== 'consultation_summary') return;
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const html = await buildMedicalRecordHtml(
        record,
        isRtl ? 'ar' : 'en',
        user?.name,
      );
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: t('Save or share your medical document', 'حفظ أو مشاركة المستند الطبي'),
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert(
          t('PDF Ready', 'تم إنشاء الملف'),
          t(`The PDF was saved to: ${uri}`, `تم حفظ الملف في: ${uri}`),
        );
      }
      setViewingRecord(null);
    } catch (e) {
      console.warn('PDF generation failed:', e);
      Alert.alert(
        t('Error', 'خطأ'),
        t('Failed to generate the PDF document.', 'تعذر إنشاء ملف PDF.'),
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Medical Records"
        titleAr="السجلات والتقارير الطبية"
        rightAction="none"
      />

      {/* Tabs Selector */}
      <View style={styles.tabsSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.tabsScroll, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.7}
                onPress={() => setActiveTab(tab.id)}
                style={[
                  styles.tabPill,
                  isActive && styles.tabPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabPillText,
                    isActive && styles.tabPillTextActive,
                  ]}
                >
                  {t(tab.labelEn, tab.labelAr)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Fetch Error Banner — visible so failures are observable during testing */}
      {fetchError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{fetchError}</Text>
        </View>
      )}

      {/* Records Cards List / Vitals Tab */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'vitals' ? (
          /* ── Vital Signs Tab ──────────────────────────────────────── */
          apiVitals.length === 0 ? (
            <View style={styles.emptyVitals}>
              <Text style={styles.emptyVitalsText}>
                {t('No vital signs recorded yet.', 'لا توجد علامات حيوية مسجلة بعد.')}
              </Text>
            </View>
          ) : (
            apiVitals.map((v) => {
              // Cast individual fields because VitalSignApiRecord has a
              // [key: string]: unknown index signature which widens all
              // known fields to 'unknown'. Casts are safe — they match
              // the declared types in the interface.
              const measuredAt = v.measured_at as string;
              const recordedBy = v.recorded_by as string | null | undefined;
              const heartRate = v.heart_rate as number | null | undefined;
              const systolicBp = v.systolic_bp as number | null | undefined;
              const diastolicBp = v.diastolic_bp as number | null | undefined;
              const temperature = v.temperature as number | null | undefined;
              const respiratoryRate = v.respiratory_rate as number | null | undefined;
              const oxygenSaturation = v.oxygen_saturation as number | null | undefined;
              const weight = v.weight as number | null | undefined;
              const height = v.height as number | null | undefined;
              const bmi = v.bmi as number | null | undefined;
              const notes = v.notes as string | null | undefined;
              return (
              <View key={v.id} style={styles.vitalCard}>
                <View style={[styles.vitalCardHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <Text style={styles.vitalDate}>{formatVitalDate(measuredAt)}</Text>
                  {recordedBy ? (
                    <Text style={styles.vitalRecordedBy}>
                      {t('By', 'بواسطة')} {recordedBy}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.vitalGrid}>
                  {heartRate != null && (
                    <View style={styles.vitalItem}>
                      <Text style={styles.vitalLabel}>{t('Heart Rate', 'معدل ضربات القلب')}</Text>
                      <Text style={styles.vitalValue}>{heartRate} <Text style={styles.vitalUnit}>bpm</Text></Text>
                    </View>
                  )}
                  {systolicBp != null && diastolicBp != null && (
                    <View style={styles.vitalItem}>
                      <Text style={styles.vitalLabel}>{t('Blood Pressure', 'ضغط الدم')}</Text>
                      <Text style={styles.vitalValue}>{systolicBp}/{diastolicBp} <Text style={styles.vitalUnit}>mmHg</Text></Text>
                    </View>
                  )}
                  {temperature != null && (
                    <View style={styles.vitalItem}>
                      <Text style={styles.vitalLabel}>{t('Temperature', 'درجة الحرارة')}</Text>
                      <Text style={styles.vitalValue}>{temperature} <Text style={styles.vitalUnit}>°C</Text></Text>
                    </View>
                  )}
                  {respiratoryRate != null && (
                    <View style={styles.vitalItem}>
                      <Text style={styles.vitalLabel}>{t('Resp. Rate', 'معدل التنفس')}</Text>
                      <Text style={styles.vitalValue}>{respiratoryRate} <Text style={styles.vitalUnit}>rpm</Text></Text>
                    </View>
                  )}
                  {oxygenSaturation != null && (
                    <View style={styles.vitalItem}>
                      <Text style={styles.vitalLabel}>{t('O₂ Saturation', 'تشبع الأكسجين')}</Text>
                      <Text style={styles.vitalValue}>{oxygenSaturation} <Text style={styles.vitalUnit}>%</Text></Text>
                    </View>
                  )}
                  {weight != null && (
                    <View style={styles.vitalItem}>
                      <Text style={styles.vitalLabel}>{t('Weight', 'الوزن')}</Text>
                      <Text style={styles.vitalValue}>{weight} <Text style={styles.vitalUnit}>kg</Text></Text>
                    </View>
                  )}
                  {height != null && (
                    <View style={styles.vitalItem}>
                      <Text style={styles.vitalLabel}>{t('Height', 'الطول')}</Text>
                      <Text style={styles.vitalValue}>{height} <Text style={styles.vitalUnit}>cm</Text></Text>
                    </View>
                  )}
                  {bmi != null && (
                    <View style={styles.vitalItem}>
                      <Text style={styles.vitalLabel}>{t('BMI', 'مؤشر كتلة الجسم')}</Text>
                      <Text style={styles.vitalValue}>{Number(bmi).toFixed(1)}</Text>
                    </View>
                  )}
                </View>
                {notes ? (
                  <Text style={styles.vitalNotes}>{notes}</Text>
                ) : null}
              </View>
              );
            })
          )
        ) : (
          /* ── All other tabs (documents) ────────────────────────── */
          filteredRecords.map((record) => (
          <View key={record.id} style={styles.recordCard}>
            <View style={[styles.recordHeaderRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View style={styles.docIconWrap}>
                <FileText size={20} color={Colors.primary} />
              </View>

              <View style={[styles.docHeaderInfo, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>
                    {record.type === 'prescription'
                      ? t('E-Prescription', 'وصفة طبية معتمدة')
                      : record.type === 'consultation_summary'
                      ? t('Doctor Report', 'تقرير الطبيب')
                      : t('Lab Test Result', 'تقرير فحص مخبري')}
                  </Text>
                </View>
                <Text style={styles.recordTitle}>{t(record.title, record.titleAr)}</Text>
                <Text style={styles.recordSub}>
                  {t(record.doctorName, record.doctorNameAr)} •{' '}
                  {t(record.facility || record.clinicName || 'Sahatak Clinic', record.facilityAr || record.clinicNameAr || 'عيادات صحتك')}
                </Text>
              </View>
            </View>

            {/* Prescribed medicines preview */}
            {record.medicines && record.medicines.length > 0 && (
              <View style={styles.medicinesBox}>
                <Text style={[styles.medicinesBoxTitle, { textAlign: isRtl ? 'right' : 'left' }]}>
                  {t('Prescribed Medications', 'الأدوية الموصوفة')}
                </Text>
                {record.medicines.map((med, idx) => (
                  <View
                    key={idx}
                    style={[styles.medItemRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
                  >
                    <Text style={styles.medNameText}>{t(med.name, med.nameAr)}</Text>
                    <Text style={styles.medDosageText}>
                      {t(med.dosage, med.dosageAr)} • {t(med.frequency, med.frequencyAr)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Diagnosis notes */}
            <View style={styles.diagnosisBox}>
              <Text style={[styles.diagHeading, { textAlign: isRtl ? 'right' : 'left' }]}>
                {t('Doctor Notes & Diagnosis', 'التشخيص وملاحظات الطبيب')}:
              </Text>
              <Text style={[styles.diagText, { textAlign: isRtl ? 'right' : 'left' }]}>
                {t(record.diagnosisSummary || record.diagnosis || '', record.diagnosisSummaryAr || record.diagnosisAr || '')}
              </Text>
            </View>

            {/* Card Footer Actions */}
            <View style={[styles.cardFooter, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <Text style={styles.recordDateText}>{record.date}</Text>

              <View style={[styles.footerBtnGroup, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                {record.type === 'prescription' && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleOrderPrescription(record)}
                    style={[styles.orderMedsBtn, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
                  >
                    <ShoppingBag size={14} color={Colors.primary} />
                    <Text style={styles.orderMedsText}>{t('Order Meds', 'طلب الأدوية')}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setViewingRecord(record)}
                  style={[styles.viewPdfBtn, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
                >
                  <Download size={14} color={Colors.slate[700]} />
                  <Text style={styles.viewPdfText}>{t('View PDF', 'عرض المستند')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
        )}
      </ScrollView>

      {/* PDF / Digital Document Viewer Modal */}
      {viewingRecord && (
        <Modal transparent animationType="fade" visible={!!viewingRecord}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 20) }]}>
              <View style={[styles.modalHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <View style={[styles.certifiedBadge, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <ShieldCheck size={16} color={Colors.primary} />
                  <Text style={styles.certifiedText}>
                    {t('Certified Digital Medical Record', 'مستند طبي رقمي معتمد')}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setViewingRecord(null)}>
                  <X size={20} color={Colors.slate[600]} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                <View style={styles.docOverviewBox}>
                  <Text style={styles.docOverviewTitle}>{t(viewingRecord.title, viewingRecord.titleAr)}</Text>
                  <Text style={styles.docOverviewMeta}>{viewingRecord.doctorName} • {viewingRecord.date}</Text>
                  <Text style={styles.docOverviewMeta}>{viewingRecord.facility || viewingRecord.clinicName}</Text>
                </View>

                <View style={styles.findingsBox}>
                  <Text style={styles.findingsTitle}>{t('Clinical Summary & Findings', 'الملخص السريري والنتائج')}</Text>
                  <Text style={styles.findingsBody}>
                    {t(viewingRecord.diagnosisSummary || viewingRecord.diagnosis || '', viewingRecord.diagnosisSummaryAr || viewingRecord.diagnosisAr || '')}
                  </Text>
                </View>

                {viewingRecord.medicines && (
                  <View style={styles.findingsBox}>
                    <Text style={styles.findingsTitle}>{t('Itemized Prescription', 'تفاصيل الوصفة')}</Text>
                    {viewingRecord.medicines.map((m, i) => (
                      <View key={i} style={styles.rxDetailItem}>
                        <Text style={styles.rxDetailName}>{t(m.name, m.nameAr)}</Text>
                        <Text style={styles.rxDetailDosage}>{t(m.dosage, m.dosageAr)} • {t(m.frequency, m.frequencyAr)}</Text>
                        <Text style={styles.rxDetailInst}>{t(m.instructions, m.instructionsAr)}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>

              {(viewingRecord.type === 'prescription' || viewingRecord.type === 'consultation_summary') && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleDownload(viewingRecord)}
                  disabled={isDownloading}
                  style={[styles.downloadBtn, { flexDirection: isRtl ? 'row-reverse' : 'row', opacity: isDownloading ? 0.6 : 1 }]}
                >
                  <Download size={18} color={Colors.white} />
                  <Text style={styles.downloadBtnText}>
                    {isDownloading
                      ? t('Generating PDF...', 'جارٍ إنشاء ملف PDF...')
                      : t('Download Official PDF', 'تحميل المستند الرسمي')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate[100],
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabPill: {
    backgroundColor: Colors.slate[100],
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  tabPillActive: {
    backgroundColor: Colors.primary,
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.slate[600],
  },
  tabPillTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  recordCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    ...Shadows.sm,
    gap: 12,
  },
  recordHeaderRow: {
    alignItems: 'center',
    gap: 12,
  },
  docIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docHeaderInfo: {
    flex: 1,
    gap: 2,
  },
  typeBadge: {
    backgroundColor: Colors.primarySubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  recordTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.slate[900],
  },
  recordSub: {
    fontSize: 11,
    color: Colors.slate[500],
  },
  medicinesBox: {
    backgroundColor: Colors.slate[50],
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  medicinesBoxTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.slate[400],
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  medItemRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.slate[800],
  },
  medDosageText: {
    fontSize: 11,
    color: Colors.slate[500],
  },
  diagnosisBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.primarySubtle,
  },
  diagHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.slate[800],
    marginBottom: 2,
  },
  diagText: {
    fontSize: 12,
    color: Colors.slate[600],
    lineHeight: 16,
  },
  cardFooter: {
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.slate[100],
    paddingTop: 10,
  },
  recordDateText: {
    fontSize: 11,
    color: Colors.slate[400],
  },
  footerBtnGroup: {
    gap: 8,
  },
  orderMedsBtn: {
    backgroundColor: Colors.primarySubtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
    gap: 4,
  },
  orderMedsText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  viewPdfBtn: {
    backgroundColor: Colors.slate[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
    gap: 4,
  },
  viewPdfText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.slate[800],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    gap: 12,
    ...Shadows.lg,
  },
  modalHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate[100],
    paddingBottom: 10,
  },
  certifiedBadge: {
    alignItems: 'center',
    gap: 6,
  },
  certifiedText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  docOverviewBox: {
    backgroundColor: Colors.slate[50],
    borderRadius: 14,
    padding: 12,
    gap: 2,
    marginBottom: 10,
  },
  docOverviewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.slate[900],
  },
  docOverviewMeta: {
    fontSize: 11,
    color: Colors.slate[500],
  },
  findingsBox: {
    borderWidth: 1,
    borderColor: Colors.slate[200],
    borderRadius: 14,
    padding: 12,
    gap: 6,
    marginBottom: 10,
  },
  findingsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate[900],
  },
  findingsBody: {
    fontSize: 12,
    color: Colors.slate[600],
    lineHeight: 18,
  },
  rxDetailItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate[100],
    paddingBottom: 6,
    marginBottom: 6,
  },
  rxDetailName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  rxDetailDosage: {
    fontSize: 11,
    color: Colors.slate[500],
  },
  rxDetailInst: {
    fontSize: 10,
    color: Colors.slate[600],
  },
  downloadBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  downloadBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  // ── Error banner ──────────────────────────────────────────────────────────
  errorBanner: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
  },
  errorBannerText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
    textAlign: 'center',
  },
  // ── Vital signs tab ───────────────────────────────────────────────────────
  vitalCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    ...Shadows.sm,
    gap: 10,
  },
  vitalCardHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vitalDate: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate[700],
  },
  vitalRecordedBy: {
    fontSize: 11,
    color: Colors.slate[400],
  },
  vitalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vitalItem: {
    backgroundColor: Colors.primaryBg,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: '44%',
    flex: 1,
    gap: 2,
  },
  vitalLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.slate[500],
    textTransform: 'uppercase',
  },
  vitalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  vitalUnit: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.slate[400],
  },
  vitalNotes: {
    fontSize: 12,
    color: Colors.slate[500],
    fontStyle: 'italic',
    borderTopWidth: 1,
    borderTopColor: Colors.slate[100],
    paddingTop: 8,
  },
  emptyVitals: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyVitalsText: {
    fontSize: 13,
    color: Colors.slate[400],
    textAlign: 'center',
  },
});

