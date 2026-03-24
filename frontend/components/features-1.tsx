import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ListTodo, MapPinned, ReceiptText } from "lucide-react";
import { ReactNode } from "react";

export default function Features() {
  return (
    <section
      id="features"
      className="bg-gradient-to-b from-sky-50 to-cyan-50/40 py-16 md:py-32  "
    >
      <div className="@container mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
            Everything your travel group needs, in one flow.
          </h2>
          <p className="text-muted-foreground mt-4">
            From pre-trip planning to on-trip coordination, TripSync helps
            everyone stay aligned.
          </p>
        </div>
        <div className="@min-4xl:max-w-full @min-4xl:grid-cols-3 mx-auto mt-8 grid max-w-sm gap-6 *:text-center md:mt-16">
          <Card className="group border-sky-200/70 bg-white/80 shadow-zinc-950/5 backdrop-blur-sm  ">
            <CardHeader className="pb-3">
              <CardDecorator>
                <MapPinned className="size-6" aria-hidden />
              </CardDecorator>

              <h3 className="mt-6 font-medium">Itinerary Collaboration</h3>
            </CardHeader>

            <CardContent>
              <p className="text-sm">
                Build and edit plans with your group in a shared itinerary so
                everyone sees the latest schedule.
              </p>
            </CardContent>
          </Card>

          <Card className="group border-cyan-200/70 bg-white/80 shadow-zinc-950/5 backdrop-blur-sm  ">
            <CardHeader className="pb-3">
              <CardDecorator>
                <ListTodo className="size-6" aria-hidden />
              </CardDecorator>

              <h3 className="mt-6 font-medium">Task Tracking</h3>
            </CardHeader>

            <CardContent>
              <p className="mt-3 text-sm">
                Assign responsibilities, mark progress, and avoid last-minute
                confusion before you leave.
              </p>
            </CardContent>
          </Card>

          <Card className="group border-teal-200/70 bg-white/80 shadow-zinc-950/5 backdrop-blur-sm  ">
            <CardHeader className="pb-3">
              <CardDecorator>
                <ReceiptText className="size-6" aria-hidden />
              </CardDecorator>

              <h3 className="mt-6 font-medium">Expense Visibility</h3>
            </CardHeader>

            <CardContent>
              <p className="mt-3 text-sm">
                Track shared trip expenses in one place and understand where the
                budget is going.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
  <div className="relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-sky-500)22%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-cyan-500)30%,transparent)]   ">
    <div
      aria-hidden
      className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px]"
    />
    <div
      aria-hidden
      className="bg-radial to-background absolute inset-0 from-transparent to-75%"
    />
    <div className="bg-background/95 text-sky-700  absolute inset-0 m-auto flex size-12 items-center justify-center border border-sky-300/70 ">
      {children}
    </div>
  </div>
);
