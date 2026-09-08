import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { I18nManager, AppState, Alert } from 'react-native';
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
import { getAuthToken, removeAuthToken, ApiError } from '../api/client';
import { fetchCurrentUser, loginUser, registerUser, RegisterPayload } from '../api/auth';
import { updateProfileApi } from '../api/profile';
import { fetchDoctorsApi } from '../api/doctors';
import { fetchProductsApi } from '../api/pharmacy';
import { fetchAppointmentsApi, createAppointmentApi, cancelAppointmentApi } from '../api/appointments';
import { fetchNotificationsApi, markNotificationReadApi, markAllNotificationsReadApi } from '../api/notifications';
import { sendChatMessageApi, getOrCreateConversationApi, fetchChatMessagesApi, cacheConversationForDoctor, markMessageReadApi } from '../api/chat';
import {
  getConversationsApi,
  getUnreadCountApi,
  archiveConversationApi,
  createAppointmentConversationApi,
  getFriendlyChatError,
  RawConversation,
} from '../api/messages';

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
  startChatPolling: (doctorId: string) => void;
  stopChatPolling: () => void;
  activeChatDoctor: Doctor;
  setActiveChatDoctor: (doctor: Doctor) => void;
  /** Friendly, already-localized error from the last chat action (empty when none). */
  chatError: string;
  clearChatError: () => void;

  // Conversations (message threads list)
  conversations: RawConversation[];
  unreadTotal: number;
  refreshConversations: () => Promise<void>;
  archiveConversation: (conversationId: number | string) => Promise<void>;
  /** Create (or get) the conversation tied to an appointment, then open chat. */
  startAppointmentConversation: (appointmentId: string, doctor: Doctor) => Promise<void>;

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
  const [chatError, setChatError] = useState<string>('');
  const [conversations, setConversations] = useState<RawConversation[]>([]);
  const [unreadTotal, setUnreadTotal] = useState<number>(0);
  const [favorites, setFavorites] = useState<string[]>(['doc-1', 'doc-3']);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookingDraft, setBookingDraft] = useState<Partial<Appointment>>({});
  const [isVideoCallActive, setIsVideoCallActive] = useState<boolean>(false);

  // Ref to track the conversation ID currently open in DoctorChatScreen
  const activeChatConversationId = useRef<string>('');
  const chatPollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const unreadPollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPollTickInFlightRef = useRef(false);
  const isUnreadTickInFlightRef = useRef(false);
  const isAppActiveRef = useRef(true);

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
      case 'conversations':
        setActiveTabState('messages');
        navigate('Conversations');
        refreshConversations();
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
        navigateTo('conversations');
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
    if (res?.requiresEmailVerification) {
      // Real backend: accounts start unverified; login is blocked until the
      // email verification link is clicked. Do NOT authenticate the session.
      throw new Error(
        t(
          'Account created! Please check your email and click the verification link before signing in.',
          'تم إنشاء الحساب! يرجى فحص بريدك الإلكتروني والضغط على رابط التحقق قبل تسجيل الدخول.'
        )
      );
    }
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

  /** Client-generated optimistic ids look like `msg-<timestamp>`. */
  const isOptimisticMessage = (m: ChatMessage): boolean => m.id.startsWith('msg-');

  /**
   * Merge a full server refresh into local state without duplicates.
   * Server messages (deduped by id) are the source of truth. Optimistic
   * local messages are kept only until a matching server message arrives
   * (matched by sender + text + type), then dropped in favor of the server copy.
   */
  const mergeChatMessages = (local: ChatMessage[], server: ChatMessage[]): ChatMessage[] => {
    const seen = new Set<string>();
    const dedupedServer = server.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });

    const pendingOptimistic = local.filter(
      (m) =>
        isOptimisticMessage(m) &&
        !dedupedServer.some(
          (s) => s.sender === m.sender && s.text === m.text && s.type === m.type
        )
    );

    return [...dedupedServer, ...pendingOptimistic];
  };

  const pollChatMessages = async (doctorId: string): Promise<void> => {
    if (!isAppActiveRef.current) return; // paused while backgrounded
    if (isPollTickInFlightRef.current) return;
    isPollTickInFlightRef.current = true;
    try {
      const msgs = await fetchChatMessagesApi(doctorId, user?.id);
      setChatMessages((prev) => mergeChatMessages(prev, msgs));
      // Mark any incoming unread messages read explicitly (belt & braces —
      // GET conversation detail already marks read server-side).
      const unreadIncoming = msgs.filter((m) => m.sender === 'doctor');
      if (unreadIncoming.length > 0 && activeChatConversationId.current) {
        unreadIncoming.forEach((m) => {
          markMessageReadApi(m.id).catch(() => undefined);
        });
      }
    } catch {
      // Transient poll failure — keep current local messages, next tick retries.
    } finally {
      isPollTickInFlightRef.current = false;
    }
  };

  /** Start polling every 3 seconds. Safe to call repeatedly. */
  const startChatPolling = (doctorId: string): void => {
    stopChatPolling();
    if (!doctorId) return;
    pollChatMessages(doctorId);
    chatPollingIntervalRef.current = setInterval(() => pollChatMessages(doctorId), 3000);
  };

  /** Stop polling. Safe to call when no interval is running. */
  const stopChatPolling = (): void => {
    if (chatPollingIntervalRef.current !== null) {
      clearInterval(chatPollingIntervalRef.current);
      chatPollingIntervalRef.current = null;
    }
  };

  // ── Conversations list + unread badges ────────────────────────────────

  /** Fetch conversations + total unread badge count (silently fails). */
  const refreshConversations = useCallback(async (): Promise<void> => {
    try {
      const [{ conversations: list }, unread] = await Promise.all([
        getConversationsApi(1, 50),
        getUnreadCountApi(),
      ]);
      setConversations(list);
      setUnreadTotal(unread.total_unread);
    } catch {
      // Silent — the conversations screen shows its own empty/error state.
    }
  }, []);

  /** Poll unread-count every 20s while the app is in the foreground. */
  const pollUnreadCount = useCallback(async (): Promise<void> => {
    if (!isAppActiveRef.current || isUnreadTickInFlightRef.current) return;
    isUnreadTickInFlightRef.current = true;
    try {
      const unread = await getUnreadCountApi();
      setUnreadTotal(unread.total_unread);
    } catch {
      // Transient — retry next tick.
    } finally {
      isUnreadTickInFlightRef.current = false;
    }
  }, []);

  // Pause/resume all polling when the app is backgrounded/foregrounded.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      isAppActiveRef.current = state === 'active';
    });
    return () => sub.remove();
  }, []);

  // Unread badge polling while authenticated.
  useEffect(() => {
    if (!isAuthenticated) {
      if (unreadPollingIntervalRef.current !== null) {
        clearInterval(unreadPollingIntervalRef.current);
        unreadPollingIntervalRef.current = null;
      }
      return;
    }
    refreshConversations();
    unreadPollingIntervalRef.current = setInterval(pollUnreadCount, 20000);
    return () => {
      if (unreadPollingIntervalRef.current !== null) {
        clearInterval(unreadPollingIntervalRef.current);
        unreadPollingIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, refreshConversations, pollUnreadCount]);

  const archiveConversation = async (conversationId: number | string): Promise<void> => {
    await archiveConversationApi(conversationId);
    setConversations((prev) => prev.filter((c) => String(c.id) !== String(conversationId)));
    refreshConversations();
  };

  /**
   * Create (or get) the conversation tied to an appointment and open the
   * chat screen with that doctor. Surfaces friendly errors (e.g. trying to
   * message a doctor you have no relationship with).
   */
  const startAppointmentConversation = async (
    appointmentId: string,
    doctor: Doctor,
  ): Promise<void> => {
    try {
      const { conversation } = await createAppointmentConversationApi(appointmentId);
      cacheConversationForDoctor(doctor.id, conversation.id);
      activeChatConversationId.current = String(conversation.id);
      setActiveChatDoctor(doctor);
      navigateTo('chat_doctor', { chatDoctor: doctor });
    } catch (err) {
      Alert.alert(t('Cannot open chat', 'تعذر فتح المحادثة'), getFriendlyChatError(err, lang));
    }
  };

  /**
   * Send a chat message to the active doctor.
   * Optimistic local update, then persisted via REST; the next poll tick
   * confirms the message and delivers any doctor replies.
   */
  const sendChatMessage = async (
    text: string,
    type: 'text' | 'image' | 'prescription' | 'report' | 'voice' = 'text'
  ) => {
    if (!text.trim()) return;

    const optimisticMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'patient',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
    };
    setChatMessages((prev) => [...prev, optimisticMsg]);

    try {
      const doctorId = activeChatDoctor?.id ?? '';
      const { conversationId } = await getOrCreateConversationApi(
        doctorId,
        activeChatDoctor?.userId,
      );
      if (conversationId) {
        activeChatConversationId.current = conversationId;
      }
      await sendChatMessageApi(doctorId, { text, type }, user?.id);
      setChatError('');
      // No special post-send handling — the next poll tick confirms the message.
    } catch (err) {
      console.warn('[ChatDebug] sendChatMessage failed:', err);
      const friendly = getFriendlyChatError(err, lang);
      if (err instanceof ApiError) {
        const debugBody =
          typeof err.rawBody === 'object'
            ? JSON.stringify(err.rawBody, null, 2)
            : String(err.rawBody ?? err.message);

        Alert.alert(
          'DEBUG CHAT ERROR',
          `Endpoint: ${err.method ?? ''} ${err.url ?? ''}\nStatus: ${err.status}\nError Code: ${err.errorCode ?? 'N/A'}\n\nResponse Body:\n${debugBody}`,
          [{ text: 'OK' }],
        );
        setChatError(`${friendly} [${err.status ?? 'ERR'} ${err.url ?? ''}]`);
      } else {
        Alert.alert('DEBUG CHAT ERROR', String(err), [{ text: 'OK' }]);
        setChatError(friendly);
      }
    }
  };

  const clearChatError = () => setChatError('');

  /**
   * Load real message history for a conversation with a specific doctor.
   * Called by DoctorChatScreen on mount. Falls back gracefully if offline.
   */
  const loadChatHistory = async (doctorId: string): Promise<void> => {
    if (!doctorId) return;
    try {
      const msgs = await fetchChatMessagesApi(doctorId, user?.id);
      setChatMessages((prev) => mergeChatMessages(prev, msgs));
      setChatError('');
    } catch (err) {
      console.warn('[loadChatHistory] Could not fetch chat history, keeping local messages');
      const friendly = getFriendlyChatError(err, lang);
      if (err instanceof ApiError) {
        setChatError(`${friendly} [${err.status ?? 'ERR'}]`);
      } else {
        setChatError(friendly);
      }
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
        startChatPolling,
        stopChatPolling,
        activeChatDoctor,
        setActiveChatDoctor,
        chatError,
        clearChatError,
        conversations,
        unreadTotal,
        refreshConversations,
        archiveConversation,
        startAppointmentConversation,
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