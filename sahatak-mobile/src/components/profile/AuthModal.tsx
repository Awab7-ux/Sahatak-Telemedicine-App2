import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShieldCheck, X, Mail, Lock, User, Phone } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/styles';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const { login, register, isRtl, t } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState<string>('ahmed.mansoor@example.com');
  const [password, setPassword] = useState<string>('password123');
  const [name, setName] = useState<string>('Ahmed Mansoor');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('Error', 'خطأ'), t('Please fill in all fields', 'يرجى ملء جميع الحقول'));
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        Alert.alert(t('Success', 'نجاح'), t('Logged in successfully!', 'تم تسجيل الدخول بنجاح!'));
        onClose();
      } else {
        await register({ full_name: name, email, phone: '+966500000000', password, user_type: 'patient', age: 25, gender: 'male' });
        Alert.alert(t('Success', 'نجاح'), t('Account created successfully!', 'تم إنشاء الحساب بنجاح!'));
        onClose();
      }
    } catch (e: any) {
      Alert.alert(t('Error', 'خطأ'), e?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View style={styles.overlay}>
        <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={[styles.headerRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <View style={[styles.logoRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <ShieldCheck size={24} color={Colors.primary} />
              <Text style={styles.title}>
                {mode === 'login'
                  ? t('Login to Sahatak', 'تسجيل الدخول إلى صحتك')
                  : t('Create Account', 'إنشاء حساب جديد')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={Colors.slate[500]} />
            </TouchableOpacity>
          </View>

          {/* Toggle Tab */}
          <View style={[styles.toggleRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setMode('login')}
              style={[
                styles.toggleBtn,
                mode === 'login' && styles.toggleBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  mode === 'login' && styles.toggleTextActive,
                ]}
              >
                {t('Login', 'تسجيل الدخول')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setMode('register')}
              style={[
                styles.toggleBtn,
                mode === 'register' && styles.toggleBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  mode === 'register' && styles.toggleTextActive,
                ]}
              >
                {t('Register', 'حساب جديد')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={{ gap: 12, marginTop: 12 }}>
            {mode === 'register' && (
              <View style={[styles.inputContainer, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <User size={18} color={Colors.slate[400]} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder={t('Full Name', 'الاسم الكامل')}
                  placeholderTextColor={Colors.slate[400]}
                  style={[styles.input, { textAlign: isRtl ? 'right' : 'left' }]}
                />
              </View>
            )}

            <View style={[styles.inputContainer, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <Mail size={18} color={Colors.slate[400]} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder={t('Email Address', 'البريد الإلكتروني')}
                placeholderTextColor={Colors.slate[400]}
                style={[styles.input, { textAlign: isRtl ? 'right' : 'left' }]}
              />
            </View>

            <View style={[styles.inputContainer, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <Lock size={18} color={Colors.slate[400]} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder={t('Password', 'كلمة المرور')}
                placeholderTextColor={Colors.slate[400]}
                style={[styles.input, { textAlign: isRtl ? 'right' : 'left' }]}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSubmit}
              disabled={isLoading}
              style={styles.submitBtn}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>
                  {mode === 'login'
                    ? t('Login', 'تسجيل الدخول')
                    : t('Create My Account', 'إنشاء الحساب')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
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
  headerRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoRow: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.slate[900],
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRow: {
    backgroundColor: Colors.slate[100],
    borderRadius: 14,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: Colors.white,
    ...Shadows.sm,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.slate[600],
  },
  toggleTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  inputContainer: {
    backgroundColor: Colors.slate[50],
    borderWidth: 1,
    borderColor: Colors.slate[200],
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: Colors.slate[900],
    height: '100%',
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});

