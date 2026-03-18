import React from "react";
import { Trip } from "@/components/upcoming-trips";
import { getOngoingTrips } from "@/lib/api";
import OngoingTrips from "@/components/ongoingTrips/ongoing-trips";

export const dynamic = "force-dynamic";

async function OngoingTripsContent() {
  const data = await getOngoingTrips();
  const trips: Trip[] = data?.trips ?? data ?? [];

  return <OngoingTrips ongoingTrips={trips} />;
}

const ongoingTripsPage = () => {
  return <OngoingTripsContent />;
};

export default ongoingTripsPage;
