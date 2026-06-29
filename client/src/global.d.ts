export {};

declare global {
  interface Window {
    // The Google Identity Services script attaches its API to window.google.
    google?: {
      accounts: {
        id: {
          cancel(): unknown;
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, string | number>,
          ) => void;
        };
      };
    };
  }
}
