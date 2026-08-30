import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
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
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/styles';

export const MedicalRecordsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { navigateTo, addToCart, products, isRtl, t } = useApp();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null);

  const tabs = [
    { id: 'all', labelEn: 'All Documents', labelAr: 'الكل' },
    { id: 'prescription', labelEn: 'Prescriptions', labelAr: 'الوصفات الطبية' },
    { id: 'lab_report', labelEn: 'Lab Reports', labelAr: 'التحاليل المخبرية' },
    { id: 'consultation_summary', labelEn: 'Doctor Reports', labelAr: 'تقارير الاستشارات' },
  ];

  const filteredRecords = MEDICAL_RECORDS.filter(
    (rec) => activeTab === 'all' || rec.type === activeTab
  );

  const handleOrderPrescription = (_rec: MedicalRecord) => {
    addToCart(products[0], 1);
    navigateTo('cart');
  };

  const handleDownload = () => {
    Alert.alert(
      t('Medical Document Downloaded', 'تم حفظ المستند'),
      t('Official certified PDF document saved to your device.', 'تم حفظ التقرير الطبي بصيغة PDF على جهازك بنجاح.')
    );
    setViewingRecord(null);
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

      {/* Records Cards List */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredRecords.map((record) => (
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
        ))}
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

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleDownload}
                style={[styles.downloadBtn, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
              >
                <Download size={18} color={Colors.white} />
                <Text style={styles.downloadBtnText}>
                  {t('Download Official PDF', 'تحميل المستند الرسمي')}
                </Text>
              </TouchableOpacity>
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
});

