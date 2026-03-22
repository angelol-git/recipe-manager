import { Link } from "react-router";
import HomeRecipeCard from "./HomeRecipeCard";

function HomeItems({ filteredRecipes, openDeleteModal }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="font-semibold">Items({filteredRecipes?.length})</div>
        <Link
          to="/chat"
          className="inline-flex min-h-8 items-center justify-center rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-[15px] leading-none text-gray-600 shadow-xs transition-colors hover:bg-gray-100 hover:text-gray-700"
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
