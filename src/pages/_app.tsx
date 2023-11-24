// import '@styles/globals.scss';
// import { AuthContextProvider } from '@lib/context/auth-context';
// // import { AuthContextProvider } from '@lib/context/web3-auth-context';
// import { ThemeContextProvider } from '@lib/context/theme-context';
// import { AppHead } from '@components/common/app-head';
// import type { ReactElement, ReactNode } from 'react';
// import type { NextPage } from 'next';
// import type { AppProps } from 'next/app';
// import { Web3Modal } from "@lib/context/Web3Modal";

// export const metadata = {
//   title: "Web3Modal",
//   description: "Web3Modal Example",
// };

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
//       {/* <WagmiConfig client={client}> */}
//       <Web3Modal>

//       <AuthContextProvider>
//         <AppHead /> {/* Ensure AuthContextProvider is here */}
//         <ThemeContextProvider>
//           {getLayout(<Component {...pageProps} />)}
//         </ThemeContextProvider>
//       </AuthContextProvider>
//       </Web3Modal>
//       {/* </WagmiConfig> */}
//       {/* <Web3Modal projectId={projectId} ethereumClient={ethereumClient} /> */}
//     </>
//   );
// }

import '@styles/globals.scss';
import { Web3AuthContextProvider } from '@lib/context/web3-auth-context';
import { ThemeContextProvider } from '@lib/context/theme-context';
import { AppHead } from '@components/common/app-head';
import type { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { Web3Modal } from '@lib/context/Web3Modal';

export const metadata = {
  title: 'Web3Modal',
  description: 'Web3Modal Example'
};

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({
  Component,
  pageProps
}: AppPropsWithLayout): ReactNode {
  const getLayout = Component.getLayout ?? ((page): ReactNode => page);

  return (
    <Web3Modal>
      <Web3AuthContextProvider>
        <AppHead />
        <ThemeContextProvider>
          {getLayout(<Component {...pageProps} />)}
        </ThemeContextProvider>
      </Web3AuthContextProvider>
    </Web3Modal>
  );
}
