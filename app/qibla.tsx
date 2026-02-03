import { calculateQibla } from '@/services/qiblaService';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Location from 'expo-location';
import { router, Stack } from 'expo-router';
import { Magnetometer } from 'expo-sensors';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Linking,
    Platform,
    SafeAreaView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

interface Mosque {
    id: number;
    name: string;
    distance: string;
    address: string;
    lat: number;
    lon: number;
    raw_dist: number;
}

// Google Maps API Key - In a real app, use process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function QiblaScreen() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [qiblaHeading, setQiblaHeading] = useState<number | null>(null);
    const [magnetometer, setMagnetometer] = useState(0);
    const [mosques, setMosques] = useState<Mosque[]>([]);
    const [loadingMosques, setLoadingMosques] = useState(false);

    // Animation values
    const animatedHeading = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Use a wrapping logic for the animation to prevent spinning a full 360 when going from 359 to 0
        Animated.timing(animatedHeading, {
            toValue: magnetometer,
            duration: 150,
            useNativeDriver: true,
        }).start();
    }, [magnetometer]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            try {
                let loc = await Location.getCurrentPositionAsync({});
                setLocation(loc);

                const qibla = calculateQibla(loc.coords.latitude, loc.coords.longitude);
                setQiblaHeading(qibla);

                fetchNearbyMosques(loc.coords.latitude, loc.coords.longitude);
            } catch (e) {
                console.error('Location error:', e);
                setErrorMsg('Could not fetch location. Please ensure GPS is on.');
            }
        })();

        // Magnetometer Setup
        let subscription: any = null;
        if (Platform.OS !== 'web') {
            Magnetometer.setUpdateInterval(100);
            subscription = Magnetometer.addListener((data) => {
                let heading = Math.atan2(data.y, data.x) * (180 / Math.PI);
                // Adjust for orientation
                if (heading < 0) heading += 360;
                setMagnetometer(heading);
            });
        } else {
            // Simulated magnetometer for web testing
            const interval = setInterval(() => {
                // Not really useful for real direction but shows the UI is working
            }, 1000);
            return () => clearInterval(interval);
        }

        return () => {
            if (subscription) subscription.remove();
        };
    }, []);

    const fetchNearbyMosques = async (lat: number, lon: number) => {
        setLoadingMosques(true);
        try {
            if (GOOGLE_MAPS_API_KEY) {
                // Google Places API Implementation
                const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=5000&type=mosque&key=${GOOGLE_MAPS_API_KEY}`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.status === 'OK') {
                    const processed = data.results.map((place: any) => {
                        const d = getDistance(lat, lon, place.geometry.location.lat, place.geometry.location.lng);
                        return {
                            id: place.place_id,
                            name: place.name,
                            distance: d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`,
                            address: place.vicinity || 'Nearby Address',
                            lat: place.geometry.location.lat,
                            lon: place.geometry.location.lng,
                            raw_dist: d
                        };
                    });
                    setMosques(processed.slice(0, 10));
                    return;
                }
            }

            // Fallback to Overpass API if no Google Key or if it fails
            const query = `[out:json];node(around:5000,${lat},${lon})["amenity"="place_of_worship"]["religion"="muslim"];out;`;
            const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
            const data = await response.json();

            const processed = data.elements.map((el: any) => {
                const d = getDistance(lat, lon, el.lat, el.lon);
                return {
                    id: el.id,
                    name: el.tags['name'] || el.tags['name:en'] || el.tags['name:ar'] || el.tags['official_name'] || 'Masjid',
                    distance: d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`,
                    address: el.tags['addr:full'] || el.tags['addr:street'] || 'Nearby Address',
                    lat: el.lat,
                    lon: el.lon,
                    raw_dist: d
                };
            }).sort((a: any, b: any) => a.raw_dist - b.raw_dist);

            setMosques(processed.slice(0, 10));
        } catch (e) {
            console.error('Mosque fetch failed', e);
        } finally {
            setLoadingMosques(false);
        }
    };

    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const COMPASS_SIZE = width * 0.75;

    // The Qibla arrow should rotate relative to the compass
    const qiblaArrowRotation = qiblaHeading || 0;

    return (
        <SafeAreaView className="flex-1 bg-[#0F172A]">
            <StatusBar barStyle="light-content" />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-6 pt-10 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white/5 items-center justify-center border border-white/10">
                    <FontAwesome name="angle-left" size={20} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-black tracking-tight">Qibla & Mosque</Text>
                <View className="w-10 h-10" />
            </View>

            <FlatList
                data={mosques}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={
                    <View className="items-center py-10">
                        {/* Compass Container */}
                        <View
                            style={{ width: COMPASS_SIZE, height: COMPASS_SIZE }}
                            className="items-center justify-center"
                        >
                            {/* Basic Compass Disk */}
                            <Animated.View
                                style={{
                                    width: COMPASS_SIZE,
                                    height: COMPASS_SIZE,
                                    overflow: 'hidden',
                                    transform: [{
                                        rotate: animatedHeading.interpolate({
                                            inputRange: [0, 360],
                                            outputRange: ['360deg', '0deg']
                                        })
                                    }]
                                }}
                                className="rounded-full border-2 border-white/20 items-center justify-center bg-[#1E293B]/40"
                            >
                                {/* Simple Tick Marks */}
                                {[...Array(36)].map((_, i) => (
                                    <View
                                        key={i}
                                        style={{
                                            position: 'absolute',
                                            height: i % 9 === 0 ? 12 : 6,
                                            width: 1.5,
                                            backgroundColor: i % 9 === 0 ? '#F59E0B' : 'rgba(255,255,255,0.3)',
                                            transform: [
                                                { rotate: `${i * 10}deg` },
                                                { translateY: -(COMPASS_SIZE / 2 - 10) }
                                            ]
                                        }}
                                    />
                                ))}

                                {/* Cardinal Points - Simple */}
                                <View style={{ position: 'absolute', top: 15, width: '100%', alignItems: 'center' }}>
                                    <Text className="text-amber-500 font-black text-lg">N</Text>
                                </View>
                                <View style={{ position: 'absolute', bottom: 15, width: '100%', alignItems: 'center' }}>
                                    <Text className="text-white font-bold text-sm">S</Text>
                                </View>
                                <View style={{ position: 'absolute', right: 15, height: '100%', justifyContent: 'center' }}>
                                    <Text className="text-white font-bold text-sm">E</Text>
                                </View>
                                <View style={{ position: 'absolute', left: 15, height: '100%', justifyContent: 'center' }}>
                                    <Text className="text-white font-bold text-sm">W</Text>
                                </View>

                                {/* Qibla Arrow - Minimalist */}
                                <View
                                    style={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transform: [{ rotate: `${qiblaArrowRotation}deg` }]
                                    }}
                                >
                                    <View className="items-center" style={{ transform: [{ translateY: -(COMPASS_SIZE / 2 - 35) }] }}>
                                        <FontAwesome name="long-arrow-up" size={32} color="#F59E0B" />
                                        <View className="mt-1 bg-amber-500 px-2 py-0.5 rounded-sm">
                                            <Text className="text-[#0F172A] text-[8px] font-black">KAABA</Text>
                                        </View>
                                    </View>
                                </View>
                            </Animated.View>

                            {/* Center Point */}
                            <View className="absolute w-2 h-2 rounded-full bg-amber-500/50" />
                        </View>

                        {/* Error Msg */}
                        {errorMsg && (
                            <View className="mt-6 px-10">
                                <Text className="text-red-400 text-center text-xs bg-red-400/10 p-2 rounded-xl border border-red-400/20">{errorMsg}</Text>
                            </View>
                        )}

                        <View className="mt-10 items-center px-10">
                            <Text className="text-gray-400 text-center text-xs leading-5">
                                Align the <Text className="text-amber-500 font-bold">Gold Arrow</Text> to find the direction of the Holy Kaaba in Makkah.
                            </Text>

                            <View className="flex-row gap-8 mt-6">
                                <View className="items-center">
                                    <Text className="text-white font-black text-xl">{Math.round(qiblaArrowRotation)}°</Text>
                                    <Text className="text-amber-500/50 text-[8px] font-black uppercase tracking-widest mt-1">Qibla angle</Text>
                                </View>
                                <View className="w-[1px] h-full bg-white/5" />
                                <View className="items-center">
                                    <Text className="text-white font-black text-xl">{Math.round(magnetometer)}°</Text>
                                    <Text className="text-amber-500/50 text-[8px] font-black uppercase tracking-widest mt-1">Your Heading</Text>
                                </View>
                            </View>
                        </View>

                        {/* Heading Warning for Web */}
                        {Platform.OS === 'web' && (
                            <View className="mt-4 px-10">
                                <Text className="text-amber-500/50 text-[10px] text-center italic">Direction sensing only works on mobile devices.</Text>
                            </View>
                        )}

                        {/* Nearby Mosques Title */}
                        <View className="w-full px-6 mt-16 mb-6">
                            <Text className="text-white text-lg font-black tracking-tight">Nearby Mosques</Text>
                            <Text className="text-amber-500 text-[9px] font-black uppercase tracking-[2px]">Places of Worship</Text>
                        </View>

                        {/* Skeleton Loaders */}
                        {loadingMosques && (
                            <View className="w-full px-6">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <View key={i} className="mb-4 bg-white/5 rounded-3xl p-5 border border-white/5 flex-row items-center justify-between opacity-50">
                                        <View className="flex-1 mr-4">
                                            <View className="h-4 w-32 bg-white/10 rounded-full mb-2" />
                                            <View className="h-3 w-48 bg-white/5 rounded-full" />
                                        </View>
                                        <View className="items-end">
                                            <View className="h-2 w-8 bg-amber-500/30 rounded-full mb-2" />
                                            <View className="w-8 h-8 rounded-full bg-white/5 items-center justify-center border border-white/5" />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className="mx-6 mb-4 bg-white/5 rounded-3xl p-5 border border-white/5 flex-row items-center justify-between active:bg-white/10"
                        onPress={() => {
                            const url = Platform.select({
                                ios: `maps:0,0?q=${item.lat},${item.lon}(${encodeURIComponent(item.name)})`,
                                android: `geo:0,0?q=${item.lat},${item.lon}(${encodeURIComponent(item.name)})`,
                                web: `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lon}`
                            });
                            if (url) Linking.openURL(url as string);
                        }}
                    >
                        <View className="flex-1 mr-4">
                            <Text className="text-white font-bold text-[15px] mb-1">{item.name}</Text>
                            <Text className="text-gray-400 text-[11px]" numberOfLines={1}>{item.address}</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-amber-500 font-black text-[10px] uppercase tracking-widest">{item.distance}</Text>
                            <View className="mt-2 w-8 h-8 rounded-full bg-amber-500/10 items-center justify-center border border-amber-500/20">
                                <FontAwesome name="map-marker" size={14} color="#F59E0B" />
                            </View>
                        </View>
                        {/* Verify Badge */}
                        <View className="absolute top-2 right-2 flex-row items-center">
                            <Text className="text-white/20 text-[8px] mr-1">Tap to verify</Text>
                            <FontAwesome name="external-link" size={8} color="rgba(255,255,255,0.2)" />
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    !loadingMosques ? (
                        <View className="py-10 items-center">
                            <Text className="text-gray-500 text-xs italic">No mosques found nearby.</Text>
                        </View>
                    ) : null
                }
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView >
    );
}
