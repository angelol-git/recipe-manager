import { useState, useRef, useEffect } from "react";
import { CircleUserRound } from "lucide-react";
import GoogleLoginButton from "./GoogleLoginButton";
import API_BASE_URL from "../config/api.js";

function UserOptions({ user, logout }) {
  const [isUserOptionsOpen, setIsUserOptionsOpen] = useState(false);
  const menuRef = useRef(null);

  async function handleSuccess(response) {
    try {
      const result = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
        credentials: "include",
      });

      if (result.ok) {
        window.location.reload();
      } else {
        const err = await result.json();
        console.error("Login failed:", err);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (!isUserOptionsOpen) return;

    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsUserOptionsOpen(false);
      }
    }
    if (isUserOptionsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserOptionsOpen]);

  return (
    <div ref={menuRef} className="relative">
      <button
        id="profileMenuButton"
        aria-haspopup="true"
        className={`rounded-full hover:bg-mantle-hover duration-150 transition-colors border-5  cursor-pointer  ${
          isUserOptionsOpen ? " border-gray-400/30" : "border-base"
        }`}
        onClick={() => {
          setIsUserOptionsOpen((prev) => !prev);
        }}
      >
        <CircleUserRound size={28} strokeWidth={1.5} className="stroke-icon" />
      </button>

      {isUserOptionsOpen && (
        <div
          role="menu"
          aria-labelledby="profileMenuButton"
          className="absolute right-0 z-50 bg-crust  p-4 rounded-lg shadow-lg flex flex-col gap-3 border border-secondary/60"
        >
          {user ? (
            <div className="flex flex-col gap-4 items-center">
              <p>{user.email}</p>
              <button
                onClick={() => {
                  logout.mutate();
                }}
                className="w-full rounded-md hover:bg-accent-hover duration-150 transition-colors bg-accent text-white p-2 cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <GoogleLoginButton onSuccess={handleSuccess} />
          )}
        </div>
      )}
    </div>
  );
}
export default UserOptions;
