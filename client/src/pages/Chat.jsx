import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useRecipes } from "../contexts/RecipesContext.jsx";
import Toast from "../components/Toast.jsx";
import ChatTitle from "../components/chat/ChatTitle.jsx";
import ChatSideBar from "../components/chat/ChatSideBar.jsx";
import ChatOptions from "../components/chat/ChatOptions.jsx";
import ChatInput from "../components/chat/ChatInput.jsx";
import ChatReply from "../components/chat/ChatReply.jsx";
import ChatModal from "../components/chat/ChatModal.jsx";
import MenuSvg from "../components/icons/MenuSvg.jsx";
import ForkSvg from "../components/icons/ForkSvg.jsx";
import ChatErrorModal from "../components/chat/ChatErrorModal.jsx";
import ChatAskModal from "../components/chat/ChatAskModal.jsx";

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
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [errors, setErrors] = useState([]);
  const [toast, setToast] = useState(null);
  const [chatInputMode, setChatInputMode] = useState("Create");
  const [askMessages, setAskMessages] = useState([]);
  function showToast(message, type = "error") {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 5000);
  }

  useEffect(() => {
    if (!recipe?.id) return;
    fetchErrors(recipe.id);
  }, [recipe?.id]);

  useEffect(() => {
    if (!recipe?.id) return;
    fetchAskMessages(recipe.id);
  }, [recipe?.id]);

  function handleSendMessage() {
    if (message.trim().length === 0) return;
    if (chatInputMode === "Create") {
      sendMessage();
    }
    if (chatInputMode === "Ask") {
      sendAsk();
    }
  }
  async function sendMessage() {
    try {
      setIsReplyLoading(true);

      const result = await fetch("http://localhost:8080/api/ai/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: message.trim(),
          currentVersion: recipe?.versions?.[currentVersion] || null,
          recipeId: recipe?.id || null,
        }),
      });

      const data = await result.json();
      setMessage("");

      if (!result.ok || !data.reply) {
        showToast("Recipe could not be generated from this input");
        fetchErrors(recipe?.id);
        return;
      }

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
    } catch (error) {
      showToast("Network error. Please try again.");
      console.error("Network error:", error);
      if (recipe?.id) {
        fetchErrors(recipe.id);
      }
    } finally {
      setIsReplyLoading(false);
    }
  }

  async function sendAsk() {
    try {
      setIsReplyLoading(true);
      const result = await fetch("http://localhost:8080/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: message.trim(),
          currentVersion: recipe?.versions?.[currentVersion] || null,
          recipeId: recipe?.id || null,
        }),
      });

      const data = await result.json();
      setMessage("");

      console.log(data);
      if (!result.ok || !data.reply) {
        showToast("Recipe could not be generated from this input");
        fetchErrors(recipe?.id);
        return;
      }
    } catch (error) {
      showToast("Network error. Please try again.");
      console.error("Network error:", error);
      // if (recipe?.id) {
      //   fetchErrors(recipe.id);
      // }
    } finally {
      setIsReplyLoading(false);
    }
  }

  async function fetchAskMessages(recipeId) {
    try {
      const result = await fetch(
        `http://localhost:8080/api/recipes/${recipeId}/askMessages`,
        {
          credentials: "include",
        }
      );
      const data = await result.json();
      if (!result.ok) {
        console.error(data.error.message);
        return null;
      }
      setAskMessages(data.response);
    } catch (error) {
      console.log("Network error", error);
    }
  }
  async function fetchErrors(recipeId) {
    try {
      const result = await fetch(
        `http://localhost:8080/api/recipes/errors/${recipeId}`,
        {
          credentials: "include",
        }
      );
      const data = await result.json();
      if (!result.ok) {
        console.error(data.error.message);
        return null;
      }
      setErrors(data.errors);
    } catch (error) {
      console.log("Network error", error);
    }
  }

  async function deleteError(messageId) {
    const prevErrors = [...errors];
    setErrors((prev) => {
      return prev.filter((item) => {
        return item.id !== messageId;
      });
    });

    try {
      const result = await fetch(
        `http://localhost:8080/api/recipes/error/${messageId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!result.ok && result.status !== 204) {
        const data = await result.json();
        console.error(data.error?.message || "Unknown error");
      }
    } catch (error) {
      console.log("Network error", error);
      setErrors(prevErrors);
    }
  }

  async function handleFork() {
    console.log("Fork");
  }

  async function handleDelete() {
    if (!recipe.id) return;
    deleteRecipe(recipe.id, recipe.versions[currentVersion].id);

    if (currentVersion === recipe.versions.length - 1) {
      setCurrentVersion((prev) => prev - 1);
    }
  }

  async function handleDeleteAll() {
    if (!recipe.id) return;

    const result = await deleteRecipeAll(recipe.id);
    if (result.ok) {
      navigate("/home");
    }
  }

  async function handleRename(newTitle) {
    const updatedRecipe = { ...recipe, title: newTitle };
    updateRecipe(updatedRecipe);
  }

  return (
    <div className="relative bg-base flex flex-col h-screen text-text-primary py-5 px-4 w-full">
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
          <button
            onClick={() => setIsSideBarOpen(!isSideBarOpen)}
            className="cursor-pointer"
          >
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
            errors={errors}
            isReplyLoading={isReplyLoading}
            setIsPromptModalOpen={setIsPromptModalOpen}
            setIsErrorModalOpen={setIsErrorModalOpen}
            currentVersion={currentVersion}
            totalVersion={recipe.versions.length}
          />
        ) : (
          <div className="text-gray-400">No messages yet</div>
        )}
      </div>
      <ChatModal
        isPromptModalOpen={isPromptModalOpen}
        setIsPromptModalOpen={setIsPromptModalOpen}
        source_prompt={recipe?.versions?.[currentVersion].source_prompt}
      />
      <ChatErrorModal
        isErrorModalOpen={isErrorModalOpen}
        setIsErrorModalOpen={setIsErrorModalOpen}
        errors={errors}
        deleteError={deleteError}
      />
      <ChatAskModal
        isAskModalOpen={isAskModalOpen}
        setIsAskModalOpen={setIsAskModalOpen}
        askMessages={askMessages}
      />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ChatInput
        message={message}
        setMessage={setMessage}
        handleSendMessage={handleSendMessage}
        isReplyLoading={isReplyLoading}
        recipeVersions={recipe?.versions}
        currentVersion={currentVersion}
        setCurrentVersion={setCurrentVersion}
        chatInputMode={chatInputMode}
        setChatInputMode={setChatInputMode}
        isAskModalOpen={isAskModalOpen}
        setIsAskModalOpen={setIsAskModalOpen}
      />
    </div>
  );
}

export default Chat;
