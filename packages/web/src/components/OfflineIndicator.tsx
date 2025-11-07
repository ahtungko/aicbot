import { WifiOff, Wifi } from 'lucide-react';
import { useOffline } from '@/contexts/OfflineContext';
import { cn } from '@/lib/utils';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, unsentMessages } = useOffline();

  if (isOnline && unsentMessages.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 text-sm font-medium',
        !isOnline
          ? 'bg-destructive text-destructive-foreground'
          : 'bg-yellow-500 text-white'
      )}
    >
      {!isOnline ? (
        <>
          <WifiOff className="h-4 w-4" />
          <span>You are offline. Messages will be queued.</span>
        </>
      ) : unsentMessages.length > 0 ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>
            Back online. {unsentMessages.length} message{unsentMessages.length > 1 ? 's' : ''} queued.
          </span>
        </>
      ) : null}
    </div>
  );
};
