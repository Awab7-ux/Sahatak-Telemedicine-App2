import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Video,
  PhoneCall,
  CheckCheck,
  ShoppingBag,
  Clock,
  Sparkles,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { DOCTORS } from '../../data/mockData';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/styles';

export const DoctorChatScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    activeChatDoctor,
    chatMessages,
    sendChatMessage,
    loadChatHistory,
    navigateTo,
    addToCart,
    products,
    isRtl,
    t,
  } = useApp();

  const doctor = activeChatDoctor || DOCTORS[0];
  const [inputText, setInputText] = useState<string>('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const BackIcon = isRtl ? ChevronRight : ChevronLeft;

  // Load real message history from the backend when screen mounts
  useEffect(() => {
    if (doctor?.id) {
      loadChatHistory(doctor.id);
    }
  }, [doctor?.id]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    sendChatMessage(inputText, 'text');
    setInputText('');
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleQuickPrompt = (promptText: string) => {
    sendChatMessage(promptText, 'text');
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <View style={styles.container}>
      {/* Top Doctor Chat Header */}
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: Math.max(insets.top, 12),
            flexDirection: isRtl ? 'row-reverse' : 'row',
          },
        ]}
      >
        <View style={[styles.headerDoctorRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigateTo('home')}
            style={styles.backBtn}
          >
            <BackIcon size={20} color={Colors.slate[700]} />
          </TouchableOpacity>

          <View style={styles.avatarWrap}>
            <Image source={{ uri: doctor.avatar }} style={styles.docAvatar} />
            <View style={styles.onlineDot} />
          </View>

          <View style={{ alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
            <Text numberOfLines={1} style={styles.docName}>
              {t(doctor.name, doctor.nameAr)}
            </Text>
            <Text style={styles.docStatus}>
              {t('Online • Ready to help', 'متصل الآن • متاح للاستشارة')}
            </Text>
          </View>
        </View>

        <View style={[styles.headerCallActions, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigateTo('video_consultation')}
            style={[styles.callActionBtn, { backgroundColor: Colors.primarySubtle }]}
          >
            <Video size={18} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigateTo('video_consultation')}
            style={[styles.callActionBtn, { backgroundColor: Colors.slate[100] }]}
          >
            <PhoneCall size={16} color={Colors.slate[700]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Consultation Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.quickChipsScroll, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleQuickPrompt(t('Can you review my recent symptoms?', 'هل يمكنك مراجعة الأعراض التي أشعر بها؟'))}
          style={[styles.chip, { backgroundColor: Colors.primarySubtle }]}
        >
          <Text style={[styles.chipText, { color: Colors.primaryDark }]}>
            {t('💊 Symptom Review', '💊 مراجعة الأعراض')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleQuickPrompt(t('I need a prescription refill please.', 'أحتاج لتجديد وصفتي الطبية من فضلك.'))}
          style={[styles.chip, { backgroundColor: Colors.slate[100] }]}
        >
          <Text style={[styles.chipText, { color: Colors.slate[700] }]}>
            {t('📄 Prescription Refill', '📄 تجديد الوصفة')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleQuickPrompt(t('What is the recommended dosage for pain relief?', 'ما هي الجرعة الموصى بها لتسكين الألم؟'))}
          style={[styles.chip, { backgroundColor: Colors.slate[100] }]}
        >
          <Text style={[styles.chipText, { color: Colors.slate[700] }]}>
            {t('⏰ Dosage Inquiry', '⏰ استفسار عن الجرعات')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Message History List */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesScroll}
        contentContainerStyle={[styles.messagesContent, { paddingBottom: 20 }]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
      >
        {/* Encryption Banner */}
        <View style={styles.encryptionRow}>
          <View style={[styles.encryptionBadge, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <Sparkles size={12} color={Colors.primary} />
            <Text style={styles.encryptionText}>
              {t('End-to-end encrypted medical consultation', 'استشارة طبية مشفرة ومحمية وفق أعلى معايير الخصوصية')}
            </Text>
          </View>
        </View>

        {chatMessages.map((msg) => {
          const isPatient = msg.sender === 'patient';
          return (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                { alignItems: isPatient ? (isRtl ? 'flex-start' : 'flex-end') : (isRtl ? 'flex-end' : 'flex-start') },
              ]}
            >
              {msg.text ? (
                <View
                  style={[
                    styles.messageBubble,
                    isPatient ? styles.bubblePatient : styles.bubbleDoctor,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      {
                        color: isPatient ? Colors.white : Colors.slate[900],
                        textAlign: isRtl ? 'right' : 'left',
                      },
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
              ) : null}

              {/* Prescription Attachment Card inside Chat */}
              {msg.type === 'prescription' && msg.prescriptionData && (
                <View style={styles.prescriptionCard}>
                  <View style={[styles.rxHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.rxTitleRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                      <Stethoscope size={16} color={Colors.primary} />
                      <Text style={styles.rxTitle}>
                        {t('Official E-Prescription', 'وصفة طبية إلكترونية معتمدة')}
                      </Text>
                    </View>
                    <View style={styles.rxBadge}>
                      <Text style={styles.rxBadgeText}>{t('Verified Rx', 'معتمدة')}</Text>
                    </View>
                  </View>

                  <View style={styles.rxMedsList}>
                    {msg.prescriptionData.map((item, idx) => (
                      <View key={idx} style={styles.rxMedItem}>
                        <Text style={styles.rxMedName}>{t(item.name, item.nameAr)}</Text>
                        <Text style={styles.rxMedDosage}>
                          {t(item.dosage, item.dosageAr)} • {t(item.frequency, item.frequencyAr)}
                        </Text>
                        <Text style={styles.rxMedInst}>
                          {t(item.instructions, item.instructionsAr)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={[styles.rxActionsRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        addToCart(products[0], 1);
                        navigateTo('cart');
                      }}
                      style={[styles.rxOrderBtn, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
                    >
                      <ShoppingBag size={14} color={Colors.white} />
                      <Text style={styles.rxOrderBtnText}>
                        {t('Order to Home', 'طلب وتوصيل للمنزل')}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => navigateTo('medical_records')}
                      style={styles.rxFileBtn}
                    >
                      <FileText size={16} color={Colors.slate[700]} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Timestamp & tick */}
              <View style={[styles.timestampRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <Text style={styles.timestampText}>{msg.timestamp}</Text>
                {isPatient && (
                  <CheckCheck size={13} color={Colors.primary} />
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Attachment Options Drawer */}
      {showAttachmentMenu && (
        <View style={[styles.attachmentDrawer, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              sendChatMessage('Attached: Medical Lab Blood Panel.pdf', 'report');
              setShowAttachmentMenu(false);
            }}
            style={[styles.attachOption, { backgroundColor: Colors.primarySubtle }]}
          >
            <FileText size={20} color={Colors.primary} />
            <Text style={[styles.attachOptionText, { color: Colors.primaryDark }]}>
              {t('Lab Report', 'تقرير تحاليل')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              sendChatMessage('Attached: Rash / Skin Photo.jpg', 'image');
              setShowAttachmentMenu(false);
            }}
            style={[styles.attachOption, { backgroundColor: Colors.accentLight }]}
          >
            <ImageIcon size={20} color={Colors.accent} />
            <Text style={[styles.attachOptionText, { color: Colors.accentDark }]}>
              {t('Send Photo', 'إرسال صورة')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              sendChatMessage('Voice Note (0:24) Recorded', 'voice');
              setShowAttachmentMenu(false);
            }}
            style={[styles.attachOption, { backgroundColor: Colors.purpleLight }]}
          >
            <Clock size={20} color={Colors.purple} />
            <Text style={[styles.attachOptionText, { color: Colors.purple }]}>
              {t('Voice Note', 'مقطع صوتي')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Chat Input Bar */}
      <View
        style={[
          styles.bottomInputBar,
          {
            paddingBottom: Math.max(insets.bottom, 10),
            flexDirection: isRtl ? 'row-reverse' : 'row',
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowAttachmentMenu(!showAttachmentMenu)}
          style={styles.clipBtn}
        >
          <Paperclip size={20} color={Colors.slate[500]} />
        </TouchableOpacity>

        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder={t('Type a message to doctor...', 'اكتب رسالة للطبيب...')}
          placeholderTextColor={Colors.slate[400]}
          style={[
            styles.mainInput,
            { textAlign: isRtl ? 'right' : 'left' },
          ]}
        />

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSendMessage}
          style={styles.sendBtn}
        >
          <Send size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBar: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate[100],
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
    ...Shadows.sm,
  },
  headerDoctorRow: {
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: {
    position: 'relative',
  },
  docAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  docName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.slate[900],
  },
  docStatus: {
    fontSize: 10,
    color: Colors.accentDark,
    fontWeight: '600',
  },
  headerCallActions: {
    gap: 8,
    alignItems: 'center',
  },
  callActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickChipsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate[100],
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  encryptionRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  encryptionBadge: {
    backgroundColor: Colors.slate[200],
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    alignItems: 'center',
    gap: 6,
  },
  encryptionText: {
    fontSize: 10,
    color: Colors.slate[600],
    fontWeight: '500',
  },
  messageRow: {
    marginBottom: 10,
    maxWidth: '85%',
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    ...Shadows.sm,
  },
  bubblePatient: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleDoctor: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  prescriptionCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.primarySubtle,
    marginTop: 6,
    width: 260,
    ...Shadows.md,
  },
  rxHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate[100],
    paddingBottom: 8,
  },
  rxTitleRow: {
    alignItems: 'center',
    gap: 6,
  },
  rxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  rxBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rxBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.accentDark,
  },
  rxMedsList: {
    paddingVertical: 8,
    gap: 6,
  },
  rxMedItem: {
    backgroundColor: Colors.slate[50],
    borderRadius: 10,
    padding: 8,
  },
  rxMedName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate[900],
  },
  rxMedDosage: {
    fontSize: 10,
    color: Colors.slate[500],
    marginTop: 2,
  },
  rxMedInst: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  rxActionsRow: {
    gap: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.slate[100],
    paddingTop: 8,
  },
  rxOrderBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  rxOrderBtnText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  rxFileBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  timestampRow: {
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
    paddingHorizontal: 4,
  },
  timestampText: {
    fontSize: 10,
    color: Colors.slate[400],
  },
  attachmentDrawer: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.slate[100],
    padding: 12,
    justifyContent: 'space-around',
  },
  attachOption: {
    width: '30%',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  attachOptionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bottomInputBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.slate[100],
    paddingHorizontal: 12,
    paddingTop: 8,
    alignItems: 'center',
    gap: 8,
  },
  clipBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainInput: {
    flex: 1,
    backgroundColor: Colors.slate[50],
    borderWidth: 1,
    borderColor: Colors.slate[200],
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 40,
    fontSize: 13,
    color: Colors.slate[900],
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

