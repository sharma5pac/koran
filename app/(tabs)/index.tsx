import SearchModal from '@/components/SearchModal';
import { MOTIVATION_QUOTES } from '@/constants/quotes';
import { useAuth } from '@/hooks/useAuth';
import { getDuaOfTheDay } from '@/services/duaService';
import { scheduleAllDailyReminders } from '@/services/notificationService';
import { cancelPrayerNotifications, getPrayerTimes, requestPrayerPermissions, scheduleAdhanNotifications } from '@/services/prayerService';
import { fetchSurahs } from '@/services/quranApi';
import { useQuranStore } from '@/store/useQuranStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import moment from 'moment-hijri';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { surahs, setSurahs, lastRead, initialize, adhanEnabled, setAdhanEnabled, prayerTimes, setPrayerTimes } = useQuranStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [nextPrayer, setNextPrayer] = useState<any>(null);

  /* Carousel Logic - Ref-based to prevent re-render flickering */
  const carouselRef = React.useRef<FlatList>(null);
  const currentCarouselIndex = React.useRef(0);
  const { width } = useWindowDimensions();
  const CARD_WIDTH = width * 0.75; // 75% of screen width
  const CARD_SPACING = 16;
  const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;

  const handleCardPress = (index: number) => {
    const nextIndex = (index + 1) % motivationQuotes.length;
    carouselRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    currentCarouselIndex.current = nextIndex;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      // handleNext(); // Disable auto-scroll for better UX on mobile
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const onMomentumScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SNAP_INTERVAL);
    if (index >= 0 && index < motivationQuotes.length) {
      currentCarouselIndex.current = index;
    }
  };

  const loadData = async () => {
    try {
      // Fetch Surahs and Prayer Times in parallel for speed
      const [surahsData, times] = await Promise.all([
        fetchSurahs(),
        getPrayerTimes()
      ]);

      if (surahsData && surahsData.length > 0) {
        setSurahs(surahsData);
      }

      if (times) {
        setPrayerTimes(times);
        updateNextPrayer(times);

        // Auto-reschedule everything if enabled (only on native)
        if (adhanEnabled && Platform.OS !== 'web') {
          await scheduleAdhanNotifications(times);
          await scheduleAllDailyReminders();
        }
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateNextPrayer = (times: any) => {
    const now = new Date();
    const prayers = [
      { name: 'Fajr', time: new Date(times.fajr) },
      { name: 'Dhuhr', time: new Date(times.dhuhr) },
      { name: 'Asr', time: new Date(times.asr) },
      { name: 'Maghrib', time: new Date(times.maghrib) },
      { name: 'Isha', time: new Date(times.isha) },
    ];

    let next = prayers.find(p => p.time > now);

    if (!next) {
      // If no prayer is found after current time, it's Fajr of the next day
      // We add 24 hours to today's Fajr to represent tomorrow's
      const tomorrowFajr = new Date(times.fajr);
      tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
      next = { name: 'Fajr', time: tomorrowFajr };
    }

    setNextPrayer(next);
  };

  const toggleAdhan = async (value: boolean) => {
    if (value) {
      const granted = await requestPrayerPermissions();
      if (!granted) return;
      if (prayerTimes) {
        await scheduleAdhanNotifications(prayerTimes);
        await scheduleAllDailyReminders();
      }
    } else {
      await cancelPrayerNotifications();
    }
    setAdhanEnabled(value);
  };

  useEffect(() => {
    const init = async () => {
      await initialize(); // Load lastRead and other settings on mount

      // Start loading data immediately
      loadData();
    };

    init();

    let unsubscribe: any;
    if (user) {
      unsubscribe = require('@/services/syncService').syncUserData();
    }
    return () => unsubscribe?.();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const lastReadSurah = lastRead ? surahs.find(s => s.id === lastRead.surahId) : null;

  // Shuffle quotes on mount to give a fresh experience every time
  const motivationQuotes = React.useMemo(() => {
    const shuffled = [...MOTIVATION_QUOTES].sort(() => 0.5 - Math.random());
    return shuffled;
  }, []);

  const quoteImages = [
    require('../../assets/images/pexels_earth_photart_2149767641_35315918.png'),
    require('../../assets/images/pexels_ftmglgkhn_34179320.png'),
    require('../../assets/images/pexels_gr_stocks_1716147_8522576.png'),
    require('../../assets/images/pexels_haydan_as_soendawy_730525_2895295.png'),
    require('../../assets/images/pexels_yasirgurbuz_12593672.png'),
    require('../../assets/images/pexels_ovais_ibn_farooq_454781010_20875997.png'),
    require('../../assets/images/pexels_pixabay_460680.png'),
    require('../../assets/images/pexels_rdne_7249185.png'),
    require('../../assets/images/pexels_rubaitulazad_16150272.png'),
    require('../../assets/images/pexels_manpritkalsi_1537086.png'),
  ];

  const renderQuoteItem = ({ item, index }: { item: any, index: number }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => handleCardPress(index)}
      style={{ width: CARD_WIDTH }}
      className="h-[320px] mr-4 rounded-3xl overflow-hidden border border-white/10 bg-[#1E293B] shadow-2xl shadow-black"
    >
      <Image
        source={quoteImages[index % quoteImages.length]}
        className="absolute inset-0 w-full h-full"
        resizeMode="cover"
      />

      <LinearGradient
        colors={['rgba(15, 23, 42, 0.1)', 'rgba(15, 23, 42, 0.4)', 'rgba(15, 23, 42, 0.9)']}
        locations={[0, 0.3, 1]}
        className="absolute inset-0"
      />

      <View className="flex-1 justify-between p-5">
        <View className="flex-row justify-between items-start">
          <BlurView intensity={20} tint="light" className="px-2.5 h-6 rounded-lg items-center justify-center border border-white/20 overflow-hidden">
            <Text className="text-white font-bold text-[8px] tracking-wider uppercase">{item.category}</Text>
          </BlurView>
          <BlurView intensity={15} tint="light" className="w-7 h-7 rounded-full items-center justify-center overflow-hidden border border-white/10">
            <FontAwesome name="heart" size={12} color="#F59E0B" />
          </BlurView>
        </View>

        <View>
          <Text className="text-white text-base font-semibold mb-3 leading-6 italic" numberOfLines={5}>"{item.text}"</Text>
          <View className="h-[1px] w-8 bg-amber-500/50 mb-3" />
          <Text className="text-amber-500 text-[9px] font-bold uppercase tracking-widest">
            — {item.author}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View className="pb-6">
      <View className="px-6 pt-4">
        {/* Dynamic Island Top Bar */}
        <View className="flex-row items-center justify-between mb-8 h-14 bg-white/5 rounded-full px-2 border border-white/10 overflow-hidden shadow-lg">
          <BlurView intensity={20} tint="dark" className="absolute inset-0" />

          <TouchableOpacity
            className="w-10 h-10 rounded-full items-center justify-center"
          >
            <FontAwesome name="bars" size={18} color="white" className="opacity-70" />
          </TouchableOpacity>

          <Text className="text-white text-xl font-black tracking-tighter">
            NurQuran
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/profile')}
            className="w-10 h-10 rounded-full bg-amber-500/10 items-center justify-center border border-white/10 overflow-hidden"
          >
            {user?.photoURL ? (
              <Image
                source={{ uri: user.photoURL }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require('@/assets/images/avatar.png')}
                className="w-full h-full"
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Hijri Date Display */}
        <View className="mb-4 px-2 flex-row justify-between items-end">
          <View>
            <Text className="text-white text-[24px] font-bold tracking-tight mb-0.5">
              Salam, {user?.displayName?.split(' ')[0] || 'Guest'}
            </Text>
            <Text className="text-amber-500/70 text-[11px] font-bold uppercase tracking-widest opacity-80">
              "The Quran is a guide for the righteous"
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{moment().format('dddd, D MMM')}</Text>
            <Text className="text-amber-500 text-sm font-bold">{prayerTimes?.hijri || '... LOADING'}</Text>
          </View>
        </View>

        {/* Prayer Times Card (New) */}
        <View className="mb-8 rounded-[28px] overflow-hidden shadow-2xl shadow-black/40 border border-white/10 h-32 bg-[#1E293B]">
          <BlurView intensity={20} tint="dark" className="flex-1 p-5 flex-row items-center justify-between">
            <View>
              <Text className="text-amber-500 text-[9px] font-black tracking-[2px] uppercase mb-1">
                NEXT PRAYER
              </Text>
              <Text className="text-white text-xl font-black">{nextPrayer?.name || 'Loading...'}</Text>
              <Text className="text-white/60 text-xs font-bold">
                {nextPrayer ? moment(nextPrayer.time).format('h:mm A') : '--:--'}
              </Text>
            </View>

            <View className="items-center">
              <Text className="text-white/40 text-[9px] font-black uppercase mb-2">ATHAN REMINDER</Text>
              <Switch
                value={adhanEnabled}
                onValueChange={toggleAdhan}
                trackColor={{ false: "#334155", true: "#F59E0B" }}
                thumbColor={adhanEnabled ? "#fff" : "#94A3B8"}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>
          </BlurView>
        </View>

        {/* Dua of the Day Card */}
        {(() => {
          const dua = getDuaOfTheDay();
          return (
            <View className="mb-8 rounded-[32px] overflow-hidden border border-amber-500/20 shadow-2xl shadow-amber-900/10">
              <LinearGradient
                colors={['#1E293B', '#0F172A']}
                className="absolute inset-0"
              />
              <Image
                source={require('@/assets/images/islamic_card_bg.png')}
                className="absolute inset-0 w-full h-full opacity-10"
                resizeMode="cover"
              />
              <View className="p-6">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                    <Text className="text-amber-500 text-[9px] font-black uppercase tracking-[2px]">Dua of the Day</Text>
                  </View>
                  <FontAwesome name="star" size={12} color="#F59E0B" />
                </View>

                <Text className="text-white text-right text-xl font-bold mb-3 leading-9" style={{ fontFamily: 'amiri-bold' }}>
                  {dua.arabic}
                </Text>

                <Text className="text-gray-400 text-xs italic mb-4 leading-5">
                  {dua.translation}
                </Text>

                <View className="flex-row flex-wrap items-center justify-between gap-y-3">
                  <View className="flex-shrink mr-2 mb-1">
                    <Text className="text-amber-500/60 text-[10px] font-black uppercase tracking-widest leading-loose">
                      {dua.reference}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className="flex-row items-center gap-2 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/5"
                  >
                    <FontAwesome name="share-alt" size={10} color="#F59E0B" />
                    <Text className="text-gray-300 text-[10px] font-black uppercase tracking-wider">Share Blessing</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })()}



        {/* Compact Last Read Card */}
        <View className="mb-8 rounded-[28px] overflow-hidden shadow-2xl shadow-black/40 border border-white/10 h-48">
          <Image
            source={require('@/assets/images/islamic_card_bg.png')}
            className="absolute inset-0 w-full h-full opacity-60"
            resizeMode="cover"
          />
          <BlurView intensity={10} tint="dark" className="flex-1 p-5 justify-between">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-amber-500 text-[9px] font-black tracking-[2px] uppercase mb-1">
                  CONTINUE READING
                </Text>
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-white text-xl font-black">
                    {lastReadSurah?.name_simple || 'Al-Baqarah'}
                  </Text>
                  <FontAwesome name="check-circle" size={12} color="#10B981" />
                </View>
                <Text className="text-white/60 text-xs font-bold">
                  Ayah {lastRead?.verseNumber || 1}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => router.push(lastReadSurah ? `/surah/${lastReadSurah.id}` : `/surah/2`)}
                className="w-12 h-12 rounded-full bg-amber-500 items-center justify-center shadow-lg shadow-amber-600/20"
              >
                <FontAwesome name="play" size={16} color="#0F172A" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </View>

            <View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-white/40 text-[10px] font-black uppercase tracking-wider">Progress</Text>
                <Text className="text-amber-500 text-[10px] font-black">
                  {lastReadSurah ? Math.round(((lastRead?.verseNumber || 0) / lastReadSurah.verses_count) * 100) : 5}%
                </Text>
              </View>
              <View className="h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
                <View
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: lastReadSurah ? `${((lastRead?.verseNumber || 0) / lastReadSurah.verses_count) * 100}%` : '5%' }}
                />
              </View>
            </View>
          </BlurView>
        </View>

        {/* AI Chat Shortcut Card */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/(tabs)/ai-chat')}
          className="mb-8 h-24 rounded-[28px] overflow-hidden border border-amber-500/20 shadow-xl shadow-amber-500/10"
        >
          <LinearGradient
            colors={['#1E293B', '#0F172A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1 flex-row items-center px-5"
          />
          <View className="absolute inset-0 flex-row items-center px-5">
            <View className="w-12 h-12 rounded-xl bg-amber-500/10 items-center justify-center border border-amber-500/20">
              <FontAwesome name="magic" size={20} color="#F59E0B" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-white text-base font-bold">Ask NurAI</Text>
              <Text className="text-gray-400 text-[11px] font-medium">Explore Quranic wisdom with AI</Text>
            </View>
            <View className="w-7 h-7 rounded-full bg-white/5 items-center justify-center">
              <FontAwesome name="angle-right" size={14} color="white" />
            </View>
          </View>
        </TouchableOpacity>
        {/* Daily Wisdom Section */}
        <View className="flex-row items-center justify-between px-6 mb-4">
          <Text className="text-white text-xl font-bold tracking-tight">Daily Wisdom</Text>
        </View>

        {/* Horizontal Motivation Slideshow */}
        <View className="relative">
          <FlatList
            ref={carouselRef}
            horizontal
            data={motivationQuotes}
            keyExtractor={(item) => `quote-${item.id}`}
            renderItem={renderQuoteItem}
            contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={SNAP_INTERVAL}
            onMomentumScrollEnd={onMomentumScrollEnd}
            getItemLayout={(data, index) => ({
              length: SNAP_INTERVAL,
              offset: SNAP_INTERVAL * index,
              index
            })}
            onScrollToIndexFailed={(info) => {
              const wait = new Promise(resolve => setTimeout(resolve, 500));
              wait.then(() => {
                carouselRef.current?.scrollToIndex({ index: info.index, animated: true });
              });
            }}
            className="mb-10"
          />
        </View>
      </View>
    </View>
  );

  // We remove the full-screen loading state to allow skeleton/cached data to show
  // only show loader if it's the very first time and we have no data
  if (loading && surahs.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0F172A]">
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text className="text-white/50 mt-4 font-medium">Preparing Experience...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]">
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <View className="flex-1">
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
      />
    </SafeAreaView>
  );
}
