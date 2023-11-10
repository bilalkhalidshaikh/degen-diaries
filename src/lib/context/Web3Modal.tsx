// // // context/Web3Modal.tsx

// import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
// // import { WagmiConfig } from 'wagmi';
// // import { mainnet, arbitrum } from 'viem/chains';

// // const projectId = 'YOUR_PROJECT_ID'; // Replace with your actual project ID from WalletConnect Cloud

// // const metadata = {
// //   name: 'Web3Modal',
// //   description: 'Web3Modal Example',
// //   url: 'https://web3modal.com',
// //   icons: ['https://avatars.githubusercontent.com/u/37784886'],
// // };

// // const chains = [mainnet, arbitrum];
// // const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// createWeb3Modal({ wagmiConfig, projectId, chains });

// // export function Web3ModalProvider({ children }) {
// //   return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>;
// // }

// import { useEffect, useState } from 'react';
// import { WagmiConfig, createConfig, configureChains } from 'wagmi';
// import { publicProvider } from 'wagmi/providers/public';
// import { mainnet } from 'wagmi/chains'; // Ensure correct import
// import { createWeb3Modal } from '@web3modal/wagmi/react';
// import { createContext } from 'react';
// import WalletConnectProvider from '@walletconnect/web3-provider';

// const projectId = '5ba2615e3ddcb89e772c02f921fca2c3';
// const infuraId = '3ba7ceb622df4f2aa1bf014763efe515'; // Replace with your Infura ID

// // Initialize the WalletConnectProvider
// const walletConnect = new WalletConnectProvider({
//   infuraId: infuraId,
//   // Add other configuration options if needed
// });

// console.log('WalletConnectProvider initialized:', walletConnect);

// // Configure chains outside of the component
// const { chains, provider } = configureChains(
//   [mainnet],
//   [
//     () => walletConnect, // Function that returns WalletConnectProvider instance
//     publicProvider       // Ensure this is correctly imported and is a function
//   ]
// );

// console.log('Chains configured:', chains, 'Provider:', provider);

// // Create wagmiConfig outside of the component
// const wagmiConfig = createConfig({
//   autoConnect: true,
//   provider: provider,
// });

// export const Web3ModalContext = createContext(null);

// export function Web3ModalProvider({ children }) {
//   const [web3Modal, setWeb3Modal] = useState(null);

//   useEffect(() => {
//     const modal = createWeb3Modal({ wagmiConfig, projectId, chains });
//     setWeb3Modal(modal);
//   }, []);

//   return (
//     <Web3ModalContext.Provider value={web3Modal}>
//       <WagmiConfig config={wagmiConfig}>
//         {children}
//       </WagmiConfig>
//     </Web3ModalContext.Provider>
//   );
// }

// 1. Get projectId
// const projectId = '5ba2615e3ddcb89e772c02f921fca2c3'

// // 2. Create wagmiConfig
// const metadata = {
//   name: 'Web3Modal',
//   description: 'Web3Modal Example',
//   url: 'https://web3modal.com',
//   icons: ['https://avatars.githubusercontent.com/u/37784886']
// }

// const chains = [mainnet, arbitrum]
// const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

// // 3. Create modal
// createWeb3Modal({ wagmiConfig, projectId, chains })

'use client';

import { createConfig, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { WagmiConfig } from 'wagmi';
import { createContext, useEffect, useState } from 'react';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react';
import { mainnet, arbitrum } from 'viem/chains';

const projectId = '75f6b049bc9dfa057184fad34cb7207e';
const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const chains = [mainnet, arbitrum];
const wagmiConfigC = defaultWagmiConfig({ chains, projectId, metadata });

// Create Web3ModalContext
export const Web3ModalContext = createContext(null);

export function Web3ModalProvider({ children }) {
  const [web3Modal, setWeb3Modal] = useState(null);

  // useEffect(() => {
  //   // Create the Web3Modal with the wagmiConfig
  //   const modal = createWeb3Modal(wagmiConfigC);
  //   setWeb3Modal(modal);
  // }, []);

  useEffect(() => {
    try {
      console.log('wagmiConfigC:', wagmiConfigC); // Debugging line
      if (wagmiConfigC) {
        const modal = createWeb3Modal(wagmiConfigC);
        setWeb3Modal(modal);
      } else {
        console.error('wagmiConfigC is not defined');
      }
    } catch (error) {
      console.error('Error creating web3Modal:', error);
    }
  }, [wagmiConfigC]); // Adding wagmiConfigC as a dependency

  return (
    <WagmiConfig config={wagmiConfigC}>
      {' '}
      {/* Ensure WagmiConfig wraps the provider */}
      <Web3ModalContext.Provider value={web3Modal}>
        {children}
      </Web3ModalContext.Provider>
    </WagmiConfig>
  );
}
