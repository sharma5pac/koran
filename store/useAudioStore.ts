import { Audio, AVPlaybackStatus } from 'expo-av';
import { create } from 'zustand';

interface AudioState {
    sound: Audio.Sound | null;
    isPlaying: boolean;
    currentVerseKey: string | null;
    currentAudioUrl: string | null;
    position: number;
    duration: number;
    isLoading: boolean;
    isLooping: boolean;
    isReciteMode: boolean;
    playbackSpeed: number;
    onFinish: (() => void) | null;
    onNext: (() => void) | null;
    onPrevious: (() => void) | null;

    // Actions
    loadAudio: (verseKey: string, audioUrl: string, onFinish?: () => void) => Promise<void>;
    playAudio: () => Promise<void>;
    pauseAudio: () => Promise<void>;
    stopAudio: () => Promise<void>;
    seekTo: (position: number) => Promise<void>;
    toggleLooping: () => void;
    toggleReciteMode: () => void;
    setPlaybackSpeed: (speed: number) => Promise<void>;
    setCallbacks: (callbacks: { onFinish?: () => void; onNext?: () => void; onPrevious?: () => void }) => void;
    setPlaybackStatus: (status: AVPlaybackStatus) => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
    sound: null,
    isPlaying: false,
    currentVerseKey: null,
    currentAudioUrl: null,
    position: 0,
    duration: 0,
    isLoading: false,
    isLooping: false,
    isReciteMode: false,
    playbackSpeed: 1.0,
    onFinish: null,
    onNext: null,
    onPrevious: null,

    loadAudio: async (verseKey: string, audioUrl: string, onFinish?: () => void) => {
        try {
            set({ isLoading: true, onFinish: onFinish || null });

            const { sound: currentSound, playbackSpeed } = get();
            if (currentSound) {
                try {
                    await currentSound.unloadAsync();
                } catch (e) {
                    console.log('Silent error unloading previous sound:', e);
                }
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                staysActiveInBackground: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: audioUrl },
                { shouldPlay: false, rate: playbackSpeed, shouldCorrectPitch: true },
                (status) => get().setPlaybackStatus(status)
            );

            set({
                sound: newSound,
                currentVerseKey: verseKey,
                currentAudioUrl: audioUrl,
                isLoading: false,
            });
        } catch (error) {
            console.error('Error loading audio:', error);
            set({ isLoading: false });
        }
    },

    playAudio: async () => {
        const { sound } = get();
        if (sound) {
            await sound.playAsync();
            set({ isPlaying: true });
        }
    },

    pauseAudio: async () => {
        const { sound } = get();
        if (sound) {
            await sound.pauseAsync();
            set({ isPlaying: false });
        }
    },

    stopAudio: async () => {
        const { sound } = get();
        if (sound) {
            try {
                await sound.stopAsync();
                await sound.unloadAsync();
            } catch (error) {
                console.log('Audio stop/unload silent error:', error);
            }
            set({
                sound: null,
                isPlaying: false,
                currentVerseKey: null,
                currentAudioUrl: null,
                position: 0,
                duration: 0,
            });
        }
    },

    seekTo: async (position: number) => {
        const { sound } = get();
        if (sound) {
            await sound.setPositionAsync(position);
        }
    },

    toggleLooping: () => {
        set((state) => ({ isLooping: !state.isLooping }));
    },

    toggleReciteMode: () => {
        set((state) => ({ isReciteMode: !state.isReciteMode }));
    },

    setPlaybackSpeed: async (speed: number) => {
        const { sound } = get();
        if (sound) {
            await sound.setRateAsync(speed, true);
        }
        set({ playbackSpeed: speed });
    },

    setCallbacks: (callbacks: { onFinish?: () => void; onNext?: () => void; onPrevious?: () => void }) => {
        set({
            onFinish: callbacks.onFinish || get().onFinish,
            onNext: callbacks.onNext || get().onNext,
            onPrevious: callbacks.onPrevious || get().onPrevious,
        });
    },

    setPlaybackStatus: (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            set({
                position: status.positionMillis,
                duration: status.durationMillis || 0,
                isPlaying: status.isPlaying,
            });

            if (status.didJustFinish) {
                const { isLooping, onFinish, sound } = get();

                if (isLooping && sound) {
                    try {
                        sound.replayAsync().catch(() => { });
                    } catch (e) { }
                } else {
                    set({ isPlaying: false, position: 0 });
                    if (onFinish) onFinish();
                }
            }
        }
    },
}));
