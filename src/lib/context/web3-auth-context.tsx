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
import { useWeb3Modal } from '@web3modal/react';
import { serverTimestamp } from 'firebase/firestore';
import { getValidUrl } from './../../lib/context/url'; // replace with the actual path to your utility function

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
  connector: Connector | null; // Add connector here
};

export const AuthContext = createContext<AuthContext | null>(null);

type AuthContextProviderProps = {
  children: React.ReactNode;
};

// ... (previous imports)

export function AuthContextProvider({
  children
}: AuthContextProviderProps): JSX.Element {
  const { address, connector } = useAccount(); // Get connector directly from useAccount
  const { connect, disconnect } = useConnect();

  // Ensure connector is available or set it to null
  const actualConnector = connector || null;

  const { data: ensAvatar } = useEnsAvatar({ address });
  const { data: ensName } = useEnsName({ address });
  const [user, setUser] = useState<User | null>(null);
  const [userBookmarks, setUserBookmarks] = useState<Bookmark[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const manageUser = async (): Promise<void> => {
      if (!address) {
        console.error('Address is undefined');
        setLoading(false);
        return;
      }

      console.log('manageUser called with address:', address);

      const userSnapshot = await getDoc(doc(usersCollection, address));

      async function getValidUrl(address: string): Promise<string | null> {
        if (!address) return null;

        // Construct a valid URL using the address
        const url = `https://source.boringavatars.com/${address}`;

        try {
          const response = await fetch(url);
          if (!response.ok) {
            // If the response is not ok, return a default avatar URL
            return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUTLhfdkuzPiOnl9wfnneG9l-bOM-YR53JCQ&usqp=CAU';
          }
          return url;
        } catch (error) {
          console.error('Error fetching avatar:', error);
          // In case of an error, return a default avatar URL
          return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUTLhfdkuzPiOnl9wfnneG9l-bOM-YR53JCQ&usqp=CAU';
        }
      }

      if (!userSnapshot.exists()) {
        console.log('User does not exist, creating...');

        const validPhotoURL = getValidUrl(address);

        const userData: WithFieldValue<User> = {
          id: address, // Use wallet address as the user ID
          bio: null,
          name: 'User Name', // Update this with the correct value
          theme: null,
          accent: null,
          website: null,
          location: null,
          // photoURL: `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUTLhfdkuzPiOnl9wfnneG9l-bOM-YR53JCQ&usqp=CAU`,
          photoURL: validPhotoURL,
          username: address, // Set the username to the wallet address
          verified: false,
          following: [],
          followers: [],
          createdAt: serverTimestamp(),
          updatedAt: null,
          totalTweets: 0,
          totalPhotos: 0,
          pinnedTweet: null,
          coverPhotoURL: null
        };

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
      }

      setLoading(false);
    };

    if (address) {
      manageUser();
    }
  }, [address]); // Include address as a dependency for useEffect
  // Include address as a dependency for useEffect

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

  const { open, close } = useWeb3Modal();

  const connectWithWallet = async (): Promise<void> => {
    try {
      // @ts-ignore
      open(); // Open the web3 modal
      console.log('manageUser called with authUser:', address && address);
    } catch (error) {
      setError(error as Error);
    }
  };

  const disconnectWallet = async (): Promise<void> => {
    try {
      close(); // Close the web3 modal
    } catch (error) {
      setError(error as Error);
    }
  };

  const isAdmin = user ? user.username === 'ccrsxx' : false;
  const randomSeed = useMemo(getRandomId, [user?.id]);

  const signOut = async (): Promise<void> => {
    try {
      // Disconnect the wallet
      if (actualConnector) {
        await disconnectWallet();
      }
      // Reset the user state to null
      setUser(null);
    } catch (error) {
      setError(error as Error);
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
