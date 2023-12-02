import { MainLayout } from '@components/layout/main-layout';
import { ProtectedLayout, ChatLayout } from '@components/layout/common-layout'; // Update the import path accordingly
import { SEO } from '@components/common/seo';
import { MainContainer } from '@components/chat/main-container';
import { MainHeader } from '@components/chat/main-header';
import type { ReactElement, ReactNode } from 'react';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/context/web3-auth-context'; // replace with the actual path to your auth context
// import { useAuth } from '../lib/context/auth-context'; // replace with the actual path to your auth context
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  orderBy,
  doc,
  getFirestore,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { setDoc } from 'firebase/firestore';
import { getDoc, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { Loading } from '@components/ui/loading';
import useLongPress from '../lib/hooks/useLongPress'; // Make sure this path is correct
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const db = getFirestore();

type User = {
  id: any;
  name?: any;
  imgSrc?: any;
  photoURL?: any; // Add this line to include the photoURL property
  isPinned?: boolean;
  isMuted?: boolean;
  isDeleted?: boolean;
};
// Utility function to check if the device is mobile
// Improved Mobile Device Detection
function isMobileDevice() {
  return window.matchMedia('only screen and (max-width: 760px)').matches;
}
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
  const [chatStates, setChatStates] = useState(new Map());
  const [showActionBar, setShowActionBar] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);

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
      // let chatDoc = chatsSnapshot.docs.find((doc) => {
      //   const chatData = doc.data();
      //   // return (
      //   //   chatData.userIds.includes(user.id) &&
      //   //   chatData.userIds.includes(otherUserId)
      //   // );
      //   return (
      //     Array.isArray(chatData.userIds) &&
      //     chatData.userIds.includes(user?.id) &&
      //     chatData.userIds.includes(otherUserId)
      //   );
      // });
      let chatDoc = chatsSnapshot.docs.find((doc) => {
        const chatData = doc.data();
        console.log('chatData.userIds:', chatData.userIds); // Check the actual value
        console.log('user.id:', user?.id);
        console.log('otherUserId:', otherUserId);
        if (!Array.isArray(chatData.userIds) || !user?.id || !otherUserId) {
          console.error(
            'One of the required fields is undefined or not an array.'
          );
          return false;
        }
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
      console.error('Error in starting chat:', error);
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

    const trimmedMessage = message.trim();

    if (trimmedMessage) {
      try {
        await addDoc(collection(db, `chats/${chatId}/messages`), {
          text: trimmedMessage,
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
    return <Loading className='mt-5 w-full' />; // You can replace this with a proper loading component
  }

  type MainHeaderProps = {
    title: React.ReactNode;
    // ... other props
  };

  // State to determine if chat box should be shown
  const [showChatBox, setShowChatBox] = useState(false);

  const handleUserSelect = async (userId) => {
    console.log(`handleUserSelect called with userId: ${userId}`);

    if (!user || !user.id) {
      console.error('Authentication error: User is not defined.');
      return;
    }

    if (!userId) {
      console.error('User ID for the other user is not defined.');
      return;
    }

    try {
      const chatsCol = collection(db, 'chats');
      const chatsSnapshot = await getDocs(chatsCol);
      let chatDocRef;

      const chatDoc = chatsSnapshot.docs.find((doc) => {
        const chatData = doc.data();
        return (
          Array.isArray(chatData.userIds) &&
          chatData.userIds.includes(user.id) &&
          chatData.userIds.includes(userId)
        );
      });

      if (chatDoc) {
        chatDocRef = chatDoc.ref;
      } else {
        // Create a new chat document
        const newChatDocRef = doc(collection(db, 'chats'));
        await setDoc(newChatDocRef, {
          userIds: [user.id, userId],
          createdAt: new Date()
        });
        chatDocRef = newChatDocRef;
      }

      // Now fetch the chat user details
      const otherUserDoc = await getDoc(doc(db, `users/${userId}`));
      if (!otherUserDoc.exists()) {
        console.error('Other user document does not exist.');
        return;
      }

      setChatUser({ ...otherUserDoc.data(), id: otherUserDoc.id });
      setShowChatBox(true);
      router.push(`/chat/${chatDocRef.id}`);
    } catch (error) {
      console.error('Error handling user selection:', error);
    }
  };
  useEffect(() => {
    console.log(`showChatBox changed: ${showChatBox}`);
  }, [showChatBox]);

  const handleBackToUsers = () => {
    setShowChatBox(false);
  };

  const BackArrowIcon = () => <span>←</span>; // Replace this with your actual back arrow icon
  const fetchAndUpdateUsers = async () => {
    const userCol = collection(db, 'users');
    const userSnapshot = await getDocs(userCol);
    const userList = userSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id
    }));
    setUsers(userList); // Assuming setUsers is your state updating function
  };

  const [searchTerm, setSearchTerm] = useState('');
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to format the date

  // Custom styles for chat bubbles and the chat container
  // const chatBubbleStyles = (isCurrentUser: boolean) =>
  //   `max-w-xs md:max-w-md lg:max-w-lg break-words rounded-lg p-4 ${
  //     isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
  //   }`;
  // // Function to delete a chat
  // const deleteChat = async (chatId) => {
  //   if (!chatId) return;

  //   try {
  //     await deleteDoc(doc(db, 'chats', chatId));
  //     console.log(`Chat with ID ${chatId} deleted.`);
  //     // You may want to navigate the user away from the chat after deletion
  //   } catch (error) {
  //     console.error('Error deleting chat:', error);
  //   }
  // };

  // Function to pin a chat
  // Function to pin/unpin a chat

  // const togglePinChat = async (chatId) => {
  //   try {
  //     const chatRef = doc(db, 'chats', chatId);
  //     const chatDoc = await getDoc(chatRef);
  //     const isPinned = chatDoc.data()?.pinned || false;

  //     // Update Firestore
  //     await updateDoc(chatRef, { isPinned: !isPinned });

  //     // Update local state to reflect UI change
  //     setUsers((prevUsers) => {
  //       return [...prevUsers]
  //         .sort((a, b) => {
  //           if (b.isPinned && !a.isPinned) return 1;
  //           if (a.isPinned && !b.isPinned) return -1;
  //           return 0;
  //         });
  //     });

  //   } catch (error) {
  //     console.error('Error toggling pin:', error);
  //      // Provide user feedback
  //   toast.error('Error pinning chat');
  //   }
  // };
  const togglePinChat = async (chatId) => {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      const isPinned = chatDoc.data()?.isPinned || false;

      await updateDoc(doc(db, 'users', chatId), { isPinned: !isPinned });
      console.log(`Chat ${chatId} pin status updated to: ${!isPinned}`);

      // Fetch and update the state with the latest data
      fetchAndUpdateUsers(); // Make sure this function re-fetches users and updates the state

      // Update local state to reflect UI change
      setUsers((prevUsers) => {
        // Apply the pinning change to the specific user
        const updatedUsers = prevUsers.map((chat) =>
          chat.id === chatId ? { ...chat, isPinned: !isPinned } : chat
        );
        // Sort users to move pinned chats to the top
        return updatedUsers.sort((a, b) => {
          if (a.isPinned && !b.isPinned) {
            return -1;
          }
          if (!a.isPinned && b.isPinned) {
            return 1;
          }
          return 0;
        });
      });

      // toast.success('Chat pin status updated successfully');
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast.error('Error pinning chat');
    }
  };

  // const toggleMuteChat = async (chatId) => {
  //   try {
  //     const chatRef = doc(db, 'chats', chatId);
  //     const chatDoc = await getDoc(chatRef);
  //     const isMuted = chatDoc.data()?.muted || false;

  //     await updateDoc(chatRef, { muted: !isMuted });

  //     // Update local state
  //     setUsers((prevUsers) =>
  //       prevUsers.map((user) =>
  //         user.id === chatId ? { ...user, isMuted: !isMuted } : user
  //       )
  //     );
  //   } catch (error) {
  //     console.error('Error toggling mute:', error);
  //   }
  // };
  const toggleMuteChat = async (chatId) => {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      const isMuted = chatDoc.data()?.isMuted || false;

      // Update Firestore
      await updateDoc(doc(db, 'users', chatId), { isMuted: !isMuted });

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((chat) =>
          chat.id === chatId ? { ...chat, isMuted: !isMuted } : chat
        )
      );

      // toast.success('Chat mute status updated successfully');
    } catch (error) {
      console.error('Error toggling mute:', error);
      toast.error('Error muting chat');
    }
  };

  // const deleteChat = async (chatId) => {
  //   try {
  //     const chatRef = doc(db, 'chats', chatId);
  //     await deleteDoc(chatRef);

  //     // Update local state to mark the chat as deleted
  //     setUsers((prevUsers) =>
  //       prevUsers.map((user) =>
  //         user.id === chatId ? { ...user, isDeleted: true } : user
  //       )
  //     );
  //   } catch (error) {
  //     console.error('Error deleting chat:', error);
  //   }
  // };

  const deleteChat = async (chatId) => {
    try {
      const chatRef = doc(db, 'chats', chatId);

      // Update Firestore
      await updateDoc(doc(db, 'users', chatId), { isDeleted: true });

      // Update local state to remove the chat
      setUsers((prevUsers) => prevUsers.filter((chat) => chat.id !== chatId));

      toast.success('Chat deleted successfully');
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Error deleting chat');
    }
  };

  const sortUsers = (users) => {
    return users.sort((a, b) => {
      return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
    });
  };

  // Long press handlers
  // const onLongPress = (event: Event) => {
  //   event.preventDefault();
  //   // Show chat options here (e.g., using a modal or context menu)
  //   console.log('Long press detected on chat', chatId);
  //   // You would show options to pin, mute, or delete the chat
  // };

  const onClick = () => {
    // Handle the click event
    console.log('Clicked on chat', chatId);
  };

  // const longPressEvent = useLongPress(onLongPress, onClick);

  // This function will update the local state for a specific chat ID.
  const updateChatState = (chatId, updates) => {
    setChatStates((prevStates) => {
      const newState = new Map(prevStates);
      newState.set(chatId, { ...(newState.get(chatId) || {}), ...updates });
      return newState;
    });
  };

  // Chat action functions
  const handlePinChat = async (chatIdToPin) => {
    if (!chatIdToPin) {
      console.error('No chat ID provided for pinning.');
      return;
    }
    const currentChatState = chatStates.get(chatId) || {};
    const isPinned = currentChatState.isPinned || false;
    updateChatState(chatId, { isPinned: !isPinned });
    const currentChat = users.find((user) => user.id === chatIdToPin);
    if (!currentChat) return;

    const newStatus = !currentChat.isPinned;
    updateChatState(chatIdToPin, { isPinned: newStatus });
    // Immediately update UI after pinning
    setUsers((prevUsers) => {
      return prevUsers
        .map((user) => {
          if (user.id === chatIdToPin) {
            return { ...user, isPinned: !user.isPinned };
          }
          return user;
        })
        .sort((a, b) => {
          return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
        });
    });
    await togglePinChat(chatIdToPin);
    toast.success('Chat pinned successfully');
  };

  const handleMuteChat = async (chatIdToMute) => {
    if (!chatIdToMute) {
      console.error('No chat ID provided for muting.');
      return;
    }
    const currentChatState = chatStates.get(chatId) || {};
    const isMuted = currentChatState.isMuted || false;
    updateChatState(chatId, { isMuted: !isMuted });
    const currentChat = users.find((user) => user.id === chatIdToMute);
    if (!currentChat) return;

    const newStatus = !currentChat.isMuted;

    await toggleMuteChat(chatIdToMute); // Assuming this updates Firestore

    // After muting, update and sort the user list
    setUsers((prevUsers) => {
      const updatedUsers = prevUsers.map((chat) =>
        chat.id === chatIdToMute ? { ...chat, isMuted: newStatus } : chat
      );
      return sortUsers(updatedUsers); // Sort the updated user list
    });
  };

  const handleDeleteChat = async (chatIdToDelete) => {
    if (!chatIdToDelete) {
      console.error('No chat ID provided for deleting.');
      return;
    }

    await deleteChat(chatIdToDelete); // Assuming this updates Firestore
    updateChatState(chatId, { isDeleted: true });

    // After deleting, update and sort the user list
    setUsers((prevUsers) => {
      const updatedUsers = prevUsers.filter(
        (chat) => chat.id !== chatIdToDelete
      );
      return sortUsers(updatedUsers); // Sort the updated user list
    });
  };

  // Add this function within your Chat component
  const onChatAction = (action: 'pin' | 'mute' | 'delete', chatId: string) => {
    switch (action) {
      case 'pin':
        togglePinChat(chatId);
        break;
      case 'mute':
        toggleMuteChat(chatId);
        break;
      case 'delete':
        deleteChat(chatId);
        break;
      default:
        console.error('Invalid action');
    }
  };

  // Context Menu Component
  // const ChatContextMenu = ({ x, y, onPin, onMute, onDelete, visible }) => {
  //   if (!visible) return null;

  //   return (
  //     <div style={{ position: 'fixed', left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}>
  //       <Menu
  //        menuButton={
  //         <MenuButton className='context-menu-button'></MenuButton>
  //       }
  //       transition
  //       >
  //         <MenuItem onClick={() => onPin()}>Pin</MenuItem>
  //         <MenuItem onClick={() => onMute()}>Mute</MenuItem>
  //         <MenuItem onClick={() => onDelete()}>Delete</MenuItem>
  //       </Menu>
  //     </div>
  //   );
  // };

  const ChatContextMenu = ({ x, y, onPin, onMute, onDelete, visible }) => {
    if (!visible) return null;

    const handleClick = (action, e) => {
      e.stopPropagation(); // Prevent event from bubbling up
      action();
      hideContextMenu(); // Hide context menu after action
    };

    return (
      <div
        style={{
          position: 'fixed',
          left: `${x}px`,
          top: `${y}px`,
          zIndex: 1000
        }}
      >
        <ul
          style={{
            listStyleType: 'none',
            padding: '10px',
            backgroundColor: '#111827',
            borderRadius: '5px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          <li
            style={{ padding: '5px' }}
            onClick={(e) => handleClick(() => onPin(), e)}
          >
            Pin
          </li>
          <li
            style={{ padding: '5px' }}
            onClick={(e) => handleClick(() => onMute(), e)}
          >
            Mute
          </li>
          <li
            style={{ padding: '5px' }}
            onClick={(e) => handleClick(() => onDelete(), e)}
          >
            Delete
          </li>
        </ul>
      </div>
    );
  };

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    chatId: ''
  });
  const showContextMenu = (e, chatId) => {
    if (!isMobileDevice()) {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        chatId: chatId
      });
    }
  };

  // Hide context menu when clicking anywhere in the document
  useEffect(() => {
    const hideMenu = () => setContextMenu({ ...contextMenu, visible: false });
    document.addEventListener('click', hideMenu);
    return () => document.removeEventListener('click', hideMenu);
  }, [contextMenu]); // Include contextMenu in dependency array

  const hideContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };
  const onLongPress = (chatId) => {
    setShowActionBar(true);
    setContextMenu({ ...contextMenu, chatId });
  };
  // Define the onLongPressMobile handler
  const onLongPressMobile = (chatId) => {
    setSelectedChatId(chatId);
    setShowActionBar(true);
  };

  // Modified Long Press Event
  // In Chat component
  // Create the longPressEvent hook instance outside of the component rendering
  const longPressEvent = useLongPress(
    onLongPressMobile, // Long press handler for mobile
    onClick, // Click handler (common for mobile and desktop)
    { delay: 500 }
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userCol = collection(db, 'users');
        const userSnapshot = await getDocs(userCol);
        const userList = userSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id
        }));
        const sortedUsers = sortUsers(userList); // Sort users after fetching
        setUsers(sortedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [user]); // Dependency array

  const TopActionBar = ({ onPin, onMute, onDelete }) => {
    return (
      <div className='fixed bottom-10 left-1/2 z-50 flex -translate-x-1/2 transform items-center justify-around rounded bg-gray-800 p-2 shadow-md'>
        <button onClick={onPin} className='focus:outline-none'>
          <img
            src='https://cdn-icons-png.flaticon.com/512/1828/1828911.png'
            alt='Pin'
            className='h-6 w-6'
          />
        </button>
        <button onClick={onMute} className='focus:outline-none'>
          <img
            src='https://cdn-icons-png.flaticon.com/512/1828/1828970.png'
            alt='Mute'
            className='h-6 w-6'
          />
        </button>
        <button onClick={onDelete} className='focus:outline-none'>
          <img
            src='https://cdn-icons-png.flaticon.com/512/1214/1214428.png'
            alt='Delete'
            className='h-6 w-6'
          />
        </button>
      </div>
    );
  };

  return (
    <>
      <SEO title='Chat / Degen Diaries' />
      <ToastContainer position='bottom-center' autoClose={5000} />

      <MainHeader
        useMobileSidebar
        title={
          <>
            {showChatBox ? (
              <button
                onClick={handleBackToUsers}
                className='text-blue-500 hover:underline'
              >
                <BackArrowIcon />
              </button>
            ) : (
              <>
                {/* Go to the{' '} */}
                <Link href='/home'>
                  <a className='text-blue-500 hover:underline'>←</a>
                </Link>
              </>
            )}
          </>
        }
        className='flex items-center justify-between border-b border-gray-700 bg-gray-800 p-4'
      />

      <div className='flex h-screen flex-col bg-gray-900 text-gray-100 md:flex-row'>
        {/* Mobile header with back button and chat user info */}
        {showChatBox && chatUser && (
          <div className='sticky top-0 z-10 flex w-full items-center justify-between bg-gray-900 p-4 shadow-md md:hidden'>
            <button
              onClick={handleBackToUsers}
              className='rounded-full p-2 text-blue-500 hover:bg-gray-700'
            >
              {/* SVG for Back Icon */}
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 19l-7-7 7-7'
                />
              </svg>
            </button>
            <div className='flex items-center'>
              <img
                src={chatUser.photoURL || '/default-avatar.png'}
                className='h-10 w-10 rounded-full object-cover'
                alt={`${chatUser.name}'s avatar`}
              />
              <span className='ml-3 font-semibold'>{chatUser.name}</span>
            </div>
            <div className='w-10' /> {/* Spacer div for centering the title */}
          </div>
        )}
        {showActionBar && isMobileDevice() && (
          <TopActionBar
            onPin={() => handlePinChat(selectedChatId)}
            onMute={() => handleMuteChat(selectedChatId)}
            onDelete={() => handleDeleteChat(selectedChatId)}
          />
        )}

        {/* Chat List */}
        {!showChatBox && (
          <div className='flex h-full w-full flex-col overflow-y-auto border-r border-gray-700 p-4 md:w-1/4'>
            {users.map((userDetail, index) => {
              const chatState = chatStates.get(userDetail.id) || {};
              if (chatState.isDeleted) return null; // Skip rendering deleted chats

              return (
                <div
                  key={userDetail.id}
                  className={`flex cursor-pointer items-center space-x-3 px-2 py-3 ${
                    selectedChatId === userDetail.id
                      ? 'bg-blue-200'
                      : 'bg-gray-700'
                  } border-b border-gray-700`}
                  onClick={() => handleUserSelect(userDetail.id)}
                  onContextMenu={(e) => showContextMenu(e, userDetail.id)}
                  {...longPressEvent(userDetail.id)} // Apply long press event handlers here
                >
                  <img
                    src={
                      userDetail?.photoURL ||
                      'https://source.unsplash.com/random/600x600'
                    }
                    className='non-selectable h-12 w-12 rounded-full object-cover'
                    alt='User Avatar'
                  />

                  <div className='non-selectable text-left font-semibold text-gray-300'>
                    {userDetail?.name}
                  </div>
                  {/* Mute Icon */}
                  {/* Pin Icon */}
                  {userDetail.isPinned && (
                    <span className='pin-icon non-selectable'>📌</span>
                  )}
                  {userDetail.isMuted && (
                    <span className='mute-icon non-selectable'>🔇</span>
                  )}
                  {/* {userDetail.isMuted && <span className='mute-icon'>🔇</span>} */}
                  {!isMobileDevice() && (
                    <ChatContextMenu
                      x={contextMenu.x}
                      y={contextMenu.y}
                      visible={contextMenu.visible}
                      onPin={() => handlePinChat(contextMenu.chatId)}
                      onMute={() => handleMuteChat(contextMenu.chatId)}
                      onDelete={() => handleDeleteChat(contextMenu.chatId)}
                    />
                  )}

                  {/* <div className='chat-actions'>
                  <button
                    onClick={() => togglePinChat(userDetail.id)}
                    title='Pin/Unpin Chat'
                  >
                    📌
                  </button>
                  <button
                    onClick={() => toggleMuteChat(userDetail.id)}
                    title='Mute/Unmute Chat'
                  >
                    🔇
                  </button>
                  <button
                    onClick={() => deleteChat(userDetail.id)}
                    title='Delete Chat'
                  >
                    🗑️
                  </button>
                </div> */}
                </div>
              );
            })}
          </div>
        )}

        {/* Messages */}
        {showChatBox && (
          <div className='flex h-full w-full flex-col justify-between px-5 md:h-auto'>
            <div className='mt-5 flex-grow overflow-y-auto pb-16'>
              <div className='mb-4 text-center text-xl font-bold'>
                {chatUser?.name}{' '}
                {/* Displaying the name of the user you're chatting with */}
              </div>
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
            {/* Message input */}
            <div className='flex w-full items-center border-t border-gray-700 p-4'>
              <input
                className='w-full rounded-full bg-gray-700 p-2 text-sm text-white placeholder-gray-400 focus:outline-none'
                type='text'
                placeholder='Type your message here...'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={handleSendMessage}
                className='ml-4 rounded-full bg-blue-500 p-2 text-white hover:bg-blue-600 focus:outline-none'
              >
                {/* SVG for Send Icon */}
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 4l16 8m0 0l-16 8m16-8H4'
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
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
