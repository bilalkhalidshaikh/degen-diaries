import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3 from 'web3';

const provider = new WalletConnectProvider({
  rpc: {
    1: 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'
  }
});

const web3 = new Web3(provider);

export { provider, web3 };
