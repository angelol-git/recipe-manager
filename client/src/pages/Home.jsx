import { Link } from "react-router";
import { useUser } from "../hooks/useUser";
import { useRecipes } from "../hooks/useRecipes";
import { useTags } from "../hooks/useTags";
import { useEffect } from "react";
import UserOptions from "../components/UserOptions";
import HomeTags from "../components/home/HomeTags";
import HomeRecipeCard from "../components/home/HomeRecipeCard";

function Home() {
  const { data: user, logout } = useUser();
  const { data: recipes } = useRecipes();
  const {
    uniqueTags,
    selectedTags,
    handleTagSelectedClick,
    tagCounts,
    deleteTagsAll,
    isDeletingTags,
    editTagsAll,
  } = useTags(user, recipes);
  // console.log(recipes);

  useEffect(() => {
    document.title = `Recipes`;
  }, []);

  const filteredRecipes = recipes?.filter((recipe) => {
    if (selectedTags.length === 0) return true;

    return recipe.tags.some((recipeTag) => {
      return selectedTags.some(
        (selectedTag) => selectedTag.name === recipeTag.name
      );
    });
  });

  return (
    <div className="text-primary items-center bg-base p-5 lg:p-10 flex flex-col min-h-screen">
      <div className="max-w-screen-lg w-full flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-medium font-lora">Recipes</h1>
          <UserOptions user={user} logout={logout} />
        </div>
        <div>
          <HomeTags
            tags={uniqueTags}
            selectedTags={selectedTags}
            handleTagSelectedClick={handleTagSelectedClick}
            tagCounts={tagCounts}
            // handleTagClick={handleTagClick}
            // editRecipeTagAll={editRecipeTagAll}
            deleteTagsAll={deleteTagsAll}
            isDeletingTags={isDeletingTags}
            editTagsAll={editTagsAll}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="font-semibold">
              Items({filteredRecipes?.length})
            </div>
            <Link
              to="/chat"
              className="items-center bg-base hover:bg-base-hover text-sm cursor-pointer rounded-2xl border-black/30 border-1 px-2 py-1"
            >
              + Add
            </Link>
          </div>
          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-4 lg:gap-6">
            {filteredRecipes?.map((recipe) => {
              return <HomeRecipeCard key={recipe.id} recipe={recipe} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
