// web3-auth-context.tsx
// @ts-nocheck after version 3.7
/* tslint:disable */

import { useState, useEffect, useContext, createContext, useMemo } from 'react';
import { getDoc, setDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firebase } from 'firebase';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName
} from 'wagmi';
import {
  usersCollection,
  userStatsCollection
} from '@lib/firebase/collections';
import { getRandomId, getRandomInt } from '@lib/random';
import type { User as AuthUser } from 'firebase/auth';
import type { WithFieldValue } from 'firebase/firestore';
import type { User } from '@lib/types/user';
import type { Bookmark } from '@lib/types/bookmark';
import type { Stats } from '@lib/types/stats';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// import { useWeb3Modal } from '@web3modal/react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { serverTimestamp } from 'firebase/firestore';
import { getValidUrl } from './../../lib/context/url'; // replace with the actual path to your utility function
import { useWeb3ModalState } from '@web3modal/wagmi/react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut
} from 'firebase/auth';

// import { useEnsAvatar } from 'wagmi';

// Initialize Firebase (make sure you have configured Firebase properly)
const firebaseConfig = {
  apiKey: 'AIzaSyD-ALyD7Xmm5ClCVYeU8OcDW0OVKU66m4w',
  authDomain: 'twitter-web3.firebaseapp.com',
  projectId: 'twitter-web3',
  storageBucket: 'twitter-web3.appspot.com',
  messagingSenderId: '925953423560',
  appId: '1:925953423560:web:0c87f77ad6eb876d2d0dfd',
  measurementId: 'G-NK1704HW5G'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Obtain the auth object

type AuthContext = {
  user: User | null;
  walletAddress: string; // assuming it's a string, adjust the type accordingly
  error: Error | null;
  loading: boolean;
  isAdmin: boolean;
  randomSeed: string;
  userBookmarks: Bookmark[] | null;
  signOut: () => Promise<void>;
  connectWithWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  connector: Connector | null; // Add connector here
};

export const AuthContext = createContext<AuthContext | null>(null);

type AuthContextProviderProps = {
  children: React.ReactNode;
};

// ... (previous imports)

export function Web3AuthContextProvider({
  children
}: AuthContextProviderProps): JSX.Element {
  const { address, connector } = useAccount(); // Get connector directly from useAccount
  const { connect, disconnect } = useConnect();

  // Ensure connector is available or set it to null
  const actualConnector = connector || null;

  // const { data: ensAvatar } = useEnsAvatar({ address });
  // const { data: ensName } = useEnsName({ address });
  const [user, setUser] = useState<User | null>(null);
  const [userBookmarks, setUserBookmarks] = useState<Bookmark[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  const manageUser = async (
    userId: string,
    isWeb3: boolean,
    authUser?: AuthUser | null
  ): Promise<void> => {
    // if (!address) {
    //   console.error('Address is undefined');
    //   setLoading(false);
    //   return;
    // }
    // For Web3 users, check if address is present
    if (isWeb3 && !address) {
      console.error('Address is undefined');
      setLoading(false);
      return;
    }
    // For Google users, use the UID from the authUser
    const userRefId = isWeb3 ? address : userId; // For Google users, userId is the UID from Firebase

    console.log('manageUser called with userID:', userRefId);

    console.log('manageUser called with address:', address);
    if (!userRefId || typeof userRefId !== 'string') {
      console.error('Invalid user reference ID:', userRefId);
      setLoading(false);
      return;
    }

    // const userSnapshot = await getDoc(doc(usersCollection, address));
    const userSnapshot = await getDoc(doc(usersCollection, userRefId));

    async function getValidUrl(address: string): Promise<string | null> {
      if (!address) return null;

      // Construct a valid URL using the address
      const url = `https://source.boringavatars.com/${address}`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          // If the response is not ok, return a default avatar URL
          return 'https://ouch-cdn2.icons8.com/bULOsqOmFnYYAgo1CEAb_TXY2qJQhaeHRSHDFVGJfAE/rs:fit:368:368/czM6Ly9pY29uczgu/b3VjaC1wcm9kLmFz/c2V0cy9zdmcvNDQx/L2JjY2JhYTE2LWE1/N2UtNDE1Mi1hMGZl/LWYxZmMyNjQyMzkz/ZC5zdmc.png';
        }
        return url;
      } catch (error) {
        console.error('Error fetching avatar:', error);
        // In case of an error, return a default avatar URL
        return 'https://ouch-cdn2.icons8.com/bULOsqOmFnYYAgo1CEAb_TXY2qJQhaeHRSHDFVGJfAE/rs:fit:368:368/czM6Ly9pY29uczgu/b3VjaC1wcm9kLmFz/c2V0cy9zdmcvNDQx/L2JjY2JhYTE2LWE1/N2UtNDE1Mi1hMGZl/LWYxZmMyNjQyMzkz/ZC5zdmc.png';
      }
    }

    if (!userSnapshot.exists()) {
      console.log('User does not exist, creating...');

      const validPhotoURL = getValidUrl(address);

      const userData: WithFieldValue<User> = {
        id: userId,
        bio: null,
        name: isWeb3 ? 'Web3 User' : authUser?.displayName || 'Google User',
        photoURL: isWeb3 ? await getValidUrl(userId) : authUser?.photoURL || '',
        username: isWeb3 ? userId : authUser?.email || '',
        theme: null,
        accent: null,
        website: null,
        location: null,
        verified: false,
        following: [],
        followers: [],
        createdAt: serverTimestamp(),
        updatedAt: null,
        totalTweets: 0,
        totalPhotos: 0,
        pinnedTweet: null,
        coverPhotoURL: null,
        isPinned: false,
        isMuted: false,
        isDeleted: false
      };
      // const userData: WithFieldValue<User> = {
      //   id: address, // Use wallet address as the user ID
      //   bio: null,
      //   name: 'User Name', // Update this with the correct value
      //   theme: null,
      //   accent: null,
      //   website: null,
      //   location: null,
      //   // photoURL: `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUTLhfdkuzPiOnl9wfnneG9l-bOM-YR53JCQ&usqp=CAU`,
      //   photoURL: validPhotoURL,
      //   username: address, // Set the username to the wallet address
      //   verified: false,
      //   following: [],
      //   followers: [],
      //   createdAt: serverTimestamp(),
      //   updatedAt: null,
      //   totalTweets: 0,
      //   totalPhotos: 0,
      //   pinnedTweet: null,
      //   coverPhotoURL: null
      // };

      const userStatsData: WithFieldValue<Stats> = {
        likes: [],
        tweets: [],
        updatedAt: null
      };

      try {
        await Promise.all([
          setDoc(doc(usersCollection, address), userData), // Store using wallet address as the document ID
          setDoc(doc(userStatsCollection(address), 'stats'), userStatsData)
        ]);

        const newUser = (await getDoc(doc(usersCollection, address))).data();
        setUser(newUser as User);
        console.log('User created successfully');
      } catch (error) {
        console.error('Error creating user:', error);
        setError(error as Error);
      }
    } else {
      const userData = userSnapshot.data();

      // Check if the existing photoURL is valid, if not, update it to a valid URL
      // Check if the existing photoURL is valid, if not, update it to a valid URL
      if (!userData.photoURL || userData.photoURL === 'Photo URL') {
        userData.photoURL = getValidUrl(address);
      }
      setUser(userData);
      // User already exists
      const existingUserData = userSnapshot.data();

      // Check if new fields exist, if not, update them
      const updates = {};
      if (existingUserData.isPinned === undefined) updates.isPinned = false;
      if (existingUserData.isMuted === undefined) updates.isMuted = false;
      if (existingUserData.isDeleted === undefined) updates.isDeleted = false;

      if (Object.keys(updates).length > 0) {
        await updateDoc(userSnapshot.ref, updates);
      }

      setUser(existingUserData);
    }

    setLoading(false);
  };
  useEffect(() => {
    if (address) {
      manageUser(address, true);
    }
  }, [address]); // Include address as a dependency for useEffect
  // Include address as a dependency for useEffect
  // useEffect(() => {
  //   if (address) {
  //     manageUser(address, true);
  //   }
  // }, [address]);
  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        manageUser(firebaseUser.uid, false, firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let unsubscribeFromAuth: firebase.Unsubscribe;

    unsubscribeFromAuth = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setAuthUser(authUser);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeFromAuth();
    };
  }, []);

  useEffect(() => {
    if (authUser && address) {
      // @ts-ignore
      manageUser(authUser);
    }
  }, [authUser, address]);

  // const web3Modal = useContext(Web3ModalContext);

  // const { open, close } = web3Modal
  // ? useWeb3Modal()
  //   : { open: () => {}, close: () => {} };

  const { open, close } = useWeb3Modal();

  // const { open, close } = useWeb3Modal();

  // const connectWithWallet = async (): Promise<void> => {
  //   try {
  //     // @ts-ignore
  //     open(); // Open the web3 modal
  //     console.log('manageUser called with authUser:', address && address);
  //   } catch (error) {
  //     setError(error as Error);
  //   }
  // };

  const connectWithWallet = async (): Promise<void> => {
    try {
      console.log('Opening wallet connection modal...');
      await open();
      console.log('Modal opened, checking address...');
      if (address) {
        console.log('Wallet connected with address:', address);
      } else {
        console.error('Wallet connection failed: address is undefined');
      }
    } catch (error) {
      setError(error as Error);
      console.error('Error connecting wallet:', error);
    }
  };

  // useEffect(() => {
  //   if (address) {
  //     manageUser();
  //   }
  // }, [address]);

  const disconnectWallet = async (): Promise<void> => {
    try {
      await close(); // Close the web3 modal
      console.log('Disconnected..');
    } catch (error) {
      setError(error as Error);
      console.log('error while Disconnecting..', error);
    }
  };

  const isAdmin = user ? user.username === 'ccrsxx' : false;
  const randomSeed = useMemo(getRandomId, [user?.id]);

  // const signOut = async (): Promise<void> => {
  //   try {
  //     // Disconnect the wallet
  //     if (actualConnector) {
  //       await disconnectWallet();
  //     }
  //     // Reset the user state to null
  //     setUser(null);
  //   } catch (error) {
  //     setError(error as Error);
  //   }
  // };

  // Function to handle sign in with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      manageUser(result.user.uid, false, result.user);
    } catch (err) {
      setError(err as Error);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      if (connector) {
        await disconnectWallet();
      }
      setUser(null);
      console.log('Disconnected..');
    } catch (err) {
      setError(err as Error);
      console.log('error while Disconnecting', err);
    }
  };

  const value: AuthContext = {
    user,
    error,
    loading,
    isAdmin,
    randomSeed,
    userBookmarks,
    signOut,
    connectWithWallet,
    disconnectWallet,
    signInWithGoogle,
    connector: actualConnector // Use the connector or null
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContext {
  const context = useContext(AuthContext);

  if (!context)
    throw new Error('useAuth must be used within an AuthContextProvider');

  return context;
}
