import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useRecipes } from "../contexts/RecipesContext";
import HomeTags from "../components/home/HomeTags";
import UserOptions from "../components/UserOptions";

function Home() {
  const { user, recipes, deleteRecipeTagAll, editRecipeTagAll } = useRecipes();

  const tagMap = new Map();
  if (Array.isArray(recipes)) {
    for (const recipe of recipes) {
      if (Array.isArray(recipe.tags)) {
        for (const tag of recipe.tags) {
          if (!tagMap.has(tag.id)) {
            tagMap.set(tag.id, tag);
          }
        }
      }
    }
  }
  const tags = Array.from(tagMap.values());
  // );

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
    <div className="text-primary items-center bg-base p-5 lg:p-10 flex flex-col min-h-screen">
      <div className="max-w-screen-lg w-full flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-medium font-lora">Recipes</h1>
          <UserOptions user={user} />
        </div>
        <div>
          <HomeTags
            tags={tags}
            tagsSelected={tagsSelected}
            setTagsSelected={setTagsSelected}
            handleTagClick={handleTagClick}
            editRecipeTagAll={editRecipeTagAll}
            deleteRecipeTagAll={deleteRecipeTagAll}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="font-semibold">
              Items({recipes?.length ?? "..."})
            </div>
            <Link
              to="/chat"
              className="items-center bg-base hover:bg-base-hover text-sm cursor-pointer rounded-2xl border-black/30 border-1 px-2 py-1"
            >
              + Add
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:flex gap-4 ">
            {filteredRecipes?.map((item) => {
              return (
                <Link
                  to={`/chat/${item.id}`}
                  key={item.id}
                  className="group relative w-[240px] h-[250px] lg:h-[275px] cursor-pointer"
                >
                  <div className="relative w-full h-full">
                    <div className="absolute flex flex-col justify-between inset-0 border bg-mantle rounded-l-xl rounded-r-2xl p-4 border-black/30 transform transition-transform duration-200 origin-left group-hover:-rotate-y-15 z-20">
                      <h3 className="font-medium font-lora text-xl">
                        {item.title}
                      </h3>
                      <p className="text-secondary mt-auto">
                        {formatDate(item.created_at)}
                      </p>
                    </div>

                    <div className="absolute inset-0 bg-primary/40 rounded-r-2xl rounded-l-xl p-4 z-10"></div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
