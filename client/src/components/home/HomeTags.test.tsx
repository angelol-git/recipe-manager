import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, it, expect, vi } from "vitest";
import HomeTags from "./HomeTags";

describe("HomeTags", () => {
  afterEach(() => {
    cleanup();
  });
  it("switches into edit mode and saves renamed tags", async () => {
    const user = userEvent.setup();
    const handleTagSelectedClick = vi.fn();
    const deleteTagsAll = vi.fn();
    const editTagsAll = vi.fn();

    render(
      <HomeTags
        tags={[{ id: 1, name: "Dinner", color: "#ff0000" }]}
        selectedTags={[]}
        handleTagSelectedClick={handleTagSelectedClick}
        tagCounts={{ 1: 3 }}
        deleteTagsAll={deleteTagsAll}
        isDeletingTags={false}
        editTagsAll={editTagsAll}
      />,
    );

    await user.click(screen.getByRole("button", { name: /edit/i }));

    const input = screen.getByLabelText(/tag name/i);
    await user.clear(input);
    await user.type(input, "Weeknight");

    await user.click(screen.getByRole("button", { name: /done/i }));

    expect(editTagsAll).toHaveBeenCalledWith([
      { id: 1, name: "Weeknight", color: "#ff0000" },
    ]);
    expect(deleteTagsAll).not.toHaveBeenCalled();
  });

  it("shows empty state when there are no tags", () => {
    render(
      <HomeTags
        tags={[]}
        selectedTags={[]}
        handleTagSelectedClick={vi.fn()}
        tagCounts={{}}
        deleteTagsAll={vi.fn()}
        isDeletingTags={false}
        editTagsAll={vi.fn()}
      />,
    );
    expect(screen.getByText(/no tags created yet\./i)).toBeDefined();
  });

  it("deletes tags when Done is clicked", async () => {
    const user = userEvent.setup();
    const deleteTagsAll = vi.fn();
    const editTagsAll = vi.fn();
    render(
      <HomeTags
        tags={[
          { id: 1, name: "Dinner", color: "#ff0000" },
          { id: 2, name: "Sweet", color: "#ff0000" },
        ]}
        selectedTags={[]}
        handleTagSelectedClick={vi.fn()}
        tagCounts={{ 1: 1, 2: 1 }}
        deleteTagsAll={deleteTagsAll}
        isDeletingTags={false}
        editTagsAll={editTagsAll}
      />,
    );

    await user.click(screen.getByRole("button", { name: /edit/i }));
    await user.click(
      screen.getByRole("button", { name: /delete dinner tag/i }),
    );
    await user.click(screen.getByRole("button", { name: /done/i }));

    expect(deleteTagsAll).toHaveBeenCalledWith([1]);
    expect(editTagsAll).not.toHaveBeenCalled();
  });

  it("clicking done does not delete tags when no tags have been clicked", async () => {
    const user = userEvent.setup();
    const deleteTagsAll = vi.fn();
    const editTagsAll = vi.fn();
    render(
      <HomeTags
        tags={[{ id: 1, name: "Dinner", color: "#ff0000" }]}
        selectedTags={[]}
        handleTagSelectedClick={vi.fn()}
        tagCounts={{ 1: 1 }}
        deleteTagsAll={deleteTagsAll}
        isDeletingTags={false}
        editTagsAll={editTagsAll}
      />,
    );

    await user.click(screen.getByRole("button", { name: /edit/i }));
    await user.click(screen.getByRole("button", { name: /done/i }));

    expect(deleteTagsAll).not.toHaveBeenCalled();
    expect(editTagsAll).not.toHaveBeenCalled();
  });
});
