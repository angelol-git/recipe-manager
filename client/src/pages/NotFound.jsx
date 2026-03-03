import { useEffect } from "react";
import { Link } from "react-router";

function NotFound() {
  useEffect(() => {
    document.title = "Page Not Found";
  }, []);

  return (
    <div className="text-primary bg-base flex flex-col items-center justify-center min-h-screen p-5">
      <div className="max-w-screen-md w-full flex flex-col items-center gap-6 text-center">
        <h1 className="font-lora text-6xl font-bold text-accent">404</h1>

        <h2 className="font-lora text-2xl font-semibold">Page not found</h2>

        <Link
          to="/"
          className="mt-4 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors duration-200 font-medium"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
