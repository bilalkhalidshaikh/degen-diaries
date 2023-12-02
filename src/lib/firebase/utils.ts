import {
  doc,
  query,
  where,
  limit,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  increment,
  writeBatch,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  getCountFromServer,
  addDoc,
  collection
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from './app';
import {
  usersCollection,
  tweetsCollection,
  userStatsCollection,
  userBookmarksCollection
} from './collections';
import type { WithFieldValue, Query } from 'firebase/firestore';
import type { EditableUserData } from '@lib/types/user';
import type { FilesWithId, ImagesPreview } from '@lib/types/file';
import type { Bookmark } from '@lib/types/bookmark';
import type { Theme, Accent } from '@lib/types/theme';
// const functions = require('firebase-functions');
// const admin = require('firebase-admin');

// admin.initializeApp();

// exports.validateInitialReferralCode = functions.https.onCall(
//   async (data, context) => {
//     const code = data.code;
//     const db = admin.firestore();
//     const codeRef = db.collection('initialReferralCodes').doc(code);

//     return db.runTransaction(async (transaction) => {
//       const codeDoc = await transaction.get(codeRef);
//       if (!codeDoc.exists || codeDoc.data().used) {
//         throw new functions.https.HttpsError(
//           'failed-precondition',
//           'This code is invalid or has already been used.'
//         );
//       }

//       transaction.update(codeRef, { used: true });
//       return { success: true };
//     });
//   }
// );

// exports.generateReferralCodes = functions.firestore
//   .document('users/{userId}')
//   .onCreate((snap, context) => {
//     const userId = context.params.userId;
//     const userRef = admin.firestore().collection('users').doc(userId);
//     const newCode = generateRandomCode(6);

//     return userRef.update({
//       referralCode: newCode
//     });
//   });

// exports.validateReferralCode = functions.https.onCall(async (data, context) => {
//   const { code } = data;
//   const usersRef = admin.firestore().collection('users');
//   const snapshot = await usersRef
//     .where('referralCode', '==', code)
//     .limit(1)
//     .get();

//   if (snapshot.empty) {
//     throw new functions.https.HttpsError(
//       'not-found',
//       'Referral code does not exist.'
//     );
//   }

//   return { success: true };
// });

// exports.redeemReferralCode = functions.https.onCall(async (data, context) => {
//   const { code, newUserId } = data;
//   const db = admin.firestore();
//   const usersRef = db.collection('users');
//   const snapshot = await usersRef
//     .where('referralCode', '==', code)
//     .limit(1)
//     .get();

//   if (snapshot.empty) {
//     throw new functions.https.HttpsError(
//       'not-found',
//       'Referral code does not exist.'
//     );
//   }

//   const referrerUserId = snapshot.docs[0].id;
//   const referrerUserRef = usersRef.doc(referrerUserId);

//   await db.runTransaction(async (transaction) => {
//     const referrerUserDoc = await transaction.get(referrerUserRef);
//     if (!referrerUserDoc.exists) {
//       throw new functions.https.HttpsError(
//         'not-found',
//         'Referrer user does not exist.'
//       );
//     }

//     // Perform necessary updates, like incrementing the referrer's benefits
//     transaction.update(referrerUserRef, {
//       /* ... */
//     });
//     transaction.update(usersRef.doc(newUserId), { referrer: referrerUserId });

//     return { success: true };
//   });
// });

// function generateRandomCode(length) {
//   const characters =
//     'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   let result = '';
//   for (let i = 0; i < length; i++) {
//     result += characters.charAt(Math.floor(Math.random() * characters.length));
//   }
//   return result;
// }

// Example of a notification data structure
type NotificationData = {
  type: 'follow' | 'unfollow' | 'like' | 'unlike';
  fromUserId: string;
  toUserId: string;
  timestamp: any; // Firebase server timestamp
};

export async function saveNotification(
  notificationData: NotificationData
): Promise<void> {
  const notificationsRef = collection(db, 'notifications');
  await addDoc(notificationsRef, {
    ...notificationData,
    timestamp: serverTimestamp()
  });
}

export async function checkUsernameAvailability(
  username: string
): Promise<boolean> {
  const { empty } = await getDocs(
    query(usersCollection, where('username', '==', username), limit(1))
  );
  return empty;
}

export async function getCollectionCount<T>(
  collection: Query<T>
): Promise<number> {
  const snapshot = await getCountFromServer(collection);
  return snapshot.data().count;
}

export async function updateUserData(
  userId: string,
  userData: EditableUserData
): Promise<void> {
  const userRef = doc(usersCollection, userId);
  await updateDoc(userRef, {
    ...userData,
    updatedAt: serverTimestamp()
  });
}

export async function updateUserTheme(
  userId: string,
  themeData: { theme?: Theme; accent?: Accent }
): Promise<void> {
  const userRef = doc(usersCollection, userId);
  await updateDoc(userRef, { ...themeData });
}

export async function updateUsername(
  userId: string,
  username?: string
): Promise<void> {
  const userRef = doc(usersCollection, userId);
  await updateDoc(userRef, {
    ...(username && { username }),
    updatedAt: serverTimestamp()
  });
}

export async function managePinnedTweet(
  type: 'pin' | 'unpin',
  userId: string,
  tweetId: string
): Promise<void> {
  const userRef = doc(usersCollection, userId);
  await updateDoc(userRef, {
    updatedAt: serverTimestamp(),
    pinnedTweet: type === 'pin' ? tweetId : null
  });
}

export async function manageFollow(
  type: 'follow' | 'unfollow',
  userId: string,
  targetUserId: string
): Promise<void> {
  const batch = writeBatch(db);

  const userDocRef = doc(usersCollection, userId);
  const targetUserDocRef = doc(usersCollection, targetUserId);

  if (type === 'follow') {
    batch.update(userDocRef, {
      following: arrayUnion(targetUserId),
      updatedAt: serverTimestamp()
    });
    batch.update(targetUserDocRef, {
      followers: arrayUnion(userId),
      updatedAt: serverTimestamp()
    });
  } else {
    batch.update(userDocRef, {
      following: arrayRemove(targetUserId),
      updatedAt: serverTimestamp()
    });
    batch.update(targetUserDocRef, {
      followers: arrayRemove(userId),
      updatedAt: serverTimestamp()
    });
  }

  await batch.commit();
  // Save notification
  await saveNotification({
    type,
    fromUserId: userId,
    toUserId: targetUserId,
    timestamp: serverTimestamp()
  });
}

export async function removeTweet(tweetId: string): Promise<void> {
  const userRef = doc(tweetsCollection, tweetId);
  await deleteDoc(userRef);
}

export async function uploadImages(
  userId: string,
  files: FilesWithId
): Promise<ImagesPreview | null> {
  if (!files.length) return null;

  const imagesPreview = await Promise.all(
    files.map(async (file) => {
      let src: string;

      const { id, name: alt } = file;

      const storageRef = ref(storage, `images/${userId}/${alt}`);

      try {
        src = await getDownloadURL(storageRef);
      } catch {
        await uploadBytesResumable(storageRef, file);
        src = await getDownloadURL(storageRef);
      }

      return { id, src, alt };
    })
  );

  return imagesPreview;
}

export async function manageReply(
  type: 'increment' | 'decrement',
  tweetId: string
): Promise<void> {
  const tweetRef = doc(tweetsCollection, tweetId);

  try {
    await updateDoc(tweetRef, {
      userReplies: increment(type === 'increment' ? 1 : -1),
      updatedAt: serverTimestamp()
    });
  } catch {
    // do nothing, because parent tweet was already deleted
  }
}

export async function manageTotalTweets(
  type: 'increment' | 'decrement',
  userId: string
): Promise<void> {
  const userRef = doc(usersCollection, userId);
  await updateDoc(userRef, {
    totalTweets: increment(type === 'increment' ? 1 : -1),
    updatedAt: serverTimestamp()
  });
}

export async function manageTotalPhotos(
  type: 'increment' | 'decrement',
  userId: string
): Promise<void> {
  const userRef = doc(usersCollection, userId);
  await updateDoc(userRef, {
    totalPhotos: increment(type === 'increment' ? 1 : -1),
    updatedAt: serverTimestamp()
  });
}

export function manageRetweet(
  type: 'retweet' | 'unretweet',
  userId: string,
  tweetId: string
) {
  return async (): Promise<void> => {
    const batch = writeBatch(db);

    const tweetRef = doc(tweetsCollection, tweetId);
    const userStatsRef = doc(userStatsCollection(userId), 'stats');

    if (type === 'retweet') {
      batch.update(tweetRef, {
        userRetweets: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
      batch.update(userStatsRef, {
        tweets: arrayUnion(tweetId),
        updatedAt: serverTimestamp()
      });
    } else {
      batch.update(tweetRef, {
        userRetweets: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });
      batch.update(userStatsRef, {
        tweets: arrayRemove(tweetId),
        updatedAt: serverTimestamp()
      });
    }

    await batch.commit();
  };
}

export function manageLike(
  type: 'like' | 'unlike',
  userId: string,
  tweetId: string
) {
  return async (): Promise<void> => {
    const batch = writeBatch(db);

    const userStatsRef = doc(userStatsCollection(userId), 'stats');
    const tweetRef = doc(tweetsCollection, tweetId);

    if (type === 'like') {
      batch.update(tweetRef, {
        userLikes: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
      batch.update(userStatsRef, {
        likes: arrayUnion(tweetId),
        updatedAt: serverTimestamp()
      });
    } else {
      batch.update(tweetRef, {
        userLikes: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });
      batch.update(userStatsRef, {
        likes: arrayRemove(tweetId),
        updatedAt: serverTimestamp()
      });
    }

    await batch.commit();
    // Save notification
    await saveNotification({
      type,
      fromUserId: userId,
      toUserId: tweetId,
      timestamp: serverTimestamp()
    });
  };
}

export async function manageBookmark(
  type: 'bookmark' | 'unbookmark',
  userId: string,
  tweetId: string
): Promise<void> {
  const bookmarkRef = doc(userBookmarksCollection(userId), tweetId);

  if (type === 'bookmark') {
    const bookmarkData: WithFieldValue<Bookmark> = {
      id: tweetId,
      createdAt: serverTimestamp()
    };
    await setDoc(bookmarkRef, bookmarkData);
  } else await deleteDoc(bookmarkRef);
}

export async function clearAllBookmarks(userId: string): Promise<void> {
  const bookmarksRef = userBookmarksCollection(userId);
  const bookmarksSnapshot = await getDocs(bookmarksRef);

  const batch = writeBatch(db);

  bookmarksSnapshot.forEach(({ ref }) => batch.delete(ref));

  await batch.commit();
}
