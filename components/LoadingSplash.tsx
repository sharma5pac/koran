import React, { useEffect } from 'react';
import { ActivityIndicator, Animated, Image, StyleSheet, Text, View } from 'react-native';

export default function LoadingSplash() {
    const fadeAnim = new Animated.Value(0);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <Image
                    source={require('../assets/images/nur_quran_logo_square.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.title}>NurQuran</Text>
                <ActivityIndicator size="large" color="#F59E0B" style={styles.loader} />
                <Text style={styles.subtitle}>Preparing your spiritual journey...</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A', // Match themeBackgroundColor
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 30,
        letterSpacing: 2,
    },
    loader: {
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 14,
        color: '#94A3B8',
        letterSpacing: 1,
    },
});
