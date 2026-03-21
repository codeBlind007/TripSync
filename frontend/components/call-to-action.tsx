import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CallToAction() {
  return (
    <section
      id="get-started"
      className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-cyan-50/70 to-background py-16 text-foreground md:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/80 to-transparent dark:from-slate-900/70"
      />
      <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-sky-200/70 bg-white/85 px-6 py-12 text-center shadow-xl shadow-sky-200/30 backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/70 md:px-10">
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
            Ready to organize your next group trip in minutes?
          </h2>
          <p className="text-muted-foreground mt-4">
            Create a trip room, invite collaborators, build an itinerary, and
            track tasks and expenses with one shared source of truth.
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-cyan-600 text-white hover:bg-cyan-700"
            >
              <Link href="/signup">
                <span>Create Free Account</span>
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-cyan-200 bg-white text-cyan-700 hover:bg-cyan-50 dark:border-cyan-700 dark:bg-slate-900 dark:text-cyan-200 dark:hover:bg-slate-800"
            >
              <Link href="/login">
                <span>Go to Login</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
