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
  } catch (err) {
    console.error("Error fetching user:", err);
    return null;
  }
}

export async function logoutUser() {
  const res = await fetch(`${backendUrl}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    console.error(`Failed to log out: ${res.error}`);
  }

  return res.json({ message: "User logged out" });
}
