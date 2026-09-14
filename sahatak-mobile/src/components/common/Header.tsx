import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Bell,
  Globe,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Colors } from '../../theme/colors';

interface HeaderProps {
  title?: string;
  titleAr?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: 'favorite' | 'notification' | 'share' | 'language' | 'none';
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  transparent?: boolean;
  whiteText?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  titleAr,
  showBack = true,
  onBack,
  rightAction = 'none',
  isFavorite = false,
  onToggleFavorite,
  transparent = false,
  whiteText = false,
}) => {
  const insets = useSafeAreaInsets();
  const { goBack, isRtl, lang, setLang, t, unreadNotificationsCount, navigateTo, calmUi } = useApp();

  const handleBack = () => {
    if (onBack) onBack();
    else goBack();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Sahatak Telemedicine App - Connecting you with top doctors & health services.',
      });
    } catch (e) {
      console.log('Share error', e);
    }
  };

  const BackIcon = isRtl ? ChevronRight : ChevronLeft;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 12),
          backgroundColor: transparent ? 'transparent' : Colors.white,
          borderBottomWidth: transparent ? 0 : 1,
          borderBottomColor: Colors.slate[100],
          flexDirection: isRtl ? 'row-reverse' : 'row',
        },
      ]}
    >
      <View style={[styles.leftContainer, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        {showBack && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleBack}
            style={[
              styles.iconButton,
              {
                backgroundColor: whiteText ? 'rgba(255,255,255,0.2)' : Colors.slate[100],
              },
            ]}
          >
            <BackIcon size={20} color={whiteText ? Colors.white : Colors.slate[700]} />
          </TouchableOpacity>
        )}
        {title && (
          <Text
            numberOfLines={1}
            style={[
              styles.title,
              {
                color: whiteText ? Colors.white : Colors.slate[900],
                textAlign: isRtl ? 'right' : 'left',
              },
            ]}
          >
            {titleAr ? t(title, titleAr) : title}
          </Text>
        )}
      </View>

      <View style={[styles.rightContainer, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        {rightAction === 'favorite' && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onToggleFavorite}
            style={[
              styles.iconButton,
              {
                backgroundColor: isFavorite
                  ? Colors.roseLight
                  : whiteText
                  ? 'rgba(255,255,255,0.2)'
                  : Colors.slate[100],
              },
            ]}
          >
            <Heart
              size={18}
              color={isFavorite ? Colors.rose : whiteText ? Colors.white : Colors.slate[600]}
              fill={isFavorite ? Colors.rose : 'none'}
            />
          </TouchableOpacity>
        )}

        {rightAction === 'share' && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleShare}
            style={[
              styles.iconButton,
              {
                backgroundColor: whiteText ? 'rgba(255,255,255,0.2)' : Colors.slate[100],
              },
            ]}
          >
            <Share2 size={18} color={whiteText ? Colors.white : Colors.slate[600]} />
          </TouchableOpacity>
        )}

        {rightAction === 'notification' && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigateTo('notifications')}
            style={[
              styles.iconButton,
              {
                backgroundColor: whiteText ? 'rgba(255,255,255,0.2)' : Colors.slate[100],
              },
            ]}
          >
            <Bell size={18} color={whiteText ? Colors.white : Colors.slate[700]} />
            {/* Non-essential unread badge — suppressed by Calm Mode "reduce notifications".
                Notifications themselves remain fully accessible; nothing medical is hidden. */}
            {!calmUi.reduce_notifications && unreadNotificationsCount > 0 && <View style={styles.notifBadge} />}
          </TouchableOpacity>
        )}

        {rightAction === 'language' && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setLang(lang === 'en' ? 'ar' : 'en')}
            style={styles.langButton}
          >
            <Globe size={14} color={Colors.primary} />
            <Text style={styles.langText}>
              {lang === 'en' ? 'العربية' : 'English'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 30,
  },
  leftContainer: {
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rightContainer: {
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flexShrink: 1,
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primarySubtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  langText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
});

