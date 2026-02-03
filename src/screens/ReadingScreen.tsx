import AudioPlayer from '@/components/AudioPlayer';
import { fetchSurahs, fetchVerses, Verse } from '@/services/quranApi';
import { useAudioStore } from '@/store/useAudioStore';
import { useQuranStore } from '@/store/useQuranStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

import { captureRef } from '@/components/VerseSnapshot';
import { BlurView } from 'expo-blur';
import * as Sharing from 'expo-sharing';
import { Clipboard, Modal, Platform } from 'react-native';

export default function ReadingScreen() {
    const { id, verse: urlVerse } = useLocalSearchParams<{ id: string; verse?: string }>();
    const router = useRouter();
    const [verses, setVerses] = useState<Verse[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const flatListRef = useRef<FlatList>(null);
    const viewShotRef = useRef<any>(null);

    const { surahs, addBookmark, removeBookmark, bookmarks, hifzItems, toggleHifz, setLastRead, setSurahs, fontSize, arabicFont } = useQuranStore();
    const {
        loadAudio,
        playAudio,
        pauseAudio,
        isPlaying,
        currentVerseKey,
        setCallbacks
    } = useAudioStore();

    const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
    const [showActions, setShowActions] = useState(false);
    const [sharingProgress, setSharingProgress] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiExplanation, setAiExplanation] = useState<string | null>(null);

    const getFontSize = (size: string) => {
        switch (size) {
            case 'Small': return 22;
            case 'Medium': return 28;
            case 'Large': return 34;
            case 'Extra Large': return 42;
            default: return 28;
        }
    };

    const getLineHeight = (size: string) => {
        switch (size) {
            case 'Small': return 40;
            case 'Medium': return 50;
            case 'Large': return 60;
            case 'Extra Large': return 72;
            default: return 50;
        }
    };

    const handleAIExplanation = async () => {
        if (!selectedVerse) return;
        setAiLoading(true);
        setAiExplanation(null);
        try {
            const explanation = await import('@/services/aiService').then(m =>
                m.explainVerse(surah?.name_simple || '', selectedVerse.verse_number, selectedVerse.text_uthmani || '')
            );
            setAiExplanation(explanation);
        } catch (error) {
            console.error('AI Insight Error:', error);
            setAiExplanation("Sorry, I couldn't generate an explanation at this time. Please check your internet connection.");
        } finally {
            setAiLoading(false);
        }
    };

    const surah = surahs.find((s) => s.id === parseInt(id));

    // ... existing useEffects (no changes needed to the logic there) ...
    useEffect(() => {
        if (surahs.length === 0) {
            fetchSurahs().then(setSurahs).catch(console.error);
        }
    }, [surahs.length]);

    useEffect(() => {
        if (id) {
            loadVerses();
        }
    }, [id]);

    useEffect(() => {
        if (verses.length > 0) {
            setCallbacks({
                onFinish: () => {
                    const currentIndex = verses.findIndex(v => v.verse_key === currentVerseKey);
                    if (currentIndex !== -1 && currentIndex < verses.length - 1) {
                        playVerseAtIndex(currentIndex + 1);
                    }
                },
                onNext: () => {
                    const currentIndex = verses.findIndex(v => v.verse_key === currentVerseKey);
                    if (currentIndex !== -1 && currentIndex < verses.length - 1) {
                        playVerseAtIndex(currentIndex + 1);
                    }
                },
                onPrevious: () => {
                    const currentIndex = verses.findIndex(v => v.verse_key === currentVerseKey);
                    if (currentIndex > 0) {
                        playVerseAtIndex(currentIndex - 1);
                    }
                }
            });
        }
    }, [verses, currentVerseKey]);

    useEffect(() => {
        if (currentVerseKey && verses.length > 0) {
            const verseIndex = verses.findIndex(v => v.verse_key === currentVerseKey);
            if (verseIndex !== -1) {
                flatListRef.current?.scrollToIndex({
                    index: verseIndex,
                    animated: true,
                    viewPosition: 0.3,
                });
            }
        }
    }, [currentVerseKey, verses]);

    useEffect(() => {
        if (urlVerse && verses.length > 0) {
            const verseIndex = verses.findIndex(v => v.verse_number === parseInt(urlVerse));
            if (verseIndex !== -1) {
                setTimeout(() => {
                    flatListRef.current?.scrollToIndex({
                        index: verseIndex,
                        animated: true,
                        viewPosition: 0.2,
                    });
                }, 500);
            }
        }
    }, [urlVerse, verses]);

    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadVerses = async (isRefreshing = false) => {
        try {
            if (!isRefreshing && page === 1) setLoading(true);

            const data = await fetchVerses(parseInt(id), page);

            if (data.verses && data.verses.length > 0) {
                if (isRefreshing || page === 1) {
                    setVerses(data.verses);
                } else {
                    setVerses(prev => [...prev, ...data.verses]);
                }

                // Update pagination state
                const totalRecords = data.pagination?.total_records || 0;
                const loadedCount = (page - 1) * 50 + data.verses.length;
                setHasMore(loadedCount < totalRecords);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to load verses:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        if (!loadingMore && !loading && hasMore) {
            setLoadingMore(true);
            setPage(prev => prev + 1);
        }
    };

    // Trigger loadVerses when page changes
    useEffect(() => {
        if (page > 1) {
            loadVerses();
        }
    }, [page]);

    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = () => {
        setRefreshing(true);
        setPage(1);
        setHasMore(true);
        loadVerses(true);
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View className="py-8 items-center">
                <ActivityIndicator color="#F59E0B" />
            </View>
        );
    };

    const handlePlayAudio = async (verse: Verse) => {
        if (currentVerseKey === verse.verse_key && isPlaying) {
            await pauseAudio();
        } else {
            playVerseAtIndex(verses.indexOf(verse));
        }
    };

    const playVerseAtIndex = async (index: number) => {
        if (index < 0 || index >= verses.length) return;

        const verse = verses[index];
        const surahNum = verse.verse_key.split(':')[0].padStart(3, '0');
        const verseNum = verse.verse_key.split(':')[1].padStart(3, '0');
        const audioUrl = `https://everyayah.com/data/Alafasy_128kbps/${surahNum}${verseNum}.mp3`;

        await loadAudio(verse.verse_key, audioUrl);
        await playAudio();
    };

    const isBookmarked = (verseKey: string) => bookmarks.some(b => b.verse_key === verseKey || b.verseKey === verseKey);
    const isHifz = (verseKey: string) => hifzItems.some(h => h.verse_key === verseKey);

    const handleShareShot = async () => {
        if (!viewShotRef.current) return;
        setSharingProgress(true);
        try {
            const uri = await captureRef(viewShotRef.current, {
                format: 'png',
                quality: 1.0,
            });
            await Sharing.shareAsync(uri);
        } catch (error) {
            console.error('Sharing failed:', error);
        } finally {
            setSharingProgress(false);
            setShowActions(false);
        }
    };

    const copyToClipboard = (text: string) => {
        Clipboard.setString(text);
        setShowActions(false);
    };

    const handleVerseAction = (verse: Verse) => {
        setSelectedVerse(verse);
        setShowActions(true);
    };

    const VerseItem = React.memo(({
        item,
        index,
        isActive,
        isFav,
        inHifz,
        onPlay,
        onAction,
        fSize,
        aFont
    }: {
        item: Verse;
        index: number;
        isActive: boolean;
        isFav: boolean;
        inHifz: boolean;
        onPlay: (v: Verse) => void;
        onAction: (v: Verse) => void;
        fSize: string;
        aFont: string;
    }) => {
        const sizeVal = getFontSize(fSize);
        const lhVal = getLineHeight(fSize);

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => onPlay(item)}
                onLongPress={() => onAction(item)}
                className={`px-5 py-6 ${isActive ? 'bg-[#F59E0B]/10 border-l-4 border-l-amber-500' : ''}`}
            >
                <View className="flex-row justify-center items-center mb-4">
                    <View className="h-[1px] bg-amber-500/20 flex-1" />
                    <View className="px-3 flex-row items-center gap-1.5">
                        <Text className={`font-black text-[9px] tracking-[0.3em] uppercase ${isActive ? 'text-amber-400' : 'text-amber-500/50'}`}>
                            VERSE {item.verse_number}
                        </Text>
                        {inHifz && <FontAwesome name="shield" size={9} color="#F59E0B" />}
                        {isFav && <FontAwesome name="bookmark" size={9} color="#F59E0B" />}
                    </View>
                    <View className="h-[1px] bg-amber-500/20 flex-1" />
                </View>

                <Text
                    className={`text-center mb-6 ${isActive ? 'text-amber-400 shadow-lg' : 'text-white'}`}
                    style={{
                        fontFamily: aFont,
                        writingDirection: 'rtl',
                        fontSize: sizeVal,
                        lineHeight: lhVal
                    }}
                >
                    {item.text_uthmani || item.text_uthmani_simple || item.text_imlaei}
                </Text>

                <View className="items-center">
                    <Text className={`text-[15px] leading-7 font-medium text-center ${isActive ? 'text-white' : 'text-gray-400/80'}`}>
                        {item.translations?.[0]?.text
                            ? item.translations[0].text.replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '').replace(/<[^>]+>/g, '')
                            : 'Translation not available'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    });

    const renderVerse = ({ item, index }: { item: Verse; index: number }) => (
        <VerseItem
            item={item}
            index={index}
            isActive={currentVerseKey === item.verse_key}
            isFav={isBookmarked(item.verse_key)}
            inHifz={isHifz(item.verse_key)}
            onPlay={handlePlayAudio}
            onAction={handleVerseAction}
            fSize={fontSize}
            aFont={arabicFont}
        />
    );

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any[] }) => {
        if (viewableItems.length > 0) {
            const firstViewable = viewableItems[0].item as Verse;
            setLastRead(
                parseInt(id),
                surah?.name_simple || '',
                firstViewable.verse_number
            );
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    if (loading) {
        return (
            <View className="flex-1 bg-[#0F172A] items-center justify-center">
                <ActivityIndicator size="large" color="#F59E0B" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#0F172A]">
            <StatusBar barStyle="light-content" />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Share Shot Preparation View (Hidden) */}
            <View collapsable={false} style={{ position: 'absolute', left: -9999 }}>
                <View ref={viewShotRef} className="bg-[#0F172A] p-10 w-[400px] border border-white/10 rounded-[40px] items-center">
                    <Text className="text-amber-500 text-[10px] font-black tracking-[0.4em] uppercase mb-8">NurQuran</Text>
                    <Text className="text-white text-3xl text-center leading-[60px] mb-8" style={{ fontFamily: 'Amiri' }}>
                        {selectedVerse?.text_uthmani}
                    </Text>
                    <View className="h-[1px] w-20 bg-amber-500/30 mb-8" />
                    <Text className="text-gray-400 text-sm text-center leading-6 italic">
                        "{selectedVerse?.translations?.[0]?.text.replace(/<[^>]+>/g, '')}"
                    </Text>
                    <View className="mt-10 items-center">
                        <Text className="text-amber-500 text-[10px] font-black uppercase tracking-widest">
                            Surah {surah?.name_simple} • Verse {selectedVerse?.verse_number}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Dynamic Island Header */}
            <View className="px-5 pt-4 absolute top-8 left-0 right-0 z-50 items-center">
                <View className="overflow-hidden rounded-full shadow-2xl shadow-black h-12 w-full max-w-[360px] border border-white/10">
                    <BlurView
                        intensity={Platform.OS === 'ios' ? 80 : 100}
                        tint="dark"
                        className="flex-row items-center px-4 h-full"
                    >
                        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-1">
                            <FontAwesome name="angle-left" size={20} color="white" />
                        </TouchableOpacity>

                        <View className="flex-1 items-center">
                            <Text className="text-white text-sm font-bold" numberOfLines={1}>
                                Surah {surah?.name_simple}
                            </Text>
                            <Text className="text-amber-500 text-[8px] font-black tracking-[0.2em] uppercase">
                                HIFZ MODE
                            </Text>
                        </View>

                        <View className="p-2 -mr-1 w-8" />
                    </BlurView>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={verses}
                extraData={[currentVerseKey, bookmarks, hifzItems, fontSize, arabicFont]}
                renderItem={renderVerse}
                keyExtractor={(item) => item.id.toString()}
                onScrollToIndexFailed={(info) => {
                    const wait = new Promise(resolve => setTimeout(resolve, 500));
                    wait.then(() => {
                        flatListRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.2 });
                    });
                }}
                ListHeaderComponent={
                    <View className="items-center pt-28 pb-8">
                        <Text className="text-amber-500 text-2xl" style={{ fontFamily: 'Amiri' }}>
                            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                        </Text>
                        <Text className="text-gray-500 text-[10px] mt-3 px-10 text-center leading-4 font-bold uppercase tracking-widest opacity-60">
                            In the name of Allah, the Entirely Merciful, the Especially Merciful.
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center pt-20 px-10">
                        <FontAwesome name="exclamation-circle" size={40} color="#F59E0B" style={{ opacity: 0.5 }} />
                        <Text className="text-center mt-4 font-bold mb-2 text-white">No Content Found</Text>
                        <Text className="text-gray-500 text-center text-xs">Please check your internet connection and pull down to refresh.</Text>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 200 }}
                showsVerticalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={10}
                removeClippedSubviews={Platform.OS === 'android'}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
            />

            {/* Verse Action Modal */}
            <Modal
                visible={showActions}
                transparent
                animationType="fade"
                onRequestClose={() => setShowActions(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setShowActions(false)}
                    className="flex-1 bg-black/60 items-center justify-center p-6"
                >
                    <BlurView intensity={Platform.OS === 'ios' ? 40 : 100} tint="dark" className="w-full max-w-[360px] rounded-[40px] overflow-hidden border border-white/10 p-8 shadow-2xl">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-amber-500 text-[10px] font-black tracking-[0.3em] uppercase">
                                VERSE {selectedVerse?.verse_number}
                            </Text>
                            <TouchableOpacity onPress={() => { setShowActions(false); setAiExplanation(null); }}>
                                <FontAwesome name="times-circle" size={20} color="white" className="opacity-50" />
                            </TouchableOpacity>
                        </View>

                        {(aiLoading || aiExplanation) && (
                            <View className="mb-6 bg-white/5 rounded-3xl p-5 border border-white/5">
                                {aiLoading ? (
                                    <View className="py-4 items-center">
                                        <ActivityIndicator color="#F59E0B" />
                                        <Text className="text-gray-400 text-xs mt-3 font-bold uppercase tracking-widest">Consulting Gemini AI...</Text>
                                    </View>
                                ) : (
                                    <View>
                                        <Text className="text-amber-500 text-[10px] font-black mb-3 uppercase tracking-widest">AI INSIGHT</Text>
                                        <Text className="text-gray-200 text-sm leading-6">{aiExplanation}</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        <View className="gap-3">
                            {[
                                {
                                    label: 'AI Verse Insight',
                                    icon: 'magic',
                                    onPress: handleAIExplanation,
                                    tint: '#F59E0B'
                                },
                                {
                                    label: isHifz(selectedVerse?.verse_key || '') ? 'Remove from Hifz' : 'Add to Hifz',
                                    icon: 'shield',
                                    onPress: () => {
                                        if (selectedVerse) toggleHifz({
                                            surahId: parseInt(id),
                                            verseNumber: selectedVerse.verse_number,
                                            verseKey: selectedVerse.verse_key
                                        });
                                        setShowActions(false);
                                    }
                                },
                                {
                                    label: isBookmarked(selectedVerse?.verse_key || '') ? 'Remove Bookmark' : 'Add Bookmark',
                                    icon: 'bookmark',
                                    onPress: () => {
                                        if (selectedVerse) {
                                            if (isBookmarked(selectedVerse.verse_key)) {
                                                const b = bookmarks.find(bm => bm.verseKey === selectedVerse.verse_key);
                                                if (b) removeBookmark(b.id);
                                            } else {
                                                addBookmark({
                                                    id: `${id}-${selectedVerse.verse_number}-${Date.now()}`,
                                                    surahId: parseInt(id),
                                                    verseNumber: selectedVerse.verse_number,
                                                    verseKey: selectedVerse.verse_key,
                                                    timestamp: Date.now(),
                                                });
                                            }
                                        }
                                        setShowActions(false);
                                    }
                                },
                                {
                                    label: 'Share Verse Card',
                                    icon: 'camera',
                                    onPress: handleShareShot,
                                    loading: sharingProgress
                                },
                                {
                                    label: 'Copy Arabic',
                                    icon: 'copy',
                                    onPress: () => copyToClipboard(selectedVerse?.text_uthmani || '')
                                },
                            ].map((action, i) => (
                                <TouchableOpacity
                                    key={i}
                                    onPress={action.onPress}
                                    className="flex-row items-center bg-white/5 p-4 rounded-[24px] border border-white/5"
                                >
                                    <View className="w-9 h-9 rounded-full bg-amber-500/10 items-center justify-center mr-4">
                                        {action.loading ? <ActivityIndicator size="small" color="#F59E0B" /> : <FontAwesome name={action.icon as any} size={16} color={action.tint || "#F59E0B"} />}
                                    </View>
                                    <Text className="text-white font-bold text-sm">{action.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </BlurView>
                </TouchableOpacity>
            </Modal>

            <AudioPlayer />
        </SafeAreaView >
    );
}

