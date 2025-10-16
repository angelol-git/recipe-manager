import { useState } from "react";
import { Link } from "react-router";
import { useRecipes } from "../contexts/RecipesContext";
import UserOptions from "../components/UserOptions";

function Home() {
  const { user, recipes } = useRecipes();
  const [tagsSelected, setTagsSelected] = useState([]);
  const tags = Array.from(new Set(recipes.flatMap((recipe) => recipe.tags)));

  // function handleTagClick(tag) {
  //   setTagsSelected((prev) => {
  //     if (prev.includes(tag)) {
  //       return prev.filter((t) => t !== tag);
  //     }
  //     return [...prev, tag];
  //   });
  // }

  function formatDate(dateString) {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  return (
    <div className="text-primary bg-base p-5 lg:p-15 flex flex-col min-h-screen gap-5">
      <div className="flex justify-between items-center">
        <h1 className="font-medium text-4xl font-serif">Recipes</h1>
        <div>
          <UserOptions user={user} />
        </div>
      </div>
      <div>
        <h2 className="font-semibold">Tags</h2>
        <div className="flex gap-2 py-2 flex-wrap">
          {tags.length > 0 ? (
            tags.map((item) => {
              return (
                <button
                  onClick={() => {
                    handleTagClick(item);
                  }}
                  className="bg-test1 inline-flex gap-2 items-center px-2 py-0.5 text-sm
  text-[#5C5046] border border-mantle rounded-full cursor-pointer"
                  key={item}
                >
                  <div className="w-4 h-4 bg-peach rounded-full"></div>
                  {item}
                </button>
              );
            })
          ) : (
            <div className="text-secondary/70 text-sm italic">
              No tags created yet.
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="font-semibold">Items({recipes?.length ?? "..."})</div>
          <Link
            to="/chat"
            className="items-center cursor-pointer rounded-2xl border-black/30 border-1 px-2 py-1"
          >
            + Add
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:flex">
          {recipes?.map((item) => {
            return (
              <Link
                to={`/chat/${item.id}`}
                key={item.id}
                className="justify-between border-primary/30 border-1 rounded-tr-xl rounded-br-xl rounded-tl-sm rounded-bl-sm p-3 flex flex-col gap-3 md:max-w-[250px] h-[250px] cursor-pointer"
              >
                <div>
                  <h3 className="font-bold font-lora text-xl">{item.title}</h3>
                  {/* <p className="text-text-secondary">
                    {formatDescription(item.versions[0].description)}
                  </p> */}
                </div>
                <p className="text-secondary/60">
                  {formatDate(item.created_at)}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Home;
