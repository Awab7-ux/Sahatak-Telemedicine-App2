/**
 * Video Consultation Screen — REAL Jitsi integration
 *
 * CONFIRMED from the production backend + website source:
 *  - Domain comes dynamically from GET /appointments/:id/video/config (meet.ffmuc.net).
 *  - The website joins the deterministic PUBLIC room
 *      sahatak_appointment_{appointmentId}
 *    with NO JWT (frontend video-consultation.js "BYPASS BACKEND" path), so a
 *    patient joining from mobile lands in the SAME room the doctor opens
 *    from the website.
 *  - Backend lifecycle: video/join on entry (tolerated to fail if the doctor
 *    hasn't started the session), heartbeat every 30s while active, video/end
 *    on leave.
 *
 * Integration approach: Option A — react-native-webview loading the Jitsi
 * Meet web client (works with Expo Go / EAS managed builds; NO custom dev
 * client). Jitsi's mobile web client provides the interactive in-room
 * controls (microphone, camera, camera flip, chat), while our floating
 * native header provides doctor info, live duration timer, and End Call.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  AppState,
  Image,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PhoneOff, AlertTriangle, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { DOCTORS } from '../../data/mockData';
import { Colors } from '../../theme/colors';
import {
  getVideoConfigApi,
  joinVideoSessionApi,
  endVideoSessionApi,
  sendVideoHeartbeatApi,
} from '../../api/video';

export const VideoConsultationScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { activeAppointment, navigateTo, isRtl, t, user } = useApp();

  const doctor = activeAppointment?.doctor || DOCTORS[0];
  const appointmentId = activeAppointment?.id ?? '';
  const isRealAppointment = /^\d+$/.test(appointmentId);

  const [roomUrl, setRoomUrl] = useState<string>('');
  const [status, setStatus] = useState<'connecting' | 'active' | 'error'>('connecting');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const isEndingRef = useRef(false);
  const isAppActiveRef = useRef(true);

  const Chevron = isRtl ? ChevronRight : ChevronLeft;

  // ── Build the room URL matching the website's exact room join ──────────
  const setupRoom = useCallback(async () => {
    if (!isRealAppointment) {
      setStatus('error');
      setErrorMsg(
        t(
          'This is a demo appointment — no real video session is available.',
          'هذا موعد تجريبي — لا توجد جلسة فيديو حقيقية متاحة.',
        ),
      );
      return;
    }

    try {
      // 1. Fetch domain from backend
      const config = await getVideoConfigApi(appointmentId);
      const domain = config?.jitsi_domain || 'meet.ffmuc.net';

      // 2. Deterministic public room name matching the website
      const roomName = `sahatak_appointment_${appointmentId}`;

      // 3. Register participant join with backend (silent if doctor hasn't started yet)
      joinVideoSessionApi(appointmentId).catch(() => undefined);

      // 4. Build URL hash configuration
      const displayName = encodeURIComponent(
        user?.name ? `${user.name} (Patient)` : `Patient #${appointmentId}`,
      );

      const hashParams = [
        `userInfo.displayName="${displayName}"`,
        'config.disableDeepLinking=true',
        'config.enableWelcomePage=false',
        'config.enableClosePage=false',
        'config.prejoinPageEnabled=false',
        'config.skipPrejoin=true',
        'config.enableInsecureRoomNameWarning=false',
        'config.disableModeratorIndicator=true',
        'config.startWithAudioMuted=false',
        'config.startWithVideoMuted=false',
        'config.defaultLanguage="ar"',
      ].join('&');

      const fullUrl = `https://${domain}/${roomName}#${hashParams}`;
      setRoomUrl(fullUrl);
      setStatus('active');
    } catch (err) {
      console.warn('[VideoDebug] Room setup failed:', err);
      setStatus('error');
      setErrorMsg(
        t(
          "Couldn't reach the video service. Please check your connection and try again.",
          'تعذر الاتصال بخدمة الفيديو. يرجى التحقق من اتصالك والمحاولة مرة أخرى.',
        ),
      );
    }
  }, [appointmentId, isRealAppointment, t, user?.name]);

  useEffect(() => {
    setupRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Call duration timer ───────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'active') return;
    const timer = setInterval(() => setElapsedSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [status]);

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ── Pause heartbeat while backgrounded ────────────────────────────────
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      isAppActiveRef.current = state === 'active';
    });
    return () => sub.remove();
  }, []);

  // ── Heartbeat every 30s while call is active ──────────────────────────
  useEffect(() => {
    if (status !== 'active' || !isRealAppointment) return;
    const beat = () => {
      if (!isAppActiveRef.current || isEndingRef.current) return;
      sendVideoHeartbeatApi(appointmentId).catch(() => undefined);
    };
    beat();
    const interval = setInterval(beat, 30000);
    return () => clearInterval(interval);
  }, [status, appointmentId, isRealAppointment]);

  // ── End call & leave ──────────────────────────────────────────────────
  const handleEndCall = useCallback(async () => {
    if (isEndingRef.current) return;
    isEndingRef.current = true;
    if (isRealAppointment) {
      try {
        await endVideoSessionApi(appointmentId);
      } catch {
        // Tolerated if doctor already closed session
      }
    }
    navigateTo('my_appointments');
  }, [appointmentId, isRealAppointment, navigateTo]);

  // ── Error View ────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.errorContent}>
          <View style={styles.errorIconCircle}>
            <AlertTriangle size={36} color={Colors.danger} />
          </View>
          <Text style={styles.errorTitle}>
            {t('Unable to Start Consultation', 'تعذر بدء الاستشارة')}
          </Text>
          <Text style={styles.errorDescription}>{errorMsg}</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigateTo('my_appointments')}
            style={styles.returnBtn}
          >
            <Chevron size={18} color={Colors.white} />
            <Text style={styles.returnBtnText}>
              {t('Back to Appointments', 'العودة إلى المواعيد')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Connecting View ───────────────────────────────────────────────────
  if (status === 'connecting') {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <View style={styles.avatarPulsing}>
          <Image source={{ uri: doctor.avatar }} style={styles.connectingAvatar} />
          <View style={styles.pulseRing} />
        </View>
        <Text style={styles.connectingDoctorName}>
          {t(doctor.name, doctor.nameAr)}
        </Text>
        <Text style={styles.connectingSpecialty}>
          {t(doctor.specialty, doctor.specialtyAr)}
        </Text>
        <View style={styles.connectingIndicatorRow}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.connectingText}>
            {t('Connecting to consultation room...', 'جاري الاتصال بغرفة الاستشارة...')}
          </Text>
        </View>
      </View>
    );
  }

  // ── Active Call View ──────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Real Jitsi Meet room via WebView */}
      <WebView
        source={{ uri: roomUrl }}
        style={styles.fullscreenWebview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={['*']}
        onPermissionRequest={(event: any) => {
          // Grant camera & microphone access on Android WebView
          if (Platform.OS === 'android') {
            event.request?.grant(event.request?.resources);
          }
        }}
        userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36"
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingOverlayText}>
              {t('Loading video stream...', 'جاري تحميل البث المباشر...')}
            </Text>
          </View>
        )}
      />

      {/* Floating Top Bar (Doctor info, timer, HD indicator) */}
      <View
        style={[
          styles.topFloatingBar,
          {
            top: Math.max(insets.top, 12),
            flexDirection: isRtl ? 'row-reverse' : 'row',
          },
        ]}
      >
        <View style={[styles.doctorPill, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <Image source={{ uri: doctor.avatar }} style={styles.pillAvatar} />
          <View style={{ alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
            <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 4 }}>
              <Text numberOfLines={1} style={styles.pillDoctorName}>
                {t(doctor.name, doctor.nameAr)}
              </Text>
              {doctor.isVerified && <ShieldCheck size={12} color="#38bdf8" />}
            </View>
            <Text style={styles.pillTimer}>⏱ {formatTimer(elapsedSeconds)}</Text>
          </View>
        </View>

        {/* Floating End Call Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleEndCall}
          style={styles.hangupBtn}
          accessibilityLabel="End Consultation"
        >
          <PhoneOff size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  fullscreenWebview: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#020617',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingOverlayText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  // Floating Top Header
  topFloatingBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 50,
  },
  doctorPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    maxWidth: '75%',
  },
  pillAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e293b',
  },
  pillDoctorName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
    maxWidth: 120,
  },
  pillTimer: {
    fontSize: 10,
    color: '#38bdf8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
  },
  hangupBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  // Connecting State
  avatarPulsing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  connectingAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  pulseRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Colors.primary,
    opacity: 0.3,
  },
  connectingDoctorName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 4,
    textAlign: 'center',
  },
  connectingSpecialty: {
    fontSize: 13,
    color: Colors.slate[400],
    marginBottom: 24,
    textAlign: 'center',
  },
  connectingIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  connectingText: {
    fontSize: 12,
    color: Colors.slate[300],
    fontWeight: '500',
  },
  // Error State
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 13,
    color: Colors.slate[400],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  returnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  returnBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});

