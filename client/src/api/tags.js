const backendUrl = "http://localhost:8080/api"

export async function deleteTagsAll(tagIds) {
    const res = await fetch(`${backendUrl}/tags`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagIds })
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server returned ${res.status}: ${errorText}`);
    }
    return true;
}





