import * as Location from 'expo-location';
import moment from 'moment-hijri';
import { Platform } from 'react-native';
import { CalculationMethod, Coordinates, PrayerTimes } from './adhan';

const Notifications = Platform.OS === 'web' ? null : require('expo-notifications');

if (Notifications) {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });

    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('adhan', {
            name: 'Adhan Notifications',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#F59E0B',
            sound: 'adhan.mp3',
        });
    }
}

export const requestPrayerPermissions = async () => {
    const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
    if (Platform.OS === 'web') return locStatus === 'granted';
    const { status: notifStatus } = await Notifications.requestPermissionsAsync();
    return locStatus === 'granted' && notifStatus === 'granted';
};

const DEFAULT_COORDS = { latitude: 21.4225, longitude: 39.8262 }; // Mecca as fallback

export const getPrayerTimes = async () => {
    try {
        let latitude, longitude;

        try {
            // Set a timeout for location to prevent infinite loading on web if permission dialog is ignored
            const location = await Promise.race([
                Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                }),
                new Promise<null>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
            ]) as Location.LocationObject;

            latitude = location.coords.latitude;
            longitude = location.coords.longitude;
        } catch (e) {
            console.warn('Geolocation failed or timed out, using default location:', e);
            latitude = DEFAULT_COORDS.latitude;
            longitude = DEFAULT_COORDS.longitude;
        }

        const date = new Date();
        const coordinates = new Coordinates(latitude, longitude);
        const params = CalculationMethod.MuslimWorldLeague();
        const prayerTimes = new PrayerTimes(coordinates, date, params);

        return {
            fajr: prayerTimes.fajr,
            dhuhr: prayerTimes.dhuhr,
            asr: prayerTimes.asr,
            maghrib: prayerTimes.maghrib,
            isha: prayerTimes.isha,
            date: date,
            hijri: moment(date).format('iD iMMMM iYYYY'),
            latitude,
            longitude,
        };
    } catch (error) {
        console.error('Error in getPrayerTimes calculation:', error);
        return null;
    }
};

export const scheduleAdhanNotifications = async (times: any) => {
    if (Platform.OS === 'web') {
        console.log('Notifications not supported on web');
        return;
    }
    await Notifications.cancelAllScheduledNotificationsAsync();

    const prayers = [
        { name: 'Fajr', time: times.fajr },
        { name: 'Dhuhr', time: times.dhuhr },
        { name: 'Asr', time: times.asr },
        { name: 'Maghrib', time: times.maghrib },
        { name: 'Isha', time: times.isha },
    ];

    for (const prayer of prayers) {
        if (prayer.time > new Date()) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: `Time for ${prayer.name}`,
                    body: `The call to prayer for ${prayer.name} has started.`,
                    sound: 'adhan.mp3',
                    data: { prayer: prayer.name },
                },
                trigger: {
                    date: prayer.time,
                    channelId: Platform.OS === 'android' ? 'adhan' : undefined,
                    type: 'date' as any, // Cast to any to bypass strict trigger types if needed
                } as any,
            });
        }
    }
};

export const cancelPrayerNotifications = async () => {
    if (Platform.OS === 'web' || !Notifications) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
};
