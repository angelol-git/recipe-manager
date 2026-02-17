import { useEffect } from "react";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { useNavigate } from "react-router";
import { BookMarked } from "lucide-react";
import API_BASE_URL from "../config/api.js";

function Landing() {
  const navigate = useNavigate();
  useEffect(() => {
    async function redirect() {
      const result = await fetch(`${API_BASE_URL}/auth/check`, {
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
      const result = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
        credentials: "include",
      });

      if (result.ok) {
        // const data = await result.json();
        // console.log("Signed in as", data.user);
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
    <div className="p-10 bg-crust h-screen flex gap-5 text-primary justify-center">
      <div className=" max-w-screen-lg flex flex-col gap-5">
        <h1 className="flex text-4xl font-medium font-lora items-center gap-2">
          <BookMarked size={24} />
          Recipe Book
        </h1>
        <p className="text-lg font-medium">
          For creating, modifying and organizing recipes, with AI.
        </p>
        <div>
          <GoogleLoginButton onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}

export default Landing;
