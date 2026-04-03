import API_BASE_URL from "../config/api.js";
import type {EditableTagUpdate} from "../types/tag";

const backendUrl = API_BASE_URL;

export async function deleteTagsAll(tagIds:number[]) {
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
    return res.json();
}

export async function editTagsAll(updatedTags:EditableTagUpdate[]) {
    const res = await fetch(`${backendUrl}/tags`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: updatedTags })
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server returned ${res.status}: ${errorText}`);
    }
    return res.json();
}
