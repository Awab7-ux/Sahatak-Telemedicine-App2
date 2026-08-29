import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Video,
  PhoneCall,
  CheckCheck,
  Download,
  ShoppingBag,
  Clock,
  Sparkles,
  Plus,
  X,
  Stethoscope,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { DOCTORS } from '../../data/mockData';

export const DoctorChatScreen: React.FC = () => {
  const {
    activeChatDoctor,
    chatMessages,
    sendChatMessage,
    navigateTo,
    addToCart,
    products,
    isRtl,
    t,
  } = useApp();

  const doctor = activeChatDoctor || DOCTORS[0];
  const [inputText, setInputText] = useState<string>('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText, 'text');
    setInputText('');
  };

  const handleQuickPrompt = (promptText: string) => {
    sendChatMessage(promptText, 'text');
  };

  return (
    <div id="doctor-chat-screen" className="flex flex-col h-full bg-slate-50 relative">
      {/* Top Doctor Chat Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-2.5 flex items-center justify-between z-20 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('home')}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200"
            aria-label="Back"
          >
            ←
          </button>
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-none">
              {t(doctor.name, doctor.nameAr)}
            </h3>
            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 inline-block">
              {t('Online • Ready to help', 'متصل الآن • متاح للاستشارة')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigateTo('video_consultation')}
            className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors shadow-2xs"
            aria-label="Start Video Call"
          >
            <Video className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => navigateTo('video_consultation')}
            className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
            aria-label="Start Audio Call"
          >
            <PhoneCall className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Consultation Chips */}
      <div className="bg-white/80 backdrop-blur-xs px-4 py-2 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => handleQuickPrompt(t('Can you review my recent symptoms?', 'هل يمكنك مراجعة الأعراض التي أشعر بها؟'))}
          className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-medium rounded-full shrink-0 transition-colors"
        >
          {t('💊 Symptom Review', '💊 مراجعة الأعراض')}
        </button>
        <button
          onClick={() => handleQuickPrompt(t('I need a prescription refill please.', 'أحتاج لتجديد وصفتي الطبية من فضلك.'))}
          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded-full shrink-0 transition-colors"
        >
          {t('📄 Prescription Refill', '📄 تجديد الوصفة')}
        </button>
        <button
          onClick={() => handleQuickPrompt(t('What is the recommended dosage for pain relief?', 'ما هي الجرعة الموصى بها لتسكين الألم؟'))}
          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded-full shrink-0 transition-colors"
        >
          {t('⏰ Dosage Inquiry', '⏰ استفسار عن الجرعات')}
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Security / Confidentiality Notice */}
        <div className="flex justify-center my-1">
          <span className="px-3 py-1 bg-slate-200/70 text-slate-600 rounded-full text-[10px] font-medium flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-blue-600" />
            {t('End-to-end encrypted medical consultation', 'استشارة طبية مشفرة ومحمية وفق أعلى معايير الخصوصية')}
          </span>
        </div>

        {chatMessages.map((msg) => {
          const isPatient = msg.sender === 'patient';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isPatient ? 'items-end' : 'items-start'}`}
            >
              {/* Text Bubble */}
              {msg.text && (
                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed shadow-2xs ${
                    isPatient
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-100 rounded-bl-xs'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              )}

              {/* Prescription Attachment Card */}
              {msg.type === 'prescription' && msg.prescriptionData && (
                <div className="mt-2 w-72 bg-white rounded-2xl p-3.5 border border-blue-100 shadow-md text-left">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs">
                      <Stethoscope className="w-4 h-4" />
                      <span>{t('Official E-Prescription', 'وصفة طبية إلكترونية معتمدة')}</span>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-md">
                      {t('Verified Rx', 'معتمدة')}
                    </span>
                  </div>

                  <div className="py-2.5 space-y-2">
                    {msg.prescriptionData.map((item, idx) => (
                      <div key={idx} className="bg-slate-50 p-2 rounded-xl text-xs">
                        <h5 className="font-bold text-slate-900">{t(item.name, item.nameAr)}</h5>
                        <p className="text-[11px] text-slate-500">{t(item.dosage, item.dosageAr)} • {t(item.frequency, item.frequencyAr)}</p>
                        <p className="text-[10px] text-blue-600 font-medium mt-0.5">{t(item.instructions, item.instructionsAr)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => {
                        // Add first medicine from prescription to cart
                        addToCart(products[0], 1);
                        navigateTo('cart');
                      }}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{t('Order to Home', 'طلب وتوصيل للمنزل')}</span>
                    </button>
                    <button
                      onClick={() => navigateTo('medical_records')}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                      title="View PDF"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Timestamp & status indicator */}
              <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                <span>{msg.timestamp}</span>
                {isPatient && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Options Drawer */}
      {showAttachmentMenu && (
        <div className="bg-white border-t border-slate-100 p-3 grid grid-cols-3 gap-2 text-center animate-in slide-in-from-bottom duration-150">
          <button
            onClick={() => {
              sendChatMessage('Attached: Medical Lab Blood Panel.pdf', 'report');
              setShowAttachmentMenu(false);
            }}
            className="p-3 bg-blue-50 hover:bg-blue-100 rounded-2xl flex flex-col items-center justify-center text-blue-700"
          >
            <FileText className="w-5 h-5 mb-1" />
            <span className="text-[11px] font-semibold">{t('Lab Report', 'تقرير تحاليل')}</span>
          </button>
          <button
            onClick={() => {
              sendChatMessage('Attached: Rash / Skin Photo.jpg', 'image');
              setShowAttachmentMenu(false);
            }}
            className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-2xl flex flex-col items-center justify-center text-emerald-700"
          >
            <ImageIcon className="w-5 h-5 mb-1" />
            <span className="text-[11px] font-semibold">{t('Send Photo', 'إرسال صورة')}</span>
          </button>
          <button
            onClick={() => {
              sendChatMessage('Voice Note (0:24) Recorded', 'voice');
              setShowAttachmentMenu(false);
            }}
            className="p-3 bg-purple-50 hover:bg-purple-100 rounded-2xl flex flex-col items-center justify-center text-purple-700"
          >
            <Clock className="w-5 h-5 mb-1" />
            <span className="text-[11px] font-semibold">{t('Voice Note', 'مقطع صوتي')}</span>
          </button>
        </div>
      )}

      {/* Bottom Message Input Bar */}
      <form
        onSubmit={handleSendMessage}
        className="bg-white border-t border-slate-100 px-3.5 py-2.5 flex items-center gap-2 shrink-0"
      >
        <button
          type="button"
          onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
            showAttachmentMenu ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          aria-label="Attachments"
        >
          {showAttachmentMenu ? <X className="w-4 h-4" /> : <Plus className="w-4.5 h-4.5" />}
        </button>

        <input
          id="doctor-chat-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('Type your message here...', 'اكتب استفسارك الطبي هنا...')}
          className="flex-1 py-2.5 px-4 bg-slate-100 focus:bg-white text-xs text-slate-900 placeholder:text-slate-400 rounded-2xl border border-slate-200 focus:border-blue-500 focus:outline-none transition-all"
        />

        <button
          id="doctor-chat-send-btn"
          type="submit"
          disabled={!inputText.trim()}
          className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white flex items-center justify-center shadow-xs transition-all active:scale-95 shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>
    </div>
  );
};
