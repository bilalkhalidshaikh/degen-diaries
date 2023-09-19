import cn from 'clsx';
import type { ReactNode } from 'react';

type MainContainerProps = {
  children: ReactNode;
  className?: string;
  additionalStyles?: string; // New prop to add additional styles
};

export function MainContainer({
  children,
  className,
  additionalStyles = '' // Default value for the new prop
}: MainContainerProps): JSX.Element {
  return (
    <main
      className={cn(
        `hover-animation flex min-h-screen w-full max-w-xl flex-col border-x-0
         border-light-border pb-96 dark:border-dark-border xs:border-x`,
        className,
        additionalStyles // Applying the new prop here
      )}
    >
      {children}
    </main>
  );
}
