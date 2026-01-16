import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { CircleUserRound } from "lucide-react";

function UserOptions({ user, logout }) {
  const [isUserOptionsOpen, setIsUserOptionsOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);
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

  if (user) {
    return (
      <div ref={menuRef} className="relative">
        <button
          id="profileMenuButton"
          aria-haspopup="true"
          className={`rounded-full border-5  cursor-pointer  ${
            isUserOptionsOpen ? " border-gray-400/30" : "border-base"
          }`}
          onClick={() => {
            setIsUserOptionsOpen((prev) => !prev);
          }}
        >
          <CircleUserRound
            size={28}
            strokeWidth={1.5}
            className="stroke-icon"
          />
        </button>

        {isUserOptionsOpen && (
          <div
            role="menu"
            aria-labelledby="profileMenuButton"
            className="absolute right-0 z-50 bg-crust  p-4 rounded-lg shadow-lg flex flex-col gap-3 border border-secondary/60"
          >
            <div className="flex gap-5 justify-between items-center">
              <p>{user.email}</p>
            </div>

            <button
              onClick={() => {
                logout.mutate();
                navigate("/");
              }}
              className="rounded-md bg-accent text-white p-2 cursor-pointer"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default UserOptions;
