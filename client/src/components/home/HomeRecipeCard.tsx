import { useState } from "react";
import { Link } from "react-router";
import RecipeOptions from "../RecipeOptions";
import type { Recipe } from "../../types/recipe";

type OpenDeleteModalProp = (
  recipe: Recipe,
  type: "version" | "all",
  recipeVersion?: number | null,
) => void;

type HomeRecipeCardProps = {
  recipe: Recipe;
  openDeleteModal: OpenDeleteModalProp;
};

function HomeRecipeCard({ recipe, openDeleteModal }: HomeRecipeCardProps) {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  function formatDate(dateString: Recipe["created_at"]) {
    if (!dateString) {
      return;
    }

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  return (
    <Link
      to={`/chat/${recipe.id}`}
      key={recipe.id}
      className="group relative h-[250px] w-full cursor-pointer md:h-[275px] md:w-[230px] md:flex-shrink-0"
    >
      <div className="relative h-full w-full">
        <div
          className={`bg-mantle absolute inset-0 z-20 flex origin-left transform flex-col justify-between rounded-l-xl rounded-r-2xl border border-black/30 p-4 transition-transform duration-200 ease-in-out ${
            isOptionsOpen ? "-rotate-y-15" : "group-hover:-rotate-y-15"
          }`}
        >
          <div className="flex flex-col gap-2">
            <h3 className="font-lora line-clamp-2 min-h-[3.25rem] text-lg leading-snug font-medium md:text-xl">
              {recipe.title}
            </h3>
            <p className="text-secondary line-clamp-5 text-sm">
              {recipe.versions?.[recipe.versions.length - 1]?.description || ""}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-secondary text-sm">
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
        <div className="bg-primary/40 absolute inset-0 z-10 rounded-l-xl rounded-r-2xl p-4"></div>
      </div>
    </Link>
  );
}

export default HomeRecipeCard;
