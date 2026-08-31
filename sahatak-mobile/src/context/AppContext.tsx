import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { socketService } from '../services/socketService';

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
} from '../data/mockData';

import { navigate, goBack as navGoBack } from '../navigation/navigationRef';
import { getAuthToken, removeAuthToken } from '../api/client';
import { fetchCurrentUser, loginUser, registerUser, RegisterPayload } from '../api/auth';
import { updateProfileApi } from '../api/profile';
import { fetchDoctorsApi } from '../api/doctors';
import { fetchProductsApi } from '../api/pharmacy';
import { fetchAppointmentsApi, createAppointmentApi, cancelAppointmentApi } from '../api/appointments';
import { fetchNotificationsApi, markNotificationReadApi, markAllNotificationsReadApi } from '../api/notifications';
import { sendChatMessageApi, getOrCreateConversationApi, fetchChatMessagesApi } from '../api/chat';

interface AppContextType {
  // Localization
  lang: Language;
  setLang: (lang: Language) => Promise<void>;
  isRtl: boolean;
  t: (en: string, ar: string) => string;

  // Navigation
  screen: ScreenType;
  navigateTo: (screen: ScreenType, params?: any) => void;
  goBack: () => void;
  activeTab: BottomNavTab;
  setActiveTab: (tab: BottomNavTab) => void;

  // Auth
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;

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
  addAppointment: (apt: Partial<Appointment>) => Promise<Appointment>;
  cancelAppointment: (id: string) => Promise<void>;
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
  sendChatMessage: (text: string, type?: 'text' | 'image' | 'prescription' | 'report' | 'voice') => Promise<void>;
  loadChatHistory: (doctorId: string) => Promise<void>;
  activeChatDoctor: Doctor;
  setActiveChatDoctor: (doctor: Doctor) => void;

  // Favorites
  favorites: string[];
  toggleFavoriteDoctor: (id: string) => void;

  // User
  user: UserProfile | null;
  updateUser: (data: Partial<UserProfile>) => void;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<UserProfile>;

  // Global Search / Draft
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  bookingDraft: Partial<Appointment>;
  setBookingDraft: React.Dispatch<React.SetStateAction<Partial<Appointment>>>;

  // Video call state
  isVideoCallActive: boolean;
  setIsVideoCallActive: (active: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LANG_STORAGE_KEY = 'sahatak_language';
const CART_STORAGE_KEY = 'sahatak_cart';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('en');
  const [screen, setScreen] = useState<ScreenType>('home');
  const [activeTab, setActiveTabState] = useState<BottomNavTab>('home');
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  const [doctors, setDoctors] = useState<Doctor[]>(DOCTORS);
  const [products, setProducts] = useState<Product[]>(POPULAR_PRODUCTS);
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookingDraft, setBookingDraft] = useState<Partial<Appointment>>({});
  const [isVideoCallActive, setIsVideoCallActive] = useState<boolean>(false);

  // Ref to track the conversation ID currently open in DoctorChatScreen
  const activeChatConversationId = useRef<string>('');

  // Initialize Language & Validate Token from SecureStore
  useEffect(() => {
    const initApp = async () => {
      try {
        const savedLang = await AsyncStorage.getItem(LANG_STORAGE_KEY);
        if (savedLang === 'ar' || savedLang === 'en') {
          setLangState(savedLang);
        }

        const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }

        const token = await getAuthToken();
        if (token) {
          try {
            const profile = await fetchCurrentUser();
            if (profile && (profile.id || profile.email)) {
              setUser(profile);
              setIsAuthenticated(true);
            } else {
              await removeAuthToken();
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (authErr) {
            console.log('Stored token verification failed (expired or invalid):', authErr);
            await removeAuthToken();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }

        // Fetch dynamic backend data if available
        const [docs, prods, appts, notifs] = await Promise.all([
          fetchDoctorsApi(),
          fetchProductsApi(),
          fetchAppointmentsApi(),
          fetchNotificationsApi(),
        ]);
        if (docs?.length) setDoctors(docs);
        if (prods?.length) setProducts(prods);
        if (appts?.length) {
          setAppointments(appts);
          setActiveAppointment(appts[0] || null);
        }
        if (notifs?.length) setNotifications(notifs);
      } catch (err) {
        console.log('App init error:', err);
      } finally {
        setIsAuthLoading(false);
      }
    };
    initApp();
  }, []);

  const setLang = async (newLang: Language) => {
    setLangState(newLang);
    await AsyncStorage.setItem(LANG_STORAGE_KEY, newLang);
    const shouldBeRTL = newLang === 'ar';
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
      try {
        await Updates.reloadAsync();
      } catch {
        // In dev / Expo Go it may not reload native bundle immediately
      }
    }
  };

  const isRtl = lang === 'ar';

  const t = (en: string, ar: string): string => {
    return lang === 'ar' ? ar : en;
  };

  const navigateTo = (newScreen: ScreenType, params?: any) => {
    setScreen(newScreen);
    if (params?.doctor) setSelectedDoctor(params.doctor);
    if (params?.product) setSelectedProduct(params.product);
    if (params?.record) setSelectedRecord(params.record);
    if (params?.package) setSelectedCheckupPackage(params.package);
    if (params?.clinic) setSelectedClinic(params.clinic);
    if (params?.chatDoctor) setActiveChatDoctor(params.chatDoctor);

    // Map screen string to React Navigation route
    switch (newScreen) {
      case 'home':
        setActiveTabState('home');
        navigate('MainTabs', { screen: 'HomeTab' } as any);
        break;
      case 'doctors':
        navigate('DoctorList', params);
        break;
      case 'doctor_detail':
        navigate('DoctorDetail', { doctor: params?.doctor || selectedDoctor || undefined });
        break;
      case 'booking':
        navigate('BookingFlow', { doctor: params?.doctor || selectedDoctor || undefined });
        break;
      case 'video_consultation':
        navigate('VideoConsultation', params);
        break;
      case 'chat_doctor':
        setActiveTabState('messages');
        navigate('DoctorChat', { doctor: params?.chatDoctor || activeChatDoctor });
        break;
      case 'pharmacy':
        navigate('Pharmacy', params);
        break;
      case 'medicine_detail':
        navigate('MedicineDetail', { product: params?.product || selectedProduct || undefined });
        break;
      case 'cart':
        setActiveTabState('cart');
        navigate('Cart');
        break;
      case 'clinics_map':
        navigate('ClinicsMap', params);
        break;
      case 'medical_checkup':
        navigate('MedicalCheckup', params);
        break;
      case 'medical_records':
        navigate('MedicalRecords', params);
        break;
      case 'my_appointments':
        setActiveTabState('history');
        navigate('MyAppointments');
        break;
      case 'notifications':
        navigate('Notifications');
        break;
      case 'profile':
        setActiveTabState('profile');
        navigate('Profile');
        break;
      default:
        navigate('MainTabs');
        break;
    }
  };

  const goBack = () => {
    navGoBack();
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

  const login = async (identifier: string, pass: string): Promise<void> => {
    const res = await loginUser(identifier, pass);
    if (res?.user) {
      setUser(res.user);
      setIsAuthenticated(true);
      // Connect Socket.IO with the fresh JWT token
      if (res.token) {
        socketService.connect(res.token);
      }
    } else {
      throw new Error('Authentication failed');
    }
  };

  const register = async (payload: RegisterPayload): Promise<void> => {
    const res = await registerUser(payload);
    if (res?.user) {
      setUser(res.user);
      setIsAuthenticated(true);
      if (res.token) {
        socketService.connect(res.token);
      }
    } else {
      throw new Error('Account creation failed');
    }
  };

  const logout = async () => {
    socketService.disconnect();
    activeChatConversationId.current = '';
    await removeAuthToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  const addAppointment = async (aptData: Partial<Appointment>): Promise<Appointment> => {
    const createdApt = await createAppointmentApi(aptData);
    setAppointments((prev) => [createdApt, ...prev]);
    setActiveAppointment(createdApt);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Appointment Confirmed with ${createdApt.doctor.name}`,
      titleAr: `تم تأكيد موعدك بنجاح مع ${createdApt.doctor.nameAr}`,
      message: `Your ${createdApt.consultationType} consultation is scheduled for ${createdApt.date} at ${createdApt.timeSlot}.`,
      messageAr: `موعد استشارتك (${createdApt.consultationType}) محجوز في ${createdApt.date} الساعة ${createdApt.timeSlot}.`,
      timestamp: 'Just now',
      timestampAr: 'الآن',
      type: 'appointment',
      read: false,
      actionScreen: 'my_appointments',
    };
    setNotifications((prev) => [newNotif, ...prev]);
    return createdApt;
  };

  const cancelAppointment = async (id: string) => {
    await cancelAppointmentApi(id);
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: 'cancelled' } : apt))
    );
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updated = [...prev, { product, quantity }];
      }
      AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => {
      const updated = prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.product.id !== productId);
      AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    AsyncStorage.removeItem(CART_STORAGE_KEY);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  const markNotificationRead = async (id: string) => {
    await markNotificationReadApi(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = async () => {
    await markAllNotificationsReadApi();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  /**
   * Send a chat message to the active doctor.
   *
   * Strategy:
   *  1. Optimistically add the message to local state so the UI is instant.
   *  2. Resolve the conversation ID (get-or-create via REST).
   *  3. If socket is connected → emit 'new_message' for real-time delivery.
   *  4. Always persist via REST POST as the reliable channel.
   *  5. Register a socket listener (once per conversation) so incoming
   *     doctor replies land in chatMessages automatically.
   */
  const sendChatMessage = async (
    text: string,
    type: 'text' | 'image' | 'prescription' | 'report' | 'voice' = 'text'
  ) => {
    if (!text.trim()) return;

    // 1. Optimistic local update
    const optimisticMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'patient',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
    };
    setChatMessages((prev) => [...prev, optimisticMsg]);

    try {
      // 2. Get or create conversation
      const doctorId = activeChatDoctor?.id ?? '';
      const { conversationId } = await getOrCreateConversationApi(doctorId);

      if (conversationId && conversationId !== activeChatConversationId.current) {
        // Join the Socket.IO room and register incoming message listener (once)
        activeChatConversationId.current = conversationId;
        socketService.joinConversation(conversationId);

        // Register listener: push incoming doctor messages into state in real-time.
        // Signature: onMessage(cb: (msg: IncomingMessage, convId: string) => void)
        socketService.onMessage((msg, _convId) => {
          // Filter to this conversation and ignore our own echoes
          if (String(msg.conversation_id) !== String(conversationId)) return;
          if (msg.sender_type === 'patient') return;
          const incoming: ChatMessage = {
            id: String(msg.id ?? `msg-${Date.now()}`),
            sender: 'doctor',
            text: msg.content ?? '',
            timestamp: msg.created_at
              ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: (msg.message_type as any) ?? 'text',
          };
          setChatMessages((prev) => [...prev, incoming]);
        });
      }

      // 3. Persist via REST — the backend broadcasts via socket after saving
      await sendChatMessageApi(doctorId, { text, type }, user?.id);
    } catch (err) {
      // Non-fatal: optimistic message is already shown
      console.warn('[sendChatMessage] Backend error (message shown locally):', err);
    }
  };


  /**
   * Load real message history for a conversation with a specific doctor.
   * Called by DoctorChatScreen on mount. Falls back gracefully if offline.
   */
  const loadChatHistory = async (doctorId: string): Promise<void> => {
    if (!doctorId) return;
    try {
      const msgs = await fetchChatMessagesApi(doctorId, user?.id);
      if (msgs.length > 0) {
        // Replace local state with the real fetched history
        setChatMessages(msgs);
      }
    } catch {
      // Backend unreachable — leave existing chatMessages intact (mocks or cached)
      console.warn('[loadChatHistory] Could not fetch chat history, keeping local messages');
    }
  };

  const toggleFavoriteDoctor = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const updateUser = (data: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  const updateUserProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const updated = await updateProfileApi(data);
    setUser(updated);
    return updated;
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
        isAuthLoading,
        isAuthenticated,
        login,
        register,
        logout,
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
        loadChatHistory,
        activeChatDoctor,
        setActiveChatDoctor,
        favorites,
        toggleFavoriteDoctor,
        user,
        updateUser,
        updateUserProfile,
        searchQuery,
        setSearchQuery,
        bookingDraft,
        setBookingDraft,
        isVideoCallActive,
        setIsVideoCallActive,
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

