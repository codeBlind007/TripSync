"use server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL;

function buildApiUrl(path: string) {
  if (!BACKEND_URL) {
    throw new Error("BACKEND_URL is not set");
  }

  return `${BACKEND_URL}${path}`;
}

export async function getUserInfo() {
  try {
    const cookieStore = await cookies();
    const res = await fetch(buildApiUrl("/api/user/me"), {
      method: "GET",
      credentials: "include",
      headers: {
        Cookie: cookieStore.toString(),
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("User info fetch failed:", res.status);
      throw new Error("failed to fetch user info");
    }

    const data = await res.json();
    return data.user;
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
}

export async function getAllUserTrips() {
  try {
    const cookieStore = await cookies();
    const res = await fetch(buildApiUrl("/api/user/all-trips"), {
      method: "GET",
      credentials: "include",
      headers: {
        Cookie: cookieStore.toString(),
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("failed to fetch all trips");
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching user's all trips:", error);
    return null;
  }
}

export async function getUserUpcomingTrips() {
  try {
    const cookieStore = await cookies();
    const res = await fetch(buildApiUrl("/api/user/upcoming-trips-dashboard"), {
      method: "GET",
      credentials: "include",
      headers: {
        Cookie: cookieStore.toString(),
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("failed to fetch upcoming trips");
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching user's upcoming trips:", error);
    return null;
  }
}

export async function getCompletedTrips() {
  try {
    const cookieStore = await cookies();
    const res = await fetch(buildApiUrl("/api/user/completed-trips"), {
      headers: {
        Cookie: cookieStore.toString(),
      },
      next: { tags: ["completed-trips"] },
    });

    if (!res.ok) throw new Error("Failed to fetch completed trips");
    const data = await res.json();
    return data.data.completedTrips || [];
  } catch (error) {
    console.error("Error fetching user's upcoming trips:", error);
    return null;
  }
}

export async function getOngoingTrips() {
  try {
    const cookieStore = await cookies();
    const res = await fetch(buildApiUrl("/api/user/ongoing-trips"), {
      method: "GET",
      credentials: "include",
      headers: {
        Cookie: cookieStore.toString(),
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("failed to fetch ongoing trips");
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching user's upcoming trips:", error);
    return null;
  }
}

export async function getUserCompletedTrips() {
  try {
    const cookieStore = await cookies();
    const res = await fetch(
      buildApiUrl("/api/user/completed-trips-dashboard"),
      {
        method: "GET",
        credentials: "include",
        headers: {
          Cookie: cookieStore.toString(),
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!res.ok) throw new Error("failed to fetch user's completed trips");
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching user's completed trips:", error);
    return null;
  }
}

export async function getRoomCollab(tripId: string) {
  try {
    const cookieStore = await cookies();
    const res = await fetch(
      buildApiUrl(`/api/trips/tripRooms/${tripId}/collaborators`),
      {
        headers: {
          Cookie: cookieStore.toString(),
        },
        next: { tags: ["messages"] },
      },
    );

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error("Invalid server response while fetching collaborators");
    }

    if (!res.ok){
      throw new Error(data.message || "Failed to fetch collaborators");
    }
  
    return data.collaborators; 
  } catch (error) {
    if(error instanceof TypeError) {
      throw new Error("Network error");
    }

    throw error;
  }
   
}

export async function getReceivedInvitations() {
  const cookieStore = await cookies();
  const res = await fetch(buildApiUrl("/api/trips/invitations/recieved"), {
    headers: {
      Cookie: cookieStore.toString(),
    },
    method: "GET",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch received invitations");
  }
  return data.invitation;
}

export async function getSentInvitations(tripId: string) {
  const cookieStore = await cookies();
  const res = await fetch(
    buildApiUrl(`/api/trips/invitations/sent/${tripId}`),
    {
      headers: {
        Cookie: cookieStore.toString(),
      },
    },
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.invitation;
}

export async function inviteCollaborator(tripId: string, email: string) {
  try {
    const cookieStore = await cookies();
    const res = await fetch(buildApiUrl(`/api/trips/${tripId}/invite`), {
      method: "POST",
      credentials: "include",
      headers: {
        Cookie: cookieStore.toString(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to send invitation");
    }
    return data;
  } catch (err) {
    throw err;
  }
}

export async function acceptInvitation(tripId: string, invitationId: string) {
  try {
    const cookieStore = await cookies();
    const res = await fetch(
      buildApiUrl(`/api/trips/${tripId}/invitations/${invitationId}`),
      {
        method: "PATCH",
        headers: {
          Cookie: cookieStore.toString(),
          "Content-type": "application/json",
        },
      },
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Invite failed");
    }

    const data = await res.json();
    return data.message;
  } catch (err) {
    throw err;
  }
}

export async function getTripTasks(tripId: string) {
  const cookieStore = await cookies();
  const res = await fetch(buildApiUrl(`/api/trips/${tripId}/tasks`), {
    headers: {
      Cookie: cookieStore.toString(),
    },
    next: { tags: ["tasks"] },
  });

  if (!res.ok) {
    throw new Error("Error while fetching Trip's Tasks");
  }

  const data = await res.json();
  return data.data;
}

export async function removeCollaborator(
  tripId: string,
  collaboratorId: string,
) {
  const cookieStore = await cookies();
  try {
    const res = await fetch(
      buildApiUrl(`/api/trips/${tripId}/collaborators/${collaboratorId}`),
      {
        method: "DELETE",
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    );

    if (!res.ok) {
      throw new Error("Error removing the collaborator");
    }

    const data = await res.json();
    return { success: true, message: data.message };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Error removing collaborator" };
  }
}

export async function getTripCollaborators(tripId: string) {
  try {
    const cookieStore = await cookies();
    const res = await fetch(buildApiUrl(`/api/trips/${tripId}/collaborators`), {
      method: "GET",
      headers: {
        Cookie: cookieStore.toString(),
      },
      next: { tags: ["trip-collaborators"] },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch collaborators: ${res.statusText}`);
    }

    const data = await res.json();
    return data.collaborators || [];
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    return [];
  }
}

export async function getExpenses(tripId: string) {
  const cookieStore = await cookies();
  const res = await fetch(buildApiUrl(`/api/trips/${tripId}/expenses`), {
    headers: {
      Cookie: cookieStore.toString(),
    },
    next: { tags: ["expenses"] },
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.data;
}

export async function getActivityData(
  tripId: string,
  activityId: string,
  itineraryId: string,
) {
  const cookieStore = await cookies();
  const res = await fetch(
    buildApiUrl(
      `/api/trips/${tripId}/itinerary/${itineraryId}/activities/${activityId}`,
    ),
    {
      headers: {
        Cookie: cookieStore.toString(),
      },
      next: { tags: ["itinerary"] },
    },
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data;
}

export async function fetchItinerary(tripId: string) {
  const cookieStore = await cookies();
  const res = await fetch(buildApiUrl(`/api/trips/${tripId}/itinerary`), {
    cache: "no-store",
    headers: {
      Cookie: cookieStore.toString(),
    },
    next: { tags: ["itinerary"] },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(
      `Failed to fetch itinerary. Status: ${res.status}. Body: ${errorText}`,
    );
    if (res.status === 404) {
      return [];
    }
    throw new Error("Failed to fetch itinerary");
  }

  const json = await res.json();
  return json.data || [];
}

export async function getMessHistory(tripId: string) {
  const cookieStore = await cookies();
  const res = await fetch(
    buildApiUrl(`/api/trips/tripRooms/${tripId}/messages`),
    {
      headers: {
        Cookie: cookieStore.toString(),
      },
      next: { tags: ["messages"] },
    },
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data.messages;
}
