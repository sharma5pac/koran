import { useAuth } from '@/hooks/useAuth';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StatusBar, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function ProfileScreen() {
    const { user, signInWithGoogle, signOut, error } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (error) {
            alert(error.message);
        }
    }, [error]);

    const handleClose = () => {
        router.back();
    };

    return (
        <View className="flex-1 justify-center items-center">
            <StatusBar barStyle="light-content" />

            {/* Backdrop */}
            <TouchableWithoutFeedback onPress={handleClose}>
                <View className="absolute inset-0 bg-black/80" />
            </TouchableWithoutFeedback>

            {/* Modal Card */}
            <View className="w-[85%] overflow-hidden rounded-[32px] border border-amber-500/30 bg-[#0F172A]">
                <LinearGradient
                    colors={['rgba(245, 158, 11, 0.1)', 'rgba(15, 23, 42, 0.9)']}
                    className="absolute inset-0"
                />

                {/* Header Pattern */}
                <View className="absolute top-0 w-full h-32 opacity-20">
                    <Image
                        source={require('../assets/images/logo.png')}
                        style={{ width: '100%', height: '100%', resizeMode: 'cover', opacity: 0.5 }}
                        blurRadius={10}
                    />
                </View>

                <View className="p-6 items-center z-10">
                    {/* Header with Close Button */}
                    <View className="w-full flex-row justify-end mb-4">
                        <TouchableOpacity
                            onPress={handleClose}
                            className="w-8 h-8 rounded-full bg-white/10 items-center justify-center"
                        >
                            <FontAwesome name="close" size={14} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Avatar */}
                    <View className="relative mb-6">
                        <View className="w-24 h-24 rounded-full bg-[#0F172A] items-center justify-center overflow-hidden border-2 border-amber-500 shadow-lg shadow-amber-500/50">
                            {user?.photoURL ? (
                                <Image
                                    source={{ uri: user.photoURL }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <FontAwesome name="user" size={40} color="#9CA3AF" />
                            )}
                        </View>
                        {user && (
                            <View className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-[#0F172A]" />
                        )}
                    </View>

                    {/* Check if user exists but has no display name (common in some auth providers) */}
                    <Text className="text-white text-2xl font-bold mb-1 text-center">
                        {user?.isAnonymous ? 'Guest User' : (user?.displayName || 'Traveler')}
                    </Text>
                    <Text className="text-gray-400 mb-8 text-sm text-center font-medium">
                        {user?.email || 'Sign in to sync your spiritual journey'}
                    </Text>

                    {/* Error Message Display */}
                    {error && (
                        <View className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg mb-6 w-full">
                            <Text className="text-red-400 text-center text-xs">{error.message}</Text>
                        </View>
                    )}

                    {/* Actions */}
                    <View className="w-full gap-3">
                        {!user || user.isAnonymous ? (
                            <TouchableOpacity
                                onPress={signInWithGoogle}
                                className="w-full py-4 rounded-2xl items-center flex-row justify-center gap-3 bg-white"
                                activeOpacity={0.9}
                            >
                                <Image
                                    source={{ uri: 'https://cdn4.iconfinder.com/data/icons/logos-brands-7/512/google_logo-google_icongoogle-512.png' }}
                                    style={{ width: 22, height: 22 }}
                                />
                                <Text className="text-black font-bold text-base">Sign In with Google</Text>
                            </TouchableOpacity>
                        ) : (
                            <>
                                <TouchableOpacity
                                    className="w-full py-4 rounded-2xl flex-row items-center px-4 bg-white/5 border border-white/10 mb-1"
                                >
                                    <View className="w-8 h-8 rounded-full bg-amber-500/20 items-center justify-center mr-3">
                                        <FontAwesome name="cog" size={16} color="#F59E0B" />
                                    </View>
                                    <Text className="text-white font-medium flex-1">Settings</Text>
                                    <FontAwesome name="angle-right" size={16} color="#6B7280" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={signOut}
                                    className="w-full py-4 rounded-2xl items-center flex-row justify-center gap-2 bg-red-500/10 border border-red-500/20"
                                >
                                    <Text className="text-red-400 font-bold text-base">Sign Out</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
}
