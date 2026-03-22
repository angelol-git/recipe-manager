import { useState, useRef, useEffect } from "react";
import { CircleUserRound, LogOut } from "lucide-react";
import GoogleLoginButton from "./GoogleLoginButton";
import API_BASE_URL from "../config/api.js";
import { useToast } from "../hooks/useToast";

function UserOptions({ user, logout }) {
  const [isUserOptionsOpen, setIsUserOptionsOpen] = useState(false);
  const menuRef = useRef(null);
  const { showToast } = useToast();

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
        showToast("Login failed. Please try again.", "error");
      }
    } catch {
      showToast("Login failed. Please try again.", "error");
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
        aria-expanded={isUserOptionsOpen}
        className={`cursor-pointer rounded-md p-1 transition-colors duration-150 hover:bg-mantle-hover/50 ${
          isUserOptionsOpen ? "bg-mantle-hover/50" : ""
        }`}
        onClick={() => {
          setIsUserOptionsOpen((prev) => !prev);
        }}
      >
        <CircleUserRound size={24} strokeWidth={1.5} className="stroke-icon" />
      </button>

      {isUserOptionsOpen && (
        <div
          role="menu"
          aria-labelledby="profileMenuButton"
          className={`absolute right-0 z-50 rounded-lg border border-secondary/20 bg-base p-2 shadow-xl ${
            user ? "w-52" : "w-[264px]"
          }`}
        >
          {user ? (
            <div className="flex flex-col text-primary">
              <div className="px-2 py-2">
                <p className="text-xs text-secondary">Signed in</p>
                <p
                  className="mt-1 truncate text-sm text-primary"
                  title={user.email}
                >
                  {user.email}
                </p>
              </div>
              <div className="my-1 h-[1px] bg-secondary/30" />
              <button
                onClick={() => {
                  logout.mutate();
                }}
                className="flex gap-2 items-center rounded-lg px-2 py-2 text-sm text-primary cursor-pointer transition-colors duration-150 hover:bg-base-hover"
              >
                <LogOut size={18} strokeWidth={1.5} />
                <div>Logout</div>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 p-1">
              <div className="px-1">
                <p className="text-sm font-medium text-primary">
                  Sign in to save your recipes
                </p>
                <p className="text-sm text-secondary">
                  Sync your chats and recipe history.
                </p>
              </div>
              <div className="w-full rounded-lg bg-base">
                <GoogleLoginButton onSuccess={handleSuccess} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default UserOptions;
