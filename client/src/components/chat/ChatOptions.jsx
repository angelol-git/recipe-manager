import { useState } from "react";
import DeleteSvg from "../icons/DeleteSvg.jsx";
import ShareSvg from "../icons/ShareSvg.jsx";
import EditSvg from "../icons/EditSvg.jsx";
import SaveSvg from "../icons/SaveSvg.jsx";
import DotsSvg from "../icons/DotsSvg.jsx";

function ChatOptions({ saveRecipe, isEditing, setIsEditing, handleDelete }) {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  return (
    <div className="flex sticky z-10 top-0 rounded justify-end gap-2">
      <button
        onClick={saveRecipe}
        className="px-2 py-1 bg-yellow flex font-semibold gap-2 rounded-md items-center"
      >
        <SaveSvg />
      </button>
      <button
        onClick={() => {
          setIsOptionsOpen(!isOptionsOpen);
        }}
        className="cursor-pointer font-bold px-2 py-1 color-black rounded-md relative"
      >
        <DotsSvg />
      </button>
      {isOptionsOpen ? (
        <div className="absolute right-0 z-100 bg-crust translate-y-12 p-2 rounded-lg shadow-lg">
          <ul className="p-1 flex gap-2 flex-col w-[150px]">
            <li className="border-b-1 border-black/40 py-2">
              <button className="flex z-100 w-full justify-between items-center">
                <ShareSvg />
                <div>Share</div>
              </button>
            </li>
            <li className="border-b-1 border-black/40 py-2">
              <button
                onClick={() => {
                  setIsEditing(!isEditing);
                }}
                className="flex w-full justify-between items-center"
              >
                <EditSvg />
                <div>Rename</div>
              </button>
            </li>
            <li className="text-rose py-2">
              <button
                onClick={handleDelete}
                className="flex w-full justify-between items-center"
              >
                <DeleteSvg />
                <div>Delete</div>
              </button>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default ChatOptions;
