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
}

const Web3Context = createContext<Web3ContextProps>({ web3: null });

interface Web3ProviderProps {
  children: ReactNode;
}

const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [web3, setWeb3] = useState<Web3 | null>(null);

  useEffect(() => {
    const connectWeb3 = async () => {
      if (window.ethereum) {
        try {
          const _web3 = new Web3(window.ethereum);
          await window.ethereum.enable();
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

  console.log('Web3:', web3);

  const handleWeb3Registration = async () => {
    try {
      const { accounts } = await web3Auth();
      console.log('Web3 accounts:', accounts);
      // Here you can use the accounts obtained from Web3 registration
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

const useWeb3 = () => {
  return useContext(Web3Context);
};

export { Web3Provider, useWeb3 };
