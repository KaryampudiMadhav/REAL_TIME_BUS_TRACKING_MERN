import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../utils/axiosInstance";

export const useUserStore = create((set) => ({
  loading: false,
  buses: [],
  setBuses: (buses) => set({ buses }),
  searchBuses: async (src, dest, date, busNumber) => {
    set({ loading: true });
    try {
      let url = `auth/search?date=${date || ''}`;
      if (busNumber) {
        url += `&busNumber=${busNumber}`;
      } else {
        url += `&from=${src}&to=${dest}`;
      }

      const res = await axiosInstance.get(url);
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
  getAllActiveBuses: async () => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("auth/search?view=active");
      set({ buses: res.data });
    } catch (error) {
      console.error("Failed to fetch active buses:", error);
      toast.error("Failed to load active buses.");
    } finally {
      set({ loading: false });
    }
  },
}));
