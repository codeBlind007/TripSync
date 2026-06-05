"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { buildClientApiUrl } from "@/lib/client-api";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const searchParams = useSearchParams();
  const token = searchParams.get("invite");
  const redirectUrl = searchParams.get("redirect_url");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignUp = () => {
    if (redirectUrl) {
      router.push(
        `/signup/google?redirect_url=${encodeURIComponent(redirectUrl)}`,
      );
      return;
    }

    router.push(token ? `/signup/google?invite=${token}` : "/signup/google");
  };

  useEffect(() => {
    const fetchInvitationData = async () => {
      if (!token) return;

      setIsLoading(true);
      try {
        await fetch(
          buildClientApiUrl(`/api/trips/invitations/validate?token=${token}`),
        );
      } catch (error) {
        console.error("Error fetching invitation data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchInvitationData();
  }, [token]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground text-balance">
                  Join TripSync and start planning your next adventure
                </p>
                {token && (
                  <p className="text-sm text-green-600 mt-2">
                    You have been invited to join a trip!
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full cursor-pointer"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="mr-2 h-4 w-4"
                >
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                {isLoading ? "Loading..." : "Continue with Google"}
              </Button>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <a
                  href={
                    redirectUrl
                      ? `/login?redirect_url=${encodeURIComponent(redirectUrl)}`
                      : "/login"
                  }
                  className="underline underline-offset-4"
                >
                  Sign in
                </a>
              </div>
            </div>
          </div>

          <div className="bg-muted relative hidden md:block">
            <Image
              src="/login-bg.jpg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover transition-all duration-500  "
              fill
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
