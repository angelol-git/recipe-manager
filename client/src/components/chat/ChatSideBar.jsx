import { Link } from "react-router";
import { Ellipsis, X, PanelLeftClose, CirclePlus } from "lucide-react";
function ChatSideBar({
  recipes,
  isMobile,
  currentRecipe,
  isSideBarOpen,
  setIsSideBarOpen,
}) {
  function formattedTitle(title) {
    return title.length > 30 ? title.slice(0, 27) + "..." : title;
  }
  return (
    <nav
      className={`z-100 gap-4 text-sm lg:border-r-gray-300 lg:border-r-1 p-2 fixed top-0 left-0 h-full w-70 lg:w-75 bg-mantle transition-transform duration-300 ease-in-out flex-col flex ${
        isSideBarOpen ? "translate-x-0 lg:static" : "-translate-x-full "
      }`}
    >
      <div className="flex justify-between items-center">
        <Link
          to={`/home`}
          className="cursor-pointer w-min p-1 rounded-lg hover:bg-mantle-hover"
        >
          <h2>Home</h2>
        </Link>
        <button
          onClick={() => {
            setIsSideBarOpen(false);
          }}
          className="cursor-pointer rounded-lg p-2 hover:bg-mantle-hover"
        >
          {isMobile ? (
            <X
              size={20}
              strokeWidth={1.5}
              className="stroke-icon hover:bg-mantle-hover"
            />
          ) : (
            <PanelLeftClose
              size={20}
              strokeWidth={1.5}
              className="stroke-icon hover:bg-mantle-hover"
            />
          )}
        </button>
      </div>
      <div>
        <button
          onClick={() => {
            if (isMobile) {
              setIsSideBarOpen(false);
            }
          }}
        >
          <Link
            to="/chat"
            className="flex gap-2 p-1 pl-2  rounded-lg items-center hover:bg-mantle-hover"
          >
            <CirclePlus size={18} strokeWidth={1.5} className="stroke-icon" />
            New Chat
          </Link>
        </button>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-secondary">Recipes</h2>
        <div className="flex w-full flex-col gap-2">
          {recipes?.map((item) => {
            return (
              <Link
                to={`/chat/${item.id}`}
                state={{ recipe: item }}
                key={item.id}
                onClick={() => {
                  if (isMobile) {
                    setIsSideBarOpen(false);
                  }
                }}
                className={`px-2 py-1 flex justify-between cursor-pointer rounded-lg hover:bg-mantle-hover ${
                  currentRecipe?.id === item.id ? "bg-overlay0" : null
                }`}
              >
                <p>{formattedTitle(item.title)}</p>
                <button className="cursor-pointer">
                  <Ellipsis
                    size={20}
                    strokeWidth={1.5}
                    className="stroke-icon"
                  />
                </button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default ChatSideBar;
