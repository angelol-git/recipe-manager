import { useEffect } from "react";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { useNavigate } from "react-router";
import { BookMarked } from "lucide-react";
function Landing() {
  const navigate = useNavigate();
  useEffect(() => {
    async function redirect() {
      const result = await fetch("http://localhost:8080/api/auth/check", {
        credentials: "include",
      });

      if (result.ok) {
        navigate("/home");
      }
    }
    redirect();
  }, []);

  async function handleSuccess(response) {
    try {
      const result = await fetch("http://localhost:8080/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
        credentials: "include",
      });

      if (result.ok) {
        const data = await result.json();
        console.log("Signed in as", data.user);
        navigate("/home");
      } else {
        const err = await result.json();
        console.error("Login failed:", err);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="p-10 bg-crust h-screen flex flex-col gap-5 text-primary">
      <h1 className="text-3xl font-lora text-bold flex gap-2 items-center">
        <BookMarked size={24} />
        Recipes
      </h1>
      <p className="text-lg font-medium">
        For creating, organizing and reading recipes, with AI.
      </p>
      <div>
        <GoogleLoginButton onSuccess={handleSuccess} />
      </div>
      <div>Add screenshots later</div>
    </div>
  );
}

export default Landing;
