export default function Loading({ fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-4 border-primary-light border-t-primary rounded-full animate-spin"></div>
      <p className="text-sm text-light-muted dark:text-dark-muted font-medium">Loading...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-dark-bg/80 flex items-center justify-center z-50 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return <div className="py-12 flex justify-center">{content}</div>;
}
