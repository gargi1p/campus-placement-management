import clsx from 'clsx';

export const Skeleton = ({ className }) => (
  <div className={clsx('animate-pulse rounded-lg bg-gray-200', className)} />
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: cols }).map((_, j) => <Skeleton key={j} className="h-8 flex-1" />)}
      </div>
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <Skeleton className="mb-4 h-4 w-1/3" />
    <Skeleton className="mb-2 h-8 w-1/2" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

export const PageLoader = () => (
  <div className="flex h-64 items-center justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
  </div>
);
