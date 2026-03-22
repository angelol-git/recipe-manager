import { useState, useEffect, memo } from "react";
import { Link } from "react-router";
import logo from "../../assets/logo.png";
import { X, PanelLeftClose, CirclePlus } from "lucide-react";
import RecipeOptions from "../RecipeOptions";
import UserOptions from "../UserOptions";

const ChatSideBar = memo(
  ({
    recipes,
    user,
    logout,
    isMobile,
    isSideBarOpen,
    isSidebarHydrated,
    hasSidebarInteracted,
    setIsSideBarOpen,
    currentRecipe,
    openDeleteModal,
  }) => {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
      setHasMounted(true);
    }, []);

    return (
      <nav
        className={`bg-mantle inset-y-0 left-0 z-100 flex h-full flex-col gap-4 text-sm ${isMobile ? "fixed" : "relative shrink-0 border-r-1 border-r-gray-300"} ${
          isMobile
            ? isSideBarOpen
              ? "w-70 translate-x-0 p-2"
              : "w-0 -translate-x-full overflow-hidden p-0"
            : isSideBarOpen
              ? "w-70 p-2"
              : "w-0 overflow-hidden p-0"
        } ${
          hasMounted && isSidebarHydrated && hasSidebarInteracted
            ? isMobile
              ? "transition-all duration-200 ease-out"
              : "transition-[width,padding] duration-200 ease-out"
            : "transition-none"
        } `}
      >
        <div className="flex items-center justify-between">
          <Link
            to={`/`}
            className="hover:bg-mantle-hover cursor-pointer rounded-lg p-1 duration-150"
          >
            <img src={logo} className="w-8" />
          </Link>
          <button
            onClick={() => {
              setIsSideBarOpen(false);
            }}
            className="hover:bg-mantle-hover cursor-pointer rounded-lg p-2 duration-150"
          >
            {isMobile ? (
              <X
                size={20}
                strokeWidth={1.5}
                className="stroke-icon hover:bg-mantle-hover duration-150"
              />
            ) : (
              <PanelLeftClose
                size={20}
                strokeWidth={1.5}
                className="stroke-icon hover:bg-mantle-hover duration-150"
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
            className="hover:bg-mantle-hover flex items-center gap-2 rounded-lg p-2 duration-150"
          >
            <CirclePlus size={18} strokeWidth={1.5} className="stroke-icon" />
            New Chat
          </Link>
        </button>
        <div className="flex min-h-0 flex-1 flex-col gap-1">
          <h2 className="text-secondary">Recipes</h2>
          <div className="flex w-full flex-col overflow-y-auto">
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
        <div className="border-secondary/20 mt-auto border-t pt-2">
          <div className="hover:bg-mantle-hover/40 flex items-center justify-between rounded-lg px-1 py-1">
            <UserOptions
              user={user}
              logout={logout}
              openUpwards
              hideUserSummary
              redirectOnLogin="/"
              redirectOnLogout="/"
            />
            <div className="min-w-0 flex-1 px-2">
              <p className="text-primary truncate text-sm">
                {user?.name || user?.email || "Guest"}
              </p>
            </div>
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
        className={`hover:bg-mantle-hover flex cursor-pointer items-center justify-between rounded-lg px-2 py-1 duration-150 ${isActive ? "bg-overlay0" : ""} ${isOptionsOpen ? "bg-mantle-hover" : ""}`}
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
