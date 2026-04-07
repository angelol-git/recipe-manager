import { useEffect } from "react";
import { Link } from "react-router";

function NotFound() {
  useEffect(() => {
    document.title = "Page Not Found";
  }, []);

  return (
    <div className="text-primary bg-base flex min-h-screen flex-col items-center justify-center p-5">
      <div className="flex w-full max-w-screen-md flex-col items-center gap-6 text-center">
        <h1 className="font-lora text-accent text-6xl font-bold">404</h1>

        <h2 className="font-lora text-2xl font-semibold">Page not found</h2>

        <Link
          to="/"
          className="bg-accent hover:bg-accent-hover mt-4 rounded-lg px-6 py-3 font-medium text-white transition-colors duration-200"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
