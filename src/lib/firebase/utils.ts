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
  collection,
  getDoc
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
  tweetId?: string; // Optional: ID of the tweet for like/unlike
  message: any;
};

// export async function saveNotification(
//   notificationData: NotificationData,
//   fromUserId: string, // ID of the user who triggered the notification
//   tweetId: string // ID of the tweet that was liked or retweeted

// ): Promise<void> {
//   // Fetch user details
//   const userDocRef = doc(db, 'users', fromUserId);
//   const userDoc = await getDoc(userDocRef);
//   if (!userDoc.exists()) {
//     console.error('User not found');
//     return;
//   }
//    // Fetch tweet details to get the creator's userId
//    const tweetDocRef = doc(db, 'tweets', tweetId);
//    const tweetDoc = await getDoc(tweetDocRef);
//    if (!tweetDoc.exists()) {
//      console.error('Tweet not found');
//      return;
//    }
//    const tweetData = tweetDoc.data();
//    const toUserId = tweetData.createdBy; // This should be the tweet creator's userId

//   const userData = userDoc.data();

//   // Create a message based on the type of notification
//   let message = '';
//   switch (notificationData.type) {
//     case 'follow':
//       message = `${userData.username} started following you.`;
//       break;
//     case 'like':
//       message = `${userData.username} liked your tweet.`;
//       break;
//     // Add other cases as needed
//   }

//   // Save the notification with user details
//   const notificationsRef = collection(db, 'notifications');
//   await addDoc(notificationsRef, {
//     ...notificationData,
//     message,
//     senderName: userData.name, // Assuming 'name' field exists in user document
//     senderPhotoURL: userData.photoURL, // Assuming 'photoURL' field exists
//     timestamp: serverTimestamp()
//   });
// }
export async function saveNotification(
  notificationData: NotificationData,
  fromUserId: string,
  tweetId?: string, // For like/unlike notifications
  toUserId?: string // For follow/unfollow notifications
): Promise<void> {
  // Fetch the user who triggered the notification
  const userDocRef = doc(db, 'users', fromUserId);
  const userDoc = await getDoc(userDocRef);
  if (!userDoc.exists()) {
    console.error('User not found');
    return;
  }
  const userData = userDoc.data();

  let targetUserId = '';
  let message = '';

  console.log(`Notification type: ${notificationData.type}`);

  switch (notificationData.type) {
    case 'like':
    case 'unlike':
      if (tweetId) {
        const tweetDocRef = doc(db, 'tweets', tweetId);
        const tweetDoc = await getDoc(tweetDocRef);
        if (tweetDoc.exists()) {
          targetUserId = tweetDoc.data().createdBy;
          console.log(`Tweet found. Target user ID: ${targetUserId}`);
        } else {
          console.error(`Tweet with ID ${tweetId} not found.`);
          return;
        }
      } else {
        console.error('Tweet ID not provided for like/unlike notification.');
        return;
      }
      message = `${userData.username} ${notificationData.type}d your tweet.`;
      break;
    case 'follow':
    case 'unfollow':
      if (toUserId) {
        targetUserId = toUserId;
        console.log(`Target user ID for follow/unfollow: ${targetUserId}`);
      } else {
        console.error(
          'Target user ID not provided for follow/unfollow notification.'
        );
        return;
      }
      message = `${userData.username} ${notificationData.type}ed you.`;
      break;
  }

  // Ensure targetUserId is defined
  if (!targetUserId) {
    console.log('Target user ID is undefined');
    return;
  }

  // Save the notification
  const notificationsRef = collection(db, 'notifications');
  await addDoc(notificationsRef, {
    ...notificationData,
    fromUserId,
    toUserId: targetUserId, // Target user ID
    message,
    senderName: userData.name,
    senderPhotoURL: userData.photoURL,
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
  // Fetch user data
  const userDocRefs = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRefs);
  if (!userDoc.exists()) {
    console.error('User not found');
    return;
  }
  const userData = userDoc.data();

  const batch = writeBatch(db);

  const userDocRef = doc(usersCollection, userId);
  const targetUserDocRef = doc(usersCollection, targetUserId);
  let notificationType;

  if (type === 'follow') {
    batch.update(userDocRef, {
      following: arrayUnion(targetUserId),
      updatedAt: serverTimestamp()
    });
    batch.update(targetUserDocRef, {
      followers: arrayUnion(userId),
      updatedAt: serverTimestamp()
    });
    notificationType = 'follow';
  } else {
    batch.update(userDocRef, {
      following: arrayRemove(targetUserId),
      updatedAt: serverTimestamp()
    });
    batch.update(targetUserDocRef, {
      followers: arrayRemove(userId),
      updatedAt: serverTimestamp()
    });
    notificationType = 'unfollow';
  }

  await batch.commit();
  // Save notification
  // Create NotificationData object
  // Create NotificationData object with message

  const notificationData: NotificationData = {
    type: notificationType,
    fromUserId: userId,
    toUserId: targetUserId,
    message:
      notificationType === 'follow'
        ? `${userData.username} started following you.`
        : `${userData.username} stopped following you.`,
    timestamp: serverTimestamp()
  };

  // Call saveNotification with the correct parameters
  await saveNotification(notificationData, userId, undefined, targetUserId); // Pass targetUserId for follow/unfollow
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
    // Fetch user data
    const userDocRefs = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRefs);
    if (!userDoc.exists()) {
      console.error('User not found');
      return;
    }
    const userData = userDoc.data();
    const batch = writeBatch(db);

    const userStatsRef = doc(userStatsCollection(userId), 'stats');
    const tweetRef = doc(tweetsCollection, tweetId);
    let notificationType;

    if (type === 'like') {
      batch.update(tweetRef, {
        userLikes: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
      batch.update(userStatsRef, {
        likes: arrayUnion(tweetId),
        updatedAt: serverTimestamp()
      });
      notificationType = 'like';
    } else {
      batch.update(tweetRef, {
        userLikes: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });
      batch.update(userStatsRef, {
        likes: arrayRemove(tweetId),
        updatedAt: serverTimestamp()
      });
      notificationType = 'unlike';
    }

    await batch.commit();
    // Save notification
    // Create NotificationData object with message

    const notificationData: NotificationData = {
      type: notificationType,
      fromUserId: userId,
      toUserId: '',
      tweetId: tweetId,
      message:
        notificationType === 'like'
          ? `${userData.username} liked your diary.`
          : `${userData.username} disliked your diary.`,
      timestamp: serverTimestamp()
    };

    // Call saveNotification with the correct parameters
    await saveNotification(notificationData, userId, tweetId); // Pass tweetId for like/unlike
  };
}

// export async function manageLike(
//   type: 'like' | 'unlike',
//   userId: string,
//   tweetId: string
// ) {
//   return async (): Promise<void> => {
//     const batch = writeBatch(db);

//     const tweetRef = doc(tweetsCollection, tweetId);
//     const userStatsRef = doc(userStatsCollection(userId), 'stats');

//     // Fetch the tweet to get the createdBy (userID of the person who posted it)
//     const tweetDoc = await getDoc(tweetRef);
//     if (!tweetDoc.exists()) {
//       console.error('Tweet not found');
//       return;
//     }
//     const tweetData = tweetDoc.data();
//     const createdByUserId = tweetData.createdBy; // This is the user ID of the tweet's creator

//     if (type === 'like') {
//       batch.update(tweetRef, {
//         userLikes: arrayUnion(userId),
//         updatedAt: serverTimestamp()
//       });
//       batch.update(userStatsRef, {
//         likes: arrayUnion(tweetId),
//         updatedAt: serverTimestamp()
//       });
//     } else {
//       batch.update(tweetRef, {
//         userLikes: arrayRemove(userId),
//         updatedAt: serverTimestamp()
//       });
//       batch.update(userStatsRef, {
//         likes: arrayRemove(tweetId),
//         updatedAt: serverTimestamp()
//       });
//     }

//     await batch.commit();

//     // Save notification
//     const notificationData: NotificationData = {
//       type: type, // 'like' or 'unlike'
//       fromUserId: userId,
//       toUserId: createdByUserId,
//       timestamp: serverTimestamp() // You can remove this if it's set inside saveNotification

//       // timestamp is set inside saveNotification
//     };

//     // Call saveNotification with the correct parameters
//     await saveNotification(notificationData, userId);
//   };
// }

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
