// @components/notifications/MainContainer.tsx
import React from 'react';

type MainContainerProps = {
  children: React.ReactNode;
};

const MainContainer: React.FC<MainContainerProps> = ({ children }) => {
  return <div className='mx-auto max-w-2xl p-4'>{children}</div>;
};

export default MainContainer;
