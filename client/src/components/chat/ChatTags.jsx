import { useState } from "react";
import CloseSvg from "../icons/CloseSvg";
import CheckSvg from "../icons/CheckSvg";
function ChatTags({ recipe, handleAddTag }) {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [tag, setTag] = useState("");
  const tags = recipe?.tags.split(",");
  return (
    <div className="flex gap-2">
      {/* <button
        className="bg-test1 inline-flex gap-2 items-center px-2 py-0.5 text-sm
  text-[#5C5046] border border-mantle rounded-full cursor-pointer"
      >
        <div className="w-4 h-4 bg-peach rounded-full"></div>
        Baking
      </button>

      <button
        className="inline-flex justify-center items-center px-2 py-0.5 text-sm
    text-gray-500 border border-gray-300 rounded-full
    cursor-pointer hover:bg-gray-100 hover:text-gray-700
    transition-colors"
      >
        +
      </button> */}
      {!isAddingTag &&
        tags?.length > 0 &&
        tags.map((item) => {
          return (
            <div
              className="bg-test1 inline-flex gap-2 items-center px-2 py-0.5 text-sm
  text-[#5C5046] border border-mantle rounded-full cursor-pointer"
              key={item}
            >
              <div className="w-4 h-4 bg-peach rounded-full"></div>
              {item}
            </div>
          );
        })}
      {isAddingTag && (
        <div className="flex gap-2">
          <input
            onChange={(event) => {
              setTag(event.target.value);
            }}
            value={tag}
            type="text"
            className="inline-flex justify-center items-center px-2 py-0.5 text-sm
    text-gray-500 border border-gray-300 rounded-full
    cursor-pointer hover:bg-gray-100 hover:text-gray-700
    transition-colors w-[100px]"
          />

          <button
            onClick={() => {
              setTag("");
              setIsAddingTag(false);
            }}
            className="rounded-full border border-gray-300 px-2 flex items-center justify-center"
          >
            <CloseSvg height={"12px"} width={"12px"} />
          </button>
          <button
            onClick={() => {
              if (tag.length === 0) return;
              setIsAddingTag((prev) => !prev);
              handleAddTag(recipe?.id, tag);
              setTag("");
            }}
            className="rounded-full border border-gray-300 px-2 flex items-center justify-center"
          >
            <CheckSvg />
          </button>
        </div>
      )}
      {!isAddingTag && tags?.length === 0 && (
        <button
          onClick={() => {
            setIsAddingTag((prev) => !prev);
          }}
          className="inline-flex justify-center items-center px-2 py-0.5 text-sm
    text-gray-500 border border-gray-300 rounded-full
    cursor-pointer hover:bg-gray-100 hover:text-gray-700
    transition-colors"
        >
          + Add Tag
        </button>
      )}
      {!isAddingTag && tags?.length > 0 && (
        <button
          onClick={() => {
            setIsAddingTag((prev) => !prev);
          }}
          className="inline-flex justify-center items-center px-2 py-0.5 text-sm
    text-gray-500 border border-gray-300 rounded-full
    cursor-pointer hover:bg-gray-100 hover:text-gray-700
    transition-colors"
        >
          +
        </button>
      )}
    </div>
  );
}

export default ChatTags;
