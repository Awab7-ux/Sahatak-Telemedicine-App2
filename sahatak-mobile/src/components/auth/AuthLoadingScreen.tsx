import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';

export const AuthLoadingScreen: React.FC = () => {
  const { t } = useApp();

  return (
    <View style={styles.container}>
      <View style={styles.brandContainer}>
        <View style={styles.iconWrap}>
          <ShieldCheck size={48} color={Colors.white} />
        </View>
        <Text style={styles.brandTitle}>{t('Sahatak', 'صحتك')}</Text>
        <Text style={styles.brandSubtitle}>
          {t('Telemedicine & Health Services', 'منصة الرعاية الصحية والاستشارات')}
        </Text>
      </View>

      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>
          {t('Connecting securely...', 'جارٍ الاتصال بأمان...')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.slate[900],
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: Colors.slate[500],
    marginTop: 4,
    textAlign: 'center',
  },
  loadingWrap: {
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.slate[500],
    fontWeight: '500',
  },
});

