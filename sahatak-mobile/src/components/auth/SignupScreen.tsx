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
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import {
  ShieldCheck,
  Camera,
  ImageIcon,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Globe,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { RootStackParamList } from '../../navigation/types';
import { uploadAvatarApi } from '../../api/profile';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/styles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

export const SignupScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { register, updateUser, lang, setLang, isRtl, t } = useApp();

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState<boolean>(false);

  // Role selector: patient or doctor
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');

  const [name, setName] = useState<string>('');
  const [nameAr, setNameAr] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');

  // Doctor-specific fields (shown only when userType === 'doctor')
  const [licenseNumber, setLicenseNumber] = useState<string>('');
  const [specialty, setSpecialty] = useState<string>('');
  const [yearsOfExperience, setYearsOfExperience] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const BackIcon = isRtl ? ChevronRight : ChevronLeft;
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  // Handle Photo Picker from Camera
  const handleTakePhoto = async () => {
    setShowPhotoModal(false);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('Camera Permission Needed', 'مطلوب إذن الكاميرا'),
          t(
            'Sahatak needs camera permission to capture your profile photo. Please enable it in your device settings.',
            'يحتاج تطبيق صحتك إلى إذن استخدام الكاميرا لالتقاط صورتك الشخصية. يرجى تفعيل الإذن من إعدادات الهاتف.'
          )
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (err: any) {
      console.log('Camera error:', err);
      Alert.alert(t('Error', 'خطأ'), t('Failed to open camera.', 'تعذر فتح الكاميرا.'));
    }
  };

  // Handle Photo Picker from Gallery
  const handlePickFromGallery = async () => {
    setShowPhotoModal(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('Photo Library Permission Needed', 'مطلوب إذن معرض الصور'),
          t(
            'Sahatak needs photo library permission so you can select your profile picture. Please enable it in your device settings.',
            'يحتاج تطبيق صحتك إلى إذن الوصول لمعرض الصور لاختيار صورتك الشخصية. يرجى تفعيل الإذن من إعدادات الهاتف.'
          )
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (err: any) {
      console.log('Gallery error:', err);
      Alert.alert(t('Error', 'خطأ'), t('Failed to open photo library.', 'تعذر فتح معرض الصور.'));
    }
  };

  const handleSignup = async () => {
    setErrorMessage(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!cleanName || !cleanEmail || !cleanPhone || !password) {
      setErrorMessage(
        t(
          'Please fill in all required fields (Name, Email, Phone, and Password).',
          'يرجى ملء جميع الحقول المطلوبة (الاسم، البريد، الهاتف، وكلمة المرور).'
        )
      );
      return;
    }

    if (!cleanEmail.includes('@')) {
      setErrorMessage(
        t('Please enter a valid email address.', 'يرجى إدخال بريد إلكتروني صحيح.')
      );
      return;
    }

    // Doctor-specific validation
    if (userType === 'doctor') {
      if (!licenseNumber.trim()) {
        setErrorMessage(
          t('Please enter your medical license number.', 'يرجى إدخال رقم الترخيص الطبي.')
        );
        return;
      }
      if (!specialty.trim()) {
        setErrorMessage(
          t('Please enter your medical specialty.', 'يرجى إدخال تخصصك الطبي.')
        );
        return;
      }
    }

    setIsLoading(true);
    try {
      // Build the backend-compatible payload
      const basePayload = {
        full_name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password,
        user_type: userType,
      };

      const payload =
        userType === 'doctor'
          ? {
              ...basePayload,
              user_type: 'doctor' as const,
              license_number: licenseNumber.trim(),
              specialty: specialty.trim(),
              years_of_experience: yearsOfExperience ? parseInt(yearsOfExperience, 10) : 0,
            }
          : {
              ...basePayload,
              user_type: 'patient' as const,
              age: age ? parseInt(age, 10) : 25,
              gender: (gender === 'Female' ? 'female' : 'male') as 'male' | 'female',
            };

      // Step 1: Register user on backend
      await register(payload);

      // Step 2: If a profile photo was selected, upload it immediately
      if (avatarUri) {
        try {
          const uploadRes = await uploadAvatarApi(avatarUri);
          if (uploadRes?.avatar) {
            updateUser({ avatar: uploadRes.avatar });
          }
        } catch (uploadErr) {
          console.log('Avatar upload deferred:', uploadErr);
        }
      }

      // Automatically transitions to main app when isAuthenticated becomes true
    } catch (err: any) {
      console.log('Registration error:', err);
      // Only show a network error when NO HTTP response was received at all
      // (ApiError carries `status: null` in that case). Any real HTTP error
      // status (e.g. 409 Conflict) is a server response, not a network problem.
      if (
        err?.status === null ||
        err?.code === 'ECONNABORTED' ||
        err?.message?.toLowerCase().includes('network')
      ) {
        setErrorMessage(
          t(
            'Network error: Unable to connect to Sahatak server. Please check your internet connection and backend status.',
            'خطأ في الاتصال: تعذر الوصول إلى خادم صحتك. يرجى التحقق من اتصال الإنترنت وتشغيل الخادم.'
          )
        );
      } else {
        // ApiError.message already carries the backend's user-facing message
        // (e.g. "Email already registered" for a 409 Conflict response).
        const serverMsg = err?.message || t('Registration failed', 'فشل إنشاء الحساب');
        setErrorMessage(serverMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Header */}
        <View style={[styles.topBar, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Login')}
            style={[styles.backBtn, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
          >
            <BackIcon size={20} color={Colors.slate[700]} />
            <Text style={styles.backBtnText}>{t('Login', 'تسجيل الدخول')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setLang(lang === 'en' ? 'ar' : 'en')}
            style={[styles.langBtn, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
          >
            <Globe size={15} color={Colors.primary} />
            <Text style={styles.langBtnText}>{lang === 'en' ? 'العربية' : 'English'}</Text>
          </TouchableOpacity>
        </View>

        {/* Title Header */}
        <View style={[styles.titleSection, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.title, { textAlign: isRtl ? 'right' : 'left' }]}>
            {t('Create Your Account', 'إنشاء حساب جديد')}
          </Text>
          <Text style={[styles.subtitle, { textAlign: isRtl ? 'right' : 'left' }]}>
            {t(
              'Join Sahatak for instant telemedicine consultations and verified prescriptions.',
              'انضم إلى منصة صحتك للحصول على استشارات طبية فورية وروشتات معتمدة.'
            )}
          </Text>
        </View>

        {/* Profile Photo Capture Card */}
        <View style={styles.avatarCard}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowPhotoModal(true)}
            style={styles.avatarButton}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={38} color={Colors.slate[400]} />
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Camera size={14} color={Colors.white} />
            </View>
          </TouchableOpacity>

          <View style={styles.avatarTextContainer}>
            <Text style={styles.avatarPromptTitle}>
              {avatarUri
                ? t('Profile Photo Selected', 'تم اختيار الصورة الشخصية')
                : t('Add Profile Photo', 'إضافة صورة شخصية')}
            </Text>
            <Text style={styles.avatarPromptSubtitle}>
              {t(
                'Tap to take a photo or select from gallery',
                'اضغط للالتقاط بالكاميرا أو الاختيار من المعرض'
              )}
            </Text>
          </View>
        </View>

        {/* Error Alert Banner */}
        {errorMessage && (
          <View style={[styles.errorBanner, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <AlertCircle size={18} color={Colors.danger} style={{ marginTop: 2 }} />
            <Text style={[styles.errorBannerText, { textAlign: isRtl ? 'right' : 'left' }]}>
              {errorMessage}
            </Text>
          </View>
        )}

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* ── Role Selector: Patient / Doctor ── */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { textAlign: isRtl ? 'right' : 'left' }]}>
              {t('I am registering as', 'أسجّل باعتباري')} *
            </Text>
            <View style={[styles.genderToggle, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setUserType('patient')}
                style={[styles.genderBtn, userType === 'patient' && styles.genderBtnActive]}
              >
                <Text style={[styles.genderBtnText, userType === 'patient' && styles.genderBtnTextActive]}>
                  {t('Patient', 'مريض')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setUserType('doctor')}
                style={[styles.genderBtn, userType === 'doctor' && styles.genderBtnActive]}
              >
                <Text style={[styles.genderBtnText, userType === 'doctor' && styles.genderBtnTextActive]}>
                  {t('Doctor', 'طبيب')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { textAlign: isRtl ? 'right' : 'left' }]}>
              {t('Full Name (English / Latin)', 'الاسم الكامل (بالإنجليزية)')} *
            </Text>
            <View style={[styles.inputBox, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <User size={18} color={Colors.slate[400]} />
              <TextInput
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={t('e.g. John Doe', 'مثال: John Doe')}
                placeholderTextColor={Colors.slate[400]}
                style={[styles.textInput, { textAlign: isRtl ? 'right' : 'left' }]}
              />
            </View>
          </View>

          {/* Arabic Name (Optional) */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { textAlign: isRtl ? 'right' : 'left' }]}>
              {t('Name in Arabic (Optional)', 'الاسم بالعربية (اختياري)')}
            </Text>
            <View style={[styles.inputBox, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <User size={18} color={Colors.slate[400]} />
              <TextInput
                value={nameAr}
                onChangeText={setNameAr}
                placeholder={t('e.g. أحمد منصور', 'مثال: أحمد منصور')}
                placeholderTextColor={Colors.slate[400]}
                style={[styles.textInput, { textAlign: 'right' }]}
              />
            </View>
          </View>

          {/* Email Address */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { textAlign: isRtl ? 'right' : 'left' }]}>
              {t('Email Address', 'البريد الإلكتروني')} *
            </Text>
            <View style={[styles.inputBox, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <Mail size={18} color={Colors.slate[400]} />
              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="name@example.com"
                placeholderTextColor={Colors.slate[400]}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.textInput, { textAlign: isRtl ? 'right' : 'left' }]}
              />
            </View>
          </View>

          {/* Phone Number */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { textAlign: isRtl ? 'right' : 'left' }]}>
              {t('Phone Number', 'رقم الهاتف')} *
            </Text>
            <View style={[styles.inputBox, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <Phone size={18} color={Colors.slate[400]} />
              <TextInput
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={t('+966 50 000 0000', '+966 50 000 0000')}
                placeholderTextColor={Colors.slate[400]}
                keyboardType="phone-pad"
                style={[styles.textInput, { textAlign: isRtl ? 'right' : 'left' }]}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { textAlign: isRtl ? 'right' : 'left' }]}>
              {t('Password', 'كلمة المرور')} *
            </Text>
            <View style={[styles.inputBox, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <Lock size={18} color={Colors.slate[400]} />
              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={t('At least 6 characters', '٦ أحرف على الأقل')}
                placeholderTextColor={Colors.slate[400]}
                secureTextEntry={!showPassword}
                style={[styles.textInput, { textAlign: isRtl ? 'right' : 'left' }]}
              />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? (
                  <EyeOff size={18} color={Colors.slate[400]} />
                ) : (
                  <Eye size={18} color={Colors.slate[400]} />
                )}
              </TouchableOpacity>
            </View>
          </View>


          {/* ── Doctor-specific fields (hidden for patients) ── */}
          {userType === 'doctor' && (
            <>
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { textAlign: isRtl ? 'right' : 'left' }]}>
                  {t('Medical License Number', 'رقم الترخيص الطبي')} *
                </Text>
                <View style={[styles.inputBox, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <User size={18} color={Colors.slate[400]} />
                  <TextInput
                    value={licenseNumber}
                    onChangeText={(text) => {
                      setLicenseNumber(text);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder={t('e.g. SA-12345', 'مثال: SA-12345')}
                    placeholderTextColor={Colors.slate[400]}
                    autoCapitalize="characters"
                    style={[styles.textInput, { textAlign: isRtl ? 'right' : 'left' }]}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { textAlign: isRtl ? 'right' : 'left' }]}>
                  {t('Medical Specialty', 'التخصص الطبي')} *
                </Text>
                <View style={[styles.inputBox, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <User size={18} color={Colors.slate[400]} />
                  <TextInput
                    value={specialty}
                    onChangeText={(text) => {
                      setSpecialty(text);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder={t('e.g. Cardiology', 'مثال: أمراض القلب')}
                    placeholderTextColor={Colors.slate[400]}
                    style={[styles.textInput, { textAlign: isRtl ? 'right' : 'left' }]}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { textAlign: isRtl ? 'right' : 'left' }]}>
                  {t('Years of Experience', 'سنوات الخبرة')}
                </Text>
                <View style={styles.inputBox}>
                  <TextInput
                    value={yearsOfExperience}
                    onChangeText={setYearsOfExperience}
                    placeholder="5"
                    placeholderTextColor={Colors.slate[400]}
                    keyboardType="numeric"
                    style={[styles.textInput, { textAlign: 'center' }]}
                  />
                </View>
              </View>
            </>
          )}

          {/* ── Patient-specific fields: Gender & Age (hidden for doctors) ── */}
          {userType === 'patient' && (
            <View style={[styles.rowFields, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={[styles.fieldLabel, { textAlign: isRtl ? 'right' : 'left' }]}>
                  {t('Gender', 'الجنس')}
                </Text>
                <View style={[styles.genderToggle, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setGender('Male')}
                    style={[styles.genderBtn, gender === 'Male' && styles.genderBtnActive]}
                  >
                    <Text style={[styles.genderBtnText, gender === 'Male' && styles.genderBtnTextActive]}>
                      {t('Male', 'ذكر')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setGender('Female')}
                    style={[styles.genderBtn, gender === 'Female' && styles.genderBtnActive]}
                  >
                    <Text style={[styles.genderBtnText, gender === 'Female' && styles.genderBtnTextActive]}>
                      {t('Female', 'أنثى')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ width: 100, gap: 6 }}>
                <Text style={[styles.fieldLabel, { textAlign: isRtl ? 'right' : 'left' }]}>
                  {t('Age', 'العمر')}
                </Text>
                <View style={styles.inputBox}>
                  <TextInput
                    value={age}
                    onChangeText={setAge}
                    placeholder="30"
                    placeholderTextColor={Colors.slate[400]}
                    keyboardType="numeric"
                    style={[styles.textInput, { textAlign: 'center' }]}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSignup}
            disabled={isLoading}
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <View style={[styles.btnRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <Text style={styles.submitButtonText}>
                  {t('Create Account', 'إنشاء الحساب')}
                </Text>
                <Arrow size={18} color={Colors.white} />
              </View>
            )}
          </TouchableOpacity>

          {/* Email Verification Notice */}
          <View style={[styles.verifyNotice, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <Mail size={16} color="#0369a1" style={{ marginTop: 1 }} />
            <Text style={[styles.verifyNoticeText, { textAlign: isRtl ? 'right' : 'left' }]}>
              {t(
                'After registration, you will receive a verification email. Please check your inbox (and spam folder) and click the link to activate your account before logging in.',
                'بعد التسجيل ستصلك رسالة بريد إلكتروني للتحقق من حسابك.\nيرجى فتح بريدك الإلكتروني (أو مجلد Spam) والنقر على رابط التفعيل قبل تسجيل الدخول.'
              )}
            </Text>
          </View>
        </View>


        {/* Footer */}
        <View style={styles.footerSection}>
          <Text style={styles.footerPrompt}>
            {t('Already have an account?', 'لديك حساب بالفعل؟')}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Login')}
            style={styles.loginLinkBtn}
          >
            <Text style={styles.loginLinkText}>
              {t('Sign In', 'تسجيل الدخول')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Photo Selection Action Modal */}
        <Modal
          visible={showPhotoModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPhotoModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={[styles.modalHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <Text style={styles.modalTitle}>
                  {t('Profile Photo', 'صورة الملف الشخصي')}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowPhotoModal(false)}
                  style={styles.modalCloseBtn}
                >
                  <X size={18} color={Colors.slate[500]} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleTakePhoto}
                style={[styles.modalOption, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
              >
                <View style={[styles.optionIconWrap, { backgroundColor: Colors.primarySubtle }]}>
                  <Camera size={20} color={Colors.primary} />
                </View>
                <View style={{ flex: 1, alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
                  <Text style={styles.optionTitle}>
                    {t('Take Photo', 'التقاط صورة بالكاميرا')}
                  </Text>
                  <Text style={styles.optionSubtitle}>
                    {t('Use device camera', 'استخدام كاميرا الهاتف')}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handlePickFromGallery}
                style={[styles.modalOption, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
              >
                <View style={[styles.optionIconWrap, { backgroundColor: Colors.accentLight }]}>
                  <ImageIcon size={20} color={Colors.accent} />
                </View>
                <View style={{ flex: 1, alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
                  <Text style={styles.optionTitle}>
                    {t('Choose from Gallery', 'اختيار من معرض الصور')}
                  </Text>
                  <Text style={styles.optionSubtitle}>
                    {t('Select an existing photo', 'اختيار صورة محفوظة')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  topBar: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.slate[700],
  },
  langBtn: {
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.slate[200],
    ...Shadows.sm,
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  titleSection: {
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.slate[900],
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.slate[500],
    lineHeight: 18,
  },
  avatarCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    alignItems: 'center',
    marginBottom: 16,
    ...Shadows.sm,
  },
  avatarButton: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.slate[100],
    borderWidth: 2,
    borderColor: Colors.slate[200],
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  avatarTextContainer: {
    alignItems: 'center',
  },
  avatarPromptTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.slate[800],
  },
  avatarPromptSubtitle: {
    fontSize: 11,
    color: Colors.slate[400],
    marginTop: 2,
  },
  errorBanner: {
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 14,
    padding: 12,
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 16,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dangerDark,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    gap: 14,
    ...Shadows.md,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate[700],
  },
  inputBox: {
    backgroundColor: Colors.slate[50],
    borderWidth: 1,
    borderColor: Colors.slate[200],
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    alignItems: 'center',
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.slate[900],
    height: '100%',
  },
  eyeBtn: {
    padding: 4,
  },
  rowFields: {
    gap: 12,
  },
  genderToggle: {
    backgroundColor: Colors.slate[100],
    borderRadius: 12,
    padding: 3,
    height: 48,
  },
  genderBtn: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderBtnActive: {
    backgroundColor: Colors.white,
    ...Shadows.sm,
  },
  genderBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.slate[600],
  },
  genderBtnTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    ...Shadows.sm,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  btnRow: {
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  footerPrompt: {
    fontSize: 13,
    color: Colors.slate[500],
  },
  loginLinkBtn: {
    paddingVertical: 4,
  },
  loginLinkText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalSheet: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    gap: 12,
    ...Shadows.lg,
  },
  modalHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.slate[900],
  },
  modalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOption: {
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: 16,
    backgroundColor: Colors.slate[50],
  },
  optionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.slate[800],
  },
  optionSubtitle: {
    fontSize: 11,
    color: Colors.slate[400],
    marginTop: 1,
  },
  verifyNotice: {
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    padding: 12,
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  verifyNoticeText: {
    flex: 1,
    fontSize: 11,
    color: '#0c4a6e',
    lineHeight: 17,
    fontWeight: '500',
  },
});

