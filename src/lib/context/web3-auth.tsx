// web3-auth.tsx

import Web3 from 'web3';

const web3Auth = async (): Promise<{ accounts: string[] }> => {
  // Check if Web3 is injected by MetaMask
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      return { accounts };
    } catch (error) {
      throw new Error('Error connecting to MetaMask.');
    }
  } else {
    throw new Error('MetaMask is not installed.');
  }
};

export default web3Auth;
