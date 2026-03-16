import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { HeroHeader } from "./header";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";

export default function HeroSection() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-x-hidden">
        <section className="relative isolate">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_45%),radial-gradient(circle_at_80%_20%,#ccfbf1_0%,transparent_40%)] dark:bg-[radial-gradient(circle_at_top_left,#0f172a_0%,transparent_45%),radial-gradient(circle_at_80%_20%,#0f3a44_0%,transparent_40%)]" />
          <div className="pb-24 pt-12 md:pb-32 lg:pb-40 lg:pt-44">
            <div className="relative mx-auto flex max-w-6xl flex-col px-6 lg:min-h-[34rem] lg:block">
              <div className="mx-auto max-w-lg text-center lg:ml-0 lg:w-1/2 lg:text-left">
                <h1 className="mt-8 max-w-2xl text-balance text-5xl font-medium md:text-6xl lg:mt-16 xl:text-7xl">
                  One workspace for every group trip.
                </h1>
                <p className="text-muted-foreground mt-8 max-w-2xl text-pretty text-lg">
                  TripSync keeps your itinerary, tasks, expenses, and trip room
                  chat in sync so your crew spends less time coordinating and
                  more time traveling.
                </p>

                <div className="mt-12 flex flex-col items-center justify-center gap-2 sm:flex-row lg:justify-start">
                  <Button asChild size="lg" className="px-5 text-base">
                    <Link href="/signup">
                      <span className="text-nowrap">Start Free</span>
                    </Link>
                  </Button>
                  <Button
                    key={2}
                    asChild
                    size="lg"
                    variant="ghost"
                    className="px-5 text-base"
                  >
                    <Link href="#features">
                      <span className="text-nowrap">Explore Features</span>
                    </Link>
                  </Button>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 text-sm sm:max-w-md">
                  <div className="rounded-lg border border-sky-200/70 bg-white/80 p-3 backdrop-blur-sm dark:border-sky-800/50 dark:bg-white/5">
                    <p className="font-medium">Live Trip Rooms</p>
                    <p className="text-muted-foreground mt-1">
                      Real-time group chat per trip.
                    </p>
                  </div>
                  <div className="rounded-lg border border-teal-200/70 bg-white/80 p-3 backdrop-blur-sm dark:border-teal-800/50 dark:bg-white/5">
                    <p className="font-medium">Shared Itinerary</p>
                    <p className="text-muted-foreground mt-1">
                      Edit plans together instantly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative mx-auto mt-12 w-full max-w-2xl lg:absolute lg:-right-4 lg:top-10 lg:mt-0 lg:w-[52%]">
                <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-sky-300/35 via-cyan-300/25 to-teal-300/35 blur-2xl dark:from-sky-700/35 dark:via-cyan-700/20 dark:to-teal-700/35" />
                <div className="relative overflow-hidden rounded-3xl border border-sky-200/70 bg-white/85 shadow-[0_25px_90px_-35px_rgba(2,132,199,0.55)] dark:border-sky-800/60 dark:bg-slate-900/70">
                  <Image
                    src="https://images.unsplash.com/photo-1501785888041-af3ef285b470"
                    alt="Mountain landscape"
                    width={3000}
                    height={2000}
                    priority
                    className="h-[19rem] w-full object-cover object-center sm:h-[24rem] lg:h-[29rem]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-sky-950/20 via-transparent to-cyan-400/20" />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-background pb-16 md:pb-32">
          <div className="group relative m-auto max-w-6xl px-6">
            <div className="flex flex-col items-center md:flex-row">
              <div className="relative py-6 md:w-[calc(100%-11rem)]">
                <div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"></div>
                <div className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20"></div>
                <ProgressiveBlur
                  className="pointer-events-none absolute left-0 top-0 h-full w-20"
                  direction="left"
                  blurIntensity={1}
                />
                <ProgressiveBlur
                  className="pointer-events-none absolute right-0 top-0 h-full w-20"
                  direction="right"
                  blurIntensity={1}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
