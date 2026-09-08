import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Search,
  Bell,
  MapPin,
  ChevronDown,
  Video,
  MessageSquare,
  ShoppingBag,
  Building2,
  Activity,
  Star,
  Plus,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { DOCTOR_CATEGORIES, HEALTH_CHECKUP_PACKAGES } from '../../data/mockData';
import { MedicalIcon } from '../common/MedicalIcon';
import { resolveImageUrl } from '../../api/client';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/styles';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    user,
    doctors,
    products,
    appointments,
    navigateTo,
    addToCart,
    isRtl,
    t,
    unreadNotificationsCount,
    setSearchQuery,
  } = useApp();

  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const upcomingApt = appointments.find((a) => a.status === 'upcoming') || appointments[0];
  const avatarUrl = user?.avatar ? resolveImageUrl(user.avatar) : DEFAULT_AVATAR;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: 80 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header & Greeting Bar */}
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: Math.max(insets.top, 14),
          },
        ]}
      >
        <View style={[styles.topRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigateTo('profile')}
            style={[styles.userRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
          >
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatar}
            />
            <View style={{ alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
              <Text style={styles.greetingText}>
                {t('Good morning,', 'صباح الخير،')}
              </Text>
              <Text style={styles.userName}>
                {user?.name ? t(user.name, user.nameAr || user.name) : t('Patient', 'المريض')}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigateTo('notifications')}
            style={styles.bellButton}
          >
            <Bell size={20} color={Colors.slate[700]} />
            {unreadNotificationsCount > 0 && <View style={styles.bellBadge} />}
          </TouchableOpacity>
        </View>

        {/* Location selector */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigateTo('clinics_map')}
          style={[styles.locationBtn, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
        >
          <View style={[styles.locationInner, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <MapPin size={15} color={Colors.primary} />
            <Text style={styles.locationLabel}>
              {t('My location at', 'موقعي الحالي في')}
            </Text>
            <Text numberOfLines={1} style={styles.locationValue}>
              {user?.location ? t(user.location, user.locationAr || user.location) : t('Khartoum, Sudan', 'الخرطوم، السودان')}
            </Text>
          </View>
          <ChevronDown size={16} color={Colors.primary} />
        </TouchableOpacity>

        {/* Search Bar */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigateTo('doctors')}
          style={[styles.searchBar, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
        >
          <Search size={18} color={Colors.slate[400]} />
          <TextInput
            placeholder={t('What do you need help with?', 'بمَ يمكننا مساعدتك اليوم؟')}
            placeholderTextColor={Colors.slate[400]}
            onChangeText={(text) => setSearchQuery(text)}
            onFocus={() => navigateTo('doctors')}
            style={[
              styles.searchInput,
              { textAlign: isRtl ? 'right' : 'left' },
            ]}
          />
        </TouchableOpacity>
      </View>

      {/* Services Grid (5 services) */}
      <View style={styles.sectionPadding}>
        <View style={[styles.servicesGrid, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigateTo('doctors')}
            style={styles.serviceItem}
          >
            <View style={[styles.serviceIconWrap, { backgroundColor: Colors.primarySubtle }]}>
              <Video size={24} color={Colors.primary} />
            </View>
            <Text style={styles.serviceLabel}>{t('Talk Doctor', 'طبيب')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigateTo('chat_doctor', { chatDoctor: doctors[0] })}
            style={styles.serviceItem}
          >
            <View style={[styles.serviceIconWrap, { backgroundColor: Colors.accentLight }]}>
              <MessageSquare size={24} color={Colors.accent} />
            </View>
            <Text style={styles.serviceLabel}>{t('Chat', 'محادثة')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigateTo('pharmacy')}
            style={styles.serviceItem}
          >
            <View style={[styles.serviceIconWrap, { backgroundColor: Colors.warningLight }]}>
              <ShoppingBag size={24} color={Colors.warning} />
            </View>
            <Text style={styles.serviceLabel}>{t('Pharmacy', 'صيدلية')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigateTo('clinics_map')}
            style={styles.serviceItem}
          >
            <View style={[styles.serviceIconWrap, { backgroundColor: Colors.purpleLight }]}>
              <Building2 size={24} color={Colors.purple} />
            </View>
            <Text style={styles.serviceLabel}>{t('Clinics', 'عيادات')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigateTo('medical_checkup')}
            style={styles.serviceItem}
          >
            <View style={[styles.serviceIconWrap, { backgroundColor: Colors.roseLight }]}>
              <Activity size={24} color={Colors.rose} />
            </View>
            <Text style={styles.serviceLabel}>{t('Checkup', 'فحص')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming Appointment Card */}
      {upcomingApt && (
        <View style={styles.sectionPadding}>
          <View style={[styles.sectionHeaderRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <Text style={styles.sectionTitle}>
              {t('Your Appointment', 'موعدك القادم')}
            </Text>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => navigateTo('my_appointments')}
              style={[styles.seeAllBtn, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
            >
              <Text style={styles.seeAllText}>{t('See all', 'عرض الكل')}</Text>
              <Arrow size={14} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.appointmentCard}>
            <View style={[styles.aptDoctorRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <Image source={{ uri: upcomingApt.doctor.avatar }} style={styles.aptDoctorAvatar} />
              <View style={[styles.aptDoctorInfo, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
                <Text style={styles.aptDoctorName}>
                  {t(upcomingApt.doctor.name, upcomingApt.doctor.nameAr)}
                </Text>
                <Text style={styles.aptSpecialty}>
                  {t(upcomingApt.doctor.specialty, upcomingApt.doctor.specialtyAr)}
                </Text>
                <View style={[styles.aptMetaRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.aptMetaItem, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <Calendar size={13} color={Colors.slate[500]} />
                    <Text style={styles.aptMetaText}>{upcomingApt.date}</Text>
                  </View>
                  <View style={[styles.aptMetaItem, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <Clock size={13} color={Colors.slate[500]} />
                    <Text style={styles.aptMetaText}>{upcomingApt.timeSlot}</Text>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigateTo('video_consultation', { appointment: upcomingApt })}
              style={[styles.joinCallBtn, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
            >
              <Video size={18} color={Colors.white} />
              <Text style={styles.joinCallText}>
                {t('Join Video Consultation', 'انضم للاستشارة المرئية')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Doctor Categories */}
      <View style={styles.sectionPadding}>
        <View style={[styles.sectionHeaderRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <Text style={styles.sectionTitle}>
            {t('Doctor Specialist', 'التخصصات الطبية')}
          </Text>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => navigateTo('doctors')}
            style={[styles.seeAllBtn, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
          >
            <Text style={styles.seeAllText}>{t('See all', 'عرض الكل')}</Text>
            <Arrow size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.categoryScroll, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
        >
          {DOCTOR_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.7}
              onPress={() => navigateTo('doctors', { categoryId: cat.id })}
              style={styles.categoryCard}
            >
              <View style={styles.categoryIconWrap}>
                <MedicalIcon name={cat.iconName} size={24} color={Colors.primary} />
              </View>
              <Text style={styles.categoryName}>
                {t(cat.name, cat.nameAr)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Top Doctors Carousel */}
      <View style={styles.sectionPadding}>
        <View style={[styles.sectionHeaderRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <Text style={styles.sectionTitle}>
            {t('Top Doctor For You', 'أطباء مميزون لك')}
          </Text>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => navigateTo('doctors')}
            style={[styles.seeAllBtn, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
          >
            <Text style={styles.seeAllText}>{t('See all', 'عرض الكل')}</Text>
            <Arrow size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.doctorScroll, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
        >
          {doctors.slice(0, 4).map((doc) => (
            <TouchableOpacity
              key={doc.id}
              activeOpacity={0.8}
              onPress={() => navigateTo('doctor_detail', { doctor: doc })}
              style={styles.doctorCard}
            >
              <Image source={{ uri: doc.avatar }} style={styles.docAvatar} />
              <View style={styles.docInfo}>
                <View style={[styles.docRatingRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <Star size={14} color="#f59e0b" fill="#f59e0b" />
                  <Text style={styles.docRatingText}>{doc.rating}</Text>
                  <Text style={styles.docReviewsText}>({doc.reviewsCount})</Text>
                </View>
                <Text numberOfLines={1} style={styles.docName}>
                  {t(doc.name, doc.nameAr)}
                </Text>
                <Text numberOfLines={1} style={styles.docSpecialty}>
                  {t(doc.specialty, doc.specialtyAr)}
                </Text>
                <View style={[styles.docFeeRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <Text style={styles.docFee}>
                    {t(doc.feeFormatted, doc.feeFormattedAr)}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => navigateTo('doctor_detail', { doctor: doc })}
                    style={styles.bookSmallBtn}
                  >
                    <Text style={styles.bookSmallText}>{t('Book', 'حجز')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Popular Pharmacy Products */}
      <View style={styles.sectionPadding}>
        <View style={[styles.sectionHeaderRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <Text style={styles.sectionTitle}>
            {t('Popular Medicines', 'أدوية ومنتجات شائعة')}
          </Text>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => navigateTo('pharmacy')}
            style={[styles.seeAllBtn, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
          >
            <Text style={styles.seeAllText}>{t('See all', 'عرض الكل')}</Text>
            <Arrow size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.productScroll, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
        >
          {products.slice(0, 4).map((product) => (
            <TouchableOpacity
              key={product.id}
              activeOpacity={0.8}
              onPress={() => navigateTo('medicine_detail', { product })}
              style={styles.productCard}
            >
              <Image source={{ uri: product.image }} style={styles.productImg} resizeMode="contain" />
              <View style={styles.productInfo}>
                <Text numberOfLines={1} style={styles.productName}>
                  {t(product.name, product.nameAr)}
                </Text>
                <Text numberOfLines={1} style={styles.productDesc}>
                  {t(product.shortDesc, product.shortDescAr)}
                </Text>
                <View style={[styles.productBottomRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <Text style={styles.productPrice}>
                    {t(product.priceFormatted, product.priceFormattedAr)}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => addToCart(product, 1)}
                    style={styles.addCartBtn}
                  >
                    <Plus size={16} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  headerBar: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate[100],
  },
  topRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userRow: {
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
  },
  greetingText: {
    fontSize: 12,
    color: Colors.slate[500],
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.slate[900],
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.slate[50],
    borderWidth: 1,
    borderColor: Colors.slate[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  locationBtn: {
    backgroundColor: Colors.primaryBg,
    borderWidth: 1,
    borderColor: Colors.primarySubtle,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationInner: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  locationValue: {
    fontSize: 11,
    color: Colors.slate[600],
    flexShrink: 1,
  },
  searchBar: {
    backgroundColor: Colors.slate[100],
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.slate[900],
    height: '100%',
  },
  sectionPadding: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  servicesGrid: {
    justifyContent: 'space-between',
  },
  serviceItem: {
    alignItems: 'center',
    width: 58,
  },
  serviceIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  serviceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.slate[700],
    textAlign: 'center',
  },
  sectionHeaderRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.slate[900],
  },
  seeAllBtn: {
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  appointmentCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    ...Shadows.md,
  },
  aptDoctorRow: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  aptDoctorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
  },
  aptDoctorInfo: {
    flex: 1,
  },
  aptDoctorName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.slate[900],
  },
  aptSpecialty: {
    fontSize: 12,
    color: Colors.slate[500],
    marginTop: 2,
  },
  aptMetaRow: {
    gap: 12,
    marginTop: 6,
  },
  aptMetaItem: {
    alignItems: 'center',
    gap: 4,
  },
  aptMetaText: {
    fontSize: 11,
    color: Colors.slate[500],
  },
  joinCallBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  joinCallText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  categoryScroll: {
    gap: 12,
    paddingVertical: 4,
  },
  categoryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.slate[100],
    minWidth: 88,
    ...Shadows.sm,
  },
  categoryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.slate[800],
    textAlign: 'center',
  },
  doctorScroll: {
    gap: 14,
    paddingVertical: 4,
  },
  doctorCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 12,
    width: 170,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    ...Shadows.sm,
  },
  docAvatar: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    marginBottom: 8,
  },
  docInfo: {
    gap: 3,
  },
  docRatingRow: {
    alignItems: 'center',
    gap: 4,
  },
  docRatingText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate[800],
  },
  docReviewsText: {
    fontSize: 11,
    color: Colors.slate[400],
  },
  docName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.slate[900],
  },
  docSpecialty: {
    fontSize: 11,
    color: Colors.slate[500],
  },
  docFeeRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  docFee: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  bookSmallBtn: {
    backgroundColor: Colors.primarySubtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  bookSmallText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  productScroll: {
    gap: 14,
    paddingVertical: 4,
  },
  productCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 12,
    width: 150,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    ...Shadows.sm,
  },
  productImg: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
  },
  productInfo: {
    gap: 3,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.slate[900],
  },
  productDesc: {
    fontSize: 11,
    color: Colors.slate[400],
  },
  productBottomRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.slate[900],
  },
  addCartBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

