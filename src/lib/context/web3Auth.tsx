// Web3AuthContext.tsx
import { useEffect } from 'react';
import { WalletConnectProvider } from '@walletconnect/web3-provider';
import { doc, setDoc } from 'firebase/firestore';
import { usersCollection } from '@lib/firebase/collections'; // Import your Firebase collections

const web3Auth = async () => {
  try {
    // Create a WalletConnect Provider
    const provider = new WalletConnectProvider({
      rpc: {
        1: 'https://mainnet.eth.aragon.network' // Use WalletConnect's Ethereum RPC endpoint
        // Add more networks if needed
      }
    });

    // Enable the provider
    await provider.enable();

    // You can now use the provider for interacting with Web3
    const web3 = new Web3(provider);

    // Fetch the user's Ethereum address
    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];

    // Save userAddress to Firebase Firestore
    const userDocRef = doc(usersCollection, userAddress); // Use the user's Ethereum address as the document ID
    await setDoc(userDocRef, { ethereumAddress: userAddress });

    // TODO: You can save additional user data or perform other actions here

    console.log('Web3 accounts:', userAddress);
  } catch (error) {
    console.error('Error connecting to WalletConnect:', error);
  }
};

export default web3Auth;
