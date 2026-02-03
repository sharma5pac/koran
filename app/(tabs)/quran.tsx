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

    useEffect(() => {
        const loadData = async () => {
            if (surahs.length === 0) {
                setLoading(true);
                try {
                    const data = await fetchSurahs();
                    setSurahs(data);
                } catch (error) {
                    console.error("Failed to fetch surahs", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadData();
    }, []);

    const filteredSurahs = surahs.filter((surah: Surah) =>
        surah.name_simple.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.name_arabic.includes(searchQuery)
    );

    const renderSurahItem = ({ item, index }: { item: Surah, index: number }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            className="flex-1 m-1.5 aspect-square rounded-2xl overflow-hidden bg-[#1E293B] shadow-lg shadow-black/50 border border-white/5"
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

            <View className="flex-1 p-3 justify-between">
                {/* Top: Number Badge */}
                <View className="flex-row justify-between items-start">
                    <View className="w-7 h-7 rounded-lg bg-amber-500/20 items-center justify-center border border-amber-500/30">
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
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#0F172A]">
            <View className="px-6 pt-6 pb-2">
                <Text className="text-2xl font-bold text-white mb-1">Holy Quran</Text>
                <Text className="text-gray-400 text-xs font-medium mb-5">Read and listen to the words of Allah</Text>

                {/* Search Bar */}
                <View className="flex-row items-center bg-[#1E293B] rounded-[20px] px-5 py-2.5 mb-3 border border-white/10">
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

            <FlatList
                data={filteredSurahs}
                renderItem={renderSurahItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={{ paddingHorizontal: 8 }}
                contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
                showsVerticalScrollIndicator={false}
                initialNumToRender={12}
                maxToRenderPerBatch={12}
            />
        </View>
    );
}
