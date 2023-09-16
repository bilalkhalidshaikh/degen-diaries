// web3-context.tsx

import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext
} from 'react';
import Web3 from 'web3';

interface Web3ContextProps {
  web3: Web3 | null;
  handleWeb3Registration: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextProps>({
  web3: null,
  handleWeb3Registration: async () => {} // Placeholder function
});

interface Web3ProviderProps {
  children: ReactNode;
}

const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [web3, setWeb3] = useState<Web3 | null>(null);

  useEffect(() => {
    const connectWeb3 = async () => {
      if ((window as any).ethereum) {
        const _web3 = new Web3((window as any).ethereum);
        try {
          await (window as any).ethereum.enable();
          setWeb3(_web3);
        } catch (error) {
          console.error('Error connecting to MetaMask:', error.message);
        }
      } else {
        console.log('MetaMask not detected. Install or enable it.');
      }
    };
    connectWeb3();
  }, []);

  const handleWeb3Registration = async () => {
    try {
      if (web3) {
        const accounts = await web3.eth.getAccounts();
        console.log('Web3 accounts:', accounts);
        // Here you can use the accounts obtained from Web3 registration
      } else {
        console.error('Web3 instance is not available.');
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error.message);
    }
  };

  return (
    <Web3Context.Provider value={{ web3, handleWeb3Registration }}>
      {children}
    </Web3Context.Provider>
  );
};

const useWeb3 = (): Web3ContextProps => {
  return useContext(Web3Context);
};

export { Web3Provider, useWeb3 };
