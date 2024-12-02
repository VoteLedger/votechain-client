export {};

declare global {
  interface Window {
    ENV: {
      REMIX_APP_URL: string;
      REMIX_API_ROUTE: string;
    };
  }
}
