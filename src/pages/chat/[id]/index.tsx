import React from 'react';
import { useRouter } from 'next/router';
import Chat from '../../../pages/chat'; // Adjust the path to point to your Chat component

function LoadingComponent() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      Loading...
    </div>
  );
}

function ChatPage() {
  const router = useRouter();
  const { id } = router.query;

  return id ? <Chat chatId={id as string} /> : <LoadingComponent />;
}

export default ChatPage;
