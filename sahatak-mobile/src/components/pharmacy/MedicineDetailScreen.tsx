import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ShoppingCart,
  ShieldCheck,
  Plus,
  Minus,
  AlertCircle,
  FileCheck,
  Building,
  Truck,
  Check,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { POPULAR_PRODUCTS } from '../../data/mockData';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/styles';

export const MedicineDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { selectedProduct, addToCart, navigateTo, isRtl, t } = useApp();
  const product = selectedProduct || POPULAR_PRODUCTS[0];

  const [quantity, setQuantity] = useState<number>(1);
  const [isAddedToast, setIsAddedToast] = useState<boolean>(false);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigateTo('cart');
  };

  const totalPrice = (product.price * quantity).toFixed(2);

  return (
    <View style={styles.container}>
      <Header
        title="Medicine Details"
        titleAr="تفاصيل الدواء"
        rightAction="share"
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Image Stage */}
        <View style={styles.imageStage}>
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
              resizeMode="contain"
            />
          </View>
          <View style={[styles.sfdaBadge, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <ShieldCheck size={14} color={Colors.accentDark} />
            <Text style={styles.sfdaBadgeText}>{t('SFDA Approved', 'معتمد من الغذاء والدواء')}</Text>
          </View>
        </View>

        {/* Product Main Card */}
        <View style={styles.sectionPadding}>
          <View style={styles.mainCard}>
            <View style={[styles.categoryRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View style={styles.catPill}>
                <Text style={styles.catPillText}>
                  {t(product.category, product.categoryAr)}
                </Text>
              </View>
              <Text style={styles.packagingText}>{product.packaging || 'Pack'}</Text>
            </View>

            <Text style={[styles.productName, { textAlign: isRtl ? 'right' : 'left' }]}>
              {t(product.name, product.nameAr)}
            </Text>

            <View style={[styles.priceQtyRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View style={{ alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
                <Text style={styles.unitPriceLabel}>{t('Unit Price', 'سعر العبوة')}</Text>
                <Text style={styles.unitPriceValue}>
                  {t(product.priceFormatted, product.priceFormattedAr)}
                </Text>
              </View>

              {/* Quantity Counter */}
              <View style={[styles.qtyCounter, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  style={styles.qtyBtn}
                >
                  <Minus size={14} color={quantity <= 1 ? Colors.slate[400] : Colors.slate[700]} />
                </TouchableOpacity>
                <Text style={styles.qtyNumber}>{quantity}</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setQuantity((q) => q + 1)}
                  style={[styles.qtyBtn, styles.qtyBtnPlus]}
                >
                  <Plus size={14} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Express Delivery Notice */}
        <View style={styles.sectionPadding}>
          <View style={[styles.deliveryBanner, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <Truck size={22} color={Colors.primary} />
            <View style={[styles.deliveryInfo, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
              <Text style={styles.deliveryTitle}>
                {t('Express 30-Min Delivery Available', 'توصيل سريع متاح خلال 30 دقيقة')}
              </Text>
              <Text style={styles.deliverySub}>
                {t('Delivered in temperature-controlled medical packaging.', 'توصيل مبرد في عبوات طبية محكمة.')}
              </Text>
            </View>
          </View>
        </View>

        {/* Medical Details */}
        <View style={styles.sectionPadding}>
          <View style={styles.detailsCard}>
            <View style={styles.detailSection}>
              <Text style={[styles.detailSectionTitle, { textAlign: isRtl ? 'right' : 'left' }]}>
                {t('About Medication', 'نبذة عن الدواء')}
              </Text>
              <Text style={[styles.detailSectionBody, { textAlign: isRtl ? 'right' : 'left' }]}>
                {t(product.description || product.shortDesc, product.descriptionAr || product.shortDescAr)}
              </Text>
            </View>

            <View style={styles.detailDivider}>
              <View style={[styles.sectionHeadingRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <FileCheck size={16} color={Colors.primary} />
                <Text style={styles.detailSubHeading}>
                  {t('Composition & Active Ingredients', 'المكونات والمادة الفعالة')}
                </Text>
              </View>
              <View style={styles.compositionBox}>
                <Text style={styles.compositionText}>{product.composition}</Text>
              </View>
            </View>

            <View style={styles.detailDivider}>
              <Text style={[styles.detailSubHeading, { textAlign: isRtl ? 'right' : 'left' }]}>
                {t('Dosage Instructions', 'إرشادات الاستخدام والجرعات')}
              </Text>
              <Text style={[styles.detailSectionBody, { textAlign: isRtl ? 'right' : 'left' }]}>
                {t(product.dosage, product.dosageAr)}
              </Text>
            </View>

            <View style={styles.detailDivider}>
              <View style={[styles.sectionHeadingRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <AlertCircle size={16} color={Colors.warning} />
                <Text style={[styles.detailSubHeading, { color: Colors.warning }]}>
                  {t('Warnings & Precautions', 'التحذيرات وموانع الاستعمال')}
                </Text>
              </View>
              <View style={styles.warningsBox}>
                <Text style={styles.warningsText}>
                  {t(product.warnings, product.warningsAr)}
                </Text>
              </View>
            </View>

            <View style={[styles.manufacturerRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View style={[styles.mfgLabelRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <Building size={14} color={Colors.slate[400]} />
                <Text style={styles.mfgLabel}>{t('Manufacturer', 'الشركة المصنعة')}:</Text>
              </View>
              <Text style={styles.mfgValue}>{product.manufacturer}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Checkout Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: Math.max(insets.bottom, 12),
            flexDirection: isRtl ? 'row-reverse' : 'row',
          },
        ]}
      >
        <View style={{ alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
          <Text style={styles.subtotalLabel}>
            {t('Subtotal', 'المجموع')} ({quantity} {t('items', 'قطع')})
          </Text>
          <Text style={styles.subtotalValue}>SAR {totalPrice}</Text>
        </View>

        <View style={[styles.ctaButtons, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleAddToCart}
            style={[
              styles.cartIconBtn,
              isAddedToast && styles.cartIconBtnSuccess,
            ]}
          >
            {isAddedToast ? (
              <Check size={18} color={Colors.accent} />
            ) : (
              <ShoppingCart size={18} color={Colors.slate[700]} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleBuyNow}
            style={styles.buyNowBtn}
          >
            <Text style={styles.buyNowBtnText}>
              {t('Express Checkout', 'إتمام الطلب الفوري')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  imageStage: {
    backgroundColor: Colors.white,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate[100],
    position: 'relative',
  },
  imageWrapper: {
    width: 200,
    height: 200,
    backgroundColor: Colors.slate[50],
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  sfdaBadge: {
    position: 'absolute',
    top: 14,
    right: 16,
    backgroundColor: Colors.accentLight,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  sfdaBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accentDark,
  },
  sectionPadding: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  mainCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    ...Shadows.sm,
  },
  categoryRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  catPill: {
    backgroundColor: Colors.primarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  packagingText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.slate[500],
  },
  productName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.slate[900],
    lineHeight: 22,
  },
  priceQtyRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.slate[100],
    paddingTop: 12,
    marginTop: 12,
  },
  unitPriceLabel: {
    fontSize: 10,
    color: Colors.slate[400],
  },
  unitPriceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  qtyCounter: {
    backgroundColor: Colors.slate[100],
    borderRadius: 14,
    padding: 4,
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnPlus: {
    backgroundColor: Colors.primary,
  },
  qtyNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.slate[900],
    minWidth: 16,
    textAlign: 'center',
  },
  deliveryBanner: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 10,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  deliverySub: {
    fontSize: 11,
    color: '#3b82f6',
    marginTop: 2,
  },
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    ...Shadows.sm,
  },
  detailSection: {
    marginBottom: 12,
  },
  detailSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate[900],
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  detailSectionBody: {
    fontSize: 12,
    color: Colors.slate[600],
    lineHeight: 18,
  },
  detailDivider: {
    borderTopWidth: 1,
    borderTopColor: Colors.slate[100],
    paddingTop: 12,
    marginBottom: 12,
  },
  sectionHeadingRow: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  detailSubHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate[900],
  },
  compositionBox: {
    backgroundColor: Colors.slate[50],
    borderRadius: 10,
    padding: 10,
  },
  compositionText: {
    fontSize: 11,
    color: Colors.slate[700],
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
  },
  warningsBox: {
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  warningsText: {
    fontSize: 11,
    color: '#92400e',
    lineHeight: 16,
  },
  manufacturerRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.slate[100],
    paddingTop: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mfgLabelRow: {
    alignItems: 'center',
    gap: 4,
  },
  mfgLabel: {
    fontSize: 11,
    color: Colors.slate[400],
  },
  mfgValue: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.slate[800],
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.slate[100],
    paddingHorizontal: 16,
    paddingTop: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadows.lg,
  },
  subtotalLabel: {
    fontSize: 10,
    color: Colors.slate[400],
  },
  subtotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.slate[900],
  },
  ctaButtons: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  cartIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartIconBtnSuccess: {
    backgroundColor: Colors.accentLight,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  buyNowBtn: {
    flex: 1,
    maxWidth: 180,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});

