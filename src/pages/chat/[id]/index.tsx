import React from 'react';
import { useRouter } from 'next/router';
import Chat from '../../../pages/chat'; // Adjust the path to point to your Chat component
import { Loading } from '@components/ui/loading';

function LoadingComponent() {
  return <Loading className='mt-5 w-full' />;
}

function ChatPage() {
  const router = useRouter();
  const { id } = router.query;
  console.log('here ist das', id);

  return id ? <Chat chatId={id as string} /> : <LoadingComponent />;
}

export default ChatPage;
