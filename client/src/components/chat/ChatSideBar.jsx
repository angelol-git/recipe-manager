import { useEffect, useState } from "react";
import { Link } from "react-router";

import CloseSvg from "../icons/CloseSvg";
function ChatSideBar({ isSideBarOpen, setIsSideBarOpen }) {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    async function getData() {
      try {
        const recipesRes = await fetch("http://localhost:8080/api/recipes/", {
          credentials: "include",
        });
        const recipesData = await recipesRes.json();
        setRecipes(recipesData);
      } catch (error) {
        console.log(error);
      }
    }

    getData();
  }, []);

  return (
    <nav
      className={`z-100 p-7 fixed top-0 left-0 h-full w-72 bg-base transition-transform duration-300 ease-in-out ${
        isSideBarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex justify-end">
        <button
          onClick={() => {
            setIsSideBarOpen(!isSideBarOpen);
          }}
          className="cursor-pointer"
        >
          <CloseSvg />
        </button>
      </div>
      <div className="flex flex-col gap-6">
        <Link to={`/home`}>
          <h2 className="cursor-pointer">Home</h2>
        </Link>
        <div>
          <h2 className="text-text-secondary/70 pb-3">Recipes</h2>
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
                >
                  <p className="cursor-pointer">{item.title}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default ChatSideBar;
