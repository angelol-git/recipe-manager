import { useState, memo } from "react";
import { Link } from "react-router";
import { X, PanelLeftClose, CirclePlus } from "lucide-react";
import RecipeOptions from "../RecipeOptions";

const ChatSideBar = memo(
  ({
    recipes,
    isMobile,
    isSideBarOpen,
    setIsSideBarOpen,
    currentRecipe,
    openDeleteModal,
  }) => {
    return (
      <nav
        className={`  
        fixed inset-y-0 left-0 z-100 
        lg:relative lg:z-0 
        min-h-screen duration-200 ease-out transition-all flex-col flex bg-mantle
        gap-4 text-sm lg:border-r-gray-300 lg:border-r-1 
        ${
          isSideBarOpen
            ? "translate-x-0 w-70 p-2"
            : "-translate-x-full w-0 p-0 lg:translate-x-0 overflow-hidden"
        }
      `}
      >
        <div className="flex justify-between items-center">
          <Link
            to={`/`}
            className="cursor-pointer w-min p-1 rounded-lg duration-150 hover:bg-mantle-hover"
          >
            <h2>Home</h2>
          </Link>
          <button
            onClick={() => {
              setIsSideBarOpen(false);
            }}
            className="cursor-pointer rounded-lg p-2 duration-150 hover:bg-mantle-hover"
          >
            {isMobile ? (
              <X
                size={20}
                strokeWidth={1.5}
                className="stroke-icon duration-150 hover:bg-mantle-hover"
              />
            ) : (
              <PanelLeftClose
                size={20}
                strokeWidth={1.5}
                className="stroke-icon duration-150 hover:bg-mantle-hover"
              />
            )}
          </button>
        </div>
        <button
          onClick={() => {
            if (isMobile) {
              setIsSideBarOpen(false);
            }
          }}
          className="w-full"
        >
          <Link
            to="/chat"
            className="flex gap-2 p-1 pl-2 rounded-lg duration-150 items-center hover:bg-mantle-hover"
          >
            <CirclePlus size={18} strokeWidth={1.5} className="stroke-icon" />
            New Chat
          </Link>
        </button>
        <div className="flex flex-col gap-1">
          <h2 className="text-secondary">Recipes</h2>
          <div className="flex w-full flex-col">
            {recipes?.map((recipe) => {
              return (
                <SideBarItem
                  key={recipe.id}
                  recipe={recipe}
                  isActive={currentRecipe?.id === recipe.id}
                  isMobile={isMobile}
                  setIsSideBarOpen={setIsSideBarOpen}
                  openDeleteModal={openDeleteModal}
                />
              );
            })}
          </div>
        </div>
      </nav>
    );
  },
);

ChatSideBar.displayName = "ChatSideBar";

const SideBarItem = memo(
  ({ recipe, isActive, isMobile, setIsSideBarOpen, openDeleteModal }) => {
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    return (
      <Link
        to={`/chat/${recipe.id}`}
        state={{ recipe }}
        onClick={() => {
          if (isMobile) {
            setIsSideBarOpen(false);
          }
        }}
        className={`items-center px-2 py-1 flex justify-between duration-150 cursor-pointer rounded-lg hover:bg-mantle-hover ${
          isActive ? "bg-overlay0" : ""
        }`}
      >
        <p className="truncate">{recipe.title}</p>

        <RecipeOptions
          recipe={recipe}
          isOptionsOpen={isOptionsOpen}
          setIsOptionsOpen={setIsOptionsOpen}
          openDeleteModal={openDeleteModal}
        />
      </Link>
    );
  },
);

SideBarItem.displayName = "SideBarItem";

export default ChatSideBar;
