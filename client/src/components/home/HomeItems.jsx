import { Link } from "react-router";
import HomeRecipeCard from "./HomeRecipeCard";

function HomeItems({ filteredRecipes, openDeleteModal }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="font-semibold">Items({filteredRecipes?.length})</div>
        <Link
          to="/chat"
          className="focus-visible:ring-accent/25 inline-flex min-h-8 cursor-pointer items-center justify-center rounded-full border border-accent/45 bg-accent/8 px-3 py-1 text-sm leading-none text-accent-hover shadow-xs transition-colors hover:border-accent/55 hover:bg-accent/18 hover:text-accent-hover focus-visible:ring-2 focus-visible:outline-none"
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
