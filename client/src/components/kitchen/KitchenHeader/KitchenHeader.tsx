import type { Dispatch, SetStateAction } from "react";
import { Link } from "react-router";
import KitchenOptions from "./KitchenOptions";
import { ArrowLeft } from "lucide-react";
import type { Recipe } from "../../../types/recipe";

type KitchenHeaderProps = {
  recipe: Recipe | null;
  recipeVersion: number;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

const KitchenHeader = ({
  recipe,
  isEditing,
  setIsEditing,
}: KitchenHeaderProps) => {
  return (
    <div className="flex justify-center px-4 pt-6">
      <div className="flex w-full max-w-screen-md flex-col justify-between gap-2 md:flex-row md:items-center md:gap-4">
        {/* TO DO: This causes a minor shift in layout, should I add an empty div with the same size as the back arrow when isEditing */}
        <div
          className={`flex w-full items-center ${
            isEditing ? "justify-end" : "justify-between"
          }`}
        >
          {!isEditing && (
            <Link
              to="/"
              className="hover:bg-mantle-hover w-min cursor-pointer rounded-lg p-1 duration-150"
            >
              <ArrowLeft strokeWidth={1.5} className="stroke-icon" size={18} />
            </Link>
          )}
          {recipe && (
            <KitchenOptions isEditing={isEditing} setIsEditing={setIsEditing} />
          )}
        </div>
      </div>
    </div>
  );
};

KitchenHeader.displayName = "KitchenHeader";

export default KitchenHeader;
