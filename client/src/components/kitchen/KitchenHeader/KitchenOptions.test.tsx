import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import KitchenOptions from "./KitchenOptions";

afterEach(() => {
  cleanup();
});

describe("KitchenOptions", () => {
  it("shows cancel and save in edit mode", () => {
    render(<KitchenOptions isEditing setIsEditing={vi.fn()} />);

    expect(screen.getByRole("button", { name: /cancel/i })).toBeTruthy();
    expect(screen.getByText(/save/i)).toBeTruthy();
  });

  it("returns to read mode when cancel is pressed", async () => {
    const user = userEvent.setup();
    const setIsEditing = vi.fn();

    render(<KitchenOptions isEditing setIsEditing={setIsEditing} />);

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(setIsEditing).toHaveBeenCalledWith(false);
  });

  it("shows the read-mode actions outside edit mode", () => {
    render(<KitchenOptions isEditing={false} setIsEditing={vi.fn()} />);

    expect(screen.getByRole("button", { name: /edit/i })).toBeTruthy();
    expect(screen.getByText(/share/i)).toBeTruthy();
  });
});
