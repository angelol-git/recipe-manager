import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { CircleUserRound, LogOut } from "lucide-react";
import GoogleLoginButton from "./GoogleLoginButton";
import API_BASE_URL from "../config/api.js";
import { useToast } from "../hooks/useToast";

function UserOptions({
  user,
  logout,
  openUpwards = false,
  hideUserSummary = false,
  redirectOnLogout = null,
  redirectOnLogin = null,
}) {
  const [isUserOptionsOpen, setIsUserOptionsOpen] = useState(false);
  const menuRef = useRef(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleSuccess(response) {
    try {
      const result = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
        credentials: "include",
      });

      if (result.ok) {
        if (redirectOnLogin) {
          navigate(redirectOnLogin);
          window.location.reload();
        } else {
          window.location.reload();
        }
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
        className={`hover:bg-mantle-hover/50 cursor-pointer rounded-md p-1 transition-colors duration-150 ${
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
          className={`border-secondary/20 bg-base absolute z-50 rounded-lg border p-2 shadow-xl ${
            openUpwards
              ? "bottom-[calc(100%+0.35rem)] left-0"
              : "top-[calc(100%+0.35rem)] right-0"
          } ${user ? "w-52" : "w-[264px]"}`}
        >
          {user ? (
            <div className="text-primary flex flex-col">
              {!hideUserSummary && (
                <>
                  <div className="px-2 py-2">
                    <p className="text-secondary text-xs">Signed in</p>
                    <p
                      className="text-primary mt-1 truncate text-sm"
                      title={user.name || user.email}
                    >
                      {user.name || user.email}
                    </p>
                  </div>
                  <div className="bg-secondary/30 my-1 h-[1px]" />
                </>
              )}
              <button
                onClick={() => {
                  logout.mutate(undefined, {
                    onSuccess: () => {
                      setIsUserOptionsOpen(false);
                      if (redirectOnLogout) {
                        navigate(redirectOnLogout);
                      }
                    },
                  });
                }}
                className="text-primary hover:bg-base-hover flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors duration-150"
              >
                <LogOut size={18} strokeWidth={1.5} />
                <div>Logout</div>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 p-1">
              <div className="px-1">
                <p className="text-primary text-sm font-medium">
                  Sign in to save your recipes
                </p>
                <p className="text-secondary text-sm">
                  Sync your chats and recipe history.
                </p>
              </div>
              <div className="bg-base w-full rounded-lg">
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
