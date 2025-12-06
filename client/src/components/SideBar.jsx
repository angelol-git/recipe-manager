import { Link } from "react-router";
import { X } from "lucide-react";
function SideBar({ recipes, currentRecipe, isSideBarOpen, setIsSideBarOpen }) {
  return (
    <nav
      className={`z-100 lg:z-0 p-5 lg:static fixed top-0 left-0 h-full w-72 bg-base transition-transform duration-300 ease-in-out flex-col flex ${
        isSideBarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex justify-between">
        <Link to={`/home`} className="cursor-pointer w-min">
          <h2>Home</h2>
        </Link>
        <button
          onClick={() => {
            setIsSideBarOpen(false);
          }}
          className="cursor-pointer"
        >
          <X size={20} strokeWidth={1.5} className="stroke-icon" />
        </button>
      </div>
      <div className="flex flex-col gap-1 pt-5">
        <h2 className="text-secondary">Recipes</h2>
        <div className="flex flex-col gap-2">
          {recipes?.map((item) => {
            return (
              <Link
                to={`/chat/${item.id}`}
                state={{ recipe: item }}
                key={item.id}
                onClick={() => {
                  setIsSideBarOpen(!isSideBarOpen);
                }}
                className={`p-1 pl-2 w-full rounded-lg ${
                  currentRecipe?.id === item.id ? "bg-crust" : null
                }`}
              >
                <p className="cursor-pointer">{item.title}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default SideBar;
