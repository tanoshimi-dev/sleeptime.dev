"use server";

import { auth0 } from "@/lib/auth0";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function updateProfile(formData: {
  displayName: string;
  locale: string;
}) {
  const session = await auth0.getSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const tokenSet = await auth0.getAccessToken();

  const response = await fetch(`${BACKEND_URL}/api/users/me`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${tokenSet.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Backend error:", response.status, text);
    return { error: `Backend returned ${response.status}` };
  }

  return { success: true, data: await response.json() };
}
