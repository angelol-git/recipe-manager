import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import ChatTitle from "../components/chat/ChatTitle.jsx";
import ChatSideBar from "../components/chat/ChatSideBar.jsx";
import ChatOptions from "../components/chat/ChatOptions.jsx";
import ChatInput from "../components/chat/ChatInput.jsx";

import MenuSvg from "../components/icons/MenuSvg.jsx";
import ChatReply from "../components/chat/ChatReply.jsx";

function Chat() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state: initialState } = useLocation();

  const [recipe, setRecipe] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [isValidResponse, setIsValidResponse] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [isReplyLoading, setIsReplyLoading] = useState(false);

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const result = await fetch(`http://localhost:8080/api/recipes/${id}`, {
          credentials: "include",
        });
        const data = await result.json();
        setRecipe({
          id: data.id || null,
          title: data.title,
          relation: data.relation || "reply",
          versions: data.versions,
        });
        setErrorMessage(null);
        setIsValidResponse(true);
      } catch (error) {
        console.log("Error fetching recipe:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (initialState?.recipe) {
      console.log(initialState.recipe);
      setRecipe({
        id: initialState.recipe.id || null,
        title: initialState.recipe.title,
        versions: initialState.recipe.versions,
      });
      setIsLoading(false);
    } else if (id) {
      fetchRecipe();
    } else {
      setIsLoading(false);
    }
  }, [id, initialState]);

  async function sendMessage() {
    if (message.length <= 0) return;
    try {
      setIsReplyLoading(true);
      const result = await fetch("http://localhost:8080/api/ai/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          previousRecipe: recipe,
        }),
      });
      setErrorMessage(null);

      const data = await result.json();
      const newVersion = {
        // id: data.recipe.id,
        ai_model: data.recipe.ai_model,
        description: data.recipe.description,
        ingredients: data.recipe.ingredients,
        instructions: data.recipe.instructions,
        source_prompt: data.recipe.source_prompt,
      };

      setRecipe((prev) => ({
        ...prev,
        versions: [newVersion, ...prev.versions],
      }));
      setMessage("");
      const isValid = checkValidResponse(data.recipe);
      setIsValidResponse(isValid);
      if (!isValid) {
        setErrorMessage("I couldn’t extract a recipe from that message.");
      }
    } catch (error) {
      console.log(`Error: ${error}`);
      setErrorMessage(
        "Something went wrong while sending your message. Please try again."
      );
    } finally {
      setIsReplyLoading(false);
    }
  }

  async function saveRecipe() {
    if (Object.keys(recipe).length === 0) return;
    try {
      const result = await fetch("http://localhost:8080/api/recipes/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          recipeId: recipe.id,
          recipe: recipe.versions[0],
        }),
      });

      const data = await result.json();
      console.log("Saved: ", data);
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

  function checkValidResponse(recipe) {
    return !!(
      recipe.title?.trim() ||
      recipe.ingredients?.trim() ||
      recipe.instructions?.trim()
    );
  }

  function saveRootRecipe(object) {
    // console.log(object);
    setRecipe({
      id: object.id || null,
      title: object.title,
      relation: object.relation || "reply",
      versions: object.versions,
    });
  }

  if (isLoading) return <p>Loading...</p>;
  return (
    <div className="relative bg-base flex flex-col h-screen text-text-primary p-5 w-full">
      {/* <ChatSideBar
        isSideBarOpen={isSideBarOpen}
        setIsSideBarOpen={setIsSideBarOpen}
      /> */}
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
            title={recipe.title}
            setCurrentRecipe={recipe}
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
        {errorMessage && (
          <div className="flex flex-col gap-3">
            <div className="p-3 rounded bg-gray-200 max-w-[80%] self-end wrap-break-word">
              {recipe.source_prompt}
            </div>
            <div className="p-3  rounded bg-rose-100 text-rose-700">
              {errorMessage}
            </div>
          </div>
        )}

        {!errorMessage && isValidResponse && Object.keys(recipe).length > 0 && (
          <ChatReply
            versions={recipe.versions}
            isReplyLoading={isReplyLoading}
          />
        )}
        {!errorMessage &&
          (!isValidResponse || Object.keys(recipe).length === 0) && (
            <div className="text-gray-400">No messages yet</div>
          )}
      </div>
      <ChatInput
        message={message}
        setMessage={setMessage}
        sendMessage={sendMessage}
        isReplyLoading={isReplyLoading}
      />
    </div>
  );
}

export default Chat;
