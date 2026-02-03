import { useQuranStore } from '@/store/useQuranStore';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface SearchResult {
    type: 'surah' | 'verse';
    surahId: number;
    surahName: string;
    verseNumber?: number;
    displayText: string;
}

interface SearchModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function SearchModal({ visible, onClose }: SearchModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const { surahs } = useQuranStore();
    const router = useRouter();

    const performSearch = (query: string): SearchResult[] => {
        if (!query.trim()) return [];

        const results: SearchResult[] = [];
        const lowerQuery = query.toLowerCase().trim();

        // Check for verse notation (e.g., "1.5" or "1:5")
        const verseMatch = lowerQuery.match(/^(\d+)[.:](\d+)$/);
        if (verseMatch) {
            const surahId = parseInt(verseMatch[1]);
            const verseNumber = parseInt(verseMatch[2]);
            const surah = surahs.find(s => s.id === surahId);

            if (surah && verseNumber <= surah.verses_count) {
                results.push({
                    type: 'verse',
                    surahId,
                    surahName: surah.name_simple,
                    verseNumber,
                    displayText: `${surah.name_simple} - Verse ${verseNumber}`,
                });
            }
            return results;
        }

        // Search by surah number
        const numberMatch = lowerQuery.match(/^\d+$/);
        if (numberMatch) {
            const surahId = parseInt(lowerQuery);
            const surah = surahs.find(s => s.id === surahId);
            if (surah) {
                results.push({
                    type: 'surah',
                    surahId: surah.id,
                    surahName: surah.name_simple,
                    displayText: `${surah.id}. ${surah.name_simple} (${surah.translated_name.name})`,
                });
            }
            return results;
        }

        // Search by surah name (English or Arabic)
        surahs.forEach(surah => {
            const nameSimple = surah.name_simple.toLowerCase();
            const nameArabic = surah.name_arabic.toLowerCase();
            const translatedName = surah.translated_name.name.toLowerCase();

            if (
                nameSimple.includes(lowerQuery) ||
                nameArabic.includes(lowerQuery) ||
                translatedName.includes(lowerQuery)
            ) {
                results.push({
                    type: 'surah',
                    surahId: surah.id,
                    surahName: surah.name_simple,
                    displayText: `${surah.id}. ${surah.name_simple} (${surah.translated_name.name})`,
                });
            }
        });

        return results.slice(0, 10); // Limit to 10 results
    };

    const searchResults = performSearch(searchQuery);

    const handleResultPress = (result: SearchResult) => {
        if (result.type === 'verse') {
            // Navigate to specific verse
            router.push(`/surah/${result.surahId}?verse=${result.verseNumber}`);
        } else {
            // Navigate to surah
            router.push(`/surah/${result.surahId}`);
        }
        onClose();
        setSearchQuery('');
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/80">
                <View className="flex-1 mt-20 bg-[#0F172A] rounded-t-3xl">
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
                        <Text className="text-white text-xl font-bold">Search Quran</Text>
                        <TouchableOpacity onPress={onClose} className="p-2">
                            <FontAwesome name="times" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Search Input */}
                    <View className="px-6 py-6">
                        <View className="flex-row items-center bg-[#1E293B] rounded-[20px] px-5 py-4 border border-white/10">
                            <FontAwesome name="search" size={18} color="#F59E0B" />
                            <TextInput
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Search Name, Number, or 1.5..."
                                placeholderTextColor="#6B7280"
                                className="flex-1 ml-4 text-white text-base font-medium"
                                autoFocus
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <FontAwesome name="times-circle" size={18} color="#6B7280" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Search Tips */}
                        <View className="mt-3">
                            <Text className="text-gray-500 text-xs">
                                💡 Try: "Al-Fatihah", "2", or "1.5" for Surah 1, Verse 5
                            </Text>
                        </View>
                    </View>

                    {/* Results */}
                    {searchQuery.trim() && (
                        <FlatList
                            data={searchResults}
                            keyExtractor={(item, index) => `${item.type}-${item.surahId}-${index}`}
                            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
                            ListEmptyComponent={
                                <View className="items-center py-10">
                                    <FontAwesome name="search" size={48} color="#374151" />
                                    <Text className="text-gray-500 text-base mt-4">
                                        No results found
                                    </Text>
                                    <Text className="text-gray-600 text-sm mt-2 text-center">
                                        Try searching by surah name, number, or verse notation
                                    </Text>
                                </View>
                            }
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => handleResultPress(item)}
                                    className="bg-[#1E293B] rounded-[24px] p-5 mb-4 border border-white/5 active:bg-[#334155]"
                                >
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-1 flex-row items-center gap-4">
                                            <View className="w-10 h-10 items-center justify-center bg-[#0F172A] rounded-full border border-white/10">
                                                <FontAwesome
                                                    name={item.type === 'verse' ? 'bookmark' : 'book'}
                                                    size={18}
                                                    color="#F59E0B"
                                                />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-white text-base font-bold">
                                                    {item.displayText}
                                                </Text>
                                                {item.type === 'verse' && (
                                                    <Text className="text-amber-500/80 text-xs font-medium uppercase tracking-wider mt-1">
                                                        Tap to jump to verse
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                        <FontAwesome name="chevron-right" size={14} color="#374151" />
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}
