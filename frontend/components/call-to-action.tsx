import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CallToAction() {
  return (
    <section
      id="get-started"
      className="relative overflow-hidden bg-gradient-to-b from-cyan-300 via-sky-500 to-teal-600 py-16 text-white md:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-cyan-100/70 to-transparent dark:from-slate-900/70"
      />
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative rounded-3xl border border-white/30 bg-white/12 px-6 py-12 text-center shadow-xl backdrop-blur-sm md:px-10">
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
            Ready to organize your next group trip in minutes?
          </h2>
          <p className="mt-4 text-cyan-50/90">
            Create a trip room, invite collaborators, build an itinerary, and
            track tasks and expenses with one shared source of truth.
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-white text-cyan-700 hover:bg-cyan-50"
            >
              <Link href="/signup">
                <span>Create Free Account</span>
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/70 bg-white/5 text-white hover:bg-white/15"
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
