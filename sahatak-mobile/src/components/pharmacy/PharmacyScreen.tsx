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
  ShoppingCart,
  Plus,
  Check,
  UploadCloud,
  ShieldCheck,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { Product } from '../../types';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/styles';

export const PharmacyScreen: React.FC = () => {
  const { products, addToCart, navigateTo, cartCount, isRtl, t } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [addedItemIds, setAddedItemIds] = useState<string[]>([]);

  const categories = [
    { id: 'all', labelEn: 'All Medicines', labelAr: 'الكل' },
    { id: 'Cold & Cough', labelEn: 'Cold & Cough', labelAr: 'الزكام والسعال' },
    { id: 'Pain Relief', labelEn: 'Pain Relief', labelAr: 'مسكنات الألم' },
    { id: 'Vitamins & Supplements', labelEn: 'Vitamins', labelAr: 'الفيتامينات' },
    { id: 'First Aid & Safety', labelEn: 'First Aid', labelAr: 'الإسعافات' },
    { id: 'Digestive Health', labelEn: 'Digestive', labelAr: 'صحة الجهاز الهضمي' },
  ];

  const filteredProducts = products.filter((item) => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      searchTerm.trim() === '' ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nameAr.includes(searchTerm) ||
      item.shortDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.shortDescAr.includes(searchTerm);
    return matchesCat && matchesSearch;
  });

  const handleAddToCartWithFeedback = (product: Product) => {
    addToCart(product, 1);
    setAddedItemIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedItemIds((prev) => prev.filter((id) => id !== product.id));
    }, 1500);
  };

  const renderProductItem = ({ item: product }: { item: Product }) => {
    const isAdded = addedItemIds.includes(product.id);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigateTo('medicine_detail', { product })}
        style={styles.productCard}
      >
        <View style={styles.productImgWrap}>
          <Image
            source={{ uri: product.image }}
            style={styles.productImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.productDetails}>
          <Text numberOfLines={1} style={styles.productCatBadge}>
            {t(product.category, product.categoryAr)}
          </Text>
          <Text numberOfLines={2} style={styles.productTitle}>
            {t(product.name, product.nameAr)}
          </Text>
          <Text numberOfLines={1} style={styles.productSubtitle}>
            {t(product.shortDesc, product.shortDescAr)}
          </Text>
        </View>

        <View style={[styles.productBottomRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <Text style={styles.productPrice}>
            {t(product.priceFormatted, product.priceFormattedAr)}
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleAddToCartWithFeedback(product)}
            style={[
              styles.addBtn,
              isAdded && styles.addBtnSuccess,
            ]}
          >
            {isAdded ? (
              <Check size={16} color={Colors.white} />
            ) : (
              <Plus size={18} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Pharmacy"
        titleAr="صيدلية صحتك الرقمية"
        rightAction="none"
      />

      {/* Search Bar & Cart Button */}
      <View style={[styles.searchSection, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        <View style={[styles.searchBar, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <Search size={18} color={Colors.slate[400]} />
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder={t('Search medicines, vitamins...', 'ابحث عن دواء أو فيتامين...')}
            placeholderTextColor={Colors.slate[400]}
            style={[
              styles.searchInput,
              { textAlign: isRtl ? 'right' : 'left' },
            ]}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigateTo('cart')}
          style={styles.cartButton}
        >
          <ShoppingCart size={20} color={Colors.white} />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderProductItem}
        columnWrapperStyle={[styles.columnWrapper, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Prescription Upload Banner */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigateTo('medical_records')}
              style={[styles.uploadBanner, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
            >
              <View style={[styles.uploadBannerLeft, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <View style={styles.uploadIconWrap}>
                  <UploadCloud size={22} color={Colors.white} />
                </View>
                <View style={[styles.uploadTextWrap, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
                  <Text style={styles.uploadTitle}>
                    {t('Have a Doctor Prescription?', 'لديك وصفة طبية من طبيبك؟')}
                  </Text>
                  <Text style={styles.uploadSub}>
                    {t('Upload Rx for 30-min express delivery', 'ارفع الروشتة لتوصيل سريع خلال 30 دقيقة')}
                  </Text>
                </View>
              </View>
              <View style={styles.uploadBadge}>
                <Text style={styles.uploadBadgeText}>{t('Upload', 'رفع')}</Text>
              </View>
            </TouchableOpacity>

            {/* Category Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.categoryTabs, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
            >
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    activeOpacity={0.7}
                    onPress={() => setActiveCategory(cat.id)}
                    style={[
                      styles.categoryTab,
                      isActive && styles.categoryTabActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryTabText,
                        isActive && styles.categoryTabTextActive,
                      ]}
                    >
                      {t(cat.labelEn, cat.labelAr)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Subheading row */}
            <View style={[styles.metaHeaderRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <Text style={styles.metaShowingText}>
                {t(`Showing ${filteredProducts.length} items`, `عرض ${filteredProducts.length} منتج`)}
              </Text>
              <View style={[styles.certBadge, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <ShieldCheck size={14} color={Colors.accent} />
                <Text style={styles.certText}>{t('100% SFDA Certified', 'معتمد 100%')}</Text>
              </View>
            </View>
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
  searchSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate[100],
    gap: 10,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
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
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  cartBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  uploadBanner: {
    backgroundColor: '#0284c7',
    borderRadius: 18,
    padding: 14,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    ...Shadows.sm,
  },
  uploadBannerLeft: {
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  uploadIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTextWrap: {
    flex: 1,
  },
  uploadTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  uploadSub: {
    fontSize: 11,
    color: '#e0f2fe',
    marginTop: 2,
  },
  uploadBadge: {
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  uploadBadgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  categoryTabs: {
    gap: 8,
    paddingBottom: 10,
  },
  categoryTab: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.slate[200],
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
  },
  categoryTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.slate[700],
  },
  categoryTabTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  metaHeaderRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  metaShowingText: {
    fontSize: 12,
    color: Colors.slate[500],
    fontWeight: '500',
  },
  certBadge: {
    alignItems: 'center',
    gap: 4,
  },
  certText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.accentDark,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    justifyContent: 'space-between',
    ...Shadows.sm,
  },
  productImgWrap: {
    width: '100%',
    height: 110,
    borderRadius: 12,
    backgroundColor: Colors.slate[50],
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    marginBottom: 8,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productDetails: {
    gap: 2,
  },
  productCatBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
    backgroundColor: Colors.primarySubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate[900],
    lineHeight: 16,
  },
  productSubtitle: {
    fontSize: 10,
    color: Colors.slate[400],
    marginTop: 2,
  },
  productBottomRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.slate[100],
    paddingTop: 8,
    marginTop: 8,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.slate[900],
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnSuccess: {
    backgroundColor: Colors.accent,
  },
});

