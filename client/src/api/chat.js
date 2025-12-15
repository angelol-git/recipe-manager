const backendUrl = "http://localhost:8080/api"

export async function sendCreateMessage(message, currentRecipeVersion) {

    const res = await fetch(`${backendUrl}/ai/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            message,
            currentRecipeVersion,
        }),
    });

    if (!res.ok) {
        throw new Error("Failed to retrieve all recipes");
    }

    return res.json();
}
