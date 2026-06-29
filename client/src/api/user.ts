import API_BASE_URL from "../config/api.js";

const backendUrl = API_BASE_URL;

export async function fetchCurrentUser() {
  try {
    const res = await fetch(`${backendUrl}/auth/me`, {
      credentials: "include",
    });

    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch {
    return null;
  }
}

export async function logoutUser() {
  const res = await fetch(`${backendUrl}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`Failed to log out: ${errorText}`);
    throw new Error(`Failed to log out: ${errorText}`);
  }

  return res.json();
}
