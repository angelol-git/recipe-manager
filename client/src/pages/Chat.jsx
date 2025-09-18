import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import ChatTitle from "../components/chat/ChatTitle.jsx";
import ChatSideBar from "../components/chat/ChatSideBar.jsx";
import ChatOptions from "../components/chat/ChatOptions.jsx";
import ChatInput from "../components/chat/ChatInput.jsx";

import MenuSvg from "../components/icons/MenuSvg.jsx";

function Chat() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state: initialState } = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [currentRecipe, setCurrentRecipe] = useState({});
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isValidResponse, setIsValidResponse] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const result = await fetch(`http://localhost:8080/api/recipes/${id}`, {
          credentials: "include",
        });
        const data = await result.json();
        saveCurrentRecipe(data);
      } catch (error) {
        console.log("Error fetching recipe:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (initialState?.recipe) {
      saveCurrentRecipe(initialState.recipe);
      setIsLoading(false);
    }

    if (id) {
      fetchRecipe();
    }
  }, [id, initialState]);

  async function sendMessage() {
    if (message.length <= 0) return;
    try {
      const result = await fetch("http://localhost:8080/api/ai/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await result.json();
      console.log(data);

      saveCurrentRecipe(data.recipe);
      setMessage("");
      if (
        !data.recipe.title &&
        !data.recipe.ingredients &&
        !data.recipe.instructions
      ) {
        setIsValidResponse(false);
        setIsError("I couldn’t extract a recipe from that message.");
        return;
      }

      setIsError(null);
    } catch (error) {
      console.log(`Error: ${error}`);
      setIsError(
        "Something went wrong while sending your message. Please try again."
      );
    }
  }

  async function saveRecipe() {
    if (Object.keys(currentRecipe).length === 0) return;
    try {
      const result = await fetch("http://localhost:8080/api/recipes/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ recipe: currentRecipe }),
      });

      const data = await result.json();
      console.log(data);
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  }

  async function handleDelete() {
    if (!id) return;
    try {
      const result = await fetch(
        `http://localhost:8080/api/recipes/delete/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!result.ok) {
        throw new Error(`Server returned ${result.status}`);
      }
      navigate("/home");
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  }

  async function handleRename(draftTitle) {
    try {
      const result = await fetch(
        `http://localhost:8080/api/recipes/editTitle/${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ newTitle: draftTitle }),
        }
      );

      if (!result.ok) {
        throw new Error(`Server returned ${result.status}`);
      }
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  }

  // function checkValidResponse() {
  //   if (!currentRecipe.title && !currentRecipe.ingredients && !currentRecipe.instructions) {
  //     return false;
  //   }
  // }
  function saveCurrentRecipe(object) {
    setCurrentRecipe({
      title: object.title,
      description: object.description,
      instructions: object.instructions,
      ingredients: object.ingredients,
      source_prompt: object.source_prompt,
      ai_model: object.ai_model,
    });
  }

  if (isLoading) return <p>Loading...</p>;
  return (
    <div className="relative bg-base flex flex-col h-screen text-text-primary p-5 w-full">
      <ChatSideBar
        isSideBarOpen={isSideBarOpen}
        setIsSideBarOpen={setIsSideBarOpen}
      />
      {isSideBarOpen && (
        <div
          className="fixed inset-0 bg-black/10 z-20"
          onClick={() => setIsSideBarOpen(false)}
        />
      )}
      <div className="gap-2 flex w-full justify-between py-2 border-b-1 border-black/40 items-start">
        <div className="flex gap-3 items-start">
          <button onClick={() => setIsSideBarOpen(!isSideBarOpen)}>
            <MenuSvg />
          </button>
          <ChatTitle
            title={currentRecipe.title}
            setCurrentRecipe={setCurrentRecipe}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleRename={handleRename}
          />
        </div>
        <ChatOptions
          saveRecipe={saveRecipe}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          handleDelete={handleDelete}
        />
      </div>
      <div className="relative flex-1 py-3 overflow-y-auto">
        <div className="relative flex-1 py-3 overflow-y-auto">
          {isError && (
            <div className="flex flex-col gap-3">
              <div className="p-3 rounded bg-gray-200 max-w-[80%] self-end">
                {currentRecipe.source_prompt}
              </div>
              <div className="p-3  rounded bg-rose-100 text-rose-700">
                {isError}
              </div>
            </div>
          )}

          {currentRecipe && isValidResponse ? (
            <div className="flex flex-col gap-3">
              <div>{currentRecipe?.description}</div>
              <div>
                <h3 className="font-bold">Ingredients</h3>
                <ul className="list-disc pl-4">
                  {currentRecipe.ingredients.split("\n").map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold">Instructions</h3>
                <ul className="list-disc">
                  {currentRecipe.instructions.split("\n").map((item, index) => (
                    <li key={index} className="list-none">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex text-black/60 text-sm underline ">
                <button>View prompt</button>
              </div>
            </div>
          ) : (
            !isError && <div className="text-gray-400">No messages yet</div>
          )}
        </div>
      </div>
      <ChatInput
        message={message}
        setMessage={setMessage}
        sendMessage={sendMessage}
      />
    </div>
  );
}

export default Chat;
