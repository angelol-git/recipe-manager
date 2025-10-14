import { useRecipes } from "../contexts/RecipesContext";
import { useNavigate } from "react-router";
import { Link } from "react-router";

function Home() {
  const navigate = useNavigate();
  const { user, recipes } = useRecipes();

  console.log(user);
  async function handleLogout() {
    try {
      const result = await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!result.ok) {
        console.error(`Failed to log out: ${result.error}`);
      }
      console.log("Logging out");
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  }

  function formatDescription(description) {
    if (!description) return null;
    if (description.length > 125) {
      let truncatedString = description.slice(0, 125).concat("...");
      return truncatedString;
    }
    return description;
  }
  function formatDate(dateString) {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  return (
    <div className="text-text-primary bg-base p-5 lg:p-15 flex flex-col h-screen gap-5">
      <div className="flex gap-5 justify-between items-center">
        <h2>User: {user?.email}</h2>
        <button
          onClick={handleLogout}
          className="rounded-md bg-blue-500 text-white p-2"
        >
          Logout
        </button>
      </div>
      <h1 className="text-4xl">Recipes</h1>
      {/* <nav>
          <div>Items</div>
        </nav> */}
      <div>
        <h2 className="font-bold">Tags</h2>
        <div className="flex gap-2">
          {/* {recipes?.map((item) => {
            item
          })} */}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div>Items({recipes?.length ?? "..."})</div>
          <Link
            to="/chat"
            className="cursor-pointer rounded-lg border-black border-1 px-2 py-1"
          >
            + Add
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:flex">
          {recipes?.map((item) => {
            return (
              <Link
                to={`/chat/${item.id}`}
                key={item.id}
                className="border-black/40 border-1 rounded-tr-xl rounded-br-xl rounded-tl-sm rounded-bl-sm p-3 flex flex-col gap-3 md:max-w-[250px] cursor-pointer"
              >
                <h3 className="font-bold font-lora text-xl">{item.title}</h3>
                <p className="text-text-secondary">
                  {formatDescription(item.versions[0].description)}
                </p>
                <p className="text-text-secondary/60">
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
