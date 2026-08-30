import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
  Camera,
  LogIn,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { resolveImageUrl } from '../../api/client';
import { uploadAvatarApi } from '../../api/profile';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/styles';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';

export const ProfileScreen: React.FC = () => {
  const {
    user,
    updateUser,
    updateUserProfile,
    lang,
    setLang,
    navigateTo,
    isAuthenticated,
    logout,
    isRtl,
    t,
  } = useApp();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(user?.name || '');
  const [phoneInput, setPhoneInput] = useState<string>(user?.phone || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setNameInput(user.name || '');
      setPhoneInput(user.phone || '');
    }
  }, [user]);

  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  const handleSaveProfile = async () => {
    if (!nameInput.trim()) {
      Alert.alert(t('Validation Error', 'خطأ في البيانات'), t('Full name cannot be empty.', 'لا يمكن ترك الاسم فارغاً.'));
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile({
        name: nameInput.trim(),
        phone: phoneInput.trim(),
      });
      setIsEditing(false);
      Alert.alert(
        t('Profile Saved', 'تم حفظ الملف الشخصي'),
        t('Your profile changes were saved successfully on the server.', 'تم حفظ التعديلات بنجاح على الخادم.')
      );
    } catch (err: any) {
      console.log('Error saving profile:', err);
      Alert.alert(
        t('Save Failed', 'تعذر حفظ التعديلات'),
        err?.response?.data?.error || t('Could not connect to server to save changes.', 'تعذر الاتصال بالخادم لحفظ التعديلات.')
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('Permission Required', 'مطلوب إذن الوصول'),
          t('Photo library access is needed to change your profile picture.', 'يحتاج التطبيق إلى إذن الوصول لمعرض الصور لتغيير الصورة الشخصية.')
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setIsUploadingAvatar(true);
        const res = await uploadAvatarApi(result.assets[0].uri);
        if (res?.user) {
          updateUser(res.user);
        } else if (res?.avatar) {
          updateUser({ avatar: res.avatar });
        }
        Alert.alert(t('Success', 'نجاح'), t('Profile picture updated successfully!', 'تم تحديث الصورة الشخصية بنجاح!'));
      }
    } catch (err: any) {
      console.log('Avatar upload error:', err);
      Alert.alert(t('Error', 'خطأ'), t('Failed to upload profile picture.', 'تعذر رفع الصورة الشخصية.'));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      t('Confirm Logout', 'تأكيد تسجيل الخروج'),
      t('Are you sure you want to log out of Sahatak?', 'هل أنت متأكد من رغبتك في تسجيل الخروج من تطبيق صحتك؟'),
      [
        { text: t('Cancel', 'إلغاء'), style: 'cancel' },
        {
          text: t('Logout', 'تسجيل الخروج'),
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const avatarUrl = user?.avatar ? resolveImageUrl(user.avatar) : DEFAULT_AVATAR;

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
              <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleChangeAvatar}
                disabled={isUploadingAvatar}
                style={styles.editAvatarBtn}
              >
                {isUploadingAvatar ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Camera size={12} color={Colors.white} />
                )}
              </TouchableOpacity>
            </View>

            <View style={[styles.userInfo, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
              {isEditing ? (
                <View style={{ width: '100%', gap: 6 }}>
                  <TextInput
                    value={nameInput}
                    onChangeText={setNameInput}
                    style={styles.inlineInput}
                    placeholder={t('Full Name', 'الاسم الكامل')}
                  />
                  <TextInput
                    value={phoneInput}
                    onChangeText={setPhoneInput}
                    style={styles.inlineInput}
                    placeholder={t('Phone Number', 'رقم الهاتف')}
                  />
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSaveProfile}
                    disabled={isSaving}
                    style={styles.saveInlineBtn}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <Text style={styles.saveInlineBtnText}>{t('Save to Server', 'حفظ على الخادم')}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={[styles.userNameRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <Text style={styles.userNameText}>
                      {user?.name ? t(user.name, user.nameAr || user.name) : t('Patient', 'المريض')}
                    </Text>
                    <ShieldCheck size={16} color={Colors.primary} />
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setIsEditing(true)}
                      style={{ padding: 2 }}
                    >
                      <Edit2 size={13} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.userPhoneText}>{user?.phone || user?.email || ''}</Text>
                  <View style={styles.vipBadge}>
                    <Text style={styles.vipBadgeText}>
                      {user?.insuranceProvider || t('Active Patient', 'مريض نشط')} • VIP
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
            <Text style={styles.vitalVal}>{user?.bloodType || user?.bloodGroup || 'O+'}</Text>
          </View>

          <View style={styles.vitalCard}>
            <View style={[styles.vitalIconWrap, { backgroundColor: Colors.primarySubtle }]}>
              <Scale size={16} color={Colors.primary} />
            </View>
            <Text style={styles.vitalLabel}>{t('Weight', 'الوزن')}</Text>
            <Text style={styles.vitalVal}>{user?.weight || '74 kg'}</Text>
          </View>

          <View style={styles.vitalCard}>
            <View style={[styles.vitalIconWrap, { backgroundColor: Colors.accentLight }]}>
              <Ruler size={16} color={Colors.accent} />
            </View>
            <Text style={styles.vitalLabel}>{t('Height', 'الطول')}</Text>
            <Text style={styles.vitalVal}>{user?.height || '178 cm'}</Text>
          </View>

          <View style={styles.vitalCard}>
            <View style={[styles.vitalIconWrap, { backgroundColor: Colors.warningLight }]}>
              <Activity size={16} color={Colors.warning} />
            </View>
            <Text style={styles.vitalLabel}>{t('Age', 'العمر')}</Text>
            <Text style={styles.vitalVal}>{user?.age || 30} {t('yrs', 'سنة')}</Text>
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
          <Text style={styles.insHolderName}>
            {user?.name ? t(user.name, user.nameAr || user.name) : t('Patient', 'المريض')}
          </Text>
          <Text style={styles.insPolicyNumber}>Policy: {user?.insurancePolicyNumber || user?.policyNumber || 'BUP-8890-4412'}</Text>
          <View style={[styles.insFooter, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <Text style={styles.insFooterText}>Provider: {user?.insuranceProvider || 'Bupa Arabia'}</Text>
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

            {/* Logout */}
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
          </View>
        </View>
      </ScrollView>
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

