import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router";

function Add() {
  const [message, setMessage] = useState("");
  // const [message, setMessage] = useState(
  //   "I want a simple chocolate chip cookie recipe. Make it chewy in the middle and slightly crispy on the edges. It should serve about 12 cookies. Add a baking tag and a dessert tag."
  // );
  // const [recipe, setRecipe] = useState({
  //   title: "Chocolate Chip Cookies - Crunchy",
  //   description:
  //     "A simple recipe for classic chocolate chip cookies that are perfectly chewy in the middle and delightfully crispy on the edges, making them an ideal dessert. This baking recipe yields approximately 12 cookies, perfect for a small batch.",
  //   ingredients:
  //     "1/2 cup (113g) unsalted butter, melted\n1/4 cup (50g) granulated sugar\n1/2 cup (100g) packed light brown sugar\n1 large egg\n1 teaspoon vanilla extract\n1 1/4 cups (150g) all-purpose flour\n1/2 teaspoon baking soda\n1/4 teaspoon salt\n1 cup (170g) semi-sweet chocolate chips",
  //   instructions:
  //     "1. Preheat your oven to 375°F (190°C). Line a baking sheet with parchment paper.\n2. In a medium bowl, whisk together the melted butter, granulated sugar, and brown sugar until well combined and smooth.\n3. Beat in the egg and vanilla extract until the mixture is light and creamy.\n4. In a separate small bowl, whisk together the flour, baking soda, and salt.\n5. Gradually add the dry ingredients to the wet ingredients, mixing until just combined. Do not overmix.\n6. Fold in the chocolate chips until evenly distributed.\n7. Drop rounded tablespoons of dough onto the prepared baking sheet, spacing them about 2 inches apart. You should get about 12 cookies.\n8. Bake for 9-11 minutes, or until the edges are golden brown and the centers are still slightly soft.\n9. Remove from the oven and let the cookies cool on the baking sheet for 5 minutes before transferring them to a wire rack to cool completely.",
  //   source_prompt:
  //     "I want a simple chocolate chip cookie recipe. Make it chewy in the middle and slightly crispy on the edges. It should serve about 12 cookies. Add a baking tag and a dessert tag.",
  //   ai_model: "gemini-2.5-flash",
  // });
  const { state } = useLocation();
  const { id } = useParams();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (state?.recipe) {
      setFormData({
        title: state.recipe.title,
        description: state.recipe.description,
        instructions: state.recipe.instructions,
        ingredients: state.recipe.ingredients,
        source_prompt: state.recipe.source_prompt,
        ai_model: state.recipe.ai_model,
      });
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
          console.log(data);
          setFormData({
            title: data.title,
            description: data.description,
            instructions: data.instructions,
            ingredients: data.ingredients,
            source_prompt: data.source_prompt,
            ai_model: data.ai_model,
          });
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
      console.log(data.recipe);
      setFormData({
        title: data.recipe.title,
        description: data.recipe.description,
        instructions: data.recipe.instructions,
        ingredients: data.recipe.ingredients,
        source_prompt: data.recipe.source_prompt,
        ai_model: data.recipe.ai_model,
      });
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
        body: JSON.stringify({ recipe: recipe }),
      });

      const data = await result.json();
      console.log(data.recipe);
    } catch (error) {
      console.log(`Error: ${error}`);
    }
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
