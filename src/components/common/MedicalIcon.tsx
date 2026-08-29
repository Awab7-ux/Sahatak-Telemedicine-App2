import React from 'react';
import {
  Stethoscope,
  Smile,
  Brain,
  Eye,
  Sparkles,
  HeartPulse,
  Activity,
  Droplets,
  Heart,
  Shield,
  Pill,
  Building2,
  PhoneCall,
  MessageSquare,
  Calendar,
  FileText,
  User,
  ShieldCheck,
  Video,
  Hospital,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface MedicalIconProps {
  name: string;
  className?: string;
}

export const MedicalIcon: React.FC<MedicalIconProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name.toLowerCase()) {
    case 'stethoscope':
      return <Stethoscope className={className} />;
    case 'smile':
      return <Smile className={className} />;
    case 'brain':
      return <Brain className={className} />;
    case 'eye':
      return <Eye className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'heartpulse':
      return <HeartPulse className={className} />;
    case 'activity':
      return <Activity className={className} />;
    case 'droplets':
      return <Droplets className={className} />;
    case 'heart':
      return <Heart className={className} />;
    case 'shield':
      return <Shield className={className} />;
    case 'pill':
      return <Pill className={className} />;
    case 'building2':
    case 'hospital':
      return <Building2 className={className} />;
    case 'phonecall':
      return <PhoneCall className={className} />;
    case 'messagesquare':
      return <MessageSquare className={className} />;
    case 'calendar':
      return <Calendar className={className} />;
    case 'filetext':
      return <FileText className={className} />;
    case 'user':
      return <User className={className} />;
    case 'shieldcheck':
      return <ShieldCheck className={className} />;
    case 'video':
      return <Video className={className} />;
    case 'clock':
      return <Clock className={className} />;
    case 'mappin':
      return <MapPin className={className} />;
    case 'check':
      return <CheckCircle2 className={className} />;
    case 'alert':
      return <AlertCircle className={className} />;
    default:
      return <Activity className={className} />;
  }
};
