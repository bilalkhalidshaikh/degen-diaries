// import { AnimatePresence } from 'framer-motion';
// import { query, where, orderBy } from 'firebase/firestore';
// import { useCollection } from '@lib/hooks/useCollection';
// import { tweetsCollection } from '@lib/firebase/collections';
// import { useUser } from '@lib/context/user-context';
// import { UserLayout, ProtectedLayout } from '@components/layout/common-layout';
// import { MainLayout } from '@components/layout/main-layout';
// import { SEO } from '@components/common/seo';
// import { UserDataLayout } from '@components/layout/user-data-layout';
// import { UserHomeLayout } from '@components/layout/user-home-layout';
// import { Tweet } from '@components/tweet/tweet';
// import { Loading } from '@components/ui/loading';
// import { useTokenBalances } from '@lib/hooks/useTokenBalances'; // Adjust the path as necessary
// import { StatsEmpty } from '@components/tweet/stats-empty';
// import TokenList from '@components/tweet/TokenList';
// import type { ReactElement, ReactNode } from 'react';

// export default function UserLikes(): JSX.Element {
//   const { user } = useUser();

//   const { id, name, username } = user ?? {};

//   const { data, loading } = useCollection(
//     query(
//       tweetsCollection,
//       where('userLikes', 'array-contains', id),
//       orderBy('createdAt', 'desc')
//     ),
//     { includeUser: true, allowNull: true }
//   );

//   return (
//     <section>
//       {/* <SEO
//         title={`Tweets liked by ${name as string} (@${
//           username as string
//         }) / Twitter`}
//       />
//       {loading ? (
//         <Loading className='mt-5' />
//       ) : !data ? (
//         <StatsEmpty
//           title={`@${username as string} hasn't liked any Tweets`}
//           description='When they do, those Tweets will show up here.'
//         />
//       ) : (
//         <AnimatePresence mode='popLayout'>
//           {data.map((tweet) => (
//             <Tweet {...tweet} key={tweet.id} />
//           ))}
//         </AnimatePresence>
//       )} */}
//       <StatsEmpty
//         title={`This wallet does not has any Coins yet`}
//         description='When they do, those Coins will show up here.'
//       />
//     </section>
//   );
// }

// UserLikes.getLayout = (page: ReactElement): ReactNode => (
//   <ProtectedLayout>
//     <MainLayout>
//       <UserLayout>
//         <UserDataLayout>
//           <UserHomeLayout>{page}</UserHomeLayout>
//         </UserDataLayout>
//       </UserLayout>
//     </MainLayout>
//   </ProtectedLayout>
// );

import { AnimatePresence } from 'framer-motion';
import { query, where, orderBy } from 'firebase/firestore';
import { useCollection } from '@lib/hooks/useCollection';
import { tweetsCollection } from '@lib/firebase/collections';
import { useUser } from '@lib/context/user-context';
import { UserLayout, ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { SEO } from '@components/common/seo';
import { UserDataLayout } from '@components/layout/user-data-layout';
import { UserHomeLayout } from '@components/layout/user-home-layout';
import { Tweet } from '@components/tweet/tweet';
import { Loading } from '@components/ui/loading';
import { useTokenBalances } from '@lib/hooks/useTokenBalances'; // Adjust the path as necessary
import { StatsEmpty } from '@components/tweet/stats-empty';
import TokenList from '@components/tweet/TokenList';
import type { ReactElement, ReactNode } from 'react';
import { useAccount } from 'wagmi';

export default function UserLikes(): JSX.Element {
  const { user } = useUser();
  const { address } = useAccount();
  useEffect(() => {
    console.log('here is the add ', address);
  }, [address]);
  const { data: balanceData, isLoading } = useBalance({
    address: address
  });

  useEffect(() => {
    // You can do something with the balance data here if needed
    console.log('here is the bal ', balanceData);
  }, [balanceData]);

  if (isLoading) {
    return <Loading />; // Your loading component
  }

  if (!balanceData?.value) {
    return (
      <StatsEmpty
        title={`${user?.username} doesn't have any coins yet.`}
        description='When they do, those Coins will show up here.'
      />
    );
  }

  // Format balance for display
  const formattedBalance = balanceData.formatted;

  return (
    <section>
      <h1>Wallet Coins</h1>
      <p>
        {formattedBalance} {balanceData.symbol}
      </p>
      {/* Render additional UI components to display ERC-20 and ERC-721 tokens */}
    </section>
  );
}

UserLikes.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <MainLayout>
      <UserLayout>
        <UserDataLayout>
          <UserHomeLayout>{page}</UserHomeLayout>
        </UserDataLayout>
      </UserLayout>
    </MainLayout>
  </ProtectedLayout>
);
