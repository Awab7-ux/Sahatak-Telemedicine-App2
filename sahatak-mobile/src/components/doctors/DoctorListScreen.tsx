import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  FlatList,
} from 'react-native';
import {
  Search,
  Star,
  Heart,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { DOCTOR_CATEGORIES } from '../../data/mockData';
import { MedicalIcon } from '../common/MedicalIcon';
import { Doctor } from '../../types';
import { matchDoctorSearch } from '../../api/doctors';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/styles';

export const DoctorListScreen: React.FC = () => {
  const { doctors, navigateTo, favorites, toggleFavoriteDoctor, isRtl, t, searchQuery, setSearchQuery } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<number>(0);

  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  const filteredDoctors = doctors.filter((doc) => {
    const matchesCategory = selectedCategory === 'all' || doc.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesRating = filterRating === 0 || doc.rating >= filterRating;
    const matchesSearch = matchDoctorSearch(doc, searchQuery);

    return matchesCategory && matchesRating && matchesSearch;
  });

  const renderDoctorItem = ({ item: doc }: { item: Doctor }) => {
    const isFav = favorites.includes(doc.id);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigateTo('doctor_detail', { doctor: doc })}
        style={styles.card}
      >
        <View style={[styles.topCardRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: doc.avatar }} style={styles.docAvatar} />
            {doc.isVerified && (
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={12} color={Colors.white} />
              </View>
            )}
          </View>

          <View style={[styles.cardDetails, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
            <View style={[styles.cardTitleRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <Text numberOfLines={1} style={styles.docName}>
                {t(doc.name, doc.nameAr)}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => toggleFavoriteDoctor(doc.id)}
                style={styles.favBtn}
              >
                <Heart
                  size={16}
                  color={isFav ? Colors.rose : Colors.slate[400]}
                  fill={isFav ? Colors.rose : 'none'}
                />
              </TouchableOpacity>
            </View>

            <Text numberOfLines={1} style={styles.docSpecialty}>
              {t(doc.specialty, doc.specialtyAr)}
            </Text>

            <View style={[styles.metaRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View style={[styles.ratingRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <Star size={13} color="#f59e0b" fill="#f59e0b" />
                <Text style={styles.ratingText}>{doc.rating}</Text>
                <Text style={styles.reviewsText}>({doc.reviewsCount})</Text>
              </View>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.expText}>
                {doc.experienceYears}+ {t('yrs exp', 'سنوات خبرة')}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.bottomCardRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={{ alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
            <Text style={styles.feeLabel}>{t('Consultation Fee', 'سعر الاستشارة')}</Text>
            <Text style={styles.feeValue}>
              {t(doc.feeFormatted, doc.feeFormattedAr)}
            </Text>
          </View>

          <View style={[styles.actionButtons, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigateTo('chat_doctor', { chatDoctor: doc })}
              style={styles.chatIconBtn}
            >
              <MessageSquare size={16} color={Colors.slate[700]} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigateTo('doctor_detail', { doctor: doc })}
              style={[styles.bookBtn, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
            >
              <Text style={styles.bookBtnText}>{t('Book Now', 'احجز موعد')}</Text>
              <Chevron size={14} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Find a Doctor"
        titleAr="ابحث عن طبيب أو استشاري"
        rightAction="language"
      />

      {/* Top Search Field */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <Search size={18} color={Colors.slate[400]} />
          <TextInput
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
            placeholder={t('Search doctor or specialist...', 'ابحث باسم الطبيب أو التخصص...')}
            placeholderTextColor={Colors.slate[400]}
            style={[
              styles.searchInput,
              { textAlign: isRtl ? 'right' : 'left' },
            ]}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <FlatList
        data={filteredDoctors}
        keyExtractor={(item) => item.id}
        renderItem={renderDoctorItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Category selection */}
            <View style={styles.categoryHeader}>
              <Text style={styles.sectionHeading}>
                {t('Search by Category', 'البحث حسب التخصص الطبي')}
              </Text>
              {selectedCategory !== 'all' && (
                <TouchableOpacity onPress={() => setSelectedCategory('all')}>
                  <Text style={styles.viewAllText}>{t('View All', 'إظهار الكل')}</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={[styles.categoriesGrid, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              {DOCTOR_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    activeOpacity={0.7}
                    onPress={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
                    style={[
                      styles.categoryCard,
                      isSelected && styles.categoryCardSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.catIconWrap,
                        isSelected && { backgroundColor: 'rgba(255,255,255,0.25)' },
                      ]}
                    >
                      <MedicalIcon
                        name={cat.iconName}
                        size={20}
                        color={isSelected ? Colors.white : Colors.primary}
                      />
                    </View>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.catLabel,
                        isSelected && { color: Colors.white, fontWeight: '700' },
                      ]}
                    >
                      {t(cat.name, cat.nameAr)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* List Heading & Filters */}
            <View style={[styles.listHeaderRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View>
                <Text style={styles.sectionHeading}>
                  {selectedCategory === 'all'
                    ? t('Recommended Doctors', 'الأطباء الموصى بهم')
                    : t(`Specialists (${filteredDoctors.length})`, `الأطباء المتاحون (${filteredDoctors.length})`)}
                </Text>
                <Text style={styles.sectionSub}>
                  {t('Board-certified medical specialists', 'استشاريون وأطباء معتمدون ومتاحون')}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setFilterRating(filterRating === 4.8 ? 0 : 4.8)}
                style={[
                  styles.filterPill,
                  filterRating > 0 && styles.filterPillActive,
                  { flexDirection: isRtl ? 'row-reverse' : 'row' },
                ]}
              >
                <Star
                  size={12}
                  color={filterRating > 0 ? '#b45309' : Colors.slate[600]}
                  fill={filterRating > 0 ? '#f59e0b' : 'none'}
                />
                <Text
                  style={[
                    styles.filterPillText,
                    filterRating > 0 && { color: '#b45309', fontWeight: '700' },
                  ]}
                >
                  4.8+
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {t('No doctors found matching your criteria.', 'لم يتم العثور على أطباء يطابقون خيارات البحث.')}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setFilterRating(0);
              }}
              style={styles.resetBtn}
            >
              <Text style={styles.resetBtnText}>{t('Reset Filters', 'إعادة ضبط التصفية')}</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate[100],
  },
  searchBar: {
    backgroundColor: Colors.slate[50],
    borderWidth: 1,
    borderColor: Colors.slate[200],
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
  clearSearch: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.slate[400],
    paddingHorizontal: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.slate[900],
  },
  sectionSub: {
    fontSize: 11,
    color: Colors.slate[500],
    marginTop: 1,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  categoriesGrid: {
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 20,
  },
  categoryCard: {
    width: '31%',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    ...Shadows.sm,
  },
  categoryCardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  catLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.slate[700],
    textAlign: 'center',
  },
  listHeaderRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterPill: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.slate[200],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  filterPillActive: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.slate[600],
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    marginBottom: 12,
    ...Shadows.sm,
  },
  topCardRow: {
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  docAvatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.slate[100],
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDetails: {
    flex: 1,
  },
  cardTitleRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  docName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.slate[900],
    flex: 1,
  },
  favBtn: {
    padding: 4,
  },
  docSpecialty: {
    fontSize: 12,
    color: Colors.slate[500],
    marginTop: 2,
  },
  metaRow: {
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  ratingRow: {
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate[800],
  },
  reviewsText: {
    fontSize: 11,
    color: Colors.slate[400],
  },
  dot: {
    color: Colors.slate[300],
  },
  expText: {
    fontSize: 11,
    color: Colors.slate[500],
  },
  bottomCardRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.slate[100],
    paddingTop: 10,
    marginTop: 10,
  },
  feeLabel: {
    fontSize: 10,
    color: Colors.slate[400],
  },
  feeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  actionButtons: {
    gap: 8,
    alignItems: 'center',
  },
  chatIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  bookBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.slate[500],
    textAlign: 'center',
    marginBottom: 12,
  },
  resetBtn: {
    backgroundColor: Colors.primarySubtle,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  resetBtnText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});

