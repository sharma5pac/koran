import { useAuth } from '@/hooks/useAuth';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Image, Modal, Platform, Text, TouchableOpacity, View } from 'react-native';

interface LoginModalProps {
    visible: boolean;
    onClose?: () => void;
}

export function LoginModal({ visible, onClose }: LoginModalProps) {
    const { signInWithGoogle, error } = useAuth();

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 items-center justify-center p-6 bg-black/60">
                <BlurView intensity={Platform.OS === 'ios' ? 40 : 50} tint="dark" className="absolute inset-0" />

                <View className="w-full max-w-sm bg-[#0F172A] border border-white/10 p-8 rounded-[32px] shadow-2xl items-center">
                    {/* Decorative Header */}
                    <View className="mb-6 items-center">
                        <View className="w-16 h-16 rounded-2xl bg-amber-500/10 items-center justify-center mb-4 border border-amber-500/20 rotate-3">
                            <FontAwesome name="lock" size={32} color="#F59E0B" />
                        </View>
                        <Text className="text-white text-2xl font-black text-center tracking-tight">Login Required</Text>
                        <Text className="text-gray-400 text-center mt-2 font-medium leading-relaxed">
                            To chat with NurAI and explore your personalized spiritual journey, please sign in with your account.
                        </Text>
                    </View>

                    {/* Error Message Display */}
                    {error && (
                        <View className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg mb-6 w-full">
                            <Text className="text-red-400 text-center text-xs font-bold uppercase tracking-wider">Authentication Error</Text>
                            <Text className="text-red-300 text-center text-xs mt-1">{error.message}</Text>
                        </View>
                    )}

                    {/* Google Sign In Button */}
                    <TouchableOpacity
                        onPress={signInWithGoogle}
                        activeOpacity={0.8}
                        className="bg-white w-full py-4 rounded-2xl items-center flex-row justify-center gap-3 mb-4 shadow-lg shadow-black/20"
                    >
                        <Image
                            source={{ uri: 'https://cdn4.iconfinder.com/data/icons/logos-brands-7/512/google_logo-google_icongoogle-512.png' }}
                            style={{ width: 24, height: 24 }}
                        />
                        <Text className="text-black font-bold text-lg">Sign In with Google</Text>
                    </TouchableOpacity>

                    {/* Close/Guest Option */}
                    <TouchableOpacity onPress={onClose} className="py-2">
                        <Text className="text-gray-500 font-bold text-sm">Maybe Later</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
