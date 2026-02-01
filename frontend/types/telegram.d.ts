export {};

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initDataUnsafe: {
          start_param?: string;
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
          };
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
      };
    };
  }
}
