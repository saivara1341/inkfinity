import { Skeleton } from "@/components/ui/skeleton";

export const CardSkeleton = () => (
  <div className="bg-card rounded-[2rem] border border-border p-6 shadow-card space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
    <Skeleton className="h-10 w-full rounded-xl" />
    <div className="pt-4 border-t border-border/50 flex justify-between">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-3 w-12" />
    </div>
  </div>
);

export const WalletSkeleton = () => (
  <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-card space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-12 w-48" />
    </div>
    <div className="flex gap-4">
      <Skeleton className="h-16 flex-1 rounded-2xl" />
      <Skeleton className="h-16 flex-1 rounded-2xl" />
      <Skeleton className="h-16 flex-1 rounded-2xl" />
    </div>
    <div className="pt-6 border-t border-border/50">
      <Skeleton className="h-12 w-full rounded-2xl" />
    </div>
  </div>
);

export const ListSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card">
    <div className="p-5 border-b border-border bg-secondary/10 flex justify-between">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-6 w-16 rounded-lg" />
    </div>
    <div className="p-4 space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between pb-4 border-b border-border/50 last:border-0 last:pb-0">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="h-4 w-16 ml-auto" />
            <Skeleton className="h-3 w-12 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const DashboardHeroSkeleton = () => (
  <div className="bg-primary/5 rounded-[3rem] p-10 border border-primary/10 relative overflow-hidden">
    <div className="relative z-10 space-y-4">
      <Skeleton className="h-4 w-40 opacity-50" />
      <Skeleton className="h-12 w-96" />
      <Skeleton className="h-6 w-64 opacity-50" />
      <div className="flex gap-4 pt-4">
        <Skeleton className="h-12 w-40 rounded-2xl" />
        <Skeleton className="h-12 w-40 rounded-2xl" />
      </div>
    </div>
    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />
  </div>
);
