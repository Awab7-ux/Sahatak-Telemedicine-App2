/**
 * Video Consultation Screen
 * 
 * TODO for Production WebRTC:
 * To upgrade this screen to real-time WebRTC video/audio streaming:
 * 1. Install 'react-native-webrtc' or 'react-native-agora'
 * 2. Connect token generation with backend route /api/consultations/:id/token
 * 3. Replace the simulated Image backgrounds below with <RTCView /> from react-native-webrtc
 *    or <RtcSurfaceView /> from react-native-agora.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Volume2,
  VolumeX,
  AlertTriangle,
  Send,
  X,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { DOCTORS } from '../../data/mockData';
import { Colors } from '../../theme/colors';

export const VideoConsultationScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { activeAppointment, navigateTo, user, isRtl, t } = useApp();

  const doctor = activeAppointment?.doctor || DOCTORS[0];

  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(552);
  const [inCallMessage, setInCallMessage] = useState<string>('');
  const [inCallChat, setInCallChat] = useState<Array<{ sender: 'doc' | 'me'; text: string; time: string }>>([
    { sender: 'doc', text: 'Hello Ahmed! I can hear and see you clearly.', time: '09:01' },
    { sender: 'me', text: 'Good morning Dr. Lalana. Thank you for taking this call.', time: '09:02' },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendInCallChat = () => {
    if (!inCallMessage.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setInCallChat((prev) => [...prev, { sender: 'me', text: inCallMessage, time: now }]);
    setInCallMessage('');
  };

  const handleEndCall = () => {
    navigateTo('my_appointments');
  };

  return (
    <View style={styles.container}>
      {/* Background Doctor Video (Simulated Feed) */}
      <Image
        source={{ uri: doctor.avatar }}
        style={styles.fullscreenVideo}
        resizeMode="cover"
      />
      <View style={styles.vignetteOverlay} />

      {/* Top Header Bar */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: Math.max(insets.top, 14),
            flexDirection: isRtl ? 'row-reverse' : 'row',
          },
        ]}
      >
        <View style={[styles.docBadge, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={styles.pulseDot} />
          <View style={{ alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
            <Text style={styles.docBadgeName}>{t(doctor.name, doctor.nameAr)}</Text>
            <Text style={styles.timerText}>⏱ {formatTimer(elapsedSeconds)}</Text>
          </View>
        </View>

        <View style={[styles.hdBadge, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={styles.hdDot} />
          <Text style={styles.hdText}>HD 1080p</Text>
        </View>
      </View>

      {/* Picture-in-Picture (Patient Self Preview) */}
      <View style={[styles.pipContainer, { top: Math.max(insets.top, 14) + 60 }]}>
        {isVideoOn ? (
          <Image source={{ uri: user.avatar }} style={styles.pipImage} />
        ) : (
          <View style={styles.pipVideoOff}>
            <VideoOff size={18} color={Colors.slate[400]} />
            <Text style={styles.pipOffText}>{t('Camera Off', 'الكاميرا مغلقة')}</Text>
          </View>
        )}
        <View style={styles.pipLabel}>
          <Text style={styles.pipLabelText}>{t('You', 'أنت')}</Text>
        </View>
      </View>

      {/* Remaining Time Warning Callout */}
      <View style={styles.warningContainer}>
        <View style={[styles.warningBanner, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <AlertTriangle size={16} color="#fef08a" />
          <Text style={styles.warningText}>
            {t('Less than 10 minutes remaining call time.', 'أقل من 10 دقائق متبقية من وقت الاستشارة.')}
          </Text>
        </View>
      </View>

      {/* Bottom Floating Rounded Control Bar */}
      <View style={[styles.controlBarWrapper, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={[styles.controlBar, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          {/* Camera Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsVideoOn(!isVideoOn)}
            style={[
              styles.controlBtn,
              !isVideoOn && styles.controlBtnDanger,
            ]}
          >
            {isVideoOn ? <VideoIcon size={22} color={Colors.white} /> : <VideoOff size={22} color={Colors.white} />}
          </TouchableOpacity>

          {/* Mic Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsMicOn(!isMicOn)}
            style={[
              styles.controlBtn,
              !isMicOn && styles.controlBtnDanger,
            ]}
          >
            {isMicOn ? <Mic size={22} color={Colors.white} /> : <MicOff size={22} color={Colors.white} />}
          </TouchableOpacity>

          {/* In-Call Chat Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsChatOpen(!isChatOpen)}
            style={styles.controlBtn}
          >
            <MessageSquare size={22} color={Colors.white} />
            <View style={styles.chatBadgeDot} />
          </TouchableOpacity>

          {/* Speaker Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsSpeakerOn(!isSpeakerOn)}
            style={[
              styles.controlBtn,
              !isSpeakerOn && { backgroundColor: Colors.warning },
            ]}
          >
            {isSpeakerOn ? <Volume2 size={22} color={Colors.white} /> : <VolumeX size={22} color={Colors.white} />}
          </TouchableOpacity>

          {/* End Call Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleEndCall}
            style={styles.endCallBtn}
          >
            <PhoneOff size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* In-Call Chat Drawer Modal */}
      {isChatOpen && (
        <View style={styles.chatDrawer}>
          <View style={[styles.chatDrawerHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <View style={[styles.chatDrawerTitleRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <MessageSquare size={16} color={Colors.primaryLight} />
              <Text style={styles.chatDrawerTitle}>
                {t('In-Call Live Chat', 'المحادثة أثناء المكالمة')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setIsChatOpen(false)} style={styles.closeDrawerBtn}>
              <X size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.chatMessagesScroll} contentContainerStyle={{ gap: 8 }}>
            {inCallChat.map((msg, i) => (
              <View
                key={i}
                style={[
                  styles.inCallMsgRow,
                  { alignItems: msg.sender === 'me' ? 'flex-end' : 'flex-start' },
                ]}
              >
                <View
                  style={[
                    styles.inCallBubble,
                    msg.sender === 'me' ? styles.inCallBubbleMe : styles.inCallBubbleDoc,
                  ]}
                >
                  <Text style={styles.inCallMsgText}>{msg.text}</Text>
                </View>
                <Text style={styles.inCallTime}>{msg.time}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={[styles.chatInputRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <TextInput
              value={inCallMessage}
              onChangeText={setInCallMessage}
              placeholder={t('Type a message to doctor...', 'اكتب رسالة للطبيب...')}
              placeholderTextColor={Colors.slate[400]}
              style={[
                styles.chatInput,
                { textAlign: isRtl ? 'right' : 'left' },
              ]}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSendInCallChat}
              style={styles.chatSendBtn}
            >
              <Send size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  fullscreenVideo: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  vignetteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  topBar: {
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  docBadge: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  docBadgeName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  timerText: {
    fontSize: 10,
    color: '#bae6fd',
    fontWeight: '600',
  },
  hdBadge: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  hdDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38bdf8',
  },
  hdText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38bdf8',
  },
  pipContainer: {
    position: 'absolute',
    right: 16,
    width: 90,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: '#1e293b',
    zIndex: 20,
  },
  pipImage: {
    width: '100%',
    height: '100%',
  },
  pipVideoOff: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },
  pipOffText: {
    fontSize: 8,
    color: Colors.slate[400],
    marginTop: 4,
  },
  pipLabel: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pipLabelText: {
    fontSize: 8,
    color: Colors.white,
    fontWeight: '600',
  },
  warningContainer: {
    position: 'absolute',
    bottom: 110,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  warningBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(254, 202, 202, 0.4)',
  },
  warningText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  controlBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  controlBar: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  controlBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnDanger: {
    backgroundColor: Colors.danger,
  },
  chatBadgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.primary,
  },
  endCallBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatDrawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    zIndex: 30,
  },
  chatDrawerHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  chatDrawerTitleRow: {
    alignItems: 'center',
    gap: 6,
  },
  chatDrawerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  closeDrawerBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatMessagesScroll: {
    flex: 1,
    paddingVertical: 10,
  },
  inCallMsgRow: {
    marginBottom: 6,
  },
  inCallBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    maxWidth: '80%',
  },
  inCallBubbleMe: {
    backgroundColor: Colors.primary,
  },
  inCallBubbleDoc: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  inCallMsgText: {
    color: Colors.white,
    fontSize: 12,
  },
  inCallTime: {
    fontSize: 9,
    color: Colors.slate[400],
    marginTop: 2,
  },
  chatInputRow: {
    gap: 8,
    alignItems: 'center',
    paddingTop: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    color: Colors.white,
    fontSize: 12,
  },
  chatSendBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

