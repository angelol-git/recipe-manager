import { useState } from "react";
import { Link } from "react-router";
import RecipeOptions from "../RecipeOptions";

function HomeRecipeCard({ recipe, openDeleteModal }) {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  function formatDate(dateString) {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  function formatDescription(description) {
    if (description.length > 100) {
      return description.slice(0, 100) + "...";
    }
    return description;
  }
  return (
    <Link
      to={`/chat/${recipe.id}`}
      key={recipe.id}
      className="group relative w-full md:w-[230px] md:flex-shrink-0 h-[250px] md:h-[275px] cursor-pointer"
    >
      <div className="relative w-full h-full">
        <div
          className={`absolute flex flex-col justify-between inset-0 border bg-mantle rounded-l-xl rounded-r-2xl p-4 border-black/30 ease-in-out transform transition-transform duration-200 origin-left z-20 ${
            isOptionsOpen ? "-rotate-y-15" : "group-hover:-rotate-y-15"
          }`}
        >
          <div className="flex flex-col gap-2">
            <h3 className="font-medium font-lora text-xl">{recipe.title}</h3>
            <p className="text-sm text-secondary">
              {formatDescription(
                recipe.versions[recipe.versions.length - 1].description,
              )}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-secondary mt-auto">
              {formatDate(recipe.created_at)}
            </p>
            <RecipeOptions
              recipe={recipe}
              isOptionsOpen={isOptionsOpen}
              setIsOptionsOpen={setIsOptionsOpen}
              openDeleteModal={openDeleteModal}
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-primary/40 rounded-r-2xl rounded-l-xl p-4 z-10 "></div>
      </div>
    </Link>
  );
}

export default HomeRecipeCard;
