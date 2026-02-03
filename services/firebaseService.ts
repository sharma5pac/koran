import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
} from 'firebase/firestore';
import { db } from './firebase';

interface FirebaseBookmark {
    userId: string;
    surahId: number;
    verseNumber: number;
    verseKey: string;
    note?: string;
    timestamp: number;
}

/**
 * Save a bookmark to Firestore
 */
export const saveBookmarkToFirebase = async (
    userId: string,
    bookmark: Omit<FirebaseBookmark, 'userId'>
): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, 'bookmarks'), {
            userId,
            ...bookmark,
        });
        return docRef.id;
    } catch (error) {
        console.error('Error saving bookmark to Firebase:', error);
        throw error;
    }
};

/**
 * Delete a bookmark from Firestore
 */
export const deleteBookmarkFromFirebase = async (bookmarkId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'bookmarks', bookmarkId));
    } catch (error) {
        console.error('Error deleting bookmark from Firebase:', error);
        throw error;
    }
};

/**
 * Fetch all bookmarks for a user from Firestore
 */
export const fetchBookmarksFromFirebase = async (
    userId: string
): Promise<FirebaseBookmark[]> => {
    try {
        const q = query(collection(db, 'bookmarks'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        const bookmarks: FirebaseBookmark[] = [];
        querySnapshot.forEach((doc) => {
            bookmarks.push({ ...doc.data(), id: doc.id } as FirebaseBookmark);
        });

        return bookmarks;
    } catch (error) {
        console.error('Error fetching bookmarks from Firebase:', error);
        throw error;
    }
};
