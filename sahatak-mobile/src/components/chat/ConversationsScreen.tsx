import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  Alert,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MessageSquare,
  FileText,
  Stethoscope,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { Doctor } from '../../types';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/styles';
import type { RawConversation } from '../../api/messages';

/**
 * ConversationsScreen
 * -------------------
 * Lists the user's real message threads (GET /messages/conversations).
 * - Unread badge per conversation (from the conversations payload); the app's
 *   global badge comes from /messages/unread-count polling in AppContext.
 * - Tap → open DoctorChatScreen with that doctor.
 * - Archive action → PUT /messages/conversations/<id>/archive.
 */

interface ConversationRow {
  id: string;
  doctor: Doctor;
  subject: string;
  lastMessageText: string;
  lastMessageTime: string;
  unreadCount: number;
}

export const ConversationsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    conversations,
    refreshConversations,
    archiveConversation,
    doctors,
    navigateTo,
    isRtl,
    t,
  } = useApp();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const handleBack = () => {
    navigateTo('home');
  };

  /** Match a conversation's doctor against the app's Doctor records, or build one. */
  const buildDoctor = (conv: RawConversation): Doctor => {
    const p = conv.participant_info?.doctor;
    const profileId = p ? String(p.id) : '';
    const known =
      doctors.find((d) => d.id === profileId) ||
      doctors.find((d) => d.name === p?.name);
    if (known) return known;
    return {
      id: profileId,
      name: p?.name ?? t('Doctor', 'طبيب'),
      nameAr: p?.name ?? t('Doctor', 'طبيب'),
      specialty: p?.specialty ?? '',
      specialtyAr: p?.specialty ?? '',
      category: p?.specialty ?? '',
      avatar: p?.avatar ?? '',
      rating: 0,
      reviewsCount: 0,
      experienceYears: 0,
      patientsCount: 0,
      fee: 0,
      feeFormatted: '',
      feeFormattedAr: '',
      clinicName: '',
      clinicNameAr: '',
      location: '',
      locationAr: '',
      about: '',
      aboutAr: '',
      isVerified: true,
      availableDays: [],
      timeSlots: [],
    };
  };

  const previewOf = (conv: RawConversation): { text: string; time: string } => {
    if (conv.last_message_at) {
      const d = new Date(conv.last_message_at);
      if (!Number.isNaN(d.getTime())) {
        return {
          text: conv.subject ?? '',
          time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
    }
    return { text: conv.subject ?? '', time: '' };
  };

  const rows: ConversationRow[] = conversations.map((conv) => {
    const doctor = buildDoctor(conv);
    const preview = previewOf(conv);
    return {
      id: String(conv.id),
      doctor,
      subject: conv.subject ?? t('Medical Consultation', 'استشارة طبية'),
      lastMessageText: preview.text || t('No messages yet', 'لا توجد رسائل بعد'),
      lastMessageTime: preview.time,
      unreadCount: conv.unread_count ?? 0,
    };
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshConversations();
    setRefreshing(false);
  }, [refreshConversations]);

  const handleOpenConversation = (row: ConversationRow) => {
    navigateTo('chat_doctor', { chatDoctor: row.doctor });
  };

  const handleArchive = (row: ConversationRow) => {
    Alert.alert(
      t('Archive conversation', 'أرشفة المحادثة'),
      t(
        `Archive your conversation with ${row.doctor.name}? You can still find it later.`,
        `أرشفة محادثتك مع ${row.doctor.nameAr}؟ يمكنك العثور عليها لاحقاً.`,
      ),
      [
        { text: t('Cancel', 'إلغاء'), style: 'cancel' },
        {
          text: t('Archive', 'أرشفة'),
          style: 'destructive',
          onPress: () => {
            archiveConversation(row.id).catch(() => {
              Alert.alert(
                t('Cannot archive', 'تعذر الأرشفة'),
                t('Please try again in a moment.', 'يرجى المحاولة بعد قليل.'),
              );
            });
          },
        },
      ],
    );
  };

  const initialsOf = (name: string): string =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 0) }]}>
      <Header
        title="Messages"
        titleAr="الرسائل"
        showBack
        onBack={handleBack}
        rightAction="none"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {rows.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <MessageSquare size={36} color={Colors.slate[400]} />
            </View>
            <Text style={styles.emptyTitle}>
              {t('No conversations yet', 'لا توجد محادثات بعد')}
            </Text>
            <Text style={styles.emptySubtitle}>
              {t(
                'Start a chat from a doctor profile or one of your appointments.',
                'ابدأ محادثة من صفحة الطبيب أو من أحد مواعيدك.',
              )}
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.emptyAction}
              onPress={() => navigateTo('my_appointments')}
            >
              <Text style={styles.emptyActionText}>
                {t('View my appointments', 'عرض مواعيدي')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          rows.map((row) => (
            <TouchableOpacity
              key={row.id}
              activeOpacity={0.7}
              style={styles.convCard}
              onPress={() => handleOpenConversation(row)}
            >
              {row.doctor.avatar ? (
                <Image source={{ uri: row.doctor.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Stethoscope size={22} color={Colors.primary} />
                  <Text style={styles.avatarInitials}>{initialsOf(row.doctor.name)}</Text>
                </View>
              )}

              <View style={styles.convBody}>
                <View style={[styles.topRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <Text numberOfLines={1} style={styles.doctorName}>
                    {isRtl ? row.doctor.nameAr : row.doctor.name}
                  </Text>
                  <Text style={styles.timeText}>{row.lastMessageTime}</Text>
                </View>
                <Text style={styles.specialty}>{row.subject}</Text>
                <Text numberOfLines={1} style={styles.previewText}>
                  {row.lastMessageText}
                </Text>
              </View>

              <View style={styles.rightCol}>
                {row.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>
                      {row.unreadCount > 99 ? '99+' : row.unreadCount}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleArchive(row)}
                  style={styles.archiveBtn}
                >
                  <FileText size={16} color={Colors.slate[400]} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 40 }} />
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
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    marginBottom: 10,
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.slate[100],
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  convBody: {
    flex: 1,
    gap: 2,
  },
  topRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doctorName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.slate[900],
    textAlign: 'left',
  },
  timeText: {
    fontSize: 10,
    color: Colors.slate[400],
  },
  specialty: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  previewText: {
    fontSize: 12,
    color: Colors.slate[500],
  },
  rightCol: {
    alignItems: 'center',
    gap: 6,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  archiveBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: Colors.slate[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.slate[100],
    ...Shadows.sm,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.slate[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.slate[900],
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.slate[500],
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyAction: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyActionText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});

