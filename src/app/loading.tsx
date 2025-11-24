export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-800 dark:border-t-blue-400" />
        <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-400">
          Loading games...
        </p>
      </div>
    </div>
  );
}
