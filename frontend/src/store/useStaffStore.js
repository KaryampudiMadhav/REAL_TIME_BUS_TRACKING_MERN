import { create } from "zustand";
import { axiosInstance } from "../utils/axiosInstance";
import toast from "react-hot-toast";

export const useStaffStore = create((set) => ({
    loading: true,
    staffUser: null,

    staffLogin: async (credentials, role) => {
        set({ loading: true });
        try {
            // Endpoint depends on role:
            // Worker (Driver/Conductor): /staff/worker/login
            // Admin: /staff/admin/login
            // Municipal: /staff/municipal/login

            let endpoint = "/staff/worker/login";
            if (role === "ADMIN") endpoint = "/staff/admin/login";
            else if (role === "MUNICIPAL") endpoint = "/staff/municipal/login";

            const payload = role === "ADMIN" || role === "MUNICIPAL"
                ? { employee_id: credentials.employeeId, password: credentials.password }
                : { employee_id: credentials.employeeId, password: credentials.password, role };

            const res = await axiosInstance.post(endpoint, payload);

            set({ staffUser: res.data.staff, loading: false });
            return { success: true, ...res.data };
        } catch (error) {
            console.error("Staff Login Error:", error);
            set({ staffUser: null, loading: false });
            return {
                success: false,
                error: error.response?.data?.error || "Login failed"
            };
        }
    },

    staffLogout: async () => {
        set({ loading: true });
        try {
            await axiosInstance.post("/staff/logout");
            set({ staffUser: null });
            toast.success("Staff logged out successfully");
        } catch (error) {
            console.error("Logout error", error);
            set({ staffUser: null });
        } finally {
            set({ loading: false });
        }
    },

    checkAuth: async () => {
        set({ loading: true });
        try {
            const res = await axiosInstance.get("/staff/me");
            set({ staffUser: res.data.staff, loading: false });
        } catch (error) {
            console.log("Not logged in as staff");
            set({ staffUser: null, loading: false });
        }
    }
}));
