import React from 'react';
import {
  Stethoscope,
  Smile,
  Brain,
  Eye,
  Sparkles,
  HeartPulse,
  Activity,
  ShieldCheck,
  Pill,
  Heart,
  Calendar,
  Video,
  MapPin,
  Clock,
  Star,
  FileText,
  User,
  ShoppingBag,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';

interface MedicalIconProps {
  name: string;
  size?: number;
  color?: string;
}

export const MedicalIcon: React.FC<MedicalIconProps> = ({
  name,
  size = 24,
  color = Colors.primary,
}) => {
  switch (name.toLowerCase()) {
    case 'stethoscope':
      return <Stethoscope size={size} color={color} />;
    case 'smile':
      return <Smile size={size} color={color} />;
    case 'brain':
      return <Brain size={size} color={color} />;
    case 'eye':
      return <Eye size={size} color={color} />;
    case 'sparkles':
      return <Sparkles size={size} color={color} />;
    case 'heartpulse':
    case 'heart-pulse':
      return <HeartPulse size={size} color={color} />;
    case 'activity':
      return <Activity size={size} color={color} />;
    case 'shieldcheck':
    case 'shield':
      return <ShieldCheck size={size} color={color} />;
    case 'pill':
      return <Pill size={size} color={color} />;
    case 'heart':
      return <Heart size={size} color={color} />;
    case 'calendar':
      return <Calendar size={size} color={color} />;
    case 'video':
      return <Video size={size} color={color} />;
    case 'mappin':
    case 'map-pin':
      return <MapPin size={size} color={color} />;
    case 'clock':
      return <Clock size={size} color={color} />;
    case 'star':
      return <Star size={size} color={color} />;
    case 'filetext':
    case 'record':
      return <FileText size={size} color={color} />;
    case 'user':
      return <User size={size} color={color} />;
    case 'shoppingbag':
    case 'cart':
      return <ShoppingBag size={size} color={color} />;
    default:
      return <Activity size={size} color={color} />;
  }
};

