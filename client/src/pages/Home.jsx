import { Link } from "react-router";
import UserOptions from "../components/UserOptions";
import { useUser } from "../hooks/useUser";
import { useRecipes } from "../hooks/useRecipes";
import { useEffect } from "react";
// import { useTags } from "../hooks/useTags";

function Home() {
  const { data: user, logout } = useUser();
  const { data: recipes } = useRecipes();
  // console.log(isError);
  // const { recipes, deleteRecipeTagAll, editRecipeTagAll } = useRecipes();
  // const { tags, tagsSelected, setTagsSelected, handleTagClick } = useTags(
  //   user,
  //   recipes
  // );

  // const filteredRecipes = recipes?.filter((recipe) => {
  //   if (tagsSelected.length === 0) return true;
  //   return recipe.tags.some((recipeTag) => {
  //     return tagsSelected.some(
  //       (selectedTag) => selectedTag.name === recipeTag.name
  //     );
  //   });
  // });
  useEffect(() => {
    document.title = `Recipes`;
  }, []);

  function formatDate(dateString) {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  return (
    <div className="text-primary items-center bg-base p-5 lg:p-10 flex flex-col min-h-screen">
      <div className="max-w-screen-lg w-full flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-medium font-lora">Recipes</h1>
          <UserOptions user={user} logout={logout} />
        </div>
        <div>
          {/* <HomeTags
            tags={tags}
            tagsSelected={tagsSelected}
            setTagsSelected={setTagsSelected}
            handleTagClick={handleTagClick}
            editRecipeTagAll={editRecipeTagAll}
            deleteRecipeTagAll={deleteRecipeTagAll}
          /> */}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="font-semibold">
              {/* Items({recipes?.length ?? "..."}) */}
            </div>
            <Link
              to="/chat"
              className="items-center bg-base hover:bg-base-hover text-sm cursor-pointer rounded-2xl border-black/30 border-1 px-2 py-1"
            >
              + Add
            </Link>
          </div>
          <div className="grid grid-cols-4 md:flex md:flex-wrap gap-4 lg:gap-6">
            {recipes?.map((recipe) => {
              return (
                <Link
                  to={`/chat/${recipe.id}`}
                  key={recipe.id}
                  className="group relative w-full md:w-[230px] h-[250px] md:h-[275px] cursor-pointer"
                >
                  <div className="relative w-full h-full">
                    <div className="absolute flex flex-col justify-between inset-0 border bg-mantle rounded-l-xl rounded-r-2xl p-4 border-black/30 transform transition-transform duration-200 origin-left group-hover:-rotate-y-15 z-20">
                      <h3 className="font-medium font-lora text-xl">
                        {recipe.title}
                      </h3>
                      <p className="text-secondary mt-auto">
                        {formatDate(recipe.created_at)}
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
