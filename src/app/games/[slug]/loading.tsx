export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button Skeleton */}
      <div className="mb-6 h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

      {/* Title Skeleton */}
      <div className="mb-8">
        <div className="mb-4 h-10 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="flex gap-2">
          <div className="h-8 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="h-8 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>

      {/* Player Skeleton */}
      <div className="aspect-video w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />

      {/* Description Skeleton */}
      <div className="mt-8">
        <div className="mb-4 h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="space-y-2">
          <div className="h-6 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-6 w-5/6 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>

      {/* Related Games Skeleton */}
      <div className="mt-12">
        <div className="mb-6 h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800"
            >
              <div className="aspect-[4/3] w-full animate-pulse bg-gray-200 dark:bg-gray-800" />
              <div className="p-4">
                <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
