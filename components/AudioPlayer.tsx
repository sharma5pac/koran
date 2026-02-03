import { Surah } from '@/services/quranApi';
import { useAudioStore } from '@/store/useAudioStore';
import { useQuranStore } from '@/store/useQuranStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BlurView } from 'expo-blur';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Text, TouchableOpacity, View } from 'react-native';

export default function AudioPlayer() {
    const {
        isPlaying,
        currentVerseKey,
        position,
        duration,
        playAudio,
        pauseAudio,
        isLoading,
        isLooping,
        isReciteMode,
        playbackSpeed,
        toggleLooping,
        toggleReciteMode,
        setPlaybackSpeed,
        onNext,
        onPrevious
    } = useAudioStore();

    const { surahs } = useQuranStore();
    const [currentSurah, setCurrentSurah] = useState<Surah | undefined>(undefined);

    useEffect(() => {
        if (currentVerseKey) {
            const surahId = parseInt(currentVerseKey.split(':')[0]);
            const found = surahs.find(s => s.id === surahId);
            setCurrentSurah(found);
        }
    }, [currentVerseKey, surahs]);

    if (!currentVerseKey) {
        return null;
    }

    const cyclePlaybackSpeed = () => {
        const speeds = [0.8, 1.0, 1.2, 1.5, 2.0];
        const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
        setPlaybackSpeed(speeds[nextIndex]);
    };

    const progress = duration > 0 ? (position / duration) * 100 : 0;

    const { bottom } = require('react-native-safe-area-context').useSafeAreaInsets();

    return (
        <View style={{ bottom: Math.max(20, bottom + 20) }} className="absolute left-4 right-4 items-center">
            {/* Dynamic Island Pill */}
            <View className="overflow-hidden rounded-full shadow-2xl shadow-black h-16 w-full max-w-[400px] border border-white/10">
                <BlurView
                    intensity={Platform.OS === 'ios' ? 80 : 100}
                    tint="dark"
                    className="flex-row items-center px-4 h-full"
                >
                    {/* Tiny Art/Icon */}
                    <View className="w-10 h-10 rounded-full bg-amber-500/10 items-center justify-center border border-amber-500/20 mr-3">
                        <FontAwesome name="play-circle" size={20} color="#F59E0B" />
                    </View>

                    {/* Progress Fill (Subtle Background) */}
                    <View className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
                        <View
                            className="h-full bg-amber-500/40"
                            style={{ width: `${progress}%` }}
                        />
                    </View>

                    {/* Surah Info & Controls in one row */}
                    <View className="flex-1 flex-row items-center justify-between">
                        <View className="flex-1 pr-2">
                            <Text className="text-white text-[13px] font-black" numberOfLines={1}>
                                {currentSurah ? currentSurah.name_simple : 'Surah'}
                            </Text>
                            <Text className="text-amber-500/80 text-[10px] font-bold">
                                {currentVerseKey.split(':')[1]}
                            </Text>
                        </View>

                        {/* Controls */}
                        <View className="flex-row items-center gap-3">
                            <TouchableOpacity onPress={() => onPrevious?.()} className="p-1 opacity-60 active:opacity-100">
                                <FontAwesome name="step-backward" size={14} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={isPlaying ? pauseAudio : playAudio}
                                disabled={isLoading}
                                className="w-10 h-10 rounded-full bg-amber-500 items-center justify-center shadow-lg shadow-amber-600/20"
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#0F172A" size="small" />
                                ) : (
                                    <FontAwesome
                                        name={isPlaying ? 'pause' : 'play'}
                                        size={16}
                                        color="#0F172A"
                                        style={{ marginLeft: isPlaying ? 0 : 2 }}
                                    />
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => onNext?.()} className="p-1 opacity-60 active:opacity-100">
                                <FontAwesome name="step-forward" size={14} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Action Buttons (Loop, Speed, Recite) - Tiny Icons only to save space */}
                        <View className="flex-row items-center gap-4 ml-4 pl-4 border-l border-white/10">
                            <TouchableOpacity onPress={toggleLooping}>
                                <FontAwesome name="retweet" size={14} color={isLooping ? "#F59E0B" : "#64748B"} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={cyclePlaybackSpeed} className="items-center justify-center min-w-[32px]">
                                <Text className="text-white text-[10px] font-black">{playbackSpeed}x</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={toggleReciteMode}>
                                <FontAwesome name="microphone" size={14} color={isReciteMode ? "#F59E0B" : "#64748B"} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            </View>
        </View>
    );
}

