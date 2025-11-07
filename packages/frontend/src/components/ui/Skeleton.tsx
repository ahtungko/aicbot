import React from 'react';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function Skeleton({ className = '', children }: SkeletonProps) {
  return (
    <div
      className={`loading-shimmer rounded ${className}`}
      role="status"
      aria-label="Loading"
    >
      {children}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-3 p-4">
      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function ConversationSkeleton() {
  return (
    <div className="p-3 border-b hover:bg-gray-50 cursor-pointer">
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}