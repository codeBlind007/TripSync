"use client";

import {
  createContext,
  Suspense,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

type NavigationProgressContextValue = {
  start: () => void;
  done: () => void;
};

const NavigationProgressContext =
  createContext<NavigationProgressContextValue | null>(null);

export function useNavigationProgress() {
  const context = useContext(NavigationProgressContext);
  if (!context) {
    throw new Error(
      "useNavigationProgress must be used within NavigationProgress"
    );
  }
  return context;
}

function scheduleUpdate(callback: () => void) {
  queueMicrotask(() => {
    startTransition(callback);
  });
}

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function isInternalNavigation(href: string | null) {
  if (!href || href.startsWith("#")) return false;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;

  try {
    const url = new URL(href, window.location.href);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

function isSameUrl(href: string) {
  try {
    const next = new URL(href, window.location.href);
    const current = new URL(window.location.href);
    return (
      next.pathname === current.pathname && next.search === current.search
    );
  } catch {
    return true;
  }
}

function NavigationProgressProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const activeRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRouteRef = useRef(true);
  const runDoneUiRef = useRef<() => void>(() => {});
  const startRef = useRef<() => void>(() => {});

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (completeTimerRef.current) {
      clearTimeout(completeTimerRef.current);
      completeTimerRef.current = null;
    }
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }, []);

  const runStartUi = useCallback(() => {
    if (!activeRef.current) return;

    clearTimers();
    setVisible(true);
    setProgress((current) => (current > 0 && current < 100 ? current : 12));

    intervalRef.current = setInterval(() => {
      setProgress((current) => {
        if (current >= 90) return current;
        const increment = Math.random() * 8 + 4;
        return Math.min(current + increment, 90);
      });
    }, 350);

    safetyTimerRef.current = setTimeout(() => {
      runDoneUiRef.current();
    }, 8000);
  }, [clearTimers]);

  const runDoneUi = useCallback(() => {
    if (!activeRef.current) return;

    clearTimers();
    activeRef.current = false;
    setProgress(100);

    completeTimerRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 280);
  }, [clearTimers]);

  runDoneUiRef.current = runDoneUi;

  const start = useCallback(() => {
    activeRef.current = true;
    scheduleUpdate(runStartUi);
  }, [runStartUi]);

  startRef.current = start;

  const done = useCallback(() => {
    if (!activeRef.current) return;
    scheduleUpdate(runDoneUi);
  }, [runDoneUi]);

  useEffect(() => {
    if (isFirstRouteRef.current) {
      isFirstRouteRef.current = false;
      return;
    }
    done();
  }, [pathname, searchParams, done]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (isModifiedClick(event)) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!isInternalNavigation(href)) return;
      if (!href || isSameUrl(href)) return;

      start();
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [start]);

  useEffect(() => {
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = (...args) => {
      const result = originalPushState(...args);
      startRef.current();
      return result;
    };

    history.replaceState = (...args) => {
      const result = originalReplaceState(...args);
      startRef.current();
      return result;
    };

    const onPopState = () => startRef.current();
    window.addEventListener("popstate", onPopState);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const contextValue = useMemo(() => ({ start, done }), [start, done]);

  return (
    <NavigationProgressContext.Provider value={contextValue}>
      <div
        aria-hidden={!visible}
        aria-live="polite"
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-100 transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0"
        )}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="relative h-0.5 w-full overflow-hidden bg-primary/15 shadow-[0_1px_6px] shadow-primary/25 sm:h-0.75">
          <div
            className="bg-primary h-full transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      {children}
    </NavigationProgressContext.Provider>
  );
}

export function NavigationProgress({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={children}>
      <NavigationProgressProvider>{children}</NavigationProgressProvider>
    </Suspense>
  );
}
