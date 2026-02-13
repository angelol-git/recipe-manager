import { useEffect, useRef } from "react";

function GoogleLoginButton({ onSuccess }) {
  const divRef = useRef(null);
  const clientID =
    "818434899703-ci36dbb8bs9m139s41rd1ff98pgtiop3.apps.googleusercontent.com";
  useEffect(() => {
    const renderGoogleButton = () => {
      if (divRef.current && window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientID,
          callback: onSuccess,
          use_fedcm_for_prompt: true,
        });
        window.google.accounts.id.renderButton(divRef.current, {
          theme: "outline",
          size: "large",
        });
      }
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.id = "google-client-script";
      script.async = true;
      script.defer = true;
      script.onload = renderGoogleButton;
      document.body.appendChild(script);
    }
  }, [onSuccess]);

  return <div ref={divRef}></div>;
}

export default GoogleLoginButton;
