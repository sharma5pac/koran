import { LoginModal } from '@/components/LoginModal';
import { useAuth } from '@/hooks/useAuth';
import { getHolidayForDate } from '@/services/islamicDays';
import { useQuranStore } from '@/store/useQuranStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BlurView } from 'expo-blur';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import moment from 'moment-hijri';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StatusBar, Switch, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

export default function SettingsScreen() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const { width, height } = useWindowDimensions();
    const isLargeScreen = width > 768;

    // Store Hooks
    const {
        notifications, setNotifications,
        fontSize, setFontSize,
        arabicFont, setArabicFont,
    } = useQuranStore();

    // UI States
    const [showDonateModal, setShowDonateModal] = useState(false);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(moment());
    const [activeSelection, setActiveSelection] = useState<{ title: string, options: string[], current: string, onSelect: (val: string) => void } | null>(null);

    const handleSignOut = () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Sign Out", style: "destructive", onPress: async () => {
                        await signOut();
                        Alert.alert("Signed Out", "May Allah reward your journey.");
                    }
                }
            ]
        );
    };

    const donationDetails = {
        number: "0754428128",
        name: "Kanakulya Nasif",
        network: "Airtel"
    };

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(donationDetails.number);
        Alert.alert("Success", "Number copied! You can now paste it in your Airtel Money dialer.");
    };

    const selectionOptions = {
        fonts: ['Uthmani', 'IndoPak', 'Amiri', 'Traditional Arabic'],
        sizes: ['Small', 'Medium', 'Large', 'Extra Large']
    };

    return (
        <View className="flex-1 bg-[#0F172A]">
            <StatusBar barStyle="light-content" />
            <ScrollView className="flex-1">
                <View className="px-5 pt-12 pb-32">
                    <View className="flex-row justify-between items-end mb-6">
                        <View>
                            <Text className="text-2xl font-bold mb-1 text-white">Menu</Text>
                            <Text className="text-amber-500 text-[11px] font-bold uppercase tracking-widest opacity-80">Settings & Support</Text>
                        </View>
                        {user ? (
                            <TouchableOpacity
                                onPress={handleSignOut}
                                className="bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20"
                            >
                                <Text className="text-red-400 font-bold text-[10px] uppercase tracking-widest">Sign Out</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={() => setShowLoginModal(true)}
                                className="bg-amber-500 px-3 py-1.5 rounded-full"
                            >
                                <Text className="text-[#0F172A] font-bold text-[10px] uppercase tracking-widest">Connect</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Profile Section (When Logged In) */}
                    {user && (
                        <View className="bg-white/5 rounded-[24px] p-4 mb-6 flex-row items-center border border-white/5">
                            <View className="w-12 h-12 rounded-full bg-amber-500/20 items-center justify-center border-2 border-amber-500/40 overflow-hidden">
                                {user.photoURL ? (
                                    <View className="w-full h-full">
                                        <Text className="text-white text-center mt-3">👤</Text>
                                    </View>
                                ) : (
                                    <FontAwesome name="user" size={20} color="#F59E0B" />
                                )}
                            </View>
                            <View className="ml-3 flex-1">
                                <Text className="text-white font-bold text-base">{user.displayName || 'Servant of Allah'}</Text>
                                <Text className="text-amber-500/60 text-[11px] font-medium">{user.email}</Text>
                            </View>
                        </View>
                    )}

                    {/* Islamic Calendar Section */}
                    <View className="mb-6 rounded-[24px] overflow-hidden bg-[#1E293B] border border-white/10 p-5">
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-full bg-amber-500/20 items-center justify-center mr-3">
                                    <FontAwesome name="calendar" size={16} color="#F59E0B" />
                                </View>
                                <View>
                                    <Text className="text-lg font-bold text-white">Islamic Calendar</Text>
                                    <Text className="text-amber-500 text-[10px] font-bold uppercase tracking-wide">{moment().format('iD iMMMM iYYYY')}</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowCalendarModal(true)}
                                className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
                            >
                                <Text className="text-white text-[10px] font-bold uppercase">View All</Text>
                            </TouchableOpacity>
                        </View>
                        <Text className="text-gray-400 text-xs italic">
                            Keep track of Islamic dates and significant days in the Hijri calendar.
                        </Text>
                    </View>

                    {/* Support / Donate Section */}
                    <View className="mb-6 rounded-[24px] overflow-hidden bg-amber-500/10 border border-amber-500/20 p-5">
                        <View className="flex-row items-center mb-3">
                            <View className="w-10 h-10 rounded-full bg-amber-500/20 items-center justify-center mr-3">
                                <FontAwesome name="heart" size={16} color="#F59E0B" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-white">Support NurQuran</Text>
                                <Text className="text-amber-500/80 text-[10px] font-bold uppercase tracking-wide">Help us grow</Text>
                            </View>
                        </View>
                        <Text className="text-gray-300 text-sm leading-5 mb-5">
                            Invest in your Akhirah. Your Sadaqah Jariyah helps us keep NurQuran free, ad-free, and beautiful for the Ummah.
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setShowDonateModal(true)}
                            className="bg-amber-500 py-3.5 rounded-xl items-center shadow-lg shadow-amber-500/20"
                        >
                            <Text className="text-[#0F172A] font-bold text-base uppercase tracking-wider">Donate Now</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Interactive Tools */}
                    <View className="mb-8">
                        <Text className="text-base font-bold mb-3 ml-2 text-white">Interactive Tools</Text>
                        <View className="rounded-[24px] overflow-hidden border bg-[#1E293B] border-white/10">


                            <TouchableOpacity
                                onPress={() => setShowCalendarModal(true)}
                                className="flex-row items-center justify-between p-4"
                            >
                                <View className="flex-row items-center">
                                    <View className="w-9 h-9 rounded-full items-center justify-center mr-3 bg-white/5">
                                        <FontAwesome name="calendar" size={16} color="#F59E0B" />
                                    </View>
                                    <View>
                                        <Text className="text-[15px] font-medium text-white">Islamic Calendar</Text>
                                        <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Hijri Holidays</Text>
                                    </View>
                                </View>
                                <FontAwesome name="chevron-right" size={12} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* App Settings */}
                    <View className="mb-6">
                        <Text className="text-base font-bold mb-3 ml-2 text-white">App Settings</Text>

                        <View className="rounded-[24px] overflow-hidden border bg-[#1E293B] border-white/10">
                            {/* Notifications */}
                            <View className="flex-row items-center justify-between p-4">
                                <View className="flex-row items-center">
                                    <View className="w-9 h-9 rounded-full items-center justify-center mr-3 bg-white/5">
                                        <FontAwesome name="bell-o" size={16} color="#F59E0B" />
                                    </View>
                                    <Text className="text-[15px] font-medium text-white">Notifications</Text>
                                </View>
                                <Switch
                                    value={notifications}
                                    onValueChange={setNotifications}
                                    trackColor={{ false: "#334155", true: "#F59E0B" }}
                                    thumbColor={notifications ? "#fff" : "#f4f3f4"}
                                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Reading Settings */}
                    <View className="mb-6">
                        <Text className="text-base font-bold mb-3 ml-2 text-white">Reading Settings</Text>

                        <View className="rounded-[24px] overflow-hidden border bg-[#1E293B] border-white/10">
                            <TouchableOpacity
                                onPress={() => setActiveSelection({
                                    title: "Arabic Font",
                                    options: selectionOptions.fonts,
                                    current: arabicFont,
                                    onSelect: (val) => {
                                        setArabicFont(val);
                                    }
                                })}
                                className="flex-row items-center justify-between p-4 border-b border-white/5"
                            >
                                <View className="flex-row items-center">
                                    <View className="w-9 h-9 rounded-full items-center justify-center mr-3 bg-white/5">
                                        <FontAwesome name="font" size={16} color="#F59E0B" />
                                    </View>
                                    <Text className="text-[15px] font-medium text-white">Arabic Font</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Text className="text-gray-400 mr-2 text-sm font-medium">{arabicFont}</Text>
                                    <FontAwesome name="chevron-right" size={12} color="#64748B" />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setActiveSelection({
                                    title: "Font Size",
                                    options: selectionOptions.sizes,
                                    current: fontSize,
                                    onSelect: (val) => {
                                        setFontSize(val);
                                    }
                                })}
                                className="flex-row items-center justify-between p-4"
                            >
                                <View className="flex-row items-center">
                                    <View className="w-9 h-9 rounded-full items-center justify-center mr-3 bg-white/5">
                                        <FontAwesome name="text-height" size={16} color="#F59E0B" />
                                    </View>
                                    <Text className="text-[15px] font-medium text-white">Font Size</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Text className="text-gray-400 mr-2 text-sm font-medium">{fontSize}</Text>
                                    <FontAwesome name="chevron-right" size={12} color="#64748B" />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text className="text-center text-xs font-bold uppercase tracking-[3px] text-gray-600 mt-10">
                        NurQuran v1.0.0
                    </Text>
                </View>
            </ScrollView>

            {/* Selection Modal */}
            <Modal
                visible={!!activeSelection}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setActiveSelection(null)}
            >
                <View className="flex-1 justify-end">
                    <TouchableOpacity
                        className="absolute inset-0 bg-black/60"
                        onPress={() => setActiveSelection(null)}
                    />
                    <View className="bg-[#1E293B] rounded-t-[40px] border-t border-white/10 p-8 pb-12">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-bold text-white">{activeSelection?.title}</Text>
                            <TouchableOpacity onPress={() => setActiveSelection(null)}>
                                <FontAwesome name="times" size={20} color="gray" />
                            </TouchableOpacity>
                        </View>
                        {activeSelection?.options.map((opt, i) => {
                            // Use live store values for comparison
                            const isCurrentlySelected =
                                activeSelection.title === "Font Size" ? fontSize === opt :
                                    activeSelection.title === "Arabic Font" ? arabicFont === opt :
                                        activeSelection.current === opt;

                            return (
                                <TouchableOpacity
                                    key={opt}
                                    onPress={() => {
                                        activeSelection.onSelect(opt);
                                        setActiveSelection(null);
                                    }}
                                    className={`flex-row items-center justify-between py-5 ${i !== activeSelection.options.length - 1 ? 'border-b border-white/5' : ''}`}
                                >
                                    <Text className={`text-lg ${isCurrentlySelected ? 'text-amber-500 font-bold' : 'text-gray-300'}`}>
                                        {opt}
                                    </Text>
                                    {isCurrentlySelected && (
                                        <FontAwesome name="check" size={16} color="#F59E0B" />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </Modal>

            {/* Donation Modal */}
            <Modal
                visible={showDonateModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDonateModal(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/80 px-6">
                    <BlurView intensity={30} tint="dark" className="absolute inset-0" />

                    <View className="w-full bg-[#1E293B] rounded-[40px] border border-white/10 overflow-hidden">
                        <View className="p-8">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-2xl font-bold text-white">Donate</Text>
                                <TouchableOpacity
                                    onPress={() => setShowDonateModal(false)}
                                    className="w-10 h-10 rounded-full bg-white/5 items-center justify-center"
                                >
                                    <FontAwesome name="times" size={20} color="white" />
                                </TouchableOpacity>
                            </View>

                            <View className="items-center mb-8">
                                <View className="w-20 h-20 rounded-full bg-amber-500/20 items-center justify-center mb-4">
                                    <FontAwesome name="mobile" size={40} color="#F59E0B" />
                                </View>
                                <Text className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-2">Airtel Mobile Money</Text>
                                <Text className="text-white text-center text-sm opacity-60 px-4">
                                    Support the development of NurQuran directly via Mobile Money.
                                </Text>
                            </View>

                            <View className="bg-white/5 rounded-3xl p-6 mb-8 border border-white/5">
                                <View className="mb-4">
                                    <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Account Holder</Text>
                                    <Text className="text-white text-xl font-bold">{donationDetails.name}</Text>
                                </View>

                                <View>
                                    <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Phone Number</Text>
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-amber-500 text-2xl font-black tracking-wider">{donationDetails.number}</Text>
                                        <TouchableOpacity
                                            onPress={copyToClipboard}
                                            className="bg-amber-500/20 px-4 py-2 rounded-xl"
                                        >
                                            <Text className="text-amber-500 font-bold">Copy</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => setShowDonateModal(false)}
                                className="bg-amber-500 w-full py-5 rounded-3xl items-center shadow-lg shadow-amber-500/30"
                            >
                                <Text className="text-[#0F172A] font-black text-lg uppercase tracking-widest">Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Islamic Calendar Modal */}
            <Modal
                visible={showCalendarModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCalendarModal(false)}
            >
                <View className={`flex-1 bg-black/80 ${isLargeScreen ? 'justify-center items-center p-10' : 'justify-end'}`}>
                    <TouchableOpacity
                        className="absolute inset-0"
                        onPress={() => setShowCalendarModal(false)}
                    />
                    <View className={`bg-[#0F172A] border-t border-white/10 overflow-hidden ${isLargeScreen ? 'w-full max-w-[500px] h-[90%] rounded-[40px] border-x border-b' : 'w-full h-[85%] rounded-t-[40px]'}`}>
                        <LinearGradient
                            colors={['#1E293B', '#0F172A']}
                            className="absolute inset-0"
                        />

                        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                            <View className="p-6">
                                <View className="flex-row justify-between items-center mb-8">
                                    <TouchableOpacity
                                        onPress={() => setCalendarMonth((moment(calendarMonth) as any).subtract(1, 'iMonth'))}
                                        className="w-12 h-12 rounded-full bg-white/5 items-center justify-center border border-white/5"
                                    >
                                        <FontAwesome name="chevron-left" size={16} color="white" />
                                    </TouchableOpacity>
                                    <View className="items-center">
                                        <Text className="text-3xl font-black text-white tracking-tight">{(calendarMonth as any).format('iMMMM')}</Text>
                                        <Text className="text-amber-500 text-[11px] font-black uppercase tracking-[5px] mt-1">{(calendarMonth as any).format('iYYYY')} / {calendarMonth.format('YYYY')}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => setCalendarMonth((moment(calendarMonth) as any).add(1, 'iMonth'))}
                                        className="w-12 h-12 rounded-full bg-white/5 items-center justify-center border border-white/5"
                                    >
                                        <FontAwesome name="chevron-right" size={16} color="white" />
                                    </TouchableOpacity>
                                </View>

                                <View className="flex-row mb-3">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                        <View key={d} className="flex-1 items-center">
                                            <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{d}</Text>
                                        </View>
                                    ))}
                                </View>

                                <View className="flex-row flex-wrap">
                                    {(() => {
                                        const daysData = [];
                                        const startOfMonth = (moment(calendarMonth) as any).startOf('iMonth');
                                        const endOfMonth = (moment(calendarMonth) as any).endOf('iMonth');
                                        const firstDayOfWeek = startOfMonth.day();

                                        for (let i = 0; i < firstDayOfWeek; i++) {
                                            daysData.push({ id: `pad-${i}`, padding: true });
                                        }

                                        const monthIndex = startOfMonth.iMonth();
                                        for (let i = 1; i <= (endOfMonth as any).iDate(); i++) {
                                            const date = (moment(startOfMonth) as any).iDate(i);
                                            const holiday = getHolidayForDate(monthIndex, i);
                                            daysData.push({
                                                id: date.format('YYYYMMDD'),
                                                day: i,
                                                isToday: date.isSame(moment(), 'day'),
                                                gregorianDay: date.date(),
                                                holiday: holiday
                                            });
                                        }

                                        return daysData.map(item => (
                                            <View key={item.id} className="w-[14.28%] aspect-square items-center justify-center p-1">
                                                {!item.padding && (
                                                    <View className={`w-full h-full rounded-2xl items-center justify-center border-2 ${item.isToday
                                                        ? 'bg-amber-500 border-amber-500'
                                                        : item.holiday
                                                            ? 'bg-emerald-500/20 border-emerald-500/50'
                                                            : 'bg-white/5 border-transparent'
                                                        }`}>
                                                        <Text className={`text-base font-black ${item.isToday ? 'text-[#0F172A]' : item.holiday ? 'text-emerald-400' : 'text-white'}`}>{item.day}</Text>
                                                        <Text className={`text-[8px] font-bold ${item.isToday ? 'text-[#0F172A]/70' : 'text-gray-500'}`}>{item.gregorianDay}</Text>
                                                        {item.holiday && (
                                                            <View className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        )}
                                                    </View>
                                                )}
                                            </View>
                                        ));
                                    })()}
                                </View>

                                <View className="mt-10">
                                    <View className="flex-row items-center justify-between mb-5">
                                        <Text className="text-white font-black text-sm uppercase tracking-[3px]">Significant Dates</Text>
                                        <View className="h-[2px] flex-1 bg-white/5 ml-4" />
                                    </View>

                                    {(() => {
                                        const startOfMonth = (moment(calendarMonth) as any).startOf('iMonth');
                                        const endOfMonth = (moment(calendarMonth) as any).endOf('iMonth');
                                        const monthIndex = startOfMonth.iMonth();
                                        const monthHolidays = [];

                                        for (let i = 1; i <= (endOfMonth as any).iDate(); i++) {
                                            const holiday = getHolidayForDate(monthIndex, i);
                                            if (holiday) {
                                                monthHolidays.push({ ...holiday, day: i });
                                            }
                                        }

                                        if (monthHolidays.length === 0) {
                                            return (
                                                <View className="bg-white/5 rounded-[24px] p-6 items-center border border-white/5 border-dashed">
                                                    <FontAwesome name="calendar-o" size={24} color="#64748B" className="mb-2 opacity-50" />
                                                    <Text className="text-gray-500 text-xs font-bold italic">No specialized observances this month</Text>
                                                </View>
                                            );
                                        }

                                        return monthHolidays.map((h, idx) => (
                                            <View key={idx} className="flex-row items-center bg-white/5 rounded-[24px] p-5 mb-3 border border-white/5">
                                                <View className="w-12 h-12 rounded-[18px] bg-emerald-500/20 items-center justify-center mr-4 border border-emerald-500/20">
                                                    <Text className="text-emerald-400 font-black text-xl">{h.day}</Text>
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-white font-bold text-base">{h.name}</Text>
                                                    <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">{(calendarMonth as any).format('iMMMM iYYYY')}</Text>
                                                </View>
                                                <View className="bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                                                    <Text className="text-emerald-400 text-[9px] font-black uppercase">Blessed</Text>
                                                </View>
                                            </View>
                                        ));
                                    })()}
                                </View>

                                <TouchableOpacity
                                    onPress={() => setShowCalendarModal(false)}
                                    className="mt-10 mb-6 bg-amber-500 py-5 rounded-[24px] items-center shadow-xl shadow-amber-500/20"
                                >
                                    <Text className="text-[#0F172A] font-black uppercase tracking-[3px] text-base">Proceed</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <LoginModal visible={showLoginModal} onClose={() => setShowLoginModal(false)} />
        </View>
    );
}
