import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useRecipes } from "../contexts/RecipesContext.jsx";
import ChatTitle from "../components/chat/ChatTitle.jsx";
import ChatSideBar from "../components/chat/ChatSideBar.jsx";
import ChatOptions from "../components/chat/ChatOptions.jsx";
import ChatInput from "../components/chat/ChatInput.jsx";
import ChatReply from "../components/chat/ChatReply.jsx";
import ChatModal from "../components/chat/ChatModal.jsx";
import MenuSvg from "../components/icons/MenuSvg.jsx";
import ForkSvg from "../components/icons/ForkSvg.jsx";

function Chat() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { recipes, addRecipe, updateRecipe, deleteRecipe, deleteRecipeAll } =
    useRecipes();
  const recipe = recipes.find((r) => r.id === parseInt(id)) || null;

  const [message, setMessage] = useState("");
  const [currentVersion, setCurrentVersion] = useState(0);
  const [isReplyLoading, setIsReplyLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // const [errorMessage, setErrorMessage] = useState(null);
  // const [isValidResponse, setIsValidResponse] = useState(true);

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
          currentVersion: recipe?.versions?.[currentVersion] || null,
          recipeId: recipe?.id || null,
        }),
      });
      // setErrorMessage(null);
      if (!result.ok) {
        const error = await result.json();
        throw new Error(`Server returned ${result.status}: ${error}`);
      }

      const data = await result.json();
      let newRecipe = {};
      if (!recipe?.id) {
        newRecipe = {
          id: data.reply.id,
          title: data.reply.title,
          // created_at: data.reply.created_at,
        };

        navigate(`/chat/${newRecipe.id}`);
      }

      const newVersion = {
        id: data.reply.versionId,
        ai_model: data.reply.ai_model,
        calories: data.reply.calories,
        total_time: data.reply.total_time,
        servings: data.reply.servings,
        description: data.reply.description,
        ingredients: data.reply.ingredients,
        instructions: data.reply.instructions,
        source_prompt: data.reply.source_prompt,
      };

      if (!recipe?.id) {
        addRecipe(newRecipe, newVersion);
      } else {
        addRecipe(recipe, newVersion);
      }

      setMessage("");
      // const isValid = checkValidResponse(data.reply);
      // setIsValidResponse(isValid);
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
    if (!recipe.id) return;

    deleteRecipe(recipe.id, recipe[currentVersion]);

    if (currentVersion === recipe.versions.length - 1) {
      setCurrentVersion((prev) => prev - 1);
    }
  }

  async function handleDeleteAll() {
    if (!recipe.id) return;

    const result = deleteRecipeAll(recipe.id);
    console.log(result);
    if (result.ok) {
      navigate("/home");
    }
  }

  async function handleRename(newTitle) {
    const updatedRecipe = { ...recipe, title: newTitle };
    updateRecipe(updatedRecipe);
  }

  // function checkValidResponse(recipe) {
  //   return !!(
  //     recipe.title?.trim() ||
  //     recipe.ingredients?.trim() ||
  //     recipe.instructions?.trim()
  //   );
  // }

  return (
    <div className="relative bg-base flex flex-col h-screen text-text-primary p-5 w-full">
      <ChatSideBar
        recipes={recipes}
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
            title={recipe?.title}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleRename={handleRename}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleFork}
            className="px-2 py-1 bg-yellow flex font-semibold gap-2 rounded-md items-center"
          >
            <ForkSvg />
          </button>
          <ChatOptions
            recipe={recipe}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleDelete={handleDelete}
            handleDeleteAll={handleDeleteAll}
          />
        </div>
      </div>
      <div className="relative flex-1 py-3 overflow-y-auto">
        {recipe?.id ? (
          <ChatReply
            versions={recipe.versions}
            isReplyLoading={isReplyLoading}
            setIsModalOpen={setIsModalOpen}
            currentVersion={currentVersion}
            totalVersion={recipe.versions.length}
          />
        ) : (
          <div className="text-gray-400">No messages yet</div>
        )}
      </div>
      <ChatModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        source_prompt={recipe?.versions?.[currentVersion].source_prompt}
      />
      <ChatInput
        message={message}
        setMessage={setMessage}
        sendMessage={sendMessage}
        isReplyLoading={isReplyLoading}
        recipeVersions={recipe?.versions}
        currentVersion={currentVersion}
        setCurrentVersion={setCurrentVersion}
      />
    </div>
  );
}

export default Chat;
