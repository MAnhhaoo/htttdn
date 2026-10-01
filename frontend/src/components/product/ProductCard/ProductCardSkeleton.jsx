export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col card-surface rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[4/5] bg-light-surface dark:bg-dark-surface" />
      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        <div className="w-16 h-2.5 bg-light-surface dark:bg-dark-surface rounded mb-2" />
        <div className="w-full h-3.5 bg-light-surface dark:bg-dark-surface rounded mb-1.5" />
        <div className="w-3/4 h-3.5 bg-light-surface dark:bg-dark-surface rounded mb-4" />
        <div className="mt-auto">
          <div className="w-10 h-2 bg-light-surface dark:bg-dark-surface rounded mb-1" />
          <div className="w-24 h-4 bg-light-surface dark:bg-dark-surface rounded" />
        </div>
      </div>
    </div>
  );
}
