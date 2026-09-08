import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Globe,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { RootStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/styles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { login, lang, setLang, isRtl, t } = useApp();

  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const handleLogin = async () => {
    setErrorMessage(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier || !password) {
      setErrorMessage(
        t(
          'Please enter your email or phone and password',
          'يرجى إدخال البريد الإلكتروني أو رقم الهاتف وكلمة المرور'
        )
      );
      return;
    }

    setIsLoading(true);
    try {
      await login(cleanIdentifier, password);
      // Navigation is handled automatically by AppNavigator reacting to isAuthenticated
    } catch (err: any) {
      if (err?.status === 401) {
        setErrorMessage(
          t(
            'Invalid credentials. Please check your email/phone and password.',
            'بيانات الدخول غير صحيحة. يرجى التأكد من البريد/الهاتف وكلمة المرور.'
          )
        );
      } else if (err?.status === null || err?.code === 'ECONNABORTED' || err?.message?.toLowerCase().includes('network')) {
        setErrorMessage(
          t(
            'Network error: Unable to reach Sahatak server. Please check your internet connection and backend status.',
            'خطأ في الاتصال: تعذر الوصول إلى خادم صحتك. يرجى التحقق من اتصال الإنترنت وتشغيل الخادم.'
          )
        );
      } else {
        // ApiError.message already carries the backend's user-facing message
        const serverMsg = err?.message || t('Login failed', 'فشل تسجيل الدخول');
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
        {/* Top Header with Language Switch */}
        <View style={[styles.topBar, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={[styles.brandBadge, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <ShieldCheck size={18} color={Colors.primary} />
            <Text style={styles.brandBadgeText}>{t('Sahatak', 'صحتك')}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setLang(lang === 'en' ? 'ar' : 'en')}
            style={[styles.langBtn, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
          >
            <Globe size={15} color={Colors.primary} />
            <Text style={styles.langBtnText}>{lang === 'en' ? 'العربية' : 'English'}</Text>
          </TouchableOpacity>
        </View>

        {/* Welcome Hero */}
        <View style={[styles.heroSection, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
          <View style={styles.iconCircle}>
            <ShieldCheck size={36} color={Colors.primary} />
          </View>
          <Text style={[styles.welcomeTitle, { textAlign: isRtl ? 'right' : 'left' }]}>
            {t('Welcome Back', 'مرحباً بعودتك')}
          </Text>
          <Text style={[styles.welcomeSubtitle, { textAlign: isRtl ? 'right' : 'left' }]}>
            {t(
              'Sign in to access your consultations, medical records, and prescriptions.',
              'سجّل الدخول للوصول إلى مواعيدك واستشاراتك وسجلاتك الطبية.'
            )}
          </Text>
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
          {/* Identifier Input */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { textAlign: isRtl ? 'right' : 'left' }]}>
              {t('Email or Phone Number', 'البريد الإلكتروني أو رقم الهاتف')}
            </Text>
            <View style={[styles.inputBox, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <Mail size={18} color={Colors.slate[400]} />
              <TextInput
                value={identifier}
                onChangeText={(text) => {
                  setIdentifier(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={t('name@example.com or +966...', 'name@example.com أو +966...')}
                placeholderTextColor={Colors.slate[400]}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.textInput, { textAlign: isRtl ? 'right' : 'left' }]}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { textAlign: isRtl ? 'right' : 'left' }]}>
              {t('Password', 'كلمة المرور')}
            </Text>
            <View style={[styles.inputBox, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <Lock size={18} color={Colors.slate[400]} />
              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={t('Enter your password', 'أدخل كلمة المرور')}
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

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={isLoading}
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <View style={[styles.btnRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <Text style={styles.submitButtonText}>
                  {t('Sign In', 'تسجيل الدخول')}
                </Text>
                <Arrow size={18} color={Colors.white} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer / Switch to Signup */}
        <View style={styles.footerSection}>
          <Text style={styles.footerPrompt}>
            {t("Don't have an account?", 'ليس لديك حساب؟')}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Signup')}
            style={styles.signupLinkBtn}
          >
            <Text style={styles.signupLinkText}>
              {t('Create New Account', 'إنشاء حساب جديد')}
            </Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'center',
  },
  topBar: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandBadge: {
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primarySubtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  brandBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
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
  heroSection: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: Colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.slate[900],
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: Colors.slate[500],
    lineHeight: 19,
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
    gap: 16,
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
    height: 50,
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
    marginTop: 24,
    flexWrap: 'wrap',
  },
  footerPrompt: {
    fontSize: 13,
    color: Colors.slate[500],
  },
  signupLinkBtn: {
    paddingVertical: 4,
  },
  signupLinkText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
});

