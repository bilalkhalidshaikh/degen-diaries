import { MainLayout } from '@components/layout/main-layout';
import {
  ProtectedLayout,
  ChatLayout,
  HomeLayout
} from '@components/layout/common-layout'; // Update the import path accordingly
import { SEO } from '@components/common/seo';
import { MainContainer } from '@components/chat/main-container';
import { MainHeader } from '@components/chat/main-header';
import type { ReactElement, ReactNode } from 'react';
import React, { useState, useEffect, useCallback } from 'react';
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
  getDocs,
  updateDoc,
  setDoc,
  getDoc,
  deleteDoc
} from 'firebase/firestore';

import Link from 'next/link';
import { Loading } from '@components/ui/loading';
import '@szhsin/react-menu/dist/index.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from '@mui/joy/Button';
import IconButton from '@mui/joy/IconButton';
import PushPinIcon from '@mui/icons-material/PushPin';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { RiUnpinFill } from 'react-icons/ri';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Avatar from '@mui/joy/Avatar';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Input from '@mui/material/Input';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PhoneIcon from '@mui/icons-material/Phone';
import VideoCamIcon from '@mui/icons-material/Videocam'; // Note: 'VideoCamIcon' should be 'Videocam'
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import cn from 'clsx';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import EmojiPicker from 'emoji-picker-react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MicIcon from '@mui/icons-material/Mic';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import back from '../../public/back.png';
import debounce from 'lodash.debounce';
import { StatsEmpty } from '@components/tweet/stats-empty';

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

// Moved outside the component to avoid re-creation on every render
// Utility function to get filtered and sorted chats
const getFilteredAndSortedChats = (allChats, userChatsData) => {
  return allChats
    .filter((chat) => {
      const chatState = userChatsData.get(chat.id);
      return chatState ? !chatState.isDeleted : true;
    })
    .sort((a, b) => {
      const aIsPinned = userChatsData.get(a.id)?.isPinned || false;
      const bIsPinned = userChatsData.get(b.id)?.isPinned || false;
      return bIsPinned - aIsPinned;
    });
};

// Function to get user chat states
const fetchUserChatStates = async (userId) => {
  const userChatsRef = collection(db, 'users', userId, 'userChats');
  const userChatSnapshot = await getDocs(userChatsRef);
  const chatStates = new Map();
  userChatSnapshot.forEach((doc) => {
    chatStates.set(doc.id, doc.data());
  });
  return chatStates;
};

// Function to fetch users
const fetchUsers = async (currentUser) => {
  const userCol = collection(db, 'users');
  const userSnapshot = await getDocs(userCol);
  return userSnapshot.docs
    .map((doc) => ({ ...doc.data(), id: doc.id }))
    .filter((user) => user.id !== currentUser?.id);
};

export default function Chat({ chatId }: { chatId: string }): JSX.Element {
  const router = useRouter();
  // const { id } = router.query; // Remove this line
  const { user } = useAuth(); // Get the authenticated user from your auth context
  const [messages, setMessages] = useState<
    { text: string; sender: string; createdAt: Date }[]
  >([]);
  // const [message, setMessage] = useState<string>('');

  const [message, setMessage] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [chatUser, setChatUser] = useState<User | null>(null);
  const [chatStates, setChatStates] = useState(new Map());
  const [showActionBar, setShowActionBar] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [recipientToken, setRecipientToken] = useState(null); // State to store the recipient's FCM token
  const [showOptionsMenu, setShowOptionsMenu] = useState(null);
  // State for managing search bar visibility
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [displayedUsers, setDisplayedUsers] = useState<User[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // New State to manage showing the options menu
  const [showOptions, setShowOptions] = useState(false);
  // New State to manage showing the feature header
  const [showFeatureHeader, setShowFeatureHeader] = useState(false);
  // State to manage the display of the feature header for an individual user
  const [featureHeaderUserId, setFeatureHeaderUserId] = useState(null);

  // Add a state to track the currently selected user for which the options should be shown
  const [selectedUserIdForOptions, setSelectedUserIdForOptions] =
    useState(null);

  useEffect(() => {
    if (!chatId && users.length > 0) {
      startNewChat();
    }
  }, [chatId, users]);

  // Fetch users and their chat states
  useEffect(() => {
    if (user) {
      Promise.all([fetchUsers(user), fetchUserChatStates(user.id)])
        .then(([users, chatStates]) => {
          setUsers(users);
          setChatStates(chatStates);
        })
        .catch(console.error);
    }
  }, [user]);

  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const userCol = collection(db, 'users');
  //       const userSnapshot = await getDocs(userCol);
  //       const userList = userSnapshot.docs
  //         .map((doc) => ({ ...doc.data(), id: doc.id }))
  //         .filter((u) => u.id !== user?.id);
  //       setUsers(userList);
  //       // Initially display all users
  //     } catch (error) {
  //       console.error('Error fetching users:', error);
  //     }
  //   };

  //   const fetchUserChatPreferences = async () => {
  //     try {
  //       const userChatRef = collection(db, 'users', user.id, 'userChats');
  //       const userChatSnapshot = await getDocs(userChatRef);
  //       const userChatsData = {};
  //       userChatSnapshot.forEach((doc) => {
  //         userChatsData[doc.id] = doc.data();
  //       });
  //       setChatStates(new Map(Object.entries(userChatsData)));
  //     } catch (error) {
  //       console.error('Error fetching user chat preferences:', error);
  //     }
  //   };

  //   if (user) {
  //     fetchUsers();
  //     fetchUserChatPreferences();
  //   }
  // }, [user]);

  // useEffect(() => {
  // const updatedDisplayedChats = getFilteredAndSortedChats(allUsers, chatStates);
  // setDisplayedUsers(updatedDisplayedChats);
  // },[chatId,user, allUsers, chatStates]); // Add chatStates as a dependency

  // useEffect for managing user data fetching and chat preferences
  const fetchUserChatPreferences = async () => {
    const userChatsRef = collection(db, 'users', user.id, 'userChats');
    const userChatSnapshot = await getDocs(userChatsRef);
    return userChatSnapshot.docs.reduce((acc, doc) => {
      const data = doc.data();
      acc.set(doc.id, {
        isPinned: data.isPinned || false,
        isMuted: data.isMuted || false,
        ...data
      });
      return acc;
    }, new Map());
  };

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      const userCol = collection(db, 'users');
      const userSnapshot = await getDocs(userCol);
      return userSnapshot.docs
        .map((doc) => ({
          ...doc.data(),
          id: doc.id
        }))
        .filter((u) => u.id !== user?.id);
    };

    // Updated function to fetch user chat preferences
    // Define fetchUserChatPreferences outside of useEffect

    // Now fetchUserChatPreferences can be safely used here
    if (user && isMounted) {
      Promise.all([fetchUsers(), fetchUserChatPreferences()])
        .then(([users, chatPrefs]) => {
          if (isMounted) {
            setUsers(users);
            setChatStates(new Map(Object.entries(chatPrefs)));
          }
        })
        .catch(console.error);
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      const fetchedUsers = await fetchUsers(user);
      const chatPrefs = await fetchUserChatPreferences();
      if (isMounted) {
        setUsers(fetchedUsers);
        setAllUsers(fetchedUsers);
        setChatStates(chatPrefs);
      }
    };

    if (user) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Combine useEffects that deal with fetching users and chat states into one
  // Updated useEffect for fetching users and their chat preferences

  // useEffect for managing displayed users
  // useEffect(() => {
  //   const updatedDisplayedChats = getFilteredAndSortedChats(allUsers, chatStates);
  //   setDisplayedUsers(updatedDisplayedChats);
  // }, [allUsers, chatStates]);

  // const getFilteredAndSortedChats = (allChats, userChatsData) => {
  //   return allChats
  //     .filter((chat) => {
  //       const chatState = userChatsData.get(chat.id);
  //       return chatState ? !chatState.isDeleted : true;
  //     })
  //     .sort((a, b) => {
  //       const aIsPinned = userChatsData.get(a.id)?.isPinned || false;
  //       const bIsPinned = userChatsData.get(b.id)?.isPinned || false;
  //       return bIsPinned - aIsPinned;
  //     });
  // };

  // Use this function where you render your chat list
  const displayedChats = getFilteredAndSortedChats(allUsers, chatStates);

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
            if (otherUserId) {
              // Fetch the other user's details
              const otherUserDoc = await getDoc(
                doc(db, `users/${otherUserId}`)
              );
              if (otherUserDoc.exists()) {
                setChatUser({ ...otherUserDoc.data(), id: otherUserDoc.id });

                // Store the recipient's FCM token
                setRecipientToken(otherUserDoc.data().fcmToken); // Assuming the token is stored under fcmToken field
              }
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
      // Check if a chat already exists
      const chatsCol = collection(db, 'chats');
      const chatsSnapshot = await getDocs(chatsCol);
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
  const handleChange = (e) => {
    console.log('Message input changed: ', e.target.value);
    setMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!chatId || !user || !chatUser) {
      console.log('Chat ID, user information, or chatUser is missing');
      return;
    }
    console.log('Sending message: ', message);

    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      try {
        // Send the message in Firestore
        const messageRef = await addDoc(
          collection(db, `chats/${chatId}/messages`),
          {
            text: trimmedMessage,
            sender: user.id,
            createdAt: new Date()
          }
        );
        console.log('message', message);
        setMessage('');
      } catch (e) {
        console.error('Error sending message: ', e);
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
  useEffect(() => {
    console.log('Current message: ', message);
  }, [message]);

  useEffect(() => {
    console.log('Emoji Picker visibility: ', showEmojiPicker);
  }, [showEmojiPicker]);

  const toggleOptionsMenu = (messageId) => {
    setShowOptionsMenu(showOptionsMenu === messageId ? null : messageId);
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

  // const [searchTerm, setSearchTerm] = useState('');
  // const filteredUsers = users.filter((user) =>
  //   user.name.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  const updateChatState = (userId, updates) => {
    setChatStates((prevStates) => {
      const updatedStates = new Map(prevStates);
      updatedStates.set(userId, { ...updatedStates.get(userId), ...updates });
      return updatedStates;
    });
  };

  const fetchChatIdsForUser = async (userId) => {
    const userChatsRef = collection(db, 'users', userId, 'userChats');
    const userChatsSnapshot = await getDocs(userChatsRef);
    const chatIds = userChatsSnapshot.docs.map((doc) => doc.id);
    return chatIds;
  };

  // Function to update the chatStates state immediately
  // Function to update the chatStates state immediately
  // Update chatStatesImmediate function
  // Ensure chat states are updated immediately and UI is re-rendered
  // Update chatStatesImmediate function

  // Function to update displayed chats based on chat states
  const updateDisplayedChats = () => {
    const updatedDisplayedChats = getFilteredAndSortedChats(
      allUsers,
      chatStates
    );
    setDisplayedUsers(updatedDisplayedChats);
  };
  const updateChatStatesImmediate = (chatId, updates) => {
    setChatStates((prevStates) => {
      const updatedStates = new Map(prevStates);
      updatedStates.set(chatId, {
        ...(updatedStates.get(chatId) || {}),
        ...updates
      });
      return updatedStates;
    });
    // Trigger UI update
    updateDisplayedChats();
  };

  // Fetch chat states from Firestore
  const fetchChatStates = async () => {
    const userChatRef = collection(db, 'users', user?.id, 'userChats');
    const userChatSnapshot = await getDocs(userChatRef);
    return userChatSnapshot.docs.reduce((acc, doc) => {
      acc[doc.id] = doc.data();
      return acc;
    }, {});
  };
  // Chat actions (pin, mute, delete)
  const performChatAction = async (userId, action) => {
    try {
      // Perform action (e.g., togglePinChat)
      await action(userId);

      // Fetch and update chat states
      const updatedChatStates = await fetchChatStates();
      setChatStates(new Map(Object.entries(updatedChatStates)));

      // Trigger UI update
      const updatedDisplayedChats = getFilteredAndSortedChats(
        allUsers,
        chatStates
      );
      setDisplayedUsers(updatedDisplayedChats);
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };
  // Function to toggle pin for a chat
  const togglePinChat = async (userId) => {
    try {
      const chatIds = await fetchChatIdsForUser(userId);
      const promises = chatIds.map(async (chatId) => {
        const userChatRef = doc(db, 'users', user.id, 'userChats', chatId);
        const userChatDoc = await getDoc(userChatRef);
        if (userChatDoc.exists()) {
          const isPinned = userChatDoc.data().isPinned || false;
          await updateDoc(userChatRef, { isPinned: !isPinned });
          updateChatStatesImmediate(userId, { isPinned: !isPinned });
          // Call updateDisplayedChats here
          updateDisplayedChats();
          toast.success(
            `Chat ${isPinned ? 'unpinned' : 'pinned'} successfully`
          );
          console.log(`Chat ${isPinned ? 'unpinned' : 'pinned'} successfully`);
        }
      });

      await Promise.all(promises);
      updateDisplayedChats(); // Add this line after updating chat states
    } catch (error) {
      console.error('Error in toggling pin:', error);
    }
  };

  // Function to toggle mute for a chat
  const toggleMuteChat = async (userId) => {
    try {
      const chatIds = await fetchChatIdsForUser(userId);
      const promises = chatIds.map(async (chatId) => {
        const userChatRef = doc(db, 'users', user.id, 'userChats', chatId);
        const userChatDoc = await getDoc(userChatRef);
        if (userChatDoc.exists()) {
          const isMuted = userChatDoc.data().isMuted || false;
          await updateDoc(userChatRef, { isMuted: !isMuted });
          updateChatStatesImmediate(userId, { isMuted: !isMuted });
          // Call updateDisplayedChats here
          updateDisplayedChats();
          toast.success(`Chat ${isMuted ? 'unmuted' : 'muted'} successfully`);
          console.log(`Chat ${isMuted ? 'unmuted' : 'muted'} successfully`);
        }
      });

      await Promise.all(promises);
      updateDisplayedChats(); // Add this line after updating chat states
    } catch (error) {
      console.error('Error in toggling mute:', error);
    }
  };
  // Function to delete a chat for a user
  const deleteUserChat = async (userId) => {
    try {
      const chatIds = await fetchChatIdsForUser(userId);
      const promises = chatIds.map(async (chatId) => {
        const userChatRef = doc(db, 'users', user.id, 'userChats', chatId);
        const userChatDoc = await getDoc(userChatRef);
        if (userChatDoc.exists()) {
          await updateDoc(userChatRef, { isDeleted: true });
          updateChatStatesImmediate(chatId, { isDeleted: true });
          toast.success(`Chat deleted successfully`);
          console.log(`Chat deleted successfully`);
        }
      });

      await Promise.all(promises);
      updateDisplayedChats(); // Add this line after updating chat states
    } catch (error) {
      console.error('Error in deleting chat:', error);
    }
  };

  // useEffect(() => {
  //   // This will run every time `chatStates` changes.
  //   const updatedDisplayedChats = getFilteredAndSortedChats(
  //     allUsers,
  //     chatStates
  //   );
  //   setDisplayedUsers(updatedDisplayedChats);
  // }, [chatStates]);

  // useEffect to update the displayed chats whenever chatStates changes
  // useEffect(() => {
  //   const updatedDisplayedChats = getFilteredAndSortedChats(
  //     allUsers,
  //     chatStates
  //   );
  //   setDisplayedUsers(updatedDisplayedChats);
  // }, [allUsers, user]);

  // Inside useEffect for updating displayedUsers based on searchTerm
  // useEffect(() => {
  //   let filtered = allUsers;
  //   if (searchTerm) {
  //     filtered = allUsers.filter((user) =>
  //       user.name.toLowerCase().includes(searchTerm.toLowerCase())
  //     );
  //   }
  //   setDisplayedUsers(getFilteredAndSortedChats(filtered, chatStates));
  // }, [searchTerm, allUsers, chatStates, getFilteredAndSortedChats]);

  const performActionAndUpdateUI = async (userId, action) => {
    try {
      // Perform the action (e.g., togglePinChat, toggleMuteChat, deleteUserChat)
      await action(userId);

      // Hide the feature header and show the main header
      setFeatureHeaderUserId(null);
      const updatedDisplayedChats = getFilteredAndSortedChats(
        allUsers,
        chatStates
      );
      setDisplayedUsers(updatedDisplayedChats);
      // Update the chat states and UI
      // ... (Update the chat states as needed)
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  // Adjusted useEffect to ensure chat list is always sorted
  // useEffect(() => {
  //   const updatedDisplayedChats = getFilteredAndSortedChats(allUsers, chatStates);

  //   // Only update the state if the new chats are different from the current ones
  //   if (JSON.stringify(displayedUsers) !== JSON.stringify(updatedDisplayedChats)) {
  //     setDisplayedUsers(updatedDisplayedChats);
  //   }
  // }, [allUsers, chatStates]); // Ensure dependencies are correct and necessary

  // Update displayed users based on chat states
  // useEffect(() => {
  //   const updatedDisplayedChats = getFilteredAndSortedChats(
  //     allUsers,
  //     chatStates
  //   );
  //   setDisplayedUsers(updatedDisplayedChats); // Correct usage of state update
  // }, [allUsers, user]);

  const sortUsers = (users) => {
    return users.sort((a, b) => {
      return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
    });
  };

  // This function will update the local state for a specific chat ID.

  const handlePinChat = async (chatIdToPin) => {
    if (!chatIdToPin) {
      console.error('No chat ID provided for pinning.');
      return;
    }

    if (!chatId) return;
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);
    const isPinned = chatDoc.data().isPinned || false;
    await updateDoc(chatRef, { isPinned: !isPinned });

    // Update local state
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === chatIdToPin ? { ...user, isPinned: !isPinned } : user
      )
    );

    toast.success(`Chat ${isPinned ? 'unpinned' : 'pinned'} successfully`);
  };

  const handleMuteChat = async (chatIdToMute) => {
    if (!chatIdToMute) {
      console.error('No chat ID provided for muting.');
      return;
    }

    const chatRef = doc(db, 'users', chatIdToMute);
    const chatDoc = await getDoc(chatRef);
    const isCurrentlyMuted = chatDoc.data()?.isMuted || false;

    await updateDoc(chatRef, { isMuted: !isCurrentlyMuted });

    // Update local state
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === chatIdToMute
          ? { ...user, isMuted: !isCurrentlyMuted }
          : user
      )
    );

    toast.success(
      `Chat ${isCurrentlyMuted ? 'unmuted' : 'muted'} successfully`
    );
  };

  // const handleDeleteChat = async (chatIdToDelete) => {
  //   if (!chatIdToDelete) {
  //     console.error('No chat ID provided for deleting.');
  //     return;
  //   }

  //   await deleteChat(chatIdToDelete); // Assuming this updates Firestore
  //   updateChatState(chatId, { isDeleted: true });
  //   setShowActionBar(false);

  //   // After deleting, update and sort the user list
  //   setUsers((prevUsers) => {
  //     const updatedUsers = prevUsers.filter(
  //       (chat) => chat.id !== chatIdToDelete
  //     );
  //     return sortUsers(updatedUsers); // Sort the updated user list
  //   });
  // };

  // Add this function within your Chat component

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
        setAllUsers(userList);
        setDisplayedUsers(userList);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [user]); // Dependency array
  // Search functionality
  // Search functionality: Filter displayed users based on search term
  // Search functionality: Update displayed users based on search term
  // useEffect for updating displayedUsers based on searchTerm
  // Combine all useEffects that setDisplayedUsers into one
  // Remove duplicate useEffects that update displayedUsers
  useEffect(() => {
    let updatedDisplayedChats = getFilteredAndSortedChats(allUsers, chatStates);

    // Apply additional filters based on searchTerm
    if (searchTerm) {
      updatedDisplayedChats = updatedDisplayedChats.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setDisplayedUsers(updatedDisplayedChats);
  }, [allUsers, chatStates, searchTerm, updateDisplayedChats]); // Add updateDisplayedChats as a dependency

  // Inside your component
  const handleNavigationChange = (event, newValue) => {
    router.push(newValue);
  };

  // Additional styles for the bottom bar and message header
  const bottomBarStyle = {
    position: 'fixed',
    bottom: 0,
    width: '100%',
    bgcolor: '#121212', // Adjust background color
    color: '#FFFFFF' // Adjust icon color
  };

  const messageHeaderStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: '#121212',
    padding: '10px'
    // other styles...
  };
  // Custom styles for the emoji picker
  const emojiPickerStyle = {
    position: 'absolute',
    bottom: '60px', // Adjust this value as needed
    left: '0',
    right: '0',
    width: '100%',
    maxHeight: '250px',
    overflowY: 'auto',
    backgroundColor: 'rgba(18, 18, 18, 0.123)',
    border: '1px solid rgba(18, 18, 18, 0.123)',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    zIndex: 5 // Ensure this is below the message input's zIndex
    // Adjust this value as needed
    // Center the picker in the available horizontal space
  };
  // const filteredUsers = searchTerm
  //   ? users.filter((user) =>
  //       user.name.toLowerCase().includes(searchTerm.toLowerCase())
  //     )
  //   : users;

  const handleSearchChange = (event) => {
    setSearchTerm(event.toLowerCase());
  };

  const renderSearchBar = () => (
    <div
      style={{
        position: 'sticky',
        top: '50px',
        zIndex: 10,
        backgroundColor: '#121212',
        padding: '10px',
        width: '100%'
      }}
    >
      <TextField
        autoFocus
        fullWidth
        size='small'
        variant='outlined'
        placeholder='Search users...'
        value={searchTerm}
        onChange={(e) => handleSearchChange(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <IconButton onClick={() => setIsSearchActive(false)}>
                <CloseIcon />
              </IconButton>
            </InputAdornment>
          )
        }}
        style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          outline: 'none !important',
          border: 'none'
        }} // Add custom styles for search bar
      />
    </div>
  );

  // Conditional rendering of MainHeader
  // Conditional rendering of MainHeader // Conditional Rendering of MainHeader
  const renderMainHeader = () => {
    if (featureHeaderUserId !== null) return null;

    if (!showChatBox) {
      return (
        <MainHeader
          useMobileSidebar
          title={<> </>}
          className='position-fixed bg-rgba(18, 18, 18, 0.123) left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-gray-700 p-4'
        >
          <Grid container alignItems='center' justifyContent='space-between'>
            <Grid item>
              <Typography
                sx={{
                  color: '#eee',
                  fontSize: '1.6rem',
                  marginLeft: '-1.2rem'
                }}
              >
                Messages
              </Typography>
            </Grid>
            <Grid item>
              <IconButton onClick={() => setIsSearchActive(!isSearchActive)}>
                <SearchIcon sx={{ color: '#eee', fontSize: '2rem' }} />
              </IconButton>
            </Grid>
          </Grid>
        </MainHeader>
      );
    }
    return null;
  };

  const BottomBar = () => (
    <BottomNavigation
      showLabels
      value={router.pathname}
      onChange={handleNavigationChange}
      sx={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        bgcolor: 'rgba(18, 18, 18, 0.123)',
        borderTop: '1px solid #777',
        paddingTop: '0.8rem'
      }}
      className={cn(
        'hover-animation even z-10 px-4 py-2 backdrop-blur-md',
        'bg-main-background/60'
      )}
    >
      <BottomNavigationAction
        label='Home'
        value='/home'
        icon={<HomeOutlinedIcon sx={{ color: '#eee', fontSize: '2rem' }} />}
      />
      <BottomNavigationAction
        label='Notifications'
        value='/notifications'
        icon={
          <NotificationsNoneOutlinedIcon
            sx={{ color: '#eee', fontSize: '2rem' }}
          />
        }
      />
      <BottomNavigationAction
        label='Chat'
        value='/chat'
        icon={<MarkEmailUnreadIcon sx={{ color: '#fff', fontSize: '2rem' }} />}
      />
      <BottomNavigationAction
        label='Profile'
        value={`/user/${user?.username}`}
        icon={
          <PermIdentityOutlinedIcon sx={{ color: '#eee', fontSize: '2rem' }} />
        }
      />
    </BottomNavigation>
  );

  const handleEmojiClick = (event, emojiObject) => {
    console.log(emojiObject); // Check what's being received
    setMessage((prevMessage) => `${prevMessage}${emojiObject.emoji}`);
  };

  // Function to handle showing options for a specific user
  // const handleShowOptions = (userId) => {
  //   console.log(`More options for user ${userId}`);
  //   setSelectedUserIdForOptions(userId);
  //   // Logic to show options like pin, mute, and delete
  // };
  // Function to show options menu
  // Toggle options menu
  // Function to handle the MoreVert click
  const handleMoreVertClick = (userId) => {
    console.log('Clicked MoreVert for user ID: ', userId);
    if (featureHeaderUserId === userId) {
      setFeatureHeaderUserId(null);
    } else {
      setFeatureHeaderUserId(userId);
    }
  };

  const handleShowOptions = (userId) => {
    console.log(`More options for user ${userId}`);
    setSelectedUserIdForOptions(userId);
  };

  useEffect(() => {
    console.log('featureHeaderUserId changed: ', featureHeaderUserId);
  }, [featureHeaderUserId]);

  useEffect(() => {
    console.log('selectedUserIdForOptions changed: ', selectedUserIdForOptions);
  }, [selectedUserIdForOptions]);

  // Add event listener to hide options when clicked outside
  // Function to hide options menu
  const hideOptionsMenu = () => {
    setShowOptions(false);
  };
  useEffect(() => {
    window.addEventListener('click', hideOptionsMenu);
    return () => {
      window.removeEventListener('click', hideOptionsMenu);
    };
  }, []);
  // Prevent event bubbling to window when clicking on MoreVert icon
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  // Toggle feature header
  const toggleFeatureHeader = (userId) => {
    setShowFeatureHeader(!showFeatureHeader);
    handleMoreVertClick(userId); // Call existing function to handle more vert click
  };

  // Render function for the options menu
  // Render Feature Header
  // Render Function for Feature Header
  // Render Function for Feature Header with Glassmorphism
  const renderFeatureHeader = () => {
    if (featureHeaderUserId === null) return null;

    const isPinned = chatStates.get(featureHeaderUserId)?.isPinned;
    const isMuted = chatStates.get(featureHeaderUserId)?.isMuted;

    return (
      <div
        className='feature-header'
        style={{
          backdropFilter: 'blur(10px)', // Glassmorphism effect
          backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent background
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Soft shadow
          borderRadius: '15px', // Rounded corners
          padding: '10px', // Padding around the content
          display: 'flex', // Align items in a row
          justifyContent: 'space-evenly', // Even spacing between items
          alignItems: 'center', // Center items vertically
          margin: '10px', // Margin from the edges
          color: 'white' // Text color
        }}
        onClick={stopPropagation}
      >
        <IconButton onClick={() => setFeatureHeaderUserId(null)}>
          <ArrowBackIcon style={{ color: 'white' }} />
        </IconButton>
        <IconButton
          onClick={() =>
            performActionAndUpdateUI(featureHeaderUserId, togglePinChat)
          }
        >
          {isPinned ? (
            <RiUnpinFill style={{ color: 'white', fontSize: '1.6rem' }} />
          ) : (
            <PushPinIcon sx={{ color: 'white' }} />
          )}
        </IconButton>
        <IconButton
          onClick={() =>
            performActionAndUpdateUI(featureHeaderUserId, toggleMuteChat)
          }
        >
          {isMuted ? (
            <VolumeUpIcon sx={{ color: 'white' }} /* style props */ />
          ) : (
            <VolumeOffIcon sx={{ color: 'white' }} /* style props */ />
          )}
        </IconButton>
        <IconButton
          onClick={() =>
            performActionAndUpdateUI(featureHeaderUserId, deleteUserChat)
          }
        >
          <DeleteIcon style={{ color: 'white' }} />
        </IconButton>
      </div>
    );
  };

  // Make sure to have correct relative path to your image
  const backgroundImageUrl = back.src; // Adjust this if needed
  // Format the current date as a string
  const currentDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Chat list rendering based on search results
  // Adjusted renderChatList to reflect pin and mute status
  // Adjusted renderChatList to reflect pin and mute status correctly

  useEffect(() => {
    console.log('Current chatStates:', chatStates);
  }, [chatStates]);
  const renderChatList = () => {
    // console.log('Displaying Chats:', displayedUsers);
    // console.log('Chat States:', chatStates);

    // Sort users based on pinned state
    const sortedUsers = [...users].sort((a, b) => {
      const aIsPinned = chatStates.get(a.id)?.isPinned || false;
      const bIsPinned = chatStates.get(b.id)?.isPinned || false;
      return bIsPinned - aIsPinned;
    });

    // Filter out deleted chats
    const visibleUsers = sortedUsers.filter((user) => {
      const chatState = chatStates.get(user.id);
      return chatState ? !chatState.isDeleted : true;
    });

    if (displayedUsers.length === 0) {
      return (
        <>
          <StatsEmpty
            title={`No users found`}
            description='Try searching for something else..'
          />
        </>
      );
    }

    return displayedUsers.map((userDetail) => {
      const userChatState = chatStates.get(userDetail.id);
      const isPinned = userChatState?.isPinned;
      const isMuted = userChatState?.isMuted;
      console.log(
        `User: ${userDetail.id}, Pinned: ${isPinned}, Muted: ${isMuted} and :${userChatState} `
      );

      return (
        <div
          key={userDetail.id}
          className={`flex cursor-pointer items-center justify-between px-2 py-3 ${
            selectedChatId === userDetail.id
              ? 'bg-rgba(18, 18, 18, 0.123)'
              : 'bg-rgba(18, 18, 18, 0.123)'
          } border-b border-gray-700`}
          onClick={() => handleUserSelect(userDetail.id)}
        >
          <div className='flex items-center space-x-3'>
            {isPinned && <PushPinIcon />}
            {isMuted && <VolumeOffIcon />}
            <img
              src={
                userDetail?.photoURL ||
                'https://img.icons8.com/?size=50&id=11730&format=png'
              }
              className='non-selectable h-12 w-12 rounded-full object-cover'
              alt='User Avatar'
            />
            <div
              className='text-#333 text-left font-semibold'
              style={{ color: '#eee' }}
            >
              {userDetail?.name}
            </div>
          </div>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleMoreVertClick(userDetail.id);
            }}
          >
            <MoreVertOutlinedIcon style={{ color: '#FFF' }} />
          </IconButton>
        </div>
      );
    });
  };

  return (
    <div style={{ overflowY: 'hidden', backgroundColor: '#121212' }}>
      <SEO title='Chat / Degen Diaries' />
      <ToastContainer position='bottom-center' autoClose={5000} />
      {renderFeatureHeader()}
      {renderMainHeader()}
      {isSearchActive && renderSearchBar()}
      {/* // Conditional rendering to show options menu */}
      <div
        className='chat-container'
        style={{ backgroundColor: '#121212', color: '#fff' }}
      >
        <div className='bg-#000 flex h-screen flex-col overflow-y-auto text-gray-100 md:flex-row'>
          {/* Mobile header with back button and chat user info */}
          {showChatBox && chatUser && (
            <>
              <div
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 15,
                  backgroundColor: '#080F23', // WhatsApp green color
                  padding: '10px 5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton
                    onClick={handleBackToUsers}
                    style={{ marginRight: '-5px' }}
                  >
                    <ArrowBackIcon
                      style={{ color: '#FFF', marginRight: '0px' }}
                    />
                  </IconButton>
                  <Avatar
                    src={chatUser?.photoURL || '/default-avatar.png'}
                    alt={`${chatUser?.name}'s avatar`}
                    style={{ marginRight: '5px' }}
                  />
                  <div>
                    <span style={{ color: '#FFF', fontWeight: 'bold' }}>
                      {chatUser?.name}
                    </span>
                    <div
                      style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: 'small'
                      }}
                    >
                      Online
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton style={{ marginRight: '5px' }}>
                    <PhoneIcon style={{ color: '#FFF' }} />
                  </IconButton>
                  {/* <IconButton style={{ marginRight: '5px' }}>
                      <VideoCamIcon style={{ color: '#FFF' }} />
                    </IconButton> */}
                  <IconButton>
                    <MoreVertOutlinedIcon style={{ color: '#FFF' }} />
                  </IconButton>
                </div>
              </div>
            </>
          )}
          {/* CHat List */}

          {/* // Updated chat list to include MoreVertIcon */}
          {!showChatBox && (
            <div className='flex h-full w-full flex-col overflow-y-auto border-r border-gray-700 p-4 md:w-1/4'>
              {renderChatList()}
            </div>
          )}

          {/* Messages */}
          {showChatBox && (
            <div
              className=' chat-messages flex h-full w-full flex-col justify-between px-5 md:h-auto'
              style={{
                flex: 1, // This will make the container fill the height
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundImage: `url(${backgroundImageUrl})`, // Make sure this path is correct
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
                position: 'relative'
              }}
            >
              {/* Dark overlay with reduced opacity */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.808)', // Darken the background
                  zIndex: 1
                }}
              ></div>

              {/* // Adjust marginTop to match your header height */}
              <div
                className='messages-list mt-25 flex-grow overflow-y-auto pb-16'
                style={{
                  flex: 1,
                  overflowY: 'auto', // Allow vertical scrolling
                  padding: '20px 0px 70px', // Add padding to the bottom to prevent the last message from being cut off
                  position: 'relative', // Use relative for z-index context
                  zIndex: 3, // Ensure it's above the overlay but below the input
                  // Make sure the container has space to display the messages above the input box
                  marginBottom: '80px' // Adjust this value based on the height of your input box
                }}
              >
                {/* Displaying the name of the user you're chatting with */}
                {/* <div className='-mb-2 text-center text-xl font-bold'>
                    {chatUser?.name}{' '}
                  </div> */}
                <div
                  className='date-label'
                  style={{ textAlign: 'center', color: 'white' }}
                >
                  {currentDate}
                </div>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.sender === user?.id ? 'justify-end' : 'justify-start'
                    } mb-4`}
                  >
                    <div
                      className={`rounded-xl px-4 py-3 ${
                        msg.sender === user?.id
                          ? 'bg-[#080F23] text-[#DFE4EA]'
                          : 'bg-[#DFE4EA] text-[#080F23]'
                      } text-weight-bold`}
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

              {/* // Inside the 'message-input' div */}
              <div
                className='message-input'
                style={{
                  position: 'fixed',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  backgroundColor: 'rgba(18, 18, 18, 0.123)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '5px 5px', // Reduced padding
                  // borderTop: '1px solid #ddd',
                  zIndex: 10, // Ensure this is above the emoji picker's zIndex
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                  overflow: 'scroll'
                }}
              >
                {/* <IconButton 
                  // onClick={() => setShowEmojiPicker((val) => !val)}
                  >
                    <EmojiEmotionsIcon style={{ color: '#eee',fontSize:'1.6rem' }} />
                  </IconButton> */}
                {/* <IconButton>
                    <AttachFileIcon style={{ color: '#075E54' }} />
                  </IconButton> */}
                <TextField
                  className='w-full rounded-full p-2 text-sm focus:outline-none'
                  fullWidth
                  type='text'
                  placeholder='Type a message'
                  value={message}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  margin='normal'
                  sx={{
                    flexGrow: 1,
                    borderRadius: '50px !important',
                    backgroundColor: '#DFE4EA',
                    color: '#000',
                    '& .MuiInputBase-input': {
                      color: '#000'
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <IconButton
                          // onClick={() => setShowEmojiPicker((val) => !val)}
                          sx={{ color: '#080F23' }}
                        >
                          <EmojiEmotionsIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          onClick={handleSendMessage}
                          sx={{ color: '#080F23 ' }}
                        >
                          <SendIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                {/* <IconButton>
                    <MicIcon style={{ color: '#075E54' }} />
                  </IconButton> */}
              </div>
            </div>
          )}
          <div className='chat-container'>
            {/* Conditional rendering for chat list or message view */}
            {!showChatBox ? (
              // Bottom bar for chat list view
              <BottomBar />
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Chat.getLayout = (page: ReactElement): ReactNode => (
  <>
    <ProtectedLayout>
      <MainLayout>
        <HomeLayout>{page}</HomeLayout>
      </MainLayout>
    </ProtectedLayout>
  </>
);
