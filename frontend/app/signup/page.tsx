import { SignupForm } from "@/components/signup-form";
import PageLoading from "@/components/shared/page-loading";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function signupPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <Suspense fallback={<PageLoading variant="auth" />}>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  );
}
