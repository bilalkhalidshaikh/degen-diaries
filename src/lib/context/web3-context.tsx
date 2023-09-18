// import {
//   useEffect,
//   useState,
//   createContext,
//   useContext,
//   ReactNode
// } from 'react';
// import Web3 from 'web3';
// import WalletConnectProvider from '@walletconnect/web3-provider';

// interface Web3ContextProps {
//   web3: Web3 | null;
//   handleWeb3Registration: () => Promise<void>;
// }

// const Web3Context = createContext<Web3ContextProps>({
//   web3: null,
//   handleWeb3Registration: async () => {} // Placeholder function
// });

// interface Web3ProviderProps {
//   children: ReactNode;
// }

// const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
//   const [web3, setWeb3] = useState<Web3 | null>(null);
//   const [isConnecting, setIsConnecting] = useState(false);

//   const connectWeb3 = async () => {
//     setIsConnecting(true);

//     try {
//       const provider = new WalletConnectProvider({
//         rpc: {
//           1: 'https://mainnet.eth.aragon.network'
//           // Add more networks if needed
//         }
//       });

//       await provider.enable();
//       const _web3 = new Web3(provider);
//       setWeb3(_web3);
//     } catch (error) {
//       console.error('Error connecting to WalletConnect:', error.message);
//     } finally {
//       setIsConnecting(false);
//     }
//   };

//   const handleWeb3Registration = async () => {
//     if (!web3) {
//       console.error('Web3 instance is not available.');
//       return;
//     }

//     try {
//       const accounts = await web3.eth.getAccounts();
//       console.log('Web3 accounts:', accounts);
//       // Here you can use the accounts obtained from Web3 registration
//     } catch (error) {
//       console.error('Error getting accounts:', error.message);
//     }
//   };

//   return (
//     <Web3Context.Provider
//       value={{ web3, handleWeb3Registration, connectWeb3, isConnecting }}
//     >
//       {children}
//     </Web3Context.Provider>
//   );
// };

// const useWeb3 = (): Web3ContextProps => {
//   return useContext(Web3Context);
// };

// export { Web3Provider, useWeb3 };
