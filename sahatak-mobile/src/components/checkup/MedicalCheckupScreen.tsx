import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Activity,
  Check,
  Home,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { HEALTH_CHECKUP_PACKAGES } from '../../data/mockData';
import { MedicalCheckupPackage } from '../../types';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/styles';

export const MedicalCheckupScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { navigateTo, isRtl, t } = useApp();
  const [selectedPkg, setSelectedPkg] = useState<MedicalCheckupPackage | null>(null);
  const [isHomeSample, setIsHomeSample] = useState<boolean>(true);
  const [isBooked, setIsBooked] = useState<boolean>(false);

  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  const handleBookPackage = (pkg: MedicalCheckupPackage) => {
    setSelectedPkg(pkg);
  };

  const handleConfirmPackage = () => {
    setIsBooked(true);
    setTimeout(() => {
      setIsBooked(false);
      setSelectedPkg(null);
      navigateTo('my_appointments');
    }, 1800);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Medical Check-up"
        titleAr="الفحص الطبي الشامل"
        rightAction="none"
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>
              {t('PREVENTIVE HEALTHCARE', 'الرعاية الوقائية')}
            </Text>
          </View>
          <Text style={[styles.heroTitle, { textAlign: isRtl ? 'right' : 'left' }]}>
            {t('Early Detection, Lifetime Wellness', 'كشف مبكر لصحة تدوم')}
          </Text>
          <Text style={[styles.heroSub, { textAlign: isRtl ? 'right' : 'left' }]}>
            {t(
              'Comprehensive laboratory packages with home nurse sampling & digital doctor consultation.',
              'باقات تحاليل شاملة مع خدمة سحب العينات المنزلية واستشارة الطبيب رقمياً.'
            )}
          </Text>
        </View>

        {/* Packages Heading */}
        <View style={[styles.sectionHeaderRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <Text style={styles.sectionHeading}>
            {t('Available Health Packages', 'باقات الفحوصات المتاحة')}
          </Text>
          <Text style={styles.packageCountText}>
            {HEALTH_CHECKUP_PACKAGES.length} {t('Packages', 'باقات')}
          </Text>
        </View>

        {/* Packages Cards */}
        {HEALTH_CHECKUP_PACKAGES.map((pkg) => (
          <View key={pkg.id} style={styles.pkgCard}>
            <View style={{ alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
              <View style={styles.testsBadge}>
                <Text style={styles.testsBadgeText}>
                  {pkg.includedTests.length} {t('Tests Included', 'فحصاً مخبرياً')}
                </Text>
              </View>
              <Text style={styles.pkgTitle}>{t(pkg.title, pkg.titleAr)}</Text>
              <Text style={styles.pkgDesc}>{t(pkg.description, pkg.descriptionAr)}</Text>
            </View>

            {/* Test items preview */}
            <View style={styles.testsListCard}>
              <Text style={[styles.testsListHeading, { textAlign: isRtl ? 'right' : 'left' }]}>
                {t('Package Covers', 'يشمل الفحص')}:
              </Text>
              {(isRtl ? pkg.includedTestsAr : pkg.includedTests).slice(0, 4).map((feat, idx) => (
                <View
                  key={idx}
                  style={[styles.testItemRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
                >
                  <Check size={14} color={Colors.accent} />
                  <Text numberOfLines={1} style={styles.testItemText}>{feat}</Text>
                </View>
              ))}
            </View>

            {/* Free Home Sample Banner */}
            <View style={[styles.homeSampleBanner, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <Home size={16} color={Colors.accentDark} />
              <Text style={styles.homeSampleText}>
                {t('Free Home Nurse Sample Collection Available', 'متاح سحب العينات منزلياً مجاناً')}
              </Text>
            </View>

            {/* Bottom Row */}
            <View style={[styles.pkgBottomRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View style={{ alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
                <Text style={styles.pkgPriceLabel}>{t('Package Price', 'سعر الباقة')}</Text>
                <Text style={styles.pkgPriceVal}>
                  {t(pkg.priceFormatted, pkg.priceFormattedAr)}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleBookPackage(pkg)}
                style={[styles.bookPkgBtn, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
              >
                <Text style={styles.bookPkgText}>{t('Book Package', 'حجز الفحص')}</Text>
                <Chevron size={14} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Booking Modal Dialog */}
      {selectedPkg && (
        <Modal transparent animationType="fade" visible={!!selectedPkg}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
              <View style={styles.modalHandle} />

              {isBooked ? (
                <View style={styles.modalSuccessContent}>
                  <View style={styles.modalSuccessIcon}>
                    <CheckCircle2 size={44} color={Colors.accent} />
                  </View>
                  <Text style={styles.modalSuccessTitle}>
                    {t('Check-up Package Booked!', 'تم تأكيد حجز الباقة!')}
                  </Text>
                  <Text style={styles.modalSuccessSub}>
                    {t(
                      'Our medical team will contact you to confirm sample collection appointment.',
                      'سيتواصل معك الفريق الطبي لتحديد موعد سحب العينة.'
                    )}
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 14 }}>
                  <View style={{ alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
                    <Text style={styles.confirmHeaderSub}>
                      {t('Confirm Check-up Booking', 'تأكيد حجز الفحص الشامل')}
                    </Text>
                    <Text style={styles.confirmHeaderTitle}>
                      {t(selectedPkg.title, selectedPkg.titleAr)}
                    </Text>
                  </View>

                  <Text style={[styles.sampleMethodLabel, { textAlign: isRtl ? 'right' : 'left' }]}>
                    {t('Sample Collection Method', 'طريقة سحب العينات')}
                  </Text>

                  <View style={[styles.methodOptionsRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setIsHomeSample(true)}
                      style={[
                        styles.methodCard,
                        isHomeSample && styles.methodCardActive,
                      ]}
                    >
                      <Home size={20} color={isHomeSample ? Colors.primary : Colors.slate[500]} />
                      <Text style={[styles.methodText, isHomeSample && styles.methodTextActive]}>
                        {t('Home Nurse Visit', 'زيارة ممرض للمنزل')}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setIsHomeSample(false)}
                      style={[
                        styles.methodCard,
                        !isHomeSample && styles.methodCardActive,
                      ]}
                    >
                      <Activity size={20} color={!isHomeSample ? Colors.primary : Colors.slate[500]} />
                      <Text style={[styles.methodText, !isHomeSample && styles.methodTextActive]}>
                        {t('Visit Medical Lab', 'زيارة المختبر')}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.modalTotalRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <Text style={styles.modalTotalLabel}>{t('Total Amount', 'المبلغ الإجمالي')}</Text>
                    <Text style={styles.modalTotalVal}>
                      {t(selectedPkg.priceFormatted, selectedPkg.priceFormattedAr)}
                    </Text>
                  </View>

                  <View style={[styles.modalActionsRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setSelectedPkg(null)}
                      style={styles.cancelBtn}
                    >
                      <Text style={styles.cancelBtnText}>{t('Cancel', 'إلغاء')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={handleConfirmPackage}
                      style={styles.confirmBtn}
                    >
                      <Text style={styles.confirmBtnText}>{t('Confirm & Pay', 'تأكيد وحجز')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
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
  scrollContent: {
    padding: 16,
  },
  heroCard: {
    backgroundColor: '#0369a1',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    ...Shadows.md,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#e0f2fe',
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 22,
  },
  heroSub: {
    fontSize: 12,
    color: '#bae6fd',
    marginTop: 4,
    lineHeight: 16,
  },
  sectionHeaderRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.slate[900],
  },
  packageCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  pkgCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    marginBottom: 14,
    ...Shadows.sm,
    gap: 10,
  },
  testsBadge: {
    backgroundColor: Colors.primarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  testsBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  pkgTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.slate[900],
  },
  pkgDesc: {
    fontSize: 12,
    color: Colors.slate[500],
    marginTop: 2,
  },
  testsListCard: {
    backgroundColor: Colors.slate[50],
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  testsListHeading: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.slate[400],
    textTransform: 'uppercase',
  },
  testItemRow: {
    alignItems: 'center',
    gap: 6,
  },
  testItemText: {
    fontSize: 12,
    color: Colors.slate[700],
    flex: 1,
  },
  homeSampleBanner: {
    backgroundColor: Colors.accentLight,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  homeSampleText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.accentDark,
    flex: 1,
  },
  pkgBottomRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.slate[100],
    paddingTop: 10,
    marginTop: 4,
  },
  pkgPriceLabel: {
    fontSize: 10,
    color: Colors.slate[400],
  },
  pkgPriceVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  bookPkgBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
  },
  bookPkgText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    ...Shadows.lg,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.slate[300],
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalSuccessContent: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  modalSuccessIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modalSuccessTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.slate[900],
  },
  modalSuccessSub: {
    fontSize: 12,
    color: Colors.slate[500],
    textAlign: 'center',
    lineHeight: 18,
  },
  confirmHeaderSub: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  confirmHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.slate[900],
    marginTop: 2,
  },
  sampleMethodLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate[800],
  },
  methodOptionsRow: {
    gap: 10,
  },
  methodCard: {
    flex: 1,
    backgroundColor: Colors.slate[50],
    borderWidth: 1.5,
    borderColor: Colors.slate[200],
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  methodCardActive: {
    backgroundColor: Colors.primaryBg,
    borderColor: Colors.primary,
  },
  methodText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.slate[700],
    textAlign: 'center',
  },
  methodTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  modalTotalRow: {
    backgroundColor: Colors.slate[50],
    borderRadius: 14,
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTotalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate[800],
  },
  modalTotalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primary,
  },
  modalActionsRow: {
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: Colors.slate[100],
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.slate[700],
  },
  confirmBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
});

