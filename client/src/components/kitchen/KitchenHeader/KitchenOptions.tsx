import { Dispatch, SetStateAction } from "react";

type KitchenOptionsProps = {
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  editFormId?: string;
};

function KitchenOptions({
  isEditing,
  setIsEditing,
  editFormId,
}: KitchenOptionsProps) {
  return isEditing ? (
    <div className="flex gap-6 text-sm">
      <button
        type="button"
        onClick={() => {
          setIsEditing(false);
        }}
        className="interactive-mono tracking-[0.08em] uppercase"
      >
        Cancel
      </button>
      <button
        type="submit"
        form={editFormId}
        className="interactive-mono tracking-[0.08em] uppercase"
      >
        Save
      </button>
    </div>
  ) : (
    <div className="flex gap-6 text-sm">
      <button
        type="button"
        onClick={() => {
          setIsEditing(true);
        }}
        className="interactive-mono tracking-[0.08em] uppercase"
      >
        Edit
      </button>
      <div className="interactive-mono tracking-[0.08em] uppercase">
        Share
      </div>
    </div>
  );
}

export default KitchenOptions;
