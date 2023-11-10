// import '@styles/globals.scss';

// // import { AuthContextProvider } from '@lib/context/auth-context';
// import { AuthContextProvider } from '@lib/context/web3-auth-context';
// import { ThemeContextProvider } from '@lib/context/theme-context';
// import { AppHead } from '@components/common/app-head';
// import type { ReactElement, ReactNode } from 'react';
// import type { NextPage } from 'next';
// import type { AppProps } from 'next/app';
// import {
//   EthereumClient,
//   w3mConnectors,
//   w3mProvider
// } from '@web3modal/ethereum';
// import { Web3Modal } from '@web3modal/react';
// import { configureChains, createConfig, WagmiConfig } from 'wagmi';
// import { arbitrum, mainnet, polygon } from 'wagmi/chains';

// const chains = [arbitrum, mainnet, polygon];
// const projectId = '5ba2615e3ddcb89e772c02f921fca2c3';

// const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
// const wagmiConfig = createConfig({
//   autoConnect: true,
//   connectors: w3mConnectors({ projectId, chains }),
//   publicClient
// });
// const ethereumClient = new EthereumClient(wagmiConfig, chains);

// type NextPageWithLayout = NextPage & {
//   getLayout?: (page: ReactElement) => ReactNode;
// };

// type AppPropsWithLayout = AppProps & {
//   Component: NextPageWithLayout;
// };

// export default function App({
//   Component,
//   pageProps
// }: AppPropsWithLayout): ReactNode {
//   const getLayout = Component.getLayout ?? ((page): ReactNode => page);

//   return (
//     <>
//       <AppHead />
//       <WagmiConfig config={wagmiConfig}>
//         <AuthContextProvider>
//           {' '}
//           {/* Ensure AuthContextProvider is here */}
//           <ThemeContextProvider>
//             {getLayout(<Component {...pageProps} />)}
//           </ThemeContextProvider>
//         </AuthContextProvider>
//       </WagmiConfig>
//       <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
//     </>
//   );
// }

import '@styles/globals.scss';
import { AuthContextProvider } from '@lib/context/web3-auth-context';
import { ThemeContextProvider } from '@lib/context/theme-context';
import { AppHead } from '@components/common/app-head';
// import { WagmiConfig } from 'wagmi';
// import { defaultWagmiConfig } from '@web3modal/wagmi/react';
// import { mainnet, arbitrum } from 'viem/chains';
// import { createWeb3Modal } from '@web3modal/wagmi/react';

import { Web3ModalProvider } from '../lib/context/Web3Modal'; // Adjust the import path as needed

// const projectId = '75f6b049bc9dfa057184fad34cb7207e';
// const metadata = {
//   name: 'Web3Modal',
//   description: 'Web3Modal Example',
//   url: 'https://web3modal.com',
//   icons: ['https://avatars.githubusercontent.com/u/37784886']
// };

// const chains = [mainnet, arbitrum];
// const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

export default function App({ Component, pageProps }) {
  // Initialize Web3Modal
  // Initialize Web3Modal with wagmiConfig
  // const web3Modal = createWeb3Modal(wagmiConfig);
  return (
    // <WagmiConfig config={wagmiConfig}>
    <Web3ModalProvider>
      <AppHead />
      <AuthContextProvider>
        <ThemeContextProvider>
          <Component {...pageProps} />
        </ThemeContextProvider>
      </AuthContextProvider>
    </Web3ModalProvider>
    // {/* </WagmiConfig> */}
  );
}
