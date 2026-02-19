import { useEffect } from "react";
import UserOptions from "../components/UserOptions";
import HomeTags from "../components/home/HomeTags";
import HomeItems from "../components/home/HomeItems";
import DeleteRecipePortal from "../components/delete/DeleteRecipePortal.jsx";
import { useUser } from "../hooks/useUser";
import { useRecipes } from "../hooks/useRecipes";
import { useTags } from "../hooks/useTags";
import { useDeleteRecipe } from "../hooks/useDeleteRecipe.jsx";

function Home() {
  const { user, logout, isLoading: isUserLoading } = useUser();
  const { data: recipes, isLoading: isRecipesLoading } = useRecipes();
  const {
    uniqueTags,
    selectedTags,
    handleTagSelectedClick,
    tagCounts,
    deleteTagsAll,
    isDeletingTags,
    editTagsAll,
  } = useTags(user, recipes);

  const { deleteModal, openDeleteModal, closeDeleteModal, handleDelete } =
    useDeleteRecipe();

  useEffect(() => {
    document.title = `Recipes`;
  }, []);

  useEffect(() => {
    if (!isUserLoading && !isRecipesLoading) {
      window.hideShell?.();
    }
  }, [isUserLoading, isRecipesLoading]);

  const filteredRecipes = recipes?.filter((recipe) => {
    if (selectedTags.length === 0) return true;

    return recipe.tags.some((recipeTag) => {
      return selectedTags.some(
        (selectedTag) => selectedTag.name === recipeTag.name,
      );
    });
  });

  return (
    <div className="text-primary items-center bg-base p-5 lg:p-10 flex flex-col min-h-screen">
      <div className="max-w-screen-lg w-full flex flex-col gap-5">
        <header className="flex justify-between items-center">
          <h1 className="text-4xl font-medium font-lora">Recipes</h1>
          <UserOptions user={user} logout={logout} />
        </header>
        <main className="flex flex-col gap-4">
          <HomeTags
            tags={uniqueTags}
            selectedTags={selectedTags}
            handleTagSelectedClick={handleTagSelectedClick}
            tagCounts={tagCounts}
            deleteTagsAll={deleteTagsAll}
            isDeletingTags={isDeletingTags}
            editTagsAll={editTagsAll}
          />

          <HomeItems
            filteredRecipes={filteredRecipes}
            openDeleteModal={openDeleteModal}
          />
        </main>
      </div>
      {deleteModal.isOpen && (
        <DeleteRecipePortal
          recipe={deleteModal.recipe}
          type={deleteModal.type}
          onClose={closeDeleteModal}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default Home;
