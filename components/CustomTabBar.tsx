import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BlurView } from 'expo-blur';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CustomTabBar({ state, descriptors, navigation }: any) {
    const { width } = useWindowDimensions();
    const TAB_BAR_MARGIN = 32; // 16px on each side
    const TAB_BAR_WIDTH = width - TAB_BAR_MARGIN;
    const TAB_COUNT = state.routes.length;
    const TAB_WIDTH = TAB_BAR_WIDTH / TAB_COUNT;

    const scrollX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const insets = useSafeAreaInsets();
    const TAB_BAR_BOTTOM = Platform.OS === 'ios' && insets.bottom > 0 ? insets.bottom : 20;


    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    useEffect(() => {
        Animated.spring(translateY, {
            toValue: isKeyboardVisible ? 150 : 0,
            useNativeDriver: true,
            bounciness: 4,
        }).start();
    }, [isKeyboardVisible]);

    useEffect(() => {
        const targetPosition = state.index * TAB_WIDTH;
        Animated.spring(scrollX, {
            toValue: targetPosition,
            useNativeDriver: true,
            bounciness: 6,
            speed: 14,
        }).start();
    }, [state.index, TAB_WIDTH]);

    // No early return, let the animation handle it smoothly

    return (
        <Animated.View style={[
            styles.container,
            {
                bottom: TAB_BAR_BOTTOM,
                transform: [
                    { translateY },
                ],
            }
        ]}>
            <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
                {/* Animated Background Indicator */}
                <Animated.View
                    style={[
                        styles.indicator,
                        {
                            width: TAB_WIDTH,
                            transform: [{ translateX: scrollX }],
                        },
                    ]}
                >
                    <View style={styles.indicatorPill} />
                </Animated.View>

                {/* Tab Items */}
                <View style={styles.tabItemsContainer}>
                    {state.routes.map((route: any, index: number) => {
                        const { options } = descriptors[route.key];
                        const isFocused = state.index === index;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name);
                            }
                        };

                        const iconName =
                            route.name === 'index' ? 'home' :
                                route.name === 'quran' ? 'book' :
                                    route.name === 'ai-chat' ? 'magic' :
                                        route.name === 'bookmarks' ? 'shield' : 'navicon';

                        return (
                            <TouchableOpacity
                                key={route.key}
                                onPress={onPress}
                                style={styles.tabItem}
                                activeOpacity={0.7}
                            >
                                <FontAwesome
                                    name={iconName}
                                    size={index === 2 ? 24 : 20}
                                    color={isFocused ? '#F59E0B' : '#94A3B8'}
                                />
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        styles.tabLabel,
                                        { color: isFocused ? '#F59E0B' : '#94A3B8' }
                                    ]}
                                >
                                    {options.title || route.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </BlurView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        // bottom is set dynamically
        left: 16,
        right: 16,
        height: 64,
        elevation: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    blurContainer: {
        flex: 1,
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    tabItemsContainer: {
        flexDirection: 'row',
        height: '100%',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 4,
    },
    indicator: {
        position: 'absolute',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    indicatorPill: {
        width: '80%',
        height: '70%',
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
    },
});
