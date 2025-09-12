import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router";

function Add() {
  const { state } = useLocation();
  const { id } = useParams();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="bg-base flex flex-col h-screen text-text-primary p-5">
      <div className="flex justify-between py-2 border-b-1 border-black/40 items-start">
        <h1 className="text-xl font-bold font-lora">
          {formData ? formData?.title : "Add"}
        </h1>
        <div className="flex sticky top-0 z-10 rounded justify-end gap-2">
          <button
            onClick={saveRecipe}
            className="px-2 py-1 text-text-secondary bg-crust rounded-md"
          >
            Save
          </button>
          <button className="font-bold px-2 py-1 color-black rounded-md">
            ...
          </button>
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

      <div className="flex gap-2 py-2">
        <textarea
          className="flex-1 border rounded p-2 text-primary border-black resize-none h-20"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter a recipe and any changes you will like to make..."
        />
        <button
          className="cursor-pointer text-white bg-accent hover:bg-accent-dark px-4 py-2 rounded"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Add;
