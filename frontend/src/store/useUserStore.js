import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../utils/axiosInstance";

export const useUserStore = create((set) => ({
  loading: false,
  buses: [],
  setBuses: (buses) => set({ buses }),
  searchBuses: async (src, dest, date) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get(
        `auth/search?from=${src}&to=${dest}&date=${date}`
      );
      set({ buses: res.data });
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch buses: " + error.message);
    } finally {
      set({ loading: false });
    }
  },
  fetchPopularRoutes: async () => {
    try {
      const res = await axiosInstance.get("auth/popular-routes");
      return res.data;
    } catch (error) {
      console.error("Failed to fetch popular routes:", error);
      return [];
    }
  },
}));
