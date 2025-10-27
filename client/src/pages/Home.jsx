import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useRecipes } from "../contexts/RecipesContext";
import HomeTags from "../components/home/HomeTags";
import UserOptions from "../components/UserOptions";

function Home() {
  const { user, recipes, deleteRecipeTagAll, editRecipeTagColor } =
    useRecipes();
  const tags = Array.from(
    new Set(
      Array.isArray(recipes)
        ? recipes.flatMap((recipe) => recipe.tags || [])
        : []
    )
  );
  const [tagsSelected, setTagsSelected] = useState(() => {
    if (!user?.id) return [];
    //Initialize react state when using react router actions, otherwise it will be empty.
    //useEffect below will not run because user.id is already mounted and does not change.
    try {
      const stored = localStorage.getItem(`tagsSelected_${user.id}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  //Waits for user.id to be initialized on mount
  useEffect(() => {
    if (!user?.id) return;
    try {
      const stored = localStorage.getItem(`tagsSelected_${user.id}`);
      if (stored) {
        setTagsSelected(JSON.parse(stored));
      }
    } catch (err) {
      console.log("Failed to parse saved tags: ", err);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    localStorage.setItem(
      `tagsSelected_${user.id}`,
      JSON.stringify(tagsSelected)
    );
  }, [tagsSelected, user?.id]);

  const filteredRecipes = recipes?.filter((recipe) => {
    if (tagsSelected.length === 0) return true;
    return recipe.tags.some((recipeTag) => {
      return tagsSelected.some(
        (selectedTag) => selectedTag.name === recipeTag.name
      );
    });
  });

  function handleTagClick(tag) {
    setTagsSelected((prev) => {
      const exists = prev.some((t) => t.name === tag.name);
      if (exists) {
        return prev.filter((t) => t.name !== tag.name);
      } else {
        return [...prev, tag];
      }
    });
  }

  function formatDate(dateString) {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  return (
    <div className="text-primary bg-base p-5 lg:p-15 flex flex-col min-h-screen gap-5">
      <div className="flex justify-between items-center">
        <h1 className="font-medium text-4xl font-serif">Recipes</h1>
        <div>
          <UserOptions user={user} />
        </div>
      </div>
      <div>
        <HomeTags
          tags={tags}
          tagsSelected={tagsSelected}
          handleTagClick={handleTagClick}
          editRecipeTagColor={editRecipeTagColor}
          deleteRecipeTagAll={deleteRecipeTagAll}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="font-semibold">Items({recipes?.length ?? "..."})</div>
          <Link
            to="/chat"
            className="items-center cursor-pointer rounded-2xl border-black/30 border-1 px-2 py-1"
          >
            + Add
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:flex">
          {filteredRecipes?.map((item) => {
            return (
              <Link
                to={`/chat/${item.id}`}
                key={item.id}
                className="justify-between border-primary/30 border-1 rounded-tr-xl rounded-br-xl rounded-tl-sm rounded-bl-sm p-3 flex flex-col gap-3 md:max-w-[250px] h-[250px] cursor-pointer"
              >
                <div>
                  <h3 className="font-bold font-lora text-xl">{item.title}</h3>
                  {/* <p className="text-text-secondary">
                    {formatDescription(item.versions[0].description)}
                  </p> */}
                </div>
                <p className="text-secondary/60">
                  {formatDate(item.created_at)}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Home;
