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

  const [isEditing, setIsEditing] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [isReplyLoading, setIsReplyLoading] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(0);

  // const [errorMessage, setErrorMessage] = useState(null);
  const [isValidResponse, setIsValidResponse] = useState(true);
  async function fetchRecipe() {
    try {
      const result = await fetch(`http://localhost:8080/api/recipes/${id}`, {
        credentials: "include",
      });
      const data = await result.json();
      setRecipe(data);
      // setErrorMessage(null);
      setIsValidResponse(true);
    } catch (error) {
      console.log("Error fetching recipe:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (initialState) {
      console.log("here1");
      setRecipe(initialState);
      setIsLoading(false);
    } else if (id) {
      console.log("here2");
      fetchRecipe();
    } else {
      console.log("here3");
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendMessage() {
    if (message.length <= 0) return;
    try {
      setIsReplyLoading(true);

      const result = await fetch("http://localhost:8080/api/ai/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: message.trim(),
          recipe: recipe,
          currentVersion: recipe.versions?.[currentVersion] || null,
          recipeId: recipe.id || null,
        }),
      });
      // setErrorMessage(null);
      const data = await result.json();
      const newVersion = {
        id: data.reply.versionId,
        ai_model: data.reply.ai_model,
        description: data.reply.description,
        ingredients: data.reply.ingredients,
        instructions: data.reply.instructions,
        source_prompt: data.reply.source_prompt,
      };

      setRecipe((prev) => ({
        ...prev,
        id: prev.id || data.reply.id,
        versions: prev.versions ? [newVersion, ...prev.versions] : [newVersion],
      }));

      setMessage("");
      const isValid = checkValidResponse(data.recipe);
      setIsValidResponse(isValid);
      // if (!isValid) {
      //   setErrorMessage("I couldn’t extract a recipe from that message.");
      // }
    } catch (error) {
      console.log(`Error: ${error}`);
      // setErrorMessage(
      //   "Something went wrong while sending your message. Please try again."
      // );
    } finally {
      setIsReplyLoading(false);
    }
  }

  async function handleFork() {
    console.log("Fork");
  }

  async function handleDelete() {
    if (!id) return;

    const v_id = recipe.versions[currentVersion].id;
    console.log(recipe.versions);
    console.log(v_id);
    const prevRecipe = recipe;
    const updatedVersions = recipe.versions.filter((item) => {
      return item.id !== v_id;
    });

    setRecipe((prev) => {
      return { ...prev, versions: updatedVersions };
    });
    try {
      const result = await fetch(
        `http://localhost:8080/api/recipes/versions/${v_id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!result.ok) {
        const errorText = await result.text();
        throw new Error(`Server returned ${result.status}: ${errorText}`);
      }
    } catch (error) {
      console.log(`Error: ${error}`);
      setRecipe(prevRecipe);
    }
  }

  async function handleDeleteAll() {
    if (!id) return;
    try {
      const result = await fetch(`http://localhost:8080/api/recipes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
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
            title={recipe.title}
            setRecipe={setRecipe}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleRename={handleRename}
          />
        </div>
        <ChatOptions
          handleFork={handleFork}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          handleDelete={handleDelete}
          handleDeleteAll={handleDeleteAll}
        />
      </div>
      <div className="relative flex-1 py-3 overflow-y-auto">
        {isValidResponse && Object.keys(recipe).length > 0 && (
          <ChatReply
            currentVersion={currentVersion}
            versions={recipe.versions}
            isReplyLoading={isReplyLoading}
          />
        )}
        {(!isValidResponse || Object.keys(recipe).length === 0) && (
          <div className="text-gray-400">No messages yet</div>
        )}
      </div>
      <ChatInput
        message={message}
        setMessage={setMessage}
        sendMessage={sendMessage}
        isReplyLoading={isReplyLoading}
        recipeVersions={recipe.versions}
        currentVersion={currentVersion}
        setCurrentVersion={setCurrentVersion}
      />
    </div>
  );
}

export default Chat;
