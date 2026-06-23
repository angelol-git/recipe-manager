export {}

declare global {
  interface Window {
    hideLoadingOverlay: () => void;
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, string | number>
          ) => void;
        };
      };
    };
  }
}
