const backendUrl = "http://localhost:8080/api"

export async function sendCreateMessage(payload) {
    const res = await fetch(`${backendUrl}/ai/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const data = await res.json();
        throw data;
    }

    return res.json();
}
