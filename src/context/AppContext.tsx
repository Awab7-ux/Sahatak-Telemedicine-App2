import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  ScreenType,
  BottomNavTab,
  Doctor,
  Product,
  Appointment,
  MedicalCheckupPackage,
  MedicalRecord,
  ClinicLocation,
  NotificationItem,
  ChatMessage,
  CartItem,
  UserProfile,
} from '../types';
import {
  DOCTORS,
  POPULAR_PRODUCTS,
  INITIAL_APPOINTMENTS,
  MEDICAL_RECORDS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_USER,
} from '../data/mockData';

interface AppContextType {
  // Localization
  lang: Language;
  setLang: (lang: Language) => void;
  isRtl: boolean;
  t: (en: string, ar: string) => string;

  // Navigation
  screen: ScreenType;
  navigateTo: (screen: ScreenType, params?: any) => void;
  goBack: () => void;
  activeTab: BottomNavTab;
  setActiveTab: (tab: BottomNavTab) => void;

  // Selected Entities
  selectedDoctor: Doctor | null;
  setSelectedDoctor: (doc: Doctor | null) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (prod: Product | null) => void;
  selectedRecord: MedicalRecord | null;
  setSelectedRecord: (rec: MedicalRecord | null) => void;
  selectedCheckupPackage: MedicalCheckupPackage | null;
  setSelectedCheckupPackage: (pkg: MedicalCheckupPackage | null) => void;
  selectedClinic: ClinicLocation | null;
  setSelectedClinic: (clinic: ClinicLocation | null) => void;

  // Global State
  doctors: Doctor[];
  products: Product[];
  appointments: Appointment[];
  addAppointment: (apt: Appointment) => void;
  cancelAppointment: (id: string) => void;
  activeAppointment: Appointment | null;
  setActiveAppointment: (apt: Appointment | null) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;

  // Notifications
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Chat
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string, type?: 'text' | 'image' | 'prescription' | 'report') => void;
  activeChatDoctor: Doctor;
  setActiveChatDoctor: (doctor: Doctor) => void;

  // Favorites
  favorites: string[];
  toggleFavoriteDoctor: (id: string) => void;

  // User
  user: UserProfile;
  updateUser: (data: Partial<UserProfile>) => void;

  // Global Search / Draft
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  bookingDraft: Partial<Appointment>;
  setBookingDraft: React.Dispatch<React.SetStateAction<Partial<Appointment>>>;

  // Video call state
  isVideoCallActive: boolean;
  setIsVideoCallActive: (active: boolean) => void;

  // Frame View Mode (Mobile Mockup vs Fluid View)
  frameMode: 'mobile' | 'fluid';
  setFrameMode: (mode: 'mobile' | 'fluid') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('en');
  const [screen, setScreen] = useState<ScreenType>('home');
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>(['home']);
  const [activeTab, setActiveTabState] = useState<BottomNavTab>('home');

  const [doctors] = useState<Doctor[]>(DOCTORS);
  const [products] = useState<Product[]>(POPULAR_PRODUCTS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(INITIAL_APPOINTMENTS[0]);

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(DOCTORS[0]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(POPULAR_PRODUCTS[0]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(MEDICAL_RECORDS[0]);
  const [selectedCheckupPackage, setSelectedCheckupPackage] = useState<MedicalCheckupPackage | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<ClinicLocation | null>(null);

  const [cart, setCart] = useState<CartItem[]>([
    { product: POPULAR_PRODUCTS[0], quantity: 1 },
  ]);

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [activeChatDoctor, setActiveChatDoctor] = useState<Doctor>(DOCTORS[0]);

  const [favorites, setFavorites] = useState<string[]>(['doc-1', 'doc-3']);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookingDraft, setBookingDraft] = useState<Partial<Appointment>>({});
  const [isVideoCallActive, setIsVideoCallActive] = useState<boolean>(false);
  const [frameMode, setFrameMode] = useState<'mobile' | 'fluid'>('mobile');

  // Handle document direction and language attributes
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
  };

  const isRtl = lang === 'ar';

  const t = (en: string, ar: string): string => {
    return lang === 'ar' ? ar : en;
  };

  const navigateTo = (newScreen: ScreenType, params?: any) => {
    if (params?.doctor) setSelectedDoctor(params.doctor);
    if (params?.product) setSelectedProduct(params.product);
    if (params?.record) setSelectedRecord(params.record);
    if (params?.package) setSelectedCheckupPackage(params.package);
    if (params?.clinic) setSelectedClinic(params.clinic);
    if (params?.chatDoctor) setActiveChatDoctor(params.chatDoctor);

    // Update bottom nav tab if moving to top-level tab
    if (newScreen === 'home') setActiveTabState('home');
    else if (newScreen === 'chat_doctor') setActiveTabState('messages');
    else if (newScreen === 'cart') setActiveTabState('cart');
    else if (newScreen === 'my_appointments' || newScreen === 'medical_records') setActiveTabState('history');
    else if (newScreen === 'profile') setActiveTabState('profile');

    setScreenHistory((prev) => [...prev, newScreen]);
    setScreen(newScreen);
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const newHistory = [...screenHistory];
      newHistory.pop(); // current
      const prevScreen = newHistory[newHistory.length - 1];
      setScreenHistory(newHistory);
      setScreen(prevScreen);
    } else {
      setScreen('home');
      setActiveTabState('home');
    }
  };

  const setActiveTab = (tab: BottomNavTab) => {
    setActiveTabState(tab);
    switch (tab) {
      case 'home':
        navigateTo('home');
        break;
      case 'messages':
        navigateTo('chat_doctor', { chatDoctor: selectedDoctor || DOCTORS[0] });
        break;
      case 'cart':
        navigateTo('cart');
        break;
      case 'history':
        navigateTo('my_appointments');
        break;
      case 'profile':
        navigateTo('profile');
        break;
    }
  };

  const addAppointment = (apt: Appointment) => {
    setAppointments((prev) => [apt, ...prev]);
    setActiveAppointment(apt);
    // Add confirmation notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Appointment Confirmed with ${apt.doctor.name}`,
      titleAr: `تم تأكيد موعدك بنجاح مع ${apt.doctor.nameAr}`,
      message: `Your ${apt.consultationType} consultation is scheduled for ${apt.date} at ${apt.timeSlot}.`,
      messageAr: `موعد استشارتك (${apt.consultationType}) محجوز في ${apt.date} الساعة ${apt.timeSlot}.`,
      timestamp: 'Just now',
      timestampAr: 'الآن',
      type: 'appointment',
      read: false,
      actionScreen: 'my_appointments',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const cancelAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: 'cancelled' } : apt))
    );
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const sendChatMessage = (text: string, type: 'text' | 'image' | 'prescription' | 'report' = 'text') => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'patient',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
    };
    setChatMessages((prev) => [...prev, newMsg]);

    // Simulated instant doctor response for rich telemedicine experience
    setTimeout(() => {
      const responsesEn = [
        "Thank you for sharing that information. I've noted it down in your digital chart.",
        "Understood. If the symptoms continue for more than 48 hours, we can schedule an in-clinic checkup.",
        "I will review your test values right now. Please continue following the prescribed dosage.",
        "Your recovery progress looks very encouraging! Keep resting well.",
      ];
      const responsesAr = [
        "شكراً لمشاركتك هذه التفاصيل. تم تدوين الملاحظة في سجلك الطبي الرقمي.",
        "مفهوم تماماً. في حال استمرت الأعراض لأكثر من 48 ساعة يرجى إبلاغي لجدولة فحص سريري.",
        "سأقوم بمراجعة نتائج التحاليل فوراً. يرجى الاستمرار على الجرعة الموصوفة.",
        "مؤشرات التحسن ممتازة جداً! واصل أخذ قسط كافٍ من الراحة وشرب السوائل.",
      ];
      const randIdx = Math.floor(Math.random() * responsesEn.length);
      const doctorReply: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'doctor',
        text: lang === 'ar' ? responsesAr[randIdx] : responsesEn[randIdx],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
      };
      setChatMessages((prev) => [...prev, doctorReply]);
    }, 1200);
  };

  const toggleFavoriteDoctor = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const updateUser = (data: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        isRtl,
        t,
        screen,
        navigateTo,
        goBack,
        activeTab,
        setActiveTab,
        selectedDoctor,
        setSelectedDoctor,
        selectedProduct,
        setSelectedProduct,
        selectedRecord,
        setSelectedRecord,
        selectedCheckupPackage,
        setSelectedCheckupPackage,
        selectedClinic,
        setSelectedClinic,
        doctors,
        products,
        appointments,
        addAppointment,
        cancelAppointment,
        activeAppointment,
        setActiveAppointment,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        notifications,
        unreadNotificationsCount,
        markNotificationRead,
        markAllNotificationsRead,
        chatMessages,
        sendChatMessage,
        activeChatDoctor,
        setActiveChatDoctor,
        favorites,
        toggleFavoriteDoctor,
        user,
        updateUser,
        searchQuery,
        setSearchQuery,
        bookingDraft,
        setBookingDraft,
        isVideoCallActive,
        setIsVideoCallActive,
        frameMode,
        setFrameMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
