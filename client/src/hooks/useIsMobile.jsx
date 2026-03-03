import { useState, useEffect } from "react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    window.matchMedia("(max-width:1024px)").matches,
  );
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width:1024px)");
    function handleChange(event) {
      setIsMobile(event.matches);
    }
    handleChange(mediaQuery);
    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return isMobile;
}

export default useIsMobile;
