import { fetchSurahs, Surah } from '@/services/quranApi';
import { useQuranStore } from '@/store/useQuranStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Import the same images to ensure "repeat" consistency
const surahImages = [
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

export default function QuranScreen() {
    const { surahs, setSurahs } = useQuranStore();
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchSurahs();
            if (data && data.length > 0) {
                setSurahs(data);
            }
        } catch (error) {
            console.error("Failed to fetch surahs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (surahs.length === 0) {
            loadData();
        }
    }, []);

    const filteredSurahs = surahs.filter((surah: Surah) =>
        surah.name_simple.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.name_arabic.includes(searchQuery)
    );

    const renderSurahItem = ({ item, index }: { item: Surah, index: number }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            style={{ minHeight: 180 }}
            className="flex-1 m-2 rounded-2xl overflow-hidden bg-[#1E293B] shadow-lg shadow-black/50 border border-white/5"
            onPress={() => router.push(`/surah/${item.id}`)}
        >
            {/* Background Image */}
            <Image
                source={surahImages[index % surahImages.length]}
                className="absolute inset-0 w-full h-full opacity-40"
                resizeMode="cover"
            />

            {/* Dark Gradient */}
            <LinearGradient
                colors={['rgba(15, 23, 42, 0.2)', 'rgba(15, 23, 42, 0.85)']}
                className="absolute inset-0"
            />

            <View className="flex-1 p-4 justify-between">
                {/* Top: Number Badge */}
                <View className="flex-row justify-between items-start">
                    <View className="w-8 h-8 rounded-lg bg-amber-500/20 items-center justify-center border border-amber-500/30">
                        <Text className="text-amber-500 font-bold text-xs">{item.id}</Text>
                    </View>
                    <View className="w-6 h-6 rounded-full bg-white/10 items-center justify-center">
                        <FontAwesome name="angle-right" size={12} color="white" />
                    </View>
                </View>

                {/* Bottom: Text Content */}
                <View className="items-start">
                    <Text className="text-white text-2xl mb-1" style={{ fontFamily: 'Amiri' }}>
                        {item.name_arabic}
                    </Text>
                    <Text className="text-white text-sm font-bold" numberOfLines={1}>
                        {item.name_simple}
                    </Text>
                    <Text className="text-amber-500/80 text-[10px] font-semibold uppercase tracking-wide" numberOfLines={1}>
                        {item.translated_name.name}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading && surahs.length === 0) {
        return (
            <View className="flex-1 items-center justify-center bg-[#0F172A]">
                <ActivityIndicator size="large" color="#F59E0B" />
                <Text className="text-white/50 mt-4 font-medium">Loading Holy Quran...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#0F172A]">
            <View className="px-6 pt-6 pb-2">
                <Text className="text-2xl font-bold text-white mb-1">Holy Quran</Text>
                <Text className="text-gray-400 text-xs font-medium mb-5">Read and listen to the words of Allah</Text>

                {/* Search Bar */}
                <View className="flex-row items-center bg-[#1E293B] rounded-[22px] px-5 py-3 mb-3 border border-white/10 shadow-lg shadow-black/20">
                    <FontAwesome name="search" size={14} color="#F59E0B" />
                    <TextInput
                        className="flex-1 ml-3 text-white text-sm font-medium"
                        placeholder="Search Surah..."
                        placeholderTextColor="#64748B"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {filteredSurahs.length === 0 && !loading ? (
                <View className="flex-1 items-center justify-center p-10">
                    <View className="w-20 h-20 rounded-full bg-[#1E293B] items-center justify-center mb-6">
                        <FontAwesome name="book" size={32} color="#64748B" />
                    </View>
                    <Text className="text-white text-lg font-bold mb-2">No Surahs Found</Text>
                    <Text className="text-gray-400 text-center mb-8">We couldn't load the Quran data. Please check your internet connection and try again.</Text>
                    <TouchableOpacity
                        onPress={loadData}
                        activeOpacity={0.8}
                        className="bg-amber-500 px-8 py-3.5 rounded-2xl shadow-lg shadow-amber-500/20"
                    >
                        <Text className="text-[#0F172A] font-black uppercase tracking-widest text-xs">Reload Quran</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={filteredSurahs}
                    renderItem={renderSurahItem}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={{ paddingHorizontal: 12 }}
                    contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                />
            )}
        </View>
    );
}
