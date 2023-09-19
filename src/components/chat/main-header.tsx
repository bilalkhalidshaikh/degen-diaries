import cn from 'clsx';
import { Button } from '@components/ui/button';
import { HeroIcon } from '@components/ui/hero-icon';
import { ToolTip } from '@components/ui/tooltip';
import { MobileSidebar } from '@components/sidebar/mobile-sidebar';
import type { ReactNode } from 'react';
import type { IconName } from '@components/ui/hero-icon';

type MainHeaderProps = {
  tip?: string;
  title?: string;
  children?: ReactNode;
  iconName?: IconName;
  className?: string;
  disableSticky?: boolean;
  useActionButton?: boolean;
  useMobileSidebar?: boolean;
  action?: () => void;
  headerBackground?: string; // New prop to customize the background of the header
};

export function MainHeader({
  tip,
  title,
  children,
  iconName,
  className,
  disableSticky,
  useActionButton,
  useMobileSidebar,
  action,
  headerBackground = 'bg-main-background/60' // Default value for the new prop
}: MainHeaderProps): JSX.Element {
  return (
    <header
      className={cn(
        'hover-animation even z-10 px-4 py-2 backdrop-blur-md',
        headerBackground, // Applying the new prop here
        !disableSticky && 'sticky top-0',
        className ?? 'flex items-center gap-6'
      )}
    >
      {useActionButton && (
        <Button
          className='dark-bg-tab group relative p-2 hover:bg-light-primary/10 active:bg-light-primary/20 
                     dark:hover:bg-dark-primary/10 dark:active:bg-dark-primary/20'
          onClick={action}
        >
          <HeroIcon
            className='h-5 w-5'
            iconName={iconName ?? 'ArrowLeftIcon'}
          />
          <ToolTip tip={tip ?? 'Back'} />
        </Button>
      )}
      {title && (
        <div className='flex gap-8'>
          {useMobileSidebar && <MobileSidebar />}
          <h2 className='text-xl font-bold' key={title}>
            {title}
          </h2>
        </div>
      )}
      {children}
    </header>
  );
}
