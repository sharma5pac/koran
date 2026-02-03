import { Platform } from 'react-native';
import { MOTIVATION_QUOTES } from '../constants/quotes';
import { DAILY_VERSES } from '../constants/verses';

const Notifications = Platform.OS === 'web' ? null : require('expo-notifications');

export const scheduleDailyVerse = async () => {
    if (Platform.OS === 'web' || !Notifications) return;

    // Pick a verse based on the day of the year
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const verse = DAILY_VERSES[dayOfYear % DAILY_VERSES.length];

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Daily Quran Verse",
            body: `"${verse.text}"\n\n— ${verse.reference}`,
            data: { type: 'verse' },
        },
        trigger: {
            hour: 9,
            minute: 0,
            repeats: true,
        },
    });
};

export const scheduleDailyQuote = async () => {
    if (Platform.OS === 'web' || !Notifications) return;

    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const quote = MOTIVATION_QUOTES[dayOfYear % MOTIVATION_QUOTES.length];

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Daily Inspiration",
            body: `"${quote.text}"\n\n— ${quote.author}`,
            data: { type: 'quote' },
        },
        trigger: {
            hour: 20,
            minute: 0,
            repeats: true,
        },
    });
};

export const scheduleAllDailyReminders = async () => {
    if (Platform.OS === 'web' || !Notifications) return;

    // Cancel existing daily reminders to avoid duplicates
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
        if (notif.content.data?.type === 'verse' || notif.content.data?.type === 'quote') {
            await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
    }

    await scheduleDailyVerse();
    await scheduleDailyQuote();
};
