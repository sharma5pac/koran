import { LoginModal } from '@/components/LoginModal';
import { useAuth } from '@/hooks/useAuth';
import { askQuranAI } from '@/services/aiService';
import { fetchSurahs } from '@/services/quranApi';
import { useQuranStore } from '@/store/useQuranStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BlurView } from 'expo-blur';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';

// No static width here to avoid early access errors

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: number;
}

const SUGGESTIONS = [
    "Verses about patience",
    "Story of Prophet Yusuf",
    "How to maintain Khushu?",
    "Verse for anxiety",
    "Importance of Sadaqah",
    "Virtues of Tahajjud",
    "Meaning of Ayat-ul-Kursi",
    "Etiquette of Dua"
];

export default function AIChatScreen() {
    const { width } = useWindowDimensions();
    const { surahs, setSurahs } = useQuranStore();
    const router = useRouter();
    const { user } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);

    React.useEffect(() => {
        if (surahs.length === 0) {
            fetchSurahs().then(setSurahs).catch(console.error);
        }
    }, [surahs.length]);

    // Auto-popup logic for unauthenticated users
    useFocusEffect(
        useCallback(() => {
            if (!user || user.isAnonymous) {
                const timeout = setTimeout(() => {
                    setShowLoginModal(true);
                }, 500);
                return () => clearTimeout(timeout);
            }
        }, [user])
    );
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Assalamu Alaikum! I am NurAI, your Quranic assistant. How can I help you explore the divine wisdom today?",
            sender: 'ai',
            timestamp: Date.now()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const navigateToVerse = (surahName: string, verseNumber: string) => {
        const cleanSearch = surahName.toLowerCase().replace('surah', '').replace(/[^a-z]/g, '').trim();

        const surah = surahs.find(s => {
            const cleanSimple = s.name_simple.toLowerCase().replace(/[^a-z]/g, '');
            const cleanComplex = s.name_complex.toLowerCase().replace(/[^a-z]/g, '');
            return cleanSimple.includes(cleanSearch) || cleanComplex.includes(cleanSearch) || cleanSearch.includes(cleanSimple);
        });

        if (surah) {
            router.push({
                pathname: '/surah/[id]',
                params: { id: surah.id.toString(), verse: verseNumber }
            });
        }
    };

    const renderTextWithLinks = (text: string, isUser: boolean) => {
        if (isUser) return <Text className="text-[15px] leading-6 text-white font-medium">{text}</Text>;

        const lines = text.split('\n');
        return lines.map((line, lineIdx) => {
            // Header 3 (###)
            if (line.startsWith('### ')) {
                return (
                    <Text key={lineIdx} className="text-amber-500 text-lg font-black mt-4 mb-2 uppercase tracking-widest">
                        {line.replace('### ', '')}
                    </Text>
                );
            }
            // Header 4 (####)
            if (line.startsWith('#### ')) {
                return (
                    <Text key={lineIdx} className="text-white text-base font-bold mt-3 mb-1">
                        {line.replace('#### ', '')}
                    </Text>
                );
            }
            // Blockquote (>)
            if (line.trim().startsWith('>')) {
                const content = line.trim().substring(1).trim();
                return (
                    <View key={lineIdx} className="border-l-2 border-amber-500/50 pl-4 py-1 my-2 bg-white/5 rounded-r-lg">
                        {renderInLineLinks(content)}
                    </View>
                );
            }

            // Normal text with inline links
            return (
                <View key={lineIdx} className="mb-2">
                    {renderInLineLinks(line)}
                </View>
            );
        });
    };

    const renderInLineLinks = (text: string) => {
        const regex = /\[\[(.*?):(.*?)]]/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(
                    <Text key={`text-${lastIndex}`} className="text-gray-200 text-[15px] leading-7">
                        {text.substring(lastIndex, match.index)}
                    </Text>
                );
            }

            const surahName = match[1].trim();
            const verseNumber = match[2].trim();

            parts.push(
                <TouchableOpacity
                    key={`link-${match.index}`}
                    onPress={() => navigateToVerse(surahName, verseNumber)}
                    activeOpacity={0.6}
                    className="bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/40 flex-row items-center mx-1 my-1 shadow-md shadow-amber-500/30"
                >
                    <FontAwesome name="book" size={12} color="#F59E0B" style={{ marginRight: 8 }} />
                    <Text className="text-amber-500 font-extrabold text-[12px] uppercase tracking-wider">
                        {surahName}:{verseNumber}
                    </Text>
                </TouchableOpacity>
            );

            lastIndex = regex.lastIndex;
        }

        if (lastIndex < text.length) {
            parts.push(
                <Text key={`text-${lastIndex}`} className="text-gray-200 text-[15px] leading-7">
                    {text.substring(lastIndex)}
                </Text>
            );
        }

        return (
            <View className="flex-row flex-wrap items-center">
                {parts}
            </View>
        );
    };

    const handleSend = async (textText?: string) => {
        // Authentication Guard
        if (!user || user.isAnonymous) {
            setShowLoginModal(true);
            return;
        }

        const messageText = textText || input.trim();
        if (!messageText || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: messageText,
            sender: 'user',
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const aiResponse = await askQuranAI(messageText);
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: aiResponse,
                sender: 'ai',
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('AI Chat Error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm sorry, I'm having trouble connecting to my divine knowledge base right now. Please try again in a moment.",
                sender: 'ai',
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    };

    const MessageItem = React.memo(({ item, width }: { item: Message; width: number }) => {
        const isUser = item.sender === 'user';
        return (
            <View className={`flex-row ${isUser ? 'justify-end' : 'justify-start'} mb-8 px-4`}>
                {!isUser && (
                    <View className="w-9 h-9 rounded-full bg-amber-500/10 items-center justify-center mr-3 mt-1 border border-amber-500/20 shadow-sm shadow-amber-500/50">
                        <FontAwesome name="magic" size={16} color="#F59E0B" />
                    </View>
                )}
                <View
                    style={{ maxWidth: width * 0.85 }}
                    className={`p-4 rounded-[24px] ${isUser
                        ? 'bg-amber-600 rounded-tr-none shadow-xl shadow-amber-900/20'
                        : 'bg-slate-800/40 border border-white/5 rounded-tl-none shadow-sm shadow-black/20'
                        }`}
                >
                    {renderTextWithLinks(item.text, isUser)}

                    <View className={`flex-row items-center mt-4 ${isUser ? 'justify-end' : 'justify-start'} opacity-40`}>
                        <FontAwesome name="clock-o" size={10} color={isUser ? 'white' : '#94A3B8'} className="mr-1" />
                        <Text className={`text-[10px] font-black uppercase tracking-[0.1em] ${isUser ? 'text-white' : 'text-gray-500'}`}>
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                </View>
            </View>
        );
    });

    const renderMessage = ({ item }: { item: Message }) => (
        <MessageItem item={item} width={width} />
    );

    return (
        <SafeAreaView className="flex-1 bg-[#0F172A]">
            <StatusBar barStyle="light-content" />

            {/* Background Decorative Image */}
            <Image
                source={require('../../assets/images/islamic_card_bg.png')}
                className="absolute inset-0 w-full h-full opacity-5"
                resizeMode="cover"
            />

            {/* Premium Header */}
            <View className="px-5 pt-2 pb-4 border-b border-white/5">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-white text-xl font-bold tracking-tight">NurAI Chat</Text>
                        <View className="flex-row items-center gap-1.5 mt-0.5">
                            <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Powered by Gemini</Text>
                        </View>
                    </View>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingTop: 16, paddingBottom: 140 }}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    removeClippedSubviews={Platform.OS === 'android'}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    ListHeaderComponent={
                        <View className="px-6 mb-6">
                            <Text className="text-amber-500/50 text-[9px] font-black uppercase tracking-[0.2em] mb-3 text-center">
                                Suggested Topics
                            </Text>
                            <View className="flex-row flex-wrap justify-center gap-2">
                                {SUGGESTIONS.map((s, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        onPress={() => handleSend(s)}
                                        className="bg-white/5 px-4 py-2.5 rounded-full border border-white/10"
                                    >
                                        <Text className="text-white/80 text-[11px] font-bold">{s}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    }
                />

                {/* Glassmorphic Input Area */}
                <View className="absolute bottom-0 left-0 right-0 px-4 pb-20 pt-2 bg-[#0F172A]">
                    <BlurView intensity={Platform.OS === 'ios' ? 40 : 80} tint="dark" className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                        <View className="flex-row items-center px-4 py-3">
                            <TextInput
                                className="flex-1 text-white text-sm py-2 max-h-20"
                                placeholder={!user || user.isAnonymous ? "Sign in to chat..." : "Ask about the Quran..."}
                                placeholderTextColor="#94A3B8"
                                value={input}
                                onChangeText={setInput}
                                multiline
                                onFocus={() => {
                                    if (!user || user.isAnonymous) {
                                        setShowLoginModal(true);
                                    }
                                }}
                            />
                            <TouchableOpacity
                                onPress={() => handleSend()}
                                disabled={loading}
                                className={`w-10 h-10 rounded-full items-center justify-center ml-2 ${input.trim() ? 'bg-amber-500' : 'bg-white/5'}`}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <FontAwesome name="send" size={14} color={input.trim() ? '#0F172A' : '#475569'} />
                                )}
                            </TouchableOpacity>
                        </View>
                    </BlurView>
                </View>
            </KeyboardAvoidingView>

            {/* Locked State Overlay */}
            {(!user || user.isAnonymous) && (
                <View className="absolute inset-0 bg-[#0F172A]/40 justify-center items-center px-8">
                    <BlurView intensity={20} tint="dark" className="absolute inset-0" />

                    <View className="bg-slate-900/90 p-8 rounded-[40px] border border-white/10 items-center shadow-2xl w-full">
                        <View className="w-20 h-20 rounded-full bg-amber-500/10 items-center justify-center mb-6 border border-amber-500/20">
                            <FontAwesome name="lock" size={32} color="#F59E0B" />
                        </View>

                        <Text className="text-white text-2xl font-bold text-center mb-2">Sign in Required</Text>
                        <Text className="text-gray-400 text-center mb-8 leading-6">
                            Connect your account to access NurAI, your personal Quranic guide and spiritual assistant.
                        </Text>

                        <TouchableOpacity
                            onPress={() => setShowLoginModal(true)}
                            className="bg-amber-500 w-full py-4 rounded-2xl items-center shadow-lg shadow-amber-500/30"
                            activeOpacity={0.8}
                        >
                            <Text className="text-[#0F172A] font-bold text-lg">Sign In with Google</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <LoginModal visible={showLoginModal} onClose={() => setShowLoginModal(false)} />
        </SafeAreaView>
    );
}
