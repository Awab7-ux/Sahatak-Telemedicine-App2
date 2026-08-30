import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import {
  Search,
  Building2,
  Phone,
  Navigation,
  Star,
  Calendar,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { CLINIC_LOCATIONS } from '../../data/mockData';
import { ClinicLocation } from '../../types';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/styles';

const INITIAL_REGION = {
  latitude: 24.7136,
  longitude: 46.6753,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export const ClinicsMapScreen: React.FC = () => {
  const { navigateTo, isRtl, t } = useApp();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedClinic, setSelectedClinic] = useState<ClinicLocation>(CLINIC_LOCATIONS[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filterTabs = [
    { id: 'all', labelEn: 'All Places', labelAr: 'الكل' },
    { id: 'hospital', labelEn: 'Hospitals', labelAr: 'مستشفيات' },
    { id: 'clinic', labelEn: 'Clinics', labelAr: 'مجمعات طبية' },
    { id: 'pharmacy', labelEn: 'Pharmacies', labelAr: 'صيدليات 24/7' },
  ];

  const filteredClinics = CLINIC_LOCATIONS.filter((c) => {
    const matchesType = selectedType === 'all' || c.type === selectedType;
    const matchesQuery =
      searchQuery.trim() === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nameAr.includes(searchQuery) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.addressAr.includes(searchQuery);
    return matchesType && matchesQuery;
  });

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleDirections = (clinic: ClinicLocation) => {
    const lat = clinic.latitude || 24.7136;
    const lng = clinic.longitude || 46.6753;
    const url = Platform.select({
      ios: `maps:0,0?q=${clinic.name}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${clinic.name})`,
      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    });
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Hospitals & Clinics"
        titleAr="المستشفيات والمراكز القريبة"
        rightAction="none"
      />

      {/* Floating Search & Filter Bar */}
      <View style={styles.floatingControls}>
        <View style={[styles.searchBar, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <Search size={16} color={Colors.slate[400]} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('Search nearby hospitals & clinics...', 'ابحث عن مستشفى أو مركز قريب...')}
            placeholderTextColor={Colors.slate[400]}
            style={[
              styles.searchInput,
              { textAlign: isRtl ? 'right' : 'left' },
            ]}
          />
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.filterScroll, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
        >
          {filterTabs.map((tab) => {
            const isActive = selectedType === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.7}
                onPress={() => setSelectedType(tab.id)}
                style={[
                  styles.filterTab,
                  isActive && styles.filterTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    isActive && styles.filterTabTextActive,
                  ]}
                >
                  {t(tab.labelEn, tab.labelAr)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Real Interactive Google Map */}
      <MapView
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {filteredClinics.map((clinic, index) => {
          const lat = clinic.latitude || 24.7136 + (index - 1) * 0.015;
          const lng = clinic.longitude || 46.6753 + (index % 2 === 0 ? 0.012 : -0.012);
          const isSelected = selectedClinic.id === clinic.id;

          return (
            <Marker
              key={clinic.id}
              coordinate={{ latitude: lat, longitude: lng }}
              onPress={() => setSelectedClinic(clinic)}
            >
              <View
                style={[
                  styles.customMarker,
                  isSelected && styles.customMarkerSelected,
                ]}
              >
                <Building2
                  size={14}
                  color={isSelected ? Colors.white : Colors.primary}
                />
                <Text
                  numberOfLines={1}
                  style={[
                    styles.markerText,
                    isSelected && { color: Colors.white },
                  ]}
                >
                  {t(clinic.name, clinic.nameAr).split(' ')[0]}
                </Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Selected Facility Bottom Sheet Card */}
      <View style={styles.bottomSheetCard}>
        <View style={styles.dragHandle} />

        <View style={[styles.clinicRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <Image source={{ uri: selectedClinic.image }} style={styles.clinicImage} />

          <View style={[styles.clinicInfo, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
            <View style={[styles.clinicTopMeta, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>
                  {t(selectedClinic.type, selectedClinic.typeAr || selectedClinic.type)}
                </Text>
              </View>
              <View style={[styles.ratingWrap, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <Star size={13} color="#f59e0b" fill="#f59e0b" />
                <Text style={styles.ratingVal}>{selectedClinic.rating}</Text>
              </View>
            </View>

            <Text numberOfLines={1} style={styles.clinicTitle}>
              {t(selectedClinic.name, selectedClinic.nameAr)}
            </Text>

            <Text numberOfLines={1} style={styles.clinicAddress}>
              {t(selectedClinic.address, selectedClinic.addressAr)}
            </Text>

            <View style={[styles.clinicStatusRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View style={[styles.distanceRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <Navigation size={12} color={Colors.primary} />
                <Text style={styles.distanceText}>{selectedClinic.distance}</Text>
              </View>
              <Text style={styles.dotSeparator}>•</Text>
              <Text style={[styles.openStatus, { color: selectedClinic.isOpen ? Colors.accentDark : Colors.slate[400] }]}>
                {selectedClinic.isOpen ? t('Open Now', 'مفتوح الآن') : t('Closed', 'مغلق')}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionGrid, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleCall(selectedClinic.phone)}
            style={[styles.actionBtn, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
          >
            <Phone size={15} color={Colors.primary} />
            <Text style={styles.actionBtnText}>{t('Call', 'اتصال')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleDirections(selectedClinic)}
            style={[styles.actionBtn, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
          >
            <Navigation size={15} color={Colors.primary} />
            <Text style={styles.actionBtnText}>{t('Directions', 'الاتجاهات')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigateTo('doctors')}
            style={[styles.bookVisitBtn, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
          >
            <Calendar size={15} color={Colors.white} />
            <Text style={styles.bookVisitText}>{t('Book Visit', 'حجز موعد')}</Text>
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
  floatingControls: {
    position: 'absolute',
    top: 70,
    left: 16,
    right: 16,
    zIndex: 20,
    gap: 8,
  },
  searchBar: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 42,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.slate[200],
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: Colors.slate[900],
  },
  filterScroll: {
    gap: 6,
  },
  filterTab: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.slate[200],
    ...Shadows.sm,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.slate[700],
  },
  filterTabTextActive: {
    color: Colors.white,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  customMarker: {
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    ...Shadows.md,
  },
  customMarkerSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.white,
  },
  markerText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.slate[900],
  },
  bottomSheetCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.slate[100],
    ...Shadows.lg,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.slate[300],
    alignSelf: 'center',
    marginBottom: 12,
  },
  clinicRow: {
    alignItems: 'center',
    gap: 12,
  },
  clinicImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  clinicInfo: {
    flex: 1,
    gap: 2,
  },
  clinicTopMeta: {
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  typeBadge: {
    backgroundColor: Colors.primarySubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  ratingWrap: {
    alignItems: 'center',
    gap: 3,
  },
  ratingVal: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.slate[800],
  },
  clinicTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.slate[900],
  },
  clinicAddress: {
    fontSize: 11,
    color: Colors.slate[500],
  },
  clinicStatusRow: {
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  distanceRow: {
    alignItems: 'center',
    gap: 3,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  dotSeparator: {
    color: Colors.slate[300],
  },
  openStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionGrid: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.slate[100],
    paddingTop: 12,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.slate[100],
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate[800],
  },
  bookVisitBtn: {
    flex: 1.2,
    backgroundColor: Colors.primary,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  bookVisitText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
});

