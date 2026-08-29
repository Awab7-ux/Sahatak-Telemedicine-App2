import React, { useState, useEffect } from 'react';
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
  FileText,
  ShieldCheck,
  Sparkles,
  Send,
  X,
  Maximize2,
  Camera,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DOCTORS } from '../../data/mockData';

export const VideoConsultationScreen: React.FC = () => {
  const { activeAppointment, goBack, navigateTo, user, isRtl, t } = useApp();

  const doctor = activeAppointment?.doctor || DOCTORS[0];

  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(552); // Starts around 09:12
  const [inCallMessage, setInCallMessage] = useState<string>('');
  const [inCallChat, setInCallChat] = useState<Array<{ sender: 'doc' | 'me'; text: string; time: string }>>([
    { sender: 'doc', text: 'Hello Ahmed! I can hear and see you clearly.', time: '09:01' },
    { sender: 'me', text: 'Good morning Dr. Lalana. Thank you for taking this call.', time: '09:02' },
  ]);

  // Timer simulation
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

  const handleSendInCallChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inCallMessage.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setInCallChat((prev) => [...prev, { sender: 'me', text: inCallMessage, time: now }]);
    setInCallMessage('');
  };

  const handleEndCall = () => {
    navigateTo('my_appointments');
  };

  return (
    <div
      id="video-consultation-screen"
      className="relative w-full h-full min-h-[700px] bg-slate-950 text-white flex flex-col justify-between overflow-hidden select-none"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Main Doctor Video Feed (Matching exact reference full-screen visual) */}
      <div className="absolute inset-0 z-0 bg-slate-900">
        <img
          src={doctor.avatar}
          alt={doctor.name}
          className="w-full h-full object-cover object-center filter brightness-95"
          referrerPolicy="no-referrer"
        />

        {/* Ambient subtle vignette gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />
      </div>

      {/* Top Bar: Doctor Info & Timer */}
      <div className="relative z-10 px-5 pt-10 pb-4 flex items-center justify-between">
        <div className="bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-4" />
          <div className="text-left">
            <h3 className="text-xs font-bold text-white leading-none truncate max-w-[140px]">
              {t(doctor.name, doctor.nameAr)}
            </h3>
            <span className="text-[10px] text-blue-200 font-mono mt-0.5 inline-block">
              ⏱ {formatTimer(elapsedSeconds)}
            </span>
          </div>
        </div>

        {/* HD Quality indicator */}
        <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5 text-[11px] font-bold text-sky-300">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          <span>HD 1080p</span>
        </div>
      </div>

      {/* Patient PiP Video Preview (Upper Right Corner) */}
      <div className="absolute top-20 right-5 z-20 w-24 h-32 rounded-2xl overflow-hidden border-2 border-white/50 shadow-2xl bg-slate-800 transition-transform active:scale-95">
        {isVideoOn ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400">
            <VideoOff className="w-6 h-6 mb-1 text-slate-500" />
            <span className="text-[9px] font-semibold">{t('Camera Off', 'الكاميرا مغلقة')}</span>
          </div>
        )}
        <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded text-[8px] font-medium text-white">
          {t('You', 'أنت')}
        </div>
      </div>

      {/* Warning Callout Bar (Matching Reference: "Less than 10 minutes remaining call time") */}
      <div className="relative z-10 px-5 mb-3">
        <div className="bg-rose-500/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold shadow-lg border border-rose-400/40 animate-soft-pulse">
          <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0" />
          <span>
            {t('Less than 10 minutes remaining call time.', 'أقل من 10 دقائق متبقية من وقت الاستشارة.')}
          </span>
        </div>
      </div>

      {/* Bottom Floating Rounded Control Bar */}
      <div className="relative z-10 px-5 pb-8">
        <div className="bg-slate-900/85 backdrop-blur-xl border border-white/15 p-3 rounded-[28px] shadow-2xl flex items-center justify-around gap-2">
          {/* Camera Button */}
          <button
            id="video-call-toggle-camera"
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isVideoOn
                ? 'bg-white/15 hover:bg-white/25 text-white'
                : 'bg-rose-500/80 text-white'
            }`}
            aria-label="Toggle Camera"
          >
            {isVideoOn ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Mic Button */}
          <button
            id="video-call-toggle-mic"
            onClick={() => setIsMicOn(!isMicOn)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isMicOn
                ? 'bg-white/15 hover:bg-white/25 text-white'
                : 'bg-rose-500/80 text-white'
            }`}
            aria-label="Toggle Mic"
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* In-Call Chat Drawer Toggle */}
          <button
            id="video-call-toggle-chat"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center relative transition-all"
            aria-label="In Call Chat"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
          </button>

          {/* Speaker Button */}
          <button
            id="video-call-toggle-speaker"
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isSpeakerOn
                ? 'bg-white/15 hover:bg-white/25 text-white'
                : 'bg-amber-500/80 text-white'
            }`}
            aria-label="Toggle Speaker"
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* End Call Button (Red) */}
          <button
            id="video-call-end-btn"
            onClick={handleEndCall}
            className="w-13 h-13 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transition-all font-bold"
            aria-label="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* In-Call Chat Slide-up Drawer */}
      {isChatOpen && (
        <div className="absolute inset-x-0 bottom-0 top-24 z-30 bg-slate-900/95 backdrop-blur-2xl rounded-t-3xl p-4 flex flex-col justify-between border-t border-white/10 shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>{t('In-Call Live Chat', 'المحادثة المباشرة أثناء المكالمة')}</span>
            </h4>
            <button
              onClick={() => setIsChatOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-2.5 text-xs">
            {inCallChat.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[80%] ${
                    msg.sender === 'me'
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white/15 text-slate-100 rounded-bl-xs'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5">{msg.time}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendInCallChat} className="pt-2 flex items-center gap-2">
            <input
              type="text"
              value={inCallMessage}
              onChange={(e) => setInCallMessage(e.target.value)}
              placeholder={t('Type a message to doctor...', 'اكتب رسالة للطبيب...')}
              className="flex-1 px-4 py-2.5 bg-white/10 text-white placeholder:text-slate-400 text-xs rounded-xl border border-white/15 focus:outline-none focus:border-blue-400"
            />
            <button
              type="submit"
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
