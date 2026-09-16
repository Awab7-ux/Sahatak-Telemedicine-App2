import React from 'react';
import { View, Image, Text, StyleSheet, StyleProp, ImageStyle, TextStyle } from 'react-native';
import { User } from 'lucide-react-native';
import { Colors } from '../../theme/colors';

/**
 * Avatar
 * ------
 * Shared profile-picture component with a generic person-silhouette fallback.
 * If `uri` is empty/missing, renders the app's existing fallback convention
 * (lucide `User` icon + name initials, as already used on ConversationsScreen)
 * instead of a blank white image box.
 *
 * `style` should carry width/height/borderRadius (the same style previously
 * passed to the raw <Image>). The fallback icon/text scale to that size.
 */
interface AvatarProps {
  uri?: string | null;
  name?: string;
  /** Style with width/height/borderRadius — reused for both image & fallback. */
  style?: StyleProp<ImageStyle>;
}

export const Avatar: React.FC<AvatarProps> = ({ uri, name, style }) => {
  if (uri) {
    return <Image source={{ uri }} style={[style, { resizeMode: 'cover' }]} />;
  }

  const flat = (StyleSheet.flatten(style) ?? {}) as Record<string, unknown>;
  const width = typeof flat.width === 'number' ? flat.width : 40;
  const iconSize = Math.max(14, Math.round(width * 0.38));
  const initials = (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <View style={[avatarStyles.fallback, style]}>
      <User size={iconSize} color={Colors.primary} />
      {initials ? (
        <Text style={[avatarStyles.initials as StyleProp<TextStyle>, { fontSize: Math.max(8, Math.round(width * 0.22)) }]}>
          {initials}
        </Text>
      ) : null}
    </View>
  );
};

const avatarStyles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.slate[100],
  },
  initials: {
    fontWeight: '800',
    color: Colors.primary,
  },
});
