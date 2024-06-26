import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import cn from 'clsx';
// import { useAuth } from '@lib/context/auth-context';
import { useAuth } from '@lib/context/web3-auth-context';
import { useModal } from '@lib/hooks/useModal';
import { delayScroll } from '@lib/utils';
import { Modal } from '@components/modal/modal';
import { TweetReplyModal } from '@components/modal/tweet-reply-modal';
import { ImagePreview } from '@components/input/image-preview';
import { UserAvatar } from '@components/user/user-avatar';
import { UserTooltip } from '@components/user/user-tooltip';
import { UserName } from '@components/user/user-name';
import { UserUsername } from '@components/user/user-username';
import { TweetActions } from './tweet-actions';
import { TweetStatus } from './tweet-status';
import { TweetStats } from './tweet-stats';
import { TweetDate } from './tweet-date';
import type { Variants } from 'framer-motion';
import type { Tweet } from '@lib/types/tweet';
import type { User } from '@lib/types/user';
import Sheet from '@mui/joy/Sheet';
import Stack from '@mui/joy/Stack';
import { styled } from '@mui/joy/styles';

export type TweetProps = Tweet & {
  user: User;
  modal?: boolean;
  pinned?: boolean;
  profile?: User | null;
  parentTweet?: boolean;
};

export const variants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.8 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

export function Tweet(tweet: TweetProps): JSX.Element {
  const {
    id: tweetId,
    text,
    modal,
    images,
    parent,
    pinned,
    profile,
    userLikes,
    createdBy,
    createdAt,
    parentTweet,
    userReplies,
    userRetweets,
    user: tweetUserData
  } = tweet;

  const { id: ownerId, name, username, verified, photoURL } = tweetUserData;

  const { user } = useAuth();

  const { open, openModal, closeModal } = useModal();

  const tweetLink = `/tweet/${tweetId}`;

  const userId = user?.id as string;

  const isOwner = userId === createdBy;

  const { id: parentId, username: parentUsername = username } = parent ?? {};

  const {
    id: profileId,
    name: profileName,
    username: profileUsername
  } = profile ?? {};

  const reply = !!parent;
  const tweetIsRetweeted = userRetweets.includes(profileId ?? '');

  return (
    // <motion.article
    //   {...(!modal ? { ...variants, layout: 'position' } : {})}
    //   animate={{
    //     ...variants.animate,
    //     ...(parentTweet && { transition: { duration: 0.2 } })
    //   }}
    //   className='opacity-8 z-1 border-radius-10 mb-4 rounded-lg border-none bg-opacity-40 p-4 shadow-md backdrop-blur-md dark:bg-[#2a51be0e]' // Added glassmorphism styles
    // >
    //   <Modal
    //     className='flex items-start justify-center'
    //     modalClassName='bg-main-background rounded-2xl max-w-xl w-full my-8 overflow-hidden'
    //     open={open}
    //     closeModal={closeModal}
    //   >
    //     <TweetReplyModal tweet={tweet} closeModal={closeModal} />
    //   </Modal>
    //   <Link href={tweetLink} scroll={!reply}>
    //     <a
    //       className={cn(
    //         `accent-tab hover-card relative flex flex-col
    //      gap-y-4 outline-none duration-200` // Removed padding and background color from here
    //         // parentTweet
    //         //   ? 'mt-0.5 pb-0 pt-2.5'
    //         //   : 'border-b border-light-border dark:border-dark-border'
    //       )}
    //       onClick={delayScroll(200)}
    //     >
    //       <div className='grid grid-cols-[auto,1fr] gap-x-3 gap-y-1'>
    //         <AnimatePresence initial={false}>
    //           {modal ? null : pinned ? (
    //             <TweetStatus type='pin'>
    //               <p className='text-sm font-bold'>Pinned Tweet</p>
    //             </TweetStatus>
    //           ) : (
    //             tweetIsRetweeted && (
    //               <TweetStatus type='tweet'>
    //                 <Link href={profileUsername as string}>
    //                   <a className='custom-underline truncate text-sm font-bold'>
    //                     {userId === profileId ? 'You' : profileName} Retweeted
    //                   </a>
    //                 </Link>
    //               </TweetStatus>
    //             )
    //           )}
    //         </AnimatePresence>
    //         <div className='flex flex-col items-center gap-2'>
    //           <UserTooltip avatar modal={modal} {...tweetUserData}>
    //             <UserAvatar src={photoURL} alt={name} username={username} />
    //           </UserTooltip>
    //           {parentTweet && (
    //             <i className='hover-animation h-full w-0.5 bg-light-line-reply dark:bg-dark-line-reply' />
    //           )}
    //         </div>
    //         <div className='flex min-w-0 flex-col'>
    //           <div className='flex justify-between gap-2 text-light-secondary dark:text-dark-secondary'>
    //             <div className='flex gap-1 truncate xs:overflow-visible xs:whitespace-normal'>
    //               <UserTooltip modal={modal} {...tweetUserData}>
    //                 <UserName
    // name={name}
    // username={username}
    // verified={verified}
    //                   className='text-light-primary dark:text-dark-primary'
    //                 />
    //               </UserTooltip>
    //               <UserTooltip modal={modal} {...tweetUserData}>
    //                 <UserUsername username={username} />
    //               </UserTooltip>
    //               <TweetDate tweetLink={tweetLink} createdAt={createdAt} />
    //             </div>
    //             <div className='px-4'>
    //               {!modal && (
    //                 <>
    //                   {/* <UserTooltip bio={user?.walletAddress || "Wallet Address Not Available"}>
    //                  <button className="p-2 hover:bg-opacity-50 hover:bg-gray-300 rounded-full">
    //                    Coins
    //                  </button>
    //                </UserTooltip> */}
    //                   <TweetActions
    //                     isOwner={isOwner}
    //                     ownerId={ownerId}
    //                     tweetId={tweetId}
    //                     parentId={parentId}
    //                     username={username}
    //                     hasImages={!!images}
    //                     createdBy={createdBy}
    //                   />
    //                 </>
    //               )}
    //             </div>
    //           </div>
    //           {(reply || modal) && (
    //             <p
    //               className={cn(
    //                 'text-light-secondary dark:text-dark-secondary',
    //                 modal && 'order-1 my-2'
    //               )}
    //             >
    //               Replying to{' '}
    //               <Link href={`/user/${parentUsername}`}>
    //                 <a className='custom-underline text-main-accent'>
    //                   @{parentUsername}
    //                 </a>
    //               </Link>
    //             </p>
    //           )}
    //           {text && (
    //             <p className='whitespace-pre-line break-words'>{text}</p>
    //           )}
    //           <div className='mt-1 flex flex-col gap-2'>
    //             {images && (
    //               <ImagePreview
    //                 tweet
    //                 imagesPreview={images}
    //                 previewCount={images.length}
    //               />
    //             )}
    //             {!modal && (
    //               <TweetStats
    //                 reply={reply}
    //                 userId={userId}
    //                 isOwner={isOwner}
    //                 tweetId={tweetId}
    //                 userLikes={userLikes}
    //                 userReplies={userReplies}
    //                 userRetweets={userRetweets}
    //                 openModal={!parent ? openModal : undefined}
    //               />
    //             )}
    //           </div>
    //         </div>
    //       </div>
    //     </a>
    //   </Link>
    // </motion.article>

    <motion.article
      {...(!modal ? { ...variants, layout: 'position' } : {})}
      animate={{
        ...variants.animate,
        ...(parentTweet && { transition: { duration: 0.2 } })
      }}
      className='opacity-8 z-1 border-radius-10 mb-4 rounded-lg border-none bg-opacity-40 p-4 shadow-md  dark:bg-[#122130]' // Added glassmorphism styles
    >
      <Modal
        className='flex items-start justify-center'
        modalClassName='bg-main-background rounded-2xl max-w-xl w-full my-8 overflow-hidden'
        open={open}
        closeModal={closeModal}
      >
        <TweetReplyModal tweet={tweet} closeModal={closeModal} />
      </Modal>
      <Link href={tweetLink} scroll={!reply}>
        <a
          className={cn(
            `accent-tab hover-card relative flex flex-col 
           gap-y-4 px-4 py-3 outline-none duration-200`,
            parentTweet
              ? 'mt-0.5 pb-0 pt-2.5'
              : 'border-b border-light-border dark:border-dark-border'
          )}
          onClick={delayScroll(200)}
        >
          <div className='grid grid-cols-[auto,1fr] gap-x-3 gap-y-1'>
            <AnimatePresence initial={false}>
              {modal ? null : pinned ? (
                <TweetStatus type='pin'>
                  <p className='text-sm font-bold'>Pinned Diaries</p>
                </TweetStatus>
              ) : (
                tweetIsRetweeted && (
                  <TweetStatus type='tweet'>
                    <Link href={profileUsername as string}>
                      <a className='custom-underline truncate text-sm font-bold'>
                        {userId === profileId ? 'You' : profileName} Reposted
                      </a>
                    </Link>
                  </TweetStatus>
                )
              )}
            </AnimatePresence>
            <div className='flex flex-col items-center gap-2'>
              <UserTooltip avatar modal={modal} {...tweetUserData}>
                <UserAvatar
                  size={62}
                  src={photoURL}
                  alt={name}
                  username={username}
                />
              </UserTooltip>
              {parentTweet && (
                <i className='hover-animation h-full w-0.5 bg-light-line-reply dark:bg-dark-line-reply' />
              )}
            </div>
            <div className='flex min-w-0 flex-col'>
              <div className='flex justify-between gap-2 text-light-secondary dark:text-dark-secondary'>
                <div className='flex gap-1 truncate xs:overflow-visible xs:whitespace-normal'>
                  <UserTooltip modal={modal} {...tweetUserData}>
                    <UserName
                      name={name}
                      username={username}
                      verified={verified}
                      className='text-light-primary dark:text-dark-primary'
                    />
                  </UserTooltip>
                  <UserTooltip modal={modal} {...tweetUserData}>
                    <UserUsername username={username} />
                  </UserTooltip>
                </div>
                <br />
              </div>
              <TweetDate tweetLink={tweetLink} createdAt={createdAt} />
              <div>
                <div className='px-4'></div>
              </div>
              {(reply || modal) && (
                <p
                  className={cn(
                    'text-light-secondary dark:text-dark-secondary',
                    modal && 'order-1 my-2'
                  )}
                >
                  Replying to{' '}
                  <Link href={`/user/${parentUsername}`}>
                    <a className='custom-underline text-main-accent'>
                      @{parentUsername}
                    </a>
                  </Link>
                </p>
              )}
              <br />
              <div className='px-4'></div>
              <br />
              {text && (
                <p className='whitespace-pre-line break-words'>{text}</p>
              )}
              <div className='mt-1 flex flex-col gap-2'>
                {images && (
                  <ImagePreview
                    tweet
                    imagesPreview={images}
                    previewCount={images.length}
                  />
                )}
                {!modal && (
                  <div
                    className={cn(
                      'flex pr-8 pt-0 text-light-secondary inner:outline-none dark:text-dark-secondary'
                    )}
                  >
                    {/* <Stack direction='row' spacing={1}> */}
                    <TweetStats
                      reply={reply}
                      userId={userId}
                      isOwner={isOwner}
                      tweetId={tweetId}
                      userLikes={userLikes}
                      userReplies={userReplies}
                      userRetweets={userRetweets}
                      openModal={!parent ? openModal : undefined}
                    />
                    {/* {!modal && ( */}
                    <TweetActions
                      isOwner={isOwner}
                      ownerId={ownerId}
                      tweetId={tweetId}
                      parentId={parentId}
                      username={username}
                      hasImages={!!images}
                      createdBy={createdBy}
                    />
                    {/* </Stack> */}
                    {/* // )} */}
                  </div>
                )}
              </div>
            </div>
          </div>
        </a>
      </Link>
    </motion.article>
  );
}
