import { useQuranStore } from '@/store/useQuranStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Alert, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';

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

export default function BookmarksScreen() {
    const { bookmarks, removeBookmark } = useQuranStore();

    const handleDelete = (id: string) => {
        Alert.alert(
            'Delete Bookmark',
            'Are you sure you want to delete this bookmark?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => removeBookmark(id) },
            ]
        );
    };

    const renderBookmark = ({ item, index }: { item: any, index: number }) => (
        <TouchableOpacity
            className="mb-4 mx-6 rounded-[32px] overflow-hidden bg-[#1E293B] border border-white/5 active:bg-[#334155]"
            activeOpacity={0.9}
            onPress={() => router.push({
                pathname: `/surah/[id]`,
                params: { id: item.surahId.toString(), verse: item.verseNumber.toString() }
            })}
        >
            {/* Background Image */}
            <Image
                source={surahImages[index % surahImages.length]}
                className="absolute inset-0 w-full h-full opacity-20"
                resizeMode="cover"
            />

            <LinearGradient
                colors={['rgba(30, 41, 59, 0.4)', 'rgba(30, 41, 59, 0.95)']}
                className="absolute inset-0"
            />

            <View className="p-6">
                <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                        <View className="flex-row items-center gap-3 mb-2">
                            <View className="w-8 h-8 rounded-xl bg-amber-500/20 items-center justify-center border border-amber-500/30">
                                <Text className="text-amber-500 font-bold text-xs">{item.surahId}</Text>
                            </View>
                            <Text className="text-lg font-bold text-white">
                                Ayah {item.verseNumber}
                            </Text>
                        </View>
                        <Text className="text-xs text-amber-500/60 font-black uppercase tracking-widest mb-1">
                            {item.verseKey}
                        </Text>
                        {item.note && (
                            <View className="mt-3 p-3 rounded-2xl bg-[#0F172A]/80 border border-white/5 shadow-sm">
                                <Text className="text-sm text-gray-200 indent-2 italic">
                                    "{item.note}"
                                </Text>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity
                        onPress={() => handleDelete(item.id)}
                        className="w-10 h-10 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20"
                    >
                        <FontAwesome name="trash" size={16} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (bookmarks.length === 0) {
        return (
            <View className="flex-1 items-center justify-center bg-[#0F172A] px-10">
                <Image
                    source={require('../../assets/images/islamic_card_bg.png')}
                    className="absolute inset-0 w-full h-full opacity-10"
                    resizeMode="cover"
                />
                <View className="w-24 h-24 rounded-[40px] bg-[#1E293B] items-center justify-center border border-white/10 mb-8 shadow-2xl">
                    <FontAwesome name="bookmark-o" size={40} color="#F59E0B" />
                </View>
                <Text className="text-2xl font-bold text-white mb-3 text-center">No bookmarks yet</Text>
                <Text className="text-base text-gray-400 text-center leading-6">
                    Keep your favorite verses close. Bookmark them while reading to find them here.
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#0F172A]">
            <View className="px-6 pt-8 pb-4">
                <Text className="text-3xl font-bold text-white mb-2">My Bookmarks</Text>
                <Text className="text-amber-500 text-sm font-bold uppercase tracking-widest opacity-80">Saved Verses</Text>
            </View>
            <FlatList
                data={bookmarks}
                renderItem={renderBookmark}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingVertical: 24, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
