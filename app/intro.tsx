import { useQuranStore } from '@/store/useQuranStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StatusBar, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function IntroScreen() {
    const router = useRouter();
    const { setHasSeenIntro } = useQuranStore();

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 20,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 10,
                friction: 5,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const handleGetStarted = () => {
        setHasSeenIntro(true);
        router.replace('/(tabs)');
    };

    return (
        <View className="flex-1 bg-[#0F172A]">
            <StatusBar barStyle="light-content" />

            {/* Background Gradient & Pattern */}
            <LinearGradient
                colors={['#0F172A', '#1E293B', '#0F172A']}
                className="absolute inset-0"
            />

            {/* Subtle Glow Orbs - using low opacity instead of unsupported filter */}
            <View
                className="absolute top-[-50] left-[-50] w-[300] h-[300] rounded-full bg-amber-500/5"
            />
            <View
                className="absolute bottom-[-100] right-[-100] w-[400] h-[400] rounded-full bg-blue-500/5"
            />

            <View className="flex-1 px-8 py-10 justify-between items-center">
                {/* Logo Section */}
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    }}
                    className="items-center mt-10"
                >
                    <View className="w-40 h-40 rounded-[40px] bg-amber-500/10 items-center justify-center border border-amber-500/20 shadow-2xl">
                        <Image
                            source={require('../assets/images/logo.png')}
                            style={{ width: 120, height: 120, resizeMode: 'contain' }}
                        />
                    </View>
                    <Text className="text-white text-4xl font-black mt-8 tracking-tighter">
                        Nur<Text className="text-amber-500">Quran</Text>
                    </Text>
                    <View className="flex-row items-center gap-2 mt-2">
                        <View className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <Text className="text-gray-400 text-xs font-bold uppercase tracking-[4px]">The Divine Light</Text>
                        <View className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    </View>
                </Animated.View>

                {/* Content Section */}
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }}
                    className="w-full"
                >
                    <BlurView intensity={20} tint="dark" className="p-8 rounded-[40px] border border-white/10 overflow-hidden bg-white/5">
                        <Text className="text-white text-2xl font-bold text-center mb-4">
                            Embrace Your Spiritual Journey
                        </Text>
                        <Text className="text-gray-400 text-center leading-7 text-base font-medium">
                            Experience the Holy Quran with stunning design, personalized AI insights, and seamless spiritual tracking.
                        </Text>

                        <View className="flex-row justify-center gap-6 mt-8">
                            <View className="items-center">
                                <View className="w-12 h-12 rounded-2xl bg-white/5 items-center justify-center border border-white/10 mb-2">
                                    <FontAwesome name="magic" size={18} color="#F59E0B" />
                                </View>
                                <Text className="text-gray-500 text-[10px] font-bold uppercase">AI Insights</Text>
                            </View>
                            <View className="items-center">
                                <View className="w-12 h-12 rounded-2xl bg-white/5 items-center justify-center border border-white/10 mb-2">
                                    <FontAwesome name="headphones" size={18} color="#F59E0B" />
                                </View>
                                <Text className="text-gray-500 text-[10px] font-bold uppercase">Audio</Text>
                            </View>
                            <View className="items-center">
                                <View className="w-12 h-12 rounded-2xl bg-white/5 items-center justify-center border border-white/10 mb-2">
                                    <FontAwesome name="check-circle" size={18} color="#F59E0B" />
                                </View>
                                <Text className="text-gray-500 text-[10px] font-bold uppercase">Progress</Text>
                            </View>
                        </View>
                    </BlurView>

                    <TouchableOpacity
                        onPress={handleGetStarted}
                        activeOpacity={0.9}
                        className="mt-8 overflow-hidden rounded-3xl"
                    >
                        <LinearGradient
                            colors={['#F59E0B', '#D97706']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="py-5 items-center"
                        >
                            <Text className="text-[#0F172A] text-lg font-black uppercase tracking-widest">
                                Get Started
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <Text className="text-center text-gray-600 text-[10px] mt-6 font-bold uppercase tracking-[2px]">
                        Guided by Nur AI
                    </Text>
                </Animated.View>
            </View>
        </View>
    );
}
