import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import ChatTitle from "../components/chat/ChatTitle.jsx";
import ChatInput from "../components/chat/ChatInput.jsx";
import DotsSvg from "../components/icons/DotsSvg.jsx";
import MenuSvg from "../components/icons/MenuSvg.jsx";
import SaveSvg from "../components/icons/SaveSvg.jsx";
import DeleteSvg from "../components/icons/DeleteSvg.jsx";
import ShareSvg from "../components/icons/ShareSvg.jsx";
import EditSvg from "../components/icons/EditSvg.jsx";
import ChatSideBar from "../components/chat/ChatSideBar.jsx";

function Chat() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id } = useParams();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  function saveFormData(object) {
    setFormData({
      title: object.title,
      description: object.description,
      instructions: object.instructions,
      ingredients: object.ingredients,
      source_prompt: object.source_prompt,
      ai_model: object.ai_model,
    });
  }

  useEffect(() => {
    if (state?.recipe) {
      const stateData = state.recipe;
      saveFormData(stateData);
      setLoading(false);
    }
  }, [state]);

  useEffect(() => {
    if (!state?.recipe && id) {
      async function fetchRecipe() {
        try {
          const result = await fetch(
            `http://localhost:8080/api/recipes/${id}`,
            {
              credentials: "include",
            }
          );
          const data = await result.json();
          setFormData(data);
        } catch (error) {
          console.log(`Error fetching recipe: `, error);
        } finally {
          setLoading(false);
        }
      }
      fetchRecipe();
    }
  }, [id, state]);

  async function sendMessage() {
    if (message.length <= 0) return;
    try {
      const result = await fetch("http://localhost:8080/api/ai/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await result.json();
      saveFormData(data);
      setMessage("");
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  }

  async function saveRecipe() {
    if (Object.keys(formData).length === 0) return;
    try {
      const result = await fetch("http://localhost:8080/api/recipes/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ recipe: formData }),
      });

      const data = await result.json();
      console.log(data.recipe);
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

  if (loading) return <p>Loading...</p>;
  return (
    <div className="relative bg-base flex flex-col h-screen text-text-primary p-5 w-full">
      <ChatSideBar
        isSideBarOpen={isSideBarOpen}
        setIsSideBarOpen={setIsSideBarOpen}
      />
      <div className="gap-2 flex w-full justify-between py-2 border-b-1 border-black/40 items-start">
        <div className="flex gap-3 items-center">
          <button onClick={() => setIsSideBarOpen(!isSideBarOpen)}>
            <MenuSvg />
          </button>

          <ChatTitle
            title={formData.title}
            setFormData={setFormData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleRename={handleRename}
          />
        </div>
        <div className="flex sticky top-0 z-10 rounded justify-end gap-2">
          <button
            onClick={saveRecipe}
            className="px-2 py-1 bg-yellow flex font-semibold gap-2 rounded-md items-center"
          >
            <SaveSvg />
            Save
          </button>
          <button
            onClick={() => {
              setIsOptionsOpen(!isOptionsOpen);
            }}
            className="cursor-pointer font-bold px-2 py-1 color-black rounded-md relative"
          >
            <DotsSvg />
          </button>
          {isOptionsOpen ? (
            <div className="absolute right-0 z-10 bg-crust translate-y-12 p-2 rounded-lg  font-medium">
              <ul className="p-1 flex gap-2 flex-col w-[150px]">
                <li className="border-b-1 border-black/40 py-2">
                  <button className="flex w-full justify-between items-center">
                    <ShareSvg />
                    <div>Share</div>
                  </button>
                </li>
                <li className="border-b-1 border-black/40 py-2">
                  <button
                    onClick={() => {
                      setIsEditing(!isEditing);
                    }}
                    className="flex w-full justify-between items-center"
                  >
                    <EditSvg />
                    <div>Rename</div>
                  </button>
                </li>
                <li className="text-rose py-2">
                  <button
                    onClick={handleDelete}
                    className="flex w-full justify-between items-center"
                  >
                    <DeleteSvg />
                    <div>Delete</div>
                  </button>
                </li>
              </ul>
            </div>
          ) : null}
        </div>
      </div>
      <div className="relative flex-1 py-3 overflow-y-auto">
        {formData ? (
          <div className="flex flex-col gap-3">
            <div>{formData?.description}</div>
            <div>
              <h3 className="font-bold">Ingredients</h3>
              <ul className="list-disc pl-4">
                {formData.ingredients.split("\n").map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold">Instructions</h3>
              <ul className="list-disc">
                {formData.instructions.split("\n").map((item, index) => (
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
          <div className="text-gray-400">No messages yet</div>
        )}
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
