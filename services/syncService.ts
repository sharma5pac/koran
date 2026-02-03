import { useQuranStore } from '@/store/useQuranStore';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export const syncUserData = () => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);

    // Subscribe to changes in Firestore
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.data();
            if (data.lastRead) {
                useQuranStore.getState().setLastRead(data.lastRead);
            }
            if (data.bookmarks) {
                // We might want to merge or replace. For now, replace for simplicity.
                // In a real app, we'd do a more sophisticated merge.
                useQuranStore.setState({ bookmarks: data.bookmarks });
            }
        }
    });

    return unsubscribe;
};

export const saveLastReadToFirebase = async (lastRead: any) => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    try {
        await setDoc(userDocRef, { lastRead }, { merge: true });
    } catch (error) {
        console.error('Error saving last read to Firebase:', error);
    }
};

export const saveBookmarksToFirebase = async (bookmarks: any[]) => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    try {
        await setDoc(userDocRef, { bookmarks }, { merge: true });
    } catch (error) {
        console.error('Error saving bookmarks to Firebase:', error);
    }
};
