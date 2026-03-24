import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { HeroHeader } from "./header";

export default function HeroSection() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-x-clip">
        <section className="relative isolate">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_45%),radial-gradient(circle_at_80%_20%,#ccfbf1_0%,transparent_40%)] " />
          <div className="pb-12 pt-16 sm:pt-20 md:pb-16 md:pt-24 lg:pb-20 lg:pt-28">
            <div className="relative mx-auto flex max-w-[84rem] flex-col px-4 sm:px-6 lg:min-h-[34rem] lg:px-8 lg:block">
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
                  <div className="rounded-lg border border-sky-200/70 bg-white/80 p-3 backdrop-blur-sm  ">
                    <p className="font-medium">Live Trip Rooms</p>
                    <p className="text-muted-foreground mt-1">
                      Real-time group chat per trip.
                    </p>
                  </div>
                  <div className="rounded-lg border border-teal-200/70 bg-white/80 p-3 backdrop-blur-sm  ">
                    <p className="font-medium">Shared Itinerary</p>
                    <p className="text-muted-foreground mt-1">
                      Edit plans together instantly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative mx-auto mt-10 w-full max-w-2xl sm:mt-12 lg:absolute lg:right-0 lg:top-10 lg:mt-0 lg:w-[50%] xl:right-2">
                <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-sky-300/35 via-cyan-300/25 to-teal-300/35 blur-2xl   " />
                <div className="relative overflow-hidden rounded-3xl border border-sky-200/70 bg-white/85 shadow-[0_25px_90px_-35px_rgba(2,132,199,0.55)]  ">
                  <Image
                    src="https://images.unsplash.com/photo-1501785888041-af3ef285b470"
                    alt="Mountain landscape"
                    width={3000}
                    height={2000}
                    priority
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 50vw"
                    className="h-[16rem] w-full object-cover object-center sm:h-[22rem] lg:h-[29rem]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-sky-950/20 via-transparent to-cyan-400/20" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
