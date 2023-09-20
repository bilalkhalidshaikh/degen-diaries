import { MainLayout } from '@components/layout/main-layout';
import { ProtectedLayout, ChatLayout } from '@components/layout/common-layout'; // Update the import path accordingly
import { SEO } from '@components/common/seo';
import { MainContainer } from '@components/chat/main-container';
import { MainHeader } from '@components/chat/main-header';
import type { ReactElement, ReactNode } from 'react';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/context/web3-auth-context'; // replace with the actual path to your auth context
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  orderBy,
  doc,
  getFirestore
} from 'firebase/firestore';
import { setDoc } from 'firebase/firestore';
import { getDoc, getDocs } from 'firebase/firestore';

import Link from 'next/link';

const db = getFirestore();

type User = {
  id: any;
  name?: any;
  imgSrc?: any;
  photoURL?: any; // Add this line to include the photoURL property
};

export default function Chat({ chatId }: { chatId: string }): JSX.Element {
  const router = useRouter();
  // const { id } = router.query; // Remove this line
  const { user } = useAuth(); // Get the authenticated user from your auth context
  const [messages, setMessages] = useState<
    { text: string; sender: string; createdAt: Date }[]
  >([]);
  const [message, setMessage] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [chatUser, setChatUser] = useState<User | null>(null);

  useEffect(() => {
    if (!chatId && users.length > 0) {
      startNewChat();
    }
  }, [chatId, users]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userCol = collection(db, 'users');
        const userSnapshot = await getDocs(userCol);
        const userList = userSnapshot.docs
          .map((doc) => ({ ...doc.data(), id: doc.id }))
          .filter((u) => u.id !== user?.id);
        setUsers(userList);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [user]);

  useEffect(() => {
    if (chatId) {
      // Fetch the chat details to get the user IDs involved in the chat
      const fetchChatDetails = async () => {
        try {
          const chatDoc = await getDoc(doc(db, `chats/${chatId}`)); // Use getDoc here
          const chatData = chatDoc.data();
          if (chatData) {
            const otherUserId = chatData.userIds.find(
              (id: string) => id !== user?.id
            );
            if (otherUserId) {
              const otherUserDoc = await getDoc(
                doc(db, `users/${otherUserId}`)
              ); // Use getDoc here
              setChatUser({ ...otherUserDoc.data(), id: otherUserDoc.id });
            }
          }
        } catch (error) {
          console.error('Error fetching chat details:', error);
        }
      };

      fetchChatDetails();
    }
  }, [chatId, user]);

  useEffect(() => {
    if (chatId) {
      const q = query(
        collection(db, `chats/${chatId}/messages`),
        orderBy('createdAt')
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        let fetchedMessages = [];
        querySnapshot.forEach((doc) => {
          fetchedMessages.push(doc.data());
        });
        setMessages(fetchedMessages);
      });

      return () => unsubscribe();
    }
  }, [chatId]);

  const startChat = async (otherUserId) => {
    try {
      // Check if a chat already exists between the two users
      const chatsCol = collection(db, 'chats');
      const chatsSnapshot = await getDocs(chatsCol);
      let chatDoc = chatsSnapshot.docs.find((doc) => {
        const chatData = doc.data();
        return (
          chatData.userIds.includes(user.id) &&
          chatData.userIds.includes(otherUserId)
        );
      });

      // If a chat doesn't exist, create a new one
      if (!chatDoc) {
        const newChatData = {
          userIds: [user.id, otherUserId],
          createdAt: new Date()
        };
        const newChatDocRef = doc(collection(db, 'chats'));
        await setDoc(newChatDocRef, newChatData);
        chatDoc = await getDoc(newChatDocRef); // Get the QueryDocumentSnapshot of the new chat document
      }

      // Navigate to the chat
      router.push(`/chat/${chatDoc.id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const startNewChat = async () => {
    if (users.length > 0) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      startChat(randomUser.id);
    } else {
      console.log('No users available to start a chat');
    }
  };

  const handleSendMessage = async () => {
    if (!chatId || !user) {
      console.log('Chat ID or user information is missing');
      return;
    }

    if (message.trim()) {
      try {
        await addDoc(collection(db, `chats/${chatId}/messages`), {
          text: message,
          sender: user.id, // Use the user's wallet address as the sender ID
          createdAt: new Date()
        });
        setMessage('');
      } catch (e) {
        console.error('Error adding document: ', e);
      }
    } else {
      console.log('Please type something to send');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!chatId) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  type MainHeaderProps = {
    title: React.ReactNode;
    // ... other props
  };

  return (
    // <MainContainer className='min-h-screen bg-gray-900 text-gray-100'>
    <>
      <SEO title='Chat / Degen Diaries' />
      <MainHeader
        useMobileSidebar
        title={
          <>
            Go to the{' '}
            <Link href='/home'>
              <a>Home</a>
            </Link>
          </>
        }
        className='flex items-center justify-between border-b border-gray-700 bg-gray-800 p-4'
      >
        {/* Removed the "Start Random Chat" button */}
      </MainHeader>

      <div className='flex min-h-screen flex-col bg-gray-900 text-gray-100'>
        {/* header */}
        <div className='flex items-center justify-between border-b border-gray-700 bg-gray-800 px-5 py-5'>
          <div className='text-2xl font-semibold'>
            Live Talk with {chatId || chatUser?.id}
          </div>
          <img
            src={
              user?.photoURL ||
              chatUser?.photoURL ||
              'https://source.unsplash.com/random/600x600'
            }
            className='h-8 w-8 rounded-full object-cover'
            alt='User Avatar'
          />
        </div>
        {/* end header */}
        {/* Chatting */}
        <div className='flex flex-grow flex-row bg-gray-800'>
          {/* chat list */}
          <div className='flex w-1/6 flex-col overflow-y-auto border-r border-gray-700 p-4'>
            {/* user list */}
            <div className='flex flex-col space-y-4'>
              {users.map((userDetail, index) => (
                <div
                  key={index}
                  className={`flex cursor-pointer flex-row items-center space-x-3 border-b border-gray-700 px-2 py-3 pb-2 ${
                    chatUser?.id === userDetail.id ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => startChat(userDetail.id)}
                >
                  <img
                    src={
                      userDetail?.photoURL ||
                      'https://source.unsplash.com/random/600x600'
                    }
                    className='h-12 w-12 rounded-full object-cover'
                    alt='User Avatar'
                  />
                  <div className='font-semibold text-gray-300'>
                    {userDetail?.name}
                  </div>
                </div>
              ))}
            </div>
            {/* end user list */}
          </div>
          {/* end chat list */}
          {/* message */}
          <div className='flex w-5/6 flex-col justify-between px-5'>
            <div className='mt-5 flex flex-grow flex-col overflow-y-auto'>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.sender === user?.id ? 'justify-end' : 'justify-start'
                  } mb-4`}
                >
                  <div
                    className={`mr-2 rounded-xl px-4 py-3 ${
                      msg.sender === user?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <img
                    src={
                      msg.sender === user?.id
                        ? user?.photoURL
                        : chatUser?.photoURL ||
                          'https://source.unsplash.com/random/600x600'
                    }
                    className='h-8 w-8 rounded-full object-cover'
                    alt=''
                  />
                </div>
              ))}
            </div>
            <div className='flex items-center py-5'>
              <input
                className='w-full rounded-xl bg-gray-700 px-3 py-5 text-gray-300'
                type='text'
                placeholder='type your message here...'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={handleSendMessage}
                className='ml-3 rounded-lg bg-blue-600 px-4 py-2 text-white'
              >
                Send
              </button>
            </div>
          </div>
          {/* end message */}
        </div>
      </div>
      {/* </MainContainer> */}
    </>
  );
}

Chat.getLayout = (page: ReactElement): ReactNode => (
  <>
    <ProtectedLayout>
      <MainLayout>
        <ChatLayout>{page}</ChatLayout>
      </MainLayout>
    </ProtectedLayout>
  </>
);
