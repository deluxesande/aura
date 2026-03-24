import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const activeStoreId = localStorage.getItem("activeStoreId");
    if (activeStoreId) {
      config.headers["x-store-id"] = activeStoreId;
    }
  }
  return config;
});
