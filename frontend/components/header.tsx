"use client";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import { ModeToggle } from "./mode-toggle";

const menuItems = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Testimonials", href: "#testimonials" },
  { name: "Contact", href: "#contact" },
];

export const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  return (
    <header>
      <nav className="fixed inset-x-0 top-0 z-50 pt-2 sm:pt-3 lg:pt-4">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 transition-all duration-300">
          <div
            data-state={menuState && "active"}
            className="relative flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-sky-200/70 bg-white/70 px-3 py-2 shadow-[0_12px_35px_-20px_rgba(2,132,199,0.55)] backdrop-blur-2xl dark:border-slate-700/80 dark:bg-slate-950/70 sm:px-4 sm:py-2.5 lg:gap-0 lg:px-6 lg:py-3"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent"
            />
            <div className="flex w-full items-center justify-between gap-4 lg:w-auto lg:gap-12">
              <Link href="/" aria-label="home" className="flex items-center">
                <Logo alt="TripSync" className="h-auto w-28 sm:w-36 lg:w-40" />
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>

              <div className="hidden lg:block">
                <ul className="flex gap-8 text-sm">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-cyan-700 dark:hover:text-cyan-300 block duration-150"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="in-data-[state=active]:block lg:in-data-[state=active]:flex mb-2 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-2xl border border-sky-200/70 bg-white/85 p-6 shadow-2xl shadow-sky-200/20 backdrop-blur-xl md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:border-slate-700/80 dark:bg-slate-900/90 dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-cyan-700 dark:hover:text-cyan-300 block duration-150"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <Button asChild variant="outline" size="sm">
                  <Link href="/login">
                    <span>Login</span>
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/signup">
                    <span>Sign Up</span>
                  </Link>
                </Button>
                <ModeToggle />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
