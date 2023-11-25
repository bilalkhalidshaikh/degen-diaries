// useSmartContract.js
import { ethers } from 'ethers';
import { useState, useCallback } from 'react';

// Replace with your smart contract's deployed address and ABI
const CONTRACT_ADDRESS = '0x123abc456def789ghijklmno012pqrs';
const CONTRACT_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [
      {
        name: '',
        type: 'string'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: '',
        type: 'string'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  }
  // ... more function and event descriptors ...
];
const useSmartContract = () => {
  // State for storing contract interaction status
  const [loading, setLoading] = useState(false);

  // Initialize ethers provider and contract
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  const checkCopyTradeStatus = useCallback(
    async (walletAddress) => {
      setLoading(true);
      try {
        // Call the smart contract function to check copy trade status
        const status = await contract.isCopyTradingActive(walletAddress);
        return status;
      } catch (error) {
        console.error('Error checking copy trade status:', error);
      } finally {
        setLoading(false);
      }
    },
    [contract]
  );

  const initiateCopyTrade = useCallback(
    async (walletAddress, status) => {
      setLoading(true);
      try {
        // Call the smart contract function to enable/disable copy trade
        const transaction = await contract.toggleCopyTrade(
          walletAddress,
          status
        );
        await transaction.wait(); // Wait for transaction to be mined
        return transaction;
      } catch (error) {
        console.error('Error initiating copy trade:', error);
      } finally {
        setLoading(false);
      }
    },
    [contract]
  );

  return {
    loading,
    checkCopyTradeStatus,
    initiateCopyTrade
  };
};

export default useSmartContract;
