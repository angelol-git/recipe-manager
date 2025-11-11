import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { CircleUserRound } from "lucide-react";

function UserOptions({ user }) {
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

  async function handleLogout() {
    try {
      const result = await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!result.ok) {
        console.error(`Failed to log out: ${result.error}`);
      }
      console.log("Logging out");
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="" ref={menuRef}>
      <button
        className={`relative rounded-full border-5 ${
          isUserOptionsOpen ? " border-gray-400/30" : "border-base"
        }`}
        onClick={() => {
          setIsUserOptionsOpen((prev) => !prev);
        }}
      >
        <CircleUserRound size={28} strokeWidth={1.5} className="stroke-icon" />
      </button>

      {isUserOptionsOpen && (
        <div className="absolute right-5 z-50 bg-crust  p-4 rounded-lg shadow-lg flex flex-col gap-3">
          <div className="flex gap-5 justify-between items-center">
            <p>{user?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-md bg-accent text-white p-2"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default UserOptions;
