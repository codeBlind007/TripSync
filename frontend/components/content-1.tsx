export default function ContentSection() {
  return (
    <section
      id="how-it-works"
      className="bg-gradient-to-b from-background to-cyan-100/60 py-16 md:pt-24 md:pb-20 "
    >
      <div className="mx-auto max-w-[84rem] space-y-8 px-4 sm:px-6 md:space-y-16 lg:px-8">
        <h2 className="relative z-10 max-w-xl text-4xl font-medium lg:text-5xl">
          From invite to check-in, everyone stays on the same page.
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24">
          <div className="relative mb-6 sm:mb-0">
            <div className="bg-muted/40 rounded-2xl border border-sky-200/70 p-6 ">
              <p className="text-sm font-medium">
                How a trip comes together in TripSync
              </p>
              <div className="mt-5 space-y-4">
                <div className="rounded-lg border border-sky-200/70 bg-background p-4 ">
                  <p className="text-sm font-medium">1. Create Trip Room</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Start a trip workspace with destination, dates, and core
                    details.
                  </p>
                </div>
                <div className="rounded-lg border border-cyan-200/70 bg-background p-4 ">
                  <p className="text-sm font-medium">2. Invite Your Group</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Add collaborators, manage pending invites, and bring
                    everyone in.
                  </p>
                </div>
                <div className="rounded-lg border border-teal-200/70 bg-background p-4 ">
                  <p className="text-sm font-medium">3. Plan, Assign, Track</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Build itinerary, assign tasks, and monitor shared trip
                    expenses.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative space-y-4">
            <p className="text-muted-foreground">
              TripSync is more than a planner.{" "}
              <span className="text-accent-foreground font-bold">
                It is your group trip command center
              </span>{" "}
              with invitations, real-time room chat, shared itineraries, and
              collaborative checklists.
            </p>
            <p className="text-muted-foreground">
              Keep every decision visible to everyone involved, reduce planning
              noise in scattered chats, and move faster with one connected
              workspace.
            </p>

            <div className="grid grid-cols-1 gap-3 pt-2 text-sm sm:grid-cols-2">
              <div className="rounded-lg border border-sky-200/70 bg-white/70 p-3  ">
                <p className="font-medium">Invite collaborators</p>
                <p className="text-muted-foreground mt-1">
                  Send and manage trip invites in-app.
                </p>
              </div>
              <div className="rounded-lg border border-cyan-200/70 bg-white/70 p-3  ">
                <p className="font-medium">Coordinate in trip rooms</p>
                <p className="text-muted-foreground mt-1">
                  Discuss plans without losing context.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <blockquote className="border-l-4 border-cyan-500/60 pl-4">
                <p>
                  We replaced five different apps with TripSync. Tasks,
                  itinerary updates, and spending details are finally in one
                  place, and nobody asks for the latest plan anymore.
                </p>

                <div className="mt-6 space-y-3">
                  <cite className="block font-medium">
                    Aarav Menon, Group Trip Planner
                  </cite>
                </div>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
