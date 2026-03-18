import { Skeleton } from "@/components/ui/skeleton";

type LoadingVariant = "default" | "dashboard" | "ongoingTrips" | "auth";

interface PageLoadingProps {
  variant?: LoadingVariant;
}

function AuthLoading() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl space-y-4">
        <Skeleton className="h-6 w-28 sm:w-32 mx-auto" />
        <Skeleton className="h-[360px] sm:h-[420px] w-full rounded-xl" />
      </div>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="w-full p-3 sm:p-4 md:p-6 space-y-6 sm:space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <Skeleton className="h-9 sm:h-10 w-40 sm:w-48" />
        <Skeleton className="h-9 sm:h-10 w-24 sm:w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-28 sm:w-36" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-56 sm:h-64 w-full" />
          <Skeleton className="h-56 sm:h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

function OngoingTripsLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto mt-6 sm:mt-8 px-4 sm:px-6 py-1 space-y-6 sm:space-y-8">
      <div className="flex items-center gap-3 sm:gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 w-40 sm:w-64" />
      </div>
      <Skeleton className="h-4 w-32 sm:w-48 -mt-3 sm:-mt-4" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            className="h-[320px] sm:h-[400px] w-full rounded-xl"
          />
        ))}
      </div>
    </div>
  );
}

function DefaultLoading() {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <Skeleton className="h-10 w-40 sm:w-64" />
      <Skeleton className="h-4 w-32 sm:w-48" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-44 sm:h-52 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function PageLoading({ variant = "default" }: PageLoadingProps) {
  switch (variant) {
    case "auth":
      return <AuthLoading />;
    case "dashboard":
      return <DashboardLoading />;
    case "ongoingTrips":
      return <OngoingTripsLoading />;
    default:
      return <DefaultLoading />;
  }
}
