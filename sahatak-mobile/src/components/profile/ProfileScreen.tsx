import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  User,
  Heart,
  FileText,
  Globe,
  Bell,
  HelpCircle,
  Shield,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Activity,
  Droplet,
  Scale,
  Ruler,
  ShieldCheck,
  Edit2,
  LogIn,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { AuthModal } from './AuthModal';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/styles';

export const ProfileScreen: React.FC = () => {
  const {
    user,
    updateUser,
    lang,
    setLang,
    navigateTo,
    isAuthenticated,
    logout,
    isRtl,
    t,
  } = useApp();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(user.name);
  const [phoneInput, setPhoneInput] = useState<string>(user.phone);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  const handleSaveProfile = () => {
    updateUser({ name: nameInput, phone: phoneInput });
    setIsEditing(false);
    Alert.alert(t('Profile Saved', 'تم حفظ الملف الشخصي'));
  };

  const handleLogout = async () => {
    await logout();
    Alert.alert(t('Logged Out', 'تم تسجيل الخروج'), t('You have been logged out.', 'تم تسجيل خروجك بنجاح.'));
  };

  return (
    <View style={styles.container}>
      <Header
        title="My Profile"
        titleAr="الملف الطبي والشخصي"
        rightAction="language"
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={[styles.userCardInner, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsEditing(!isEditing)}
                style={styles.editAvatarBtn}
              >
                <Edit2 size={12} color={Colors.white} />
              </TouchableOpacity>
            </View>

            <View style={[styles.userInfo, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
              {isEditing ? (
                <View style={{ width: '100%', gap: 6 }}>
                  <TextInput
                    value={nameInput}
                    onChangeText={setNameInput}
                    style={styles.inlineInput}
                    placeholder="Full Name"
                  />
                  <TextInput
                    value={phoneInput}
                    onChangeText={setPhoneInput}
                    style={styles.inlineInput}
                    placeholder="Phone"
                  />
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSaveProfile}
                    style={styles.saveInlineBtn}
                  >
                    <Text style={styles.saveInlineBtnText}>{t('Save', 'حفظ')}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={[styles.userNameRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <Text style={styles.userNameText}>{t(user.name, user.nameAr)}</Text>
                    <ShieldCheck size={16} color={Colors.primary} />
                  </View>
                  <Text style={styles.userPhoneText}>{user.phone}</Text>
                  <View style={styles.vipBadge}>
                    <Text style={styles.vipBadgeText}>
                      {user.insuranceProvider} • VIP
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Health Vitals Summary (4 columns) */}
        <View style={[styles.vitalsRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={styles.vitalCard}>
            <View style={[styles.vitalIconWrap, { backgroundColor: Colors.dangerLight }]}>
              <Droplet size={16} color={Colors.danger} />
            </View>
            <Text style={styles.vitalLabel}>{t('Blood', 'الفصيلة')}</Text>
            <Text style={styles.vitalVal}>{user.bloodGroup || 'O+'}</Text>
          </View>

          <View style={styles.vitalCard}>
            <View style={[styles.vitalIconWrap, { backgroundColor: Colors.primarySubtle }]}>
              <Scale size={16} color={Colors.primary} />
            </View>
            <Text style={styles.vitalLabel}>{t('Weight', 'الوزن')}</Text>
            <Text style={styles.vitalVal}>{user.weight || '74 kg'}</Text>
          </View>

          <View style={styles.vitalCard}>
            <View style={[styles.vitalIconWrap, { backgroundColor: Colors.accentLight }]}>
              <Ruler size={16} color={Colors.accent} />
            </View>
            <Text style={styles.vitalLabel}>{t('Height', 'الطول')}</Text>
            <Text style={styles.vitalVal}>{user.height || '178 cm'}</Text>
          </View>

          <View style={styles.vitalCard}>
            <View style={[styles.vitalIconWrap, { backgroundColor: Colors.warningLight }]}>
              <Activity size={16} color={Colors.warning} />
            </View>
            <Text style={styles.vitalLabel}>{t('Age', 'العمر')}</Text>
            <Text style={styles.vitalVal}>{user.age} {t('yrs', 'سنة')}</Text>
          </View>
        </View>

        {/* Health Insurance Card */}
        <View style={styles.insuranceCard}>
          <View style={[styles.insuranceTop, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <Text style={styles.insuranceHeading}>HEALTH INSURANCE</Text>
            <View style={styles.coveredPill}>
              <Text style={styles.coveredText}>100% COVERED</Text>
            </View>
          </View>
          <Text style={styles.insHolderName}>{t(user.name, user.nameAr)}</Text>
          <Text style={styles.insPolicyNumber}>Policy: {user.insurancePolicyNumber || 'BUP-8890-4412'}</Text>
          <View style={[styles.insFooter, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <Text style={styles.insFooterText}>Provider: {user.insuranceProvider}</Text>
            <Text style={styles.insFooterText}>Expiry: 12/2026</Text>
          </View>
        </View>

        {/* Medical & Account Options */}
        <View style={styles.menuGroup}>
          <Text style={[styles.groupHeading, { textAlign: isRtl ? 'right' : 'left' }]}>
            {t('Medical & Account', 'الخدمات والحساب')}
          </Text>

          <View style={styles.menuList}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigateTo('medical_records')}
              style={[styles.menuItem, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
            >
              <View style={[styles.menuItemLeft, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <View style={[styles.menuIconWrap, { backgroundColor: Colors.primarySubtle }]}>
                  <FileText size={18} color={Colors.primary} />
                </View>
                <Text style={styles.menuItemTitle}>
                  {t('My Medical Records & Prescriptions', 'السجلات الطبية والروشتات')}
                </Text>
              </View>
              <Chevron size={18} color={Colors.slate[400]} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigateTo('my_appointments')}
              style={[styles.menuItem, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
            >
              <View style={[styles.menuItemLeft, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <View style={[styles.menuIconWrap, { backgroundColor: Colors.accentLight }]}>
                  <Activity size={18} color={Colors.accent} />
                </View>
                <Text style={styles.menuItemTitle}>
                  {t('Appointment History & Consultations', 'سجل المواعيد والاستشارات')}
                </Text>
              </View>
              <Chevron size={18} color={Colors.slate[400]} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigateTo('doctors')}
              style={[styles.menuItem, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
            >
              <View style={[styles.menuItemLeft, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <View style={[styles.menuIconWrap, { backgroundColor: Colors.roseLight }]}>
                  <Heart size={18} color={Colors.rose} />
                </View>
                <Text style={styles.menuItemTitle}>
                  {t('Favorite Doctors & Specialists', 'الأطباء المفضلون')}
                </Text>
              </View>
              <Chevron size={18} color={Colors.slate[400]} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigateTo('notifications')}
              style={[styles.menuItem, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
            >
              <View style={[styles.menuItemLeft, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <View style={[styles.menuIconWrap, { backgroundColor: Colors.warningLight }]}>
                  <Bell size={18} color={Colors.warning} />
                </View>
                <Text style={styles.menuItemTitle}>
                  {t('Notifications & Dose Reminders', 'الإشعارات وتنبيهات الأدوية')}
                </Text>
              </View>
              <Chevron size={18} color={Colors.slate[400]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Settings & Auth */}
        <View style={styles.menuGroup}>
          <Text style={[styles.groupHeading, { textAlign: isRtl ? 'right' : 'left' }]}>
            {t('App Settings', 'إعدادات التطبيق')}
          </Text>

          <View style={styles.menuList}>
            {/* Language Switch */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setLang(lang === 'en' ? 'ar' : 'en')}
              style={[styles.menuItem, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
            >
              <View style={[styles.menuItemLeft, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <View style={[styles.menuIconWrap, { backgroundColor: Colors.purpleLight }]}>
                  <Globe size={18} color={Colors.purple} />
                </View>
                <Text style={styles.menuItemTitle}>
                  {t('Language / اللغة', 'اللغة / Language')}
                </Text>
              </View>
              <View style={styles.langPill}>
                <Text style={styles.langPillText}>{lang === 'en' ? 'العربية' : 'English'}</Text>
              </View>
            </TouchableOpacity>

            {/* Login or Logout */}
            {isAuthenticated ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleLogout}
                style={[styles.menuItem, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
              >
                <View style={[styles.menuItemLeft, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.menuIconWrap, { backgroundColor: Colors.dangerLight }]}>
                    <LogOut size={18} color={Colors.danger} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: Colors.danger }]}>
                    {t('Logout', 'تسجيل الخروج')}
                  </Text>
                </View>
                <Chevron size={18} color={Colors.slate[400]} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowAuthModal(true)}
                style={[styles.menuItem, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
              >
                <View style={[styles.menuItemLeft, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.menuIconWrap, { backgroundColor: Colors.primarySubtle }]}>
                    <LogIn size={18} color={Colors.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: Colors.primary }]}>
                    {t('Login / Register', 'تسجيل الدخول / إنشاء حساب')}
                  </Text>
                </View>
                <Chevron size={18} color={Colors.slate[400]} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Auth Modal Dialog */}
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
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
    gap: 14,
  },
  userCard: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    ...Shadows.sm,
  },
  userCardInner: {
    alignItems: 'center',
    gap: 14,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarImg: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: Colors.primaryLight,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    alignItems: 'center',
    gap: 6,
  },
  userNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.slate[900],
  },
  userPhoneText: {
    fontSize: 12,
    color: Colors.slate[500],
    marginTop: 2,
  },
  vipBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  vipBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accentDark,
  },
  inlineInput: {
    backgroundColor: Colors.slate[50],
    borderWidth: 1,
    borderColor: Colors.slate[200],
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 32,
    fontSize: 12,
  },
  saveInlineBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveInlineBtnText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  vitalsRow: {
    gap: 8,
  },
  vitalCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.slate[100],
    ...Shadows.sm,
  },
  vitalIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  vitalLabel: {
    fontSize: 10,
    color: Colors.slate[400],
  },
  vitalVal: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.slate[900],
    marginTop: 2,
  },
  insuranceCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 16,
    gap: 6,
    ...Shadows.md,
  },
  insuranceTop: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insuranceHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 1,
  },
  coveredPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coveredText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.white,
  },
  insHolderName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  insPolicyNumber: {
    fontSize: 11,
    color: '#94a3b8',
  },
  insFooter: {
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 8,
    marginTop: 4,
  },
  insFooterText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  menuGroup: {
    gap: 8,
  },
  groupHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.slate[400],
    textTransform: 'uppercase',
    paddingHorizontal: 4,
  },
  menuList: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    overflow: 'hidden',
    ...Shadows.sm,
  },
  menuItem: {
    padding: 14,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate[100],
  },
  menuItemLeft: {
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.slate[800],
    flex: 1,
  },
  langPill: {
    backgroundColor: Colors.primarySubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  langPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
});

