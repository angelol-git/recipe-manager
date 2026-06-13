import { Dispatch, SetStateAction } from "react";

type KitchenOptionsProps = {
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

function KitchenOptions({ isEditing, setIsEditing }: KitchenOptionsProps) {
  return isEditing ? (
    <div className="flex gap-6 text-sm">
      <button
        onClick={() => {
          setIsEditing(false);
        }}
        className="cursor-pointer underline"
      >
        Cancel
      </button>
      <div className="cursor-pointer underline">Save</div>
    </div>
  ) : (
    <div className="flex gap-6 text-sm">
      <button
        onClick={() => {
          setIsEditing(true);
        }}
        className="cursor-pointer underline"
      >
        Edit
      </button>
      <div className="cursor-pointer underline">Share</div>
    </div>
  );
}

export default KitchenOptions;
