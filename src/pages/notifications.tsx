// import React, { useState, useEffect } from 'react';
// import {
//   collection,
//   query,
//   where,
//   onSnapshot,
//   getFirestore,
//   getDoc,
//   deleteDoc,
//   doc
// } from 'firebase/firestore'; // Import Firestore functions
// import { useAuth } from '../lib/context/web3-auth-context';
// import { Loading } from '@components/ui/loading';
// import { SEO } from '@components/common/seo';
// import { MainHeader } from '@components/home/main-header';
// import { MainContainer } from '@components/home/main-container';
// import { formatDistanceToNow } from 'date-fns';
// import { AiOutlineLike, AiOutlineRetweet } from 'react-icons/ai'; // Example icons
// import { BiComment } from 'react-icons/bi'; // More icons as needed
// import type { ReactElement, ReactNode } from 'react';
// import { HomeLayout, ProtectedLayout } from '@components/layout/common-layout';
// import { MainLayout } from '@components/layout/main-layout';
// import { RiUserFollowLine } from "react-icons/ri";
// import { RiUserUnfollowLine } from "react-icons/ri";
// import { LuHeart } from "react-icons/lu";
// import { LuHeartCrack } from "react-icons/lu";

// export type Notification = {
//   id: any;
//   message: any;
//   createdAt: any;
//   actionLink?: any;
//   actionText?: any;
//   type: any; // Add this line
//   username: any;
// };

// const db = getFirestore();

// export default function Notifications(): JSX.Element {
//   const { user } = useAuth();
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   // useEffect(() => {
//   //   if (user) {
//   //     const notificationsRef = collection(db, 'notifications');
//   //     const q = query(notificationsRef, where('userId', '==', user.id));
//   //     const unsubscribe = onSnapshot(q, async (snapshot) => {
//   //       const notificationsData = await Promise.all(
//   //         snapshot.docs.map(async (notificationDoc) => {
//   //           const data = notificationDoc.data();
//   //           const userDocRef = doc(db, 'users', data.userId);
//   //           const userDoc = await getDoc(userDocRef);
//   //           const username = userDoc.exists()
//   //             ? userDoc.data().username
//   //             : 'Unknown User';

//   //           // Extract the message without the user ID
//   //           const message = data.message.replace(
//   //             /^.*liked your tweet\./,
//   //             'liked your tweet.'
//   //           );

//   //           return {
//   //             id: notificationDoc.id,
//   //             ...data,
//   //             username,
//   //             message, // Use the extracted message here
//   //             createdAt: data.createdAt.toDate()
//   //           };
//   //         })
//   //       );
//   //       setNotifications(notificationsData);
//   //       setLoading(false);
//   //     });

//   //     return () => unsubscribe();
//   //   }
//   // }, [user]);

//   useEffect(() => {
//     if (user) {
//       console.log('Checking notifications for user ID:', user.id);
//       const notificationsRef = collection(db, 'notifications');

//       // Get all notifications where the current user is the target
//       const q = query(notificationsRef, where('toUserId', '==', user.id));

//       const unsubscribe = onSnapshot(q, (snapshot) => {
//         const notificationsData = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//           createdAt: doc.data().timestamp.toDate()
//         }));

//         console.log('Processed notifications:', notificationsData);
//         setNotifications(notificationsData);
//         setLoading(false);
//       }, (error) => {
//         console.error('Error fetching notifications:', error);
//         setLoading(false);
//       });

//       return () => unsubscribe();
//     }
//   }, [user]);

//   const getIconForNotification = (type: string) => {
//     switch (type) {
//       case 'like':
//         return <LuHeart />;
//       case 'retweet':
//         return <AiOutlineRetweet />;
//       case 'comment':
//         return <BiComment />;
//       case 'unlike':
//         return <LuHeartCrack />;
//       case 'follow':
//         return <RiUserFollowLine />;
//       case 'unfollow':
//         return <RiUserUnfollowLine />;
//       // Add more cases as needed
//       default:
//         return null;
//     }
//   };

//   const handleDeleteNotification = async (notificationId) => {
//     try {
//       const notificationDocRef = doc(db, 'notifications', notificationId);
//       await deleteDoc(notificationDocRef);
//     } catch (error) {
//       console.error('Error deleting notification: ', error);
//     }
//   };

//   if (loading) {
//     return <Loading />;
//   }

//   return (
//     <>
//       <MainContainer>
//         <SEO title='Notifications / Degen Diaries' />
//         <MainHeader>
//           <div className='flex flex-col'>
//             <h2 className='text-xl font-bold'>Notifications</h2>
//             <p className='text-xs text-light-secondary dark:text-dark-secondary'>
//               @{user?.username}
//             </p>
//           </div>
//         </MainHeader>
//         {notifications.length > 0 ? (
//           <div className='flex flex-col space-y-4 p-4'>
//             {notifications.map((notification) => (
//               <div
//                 key={notification.id}
//                 className='flex items-start space-x-4 rounded-lg bg-gray-700 p-4 shadow-lg'
//               >
//                 <div className='mt-1'>
//                   {getIconForNotification(notification.type)}
//                 </div>
//                 <div className='flex-grow'>
//                   <p className='text-sm'>
//                     {notification.senderName} @{notification.message}
//                   </p>
//                   <div className='mt-2 flex items-center justify-between text-xs'>
//                     <span>
//                       {formatDistanceToNow(notification.createdAt, {
//                         addSuffix: true
//                       })}
//                     </span>
//                     <div className='flex items-center'>
//                       {notification.actionLink && (
//                         <a
//                           href={notification.actionLink}
//                           className='mr-2 text-blue-500 hover:underline'
//                         >
//                           {notification.actionText || 'View'}
//                         </a>
//                       )}
//                       <button
//                         onClick={() =>
//                           handleDeleteNotification(notification.id)
//                         }
//                         className='text-red-500 hover:underline'
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className='flex justify-center p-4 text-center'>
//             <span>No notifications found. Stay active to receive updates!</span>
//           </div>
//         )}
//       </MainContainer>
//     </>
//   );
// }

// Notifications.getLayout = (page: ReactElement): ReactNode => (
//   <ProtectedLayout>
//     <MainLayout>
//       <HomeLayout>{page}</HomeLayout>
//     </MainLayout>
//   </ProtectedLayout>
// );

import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  getFirestore,
  doc,
  writeBatch
} from 'firebase/firestore';
import { useAuth } from '../lib/context/web3-auth-context';
import { Loading } from '@components/ui/loading';
import { SEO } from '@components/common/seo';
import { MainHeader } from '@components/home/main-header';
import { MainContainer } from '@components/home/main-container';
import { formatDistanceToNow } from 'date-fns';
// import { AiOutlineLike, AiOutlineRetweet, AiOutlineUser } from 'react-icons/ai';
// import { BiComment } from 'react-icons/bi';
// import { RiUserFollowLine, RiUserUnfollowLine } from 'react-icons/ri';
import type { ReactElement, ReactNode } from 'react';
import { HomeLayout, ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { RiUserFollowLine } from 'react-icons/ri';
import { RiUserUnfollowLine } from 'react-icons/ri';
import { LuHeart } from 'react-icons/lu';
import { LuHeartCrack } from 'react-icons/lu';
import { IoHeartDislikeOutline } from 'react-icons/io5';

export type Notification = {
  id: string;
  message: string;
  createdAt: Date;
  senderName: string;
  senderPhotoURL: string;
  type: string;
};

const db = getFirestore();

export default function Notifications(): JSX.Element {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      const notificationsRef = collection(db, 'notifications');
      const q = query(notificationsRef, where('toUserId', '==', user.id));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const notificationsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().timestamp.toDate()
          }));

          setNotifications(notificationsData);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching notifications:', error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    }
  }, [user]);

  const handleMarkAsRead = async () => {
    const batch = writeBatch(db);
    notifications.forEach((notification) => {
      const notificationRef = doc(db, 'notifications', notification.id);
      batch.delete(notificationRef);
    });

    try {
      await batch.commit();
      setNotifications([]);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const getIconForNotification = (type: string) => {
    switch (type) {
      case 'like':
        return <LuHeart />;
      // case 'retweet': return <AiOutlineRetweet />;
      // case 'comment': return <BiComment />;
      case 'unlike':
        return <IoHeartDislikeOutline />;
      case 'follow':
        return <RiUserFollowLine />;
      case 'unfollow':
        return <RiUserUnfollowLine />;
      default:
        return null;
    }
  };

  const customMessage = (notification) => {
    switch (notification.type) {
      case 'like':
        return `@${notification.senderName} liked your Diary.`;
      case 'follow':
        return `@${notification.senderName} started following you on Degen Diaries.`;
      case 'unlike':
        return `@${notification.senderName} disliked your Diary.`;
      case 'unfollow':
        return `@${notification.senderName} stopped following you on Degen Diaries.`;
      default:
        return notification.message;
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <MainContainer>
        <SEO title='Notifications / Degen Diaries' />
        <MainHeader>
          <div className='flex flex-col'>
            <h2 className='text-xl font-bold'>Notifications</h2>
            <p className='text-xs text-light-secondary dark:text-dark-secondary'>
              @{user?.username}
            </p>
          </div>
        </MainHeader>
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAsRead}
            className='text-blue-500 hover:underline'
          >
            Mark all as read
          </button>
        )}
        {notifications.length > 0 ? (
          <div className='flex flex-col space-y-4 p-4'>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className='flex items-start space-x-4 rounded-lg bg-gray-700 p-4 shadow-lg'
              >
                <img
                  src={notification.senderPhotoURL}
                  alt={notification.senderName}
                  className='h-10 w-10 rounded-full'
                />
                <div className='flex-grow'>
                  <p className='text-sm'>{customMessage(notification)}</p>
                  <div className='mt-2 flex items-center justify-between text-xs'>
                    <span>
                      {formatDistanceToNow(notification.createdAt, {
                        addSuffix: true
                      })}
                    </span>
                    <div className='flex items-center text-lg'>
                      {getIconForNotification(notification.type)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex justify-center p-4 text-center'>
            <span>No notifications found. Stay active to receive updates!</span>
          </div>
        )}
      </MainContainer>
    </>
  );
}

Notifications.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <MainLayout>
      <HomeLayout>{page}</HomeLayout>
    </MainLayout>
  </ProtectedLayout>
);
