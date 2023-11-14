// import '@styles/globals.scss';
// // import {
// //   EthereumClient,
// //   w3mConnectors,
// //   w3mProvider
// // } from '@web3modal/ethereum';
// // import { Web3Modal } from '@web3modal/react';
// // import { configureChains, createConfig, WagmiConfig } from 'wagmi';
// // import { arbitrum, mainnet, polygon } from 'wagmi/chains';
// // import { AuthContextProvider } from '@lib/context/auth-context';
// import { AuthContextProvider } from '@lib/context/web3-auth-context';
// import { ThemeContextProvider } from '@lib/context/theme-context';
// import { AppHead } from '@components/common/app-head';
// import type { ReactElement, ReactNode } from 'react';
// import type { NextPage } from 'next';
// import type { AppProps } from 'next/app';
// // import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
// // import { WagmiConfig } from 'wagmi'
// // import { arbitrum, mainnet } from 'viem/chains'
// import { WagmiConfig, configureChains, mainnet } from "wagmi";
// import { publicProvider } from 'wagmi/providers/public'
// import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
// import { polygonMumbai } from "wagmi/chains";

// // const { publicClient, webSocketPublicClient } = configureChains(
// //   [mainnet],
// //   [publicProvider()],
// // )

// // const config = createConfig({
// //   publicClient,
// //   webSocketPublicClient,
// // })

// // 3. Create modal

// // const chains = [arbitrum, mainnet, polygon];

// // const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
// // const wagmiConfig = createConfig({
// //   autoConnect: true,
// //   connectors: w3mConnectors({ projectId, chains }),
// //   publicClient
// // });
// // const ethereumClient = new EthereumClient(wagmiConfig, chains);

// // 1. Get projectId
// // 2. Create wagmiConfig
// const projectId = '75f6b049bc9dfa057184fad34cb7207e';
// const metadata = {
//   name: 'Web3Modal',
//   description: 'Web3Modal Example',
//   url: 'https://web3modal.com',
//   icons: ['https://avatars.githubusercontent.com/u/37784886']
// }

// // const chains = [mainnet, arbitrum]
// // const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

// // configure the chains and provider that you want to use for your app,
// // keep in mind that you're allowed to pass any EVM-compatible chain.
// // It is also encouraged that you pass both alchemyProvider and infuraProvider.
// const { chains, provider, webSocketProvider } = configureChains(
//   [mainnet, polygonMumbai],
//   [publicProvider()]
// );

// // This creates a wagmi client instance of createClient
// // and passes in the provider and webSocketProvider.

// const client = configureChains({
//   autoConnect: false,
//   provider,
//   webSocketProvider,
//   connectors: [ // connectors is to connect your wallet, defaults to InjectedConnector();

//     new WalletConnectConnector({
//       chains,
//       options: {
//         projectId: projectId,
//       },
//     }),
//   ],
// });

// type NextPageWithLayout = NextPage & {
//   getLayout?: (page: ReactElement) => ReactNode;
// };

// type AppPropsWithLayout = AppProps & {
//   Component: NextPageWithLayout;
// };

// // 3. Create modal
// // createWeb3Modal({ wagmiConfig, projectId, chains })

// export default function App({
//   Component,
//   pageProps
// }: AppPropsWithLayout): ReactNode {
//   const getLayout = Component.getLayout ?? ((page): ReactNode => page);

//   return (
//     <>
//       <WagmiConfig client={client}>
//       <AppHead />
//         <AuthContextProvider>
//           {' '}
//           {/* Ensure AuthContextProvider is here */}
//           <ThemeContextProvider>
//             {getLayout(<Component {...pageProps} />)}
//           </ThemeContextProvider>
//         </AuthContextProvider>
//       </WagmiConfig>
//       {/* <Web3Modal projectId={projectId} ethereumClient={ethereumClient} /> */}
//     </>
//   );
// }
