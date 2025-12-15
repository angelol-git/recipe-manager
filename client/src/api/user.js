const backendUrl = "http://localhost:8080"

export async function fetchCurrentUser() {
    const res = await fetch(`${backendUrl}/api/auth/me`, {
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error("Failed to load user");
    }

    return res.json({ message: "Retrieved user data" });
}

export async function logoutUser() {
    const res = await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include",
    });

    if (!res.ok) {
        console.error(`Failed to log out: ${res.error}`);
    }

    return res.json({ message: "User logged out" });
} 