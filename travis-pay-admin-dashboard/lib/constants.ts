export const MAIN_APP_API_URL =
  process.env.NEXT_PUBLIC_MAIN_APP_API_URL || (process.env.NODE_ENV === 'production' ? "https://marketplace-frontend-q5i9.onrender.com" : "http://localhost:3000");
