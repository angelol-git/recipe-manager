import { Outlet } from "react-router";
import { useEffect, useState } from "react";
import API_BASE_URL from "../config/api.js";

function ProtectedRoute() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        await fetch(`${API_BASE_URL}/auth/check`, {
          credentials: "include",
        });
      } catch (err) {
        console.log(`Error auth check: ${err}`);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  if (loading) return null;
  return <Outlet />;
}

export default ProtectedRoute;
