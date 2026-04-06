import { Link } from "react-router";
import HomeRecipeCard from "./HomeRecipeCard";
import type { Recipe } from "../../types/recipe";

type OpenDeleteModalProp = (
  recipe: Recipe,
  type: "version" | "all",
  recipeVersion?: number | null,
) => void;

type HomeItemsProps = {
  filteredRecipes: Recipe[];
  openDeleteModal: OpenDeleteModalProp;
};

function HomeItems({ filteredRecipes, openDeleteModal }: HomeItemsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="font-semibold">Items({filteredRecipes?.length})</div>
        <Link
          to="/chat"
          className="focus-visible:ring-accent/25 border-accent/45 bg-accent/8 text-accent-hover hover:border-accent/55 hover:bg-accent/18 hover:text-accent-hover inline-flex min-h-8 cursor-pointer items-center justify-center rounded-full border px-3 py-1 text-sm leading-none shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          + Add
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:flex md:flex-wrap lg:gap-6">
        {filteredRecipes?.map((recipe) => {
          return (
            <HomeRecipeCard
              key={recipe.id}
              recipe={recipe}
              openDeleteModal={openDeleteModal}
            />
          );
        })}
      </div>
    </div>
  );
}

export default HomeItems;
