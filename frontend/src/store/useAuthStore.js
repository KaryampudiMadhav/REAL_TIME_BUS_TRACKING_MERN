import { create } from "zustand";
import { axiosInstance } from "../utils/axiosInstance";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  loading: false,
  authUser: null,

  checkAuth: async () => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/auth/checkauth");
      set({ authUser: res.data.user, loading: false });
    } catch (error) {
      set({ authUser: null, loading: false });
      console.log("CheckAuth error:", error);
    } finally {
      set({ loading: false });
    }
  },

  signup: async (userData) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.post("/auth/signup", userData);

      return {
        success: true,
        ...res.data,
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Signup failed. Please try again.";

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      set({ loading: false });
    }
  },

  login: async (userData) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.post("/auth/login", userData);
      set({ authUser: res.data.user });

      return {
        success: true,
        ...res.data,
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Login failed";

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null }); // 👈 Correct way
      toast.success("Logged out successfully.");
    } catch (error) {
      console.log(error);
      toast.error("Logout failed. Please try again.");
      // Fallback: still log user out on the frontend if API fails
      set({ authUser: null });
    } finally {
      set({ loading: false });
    }
  },

  forgotPassword: async (email) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.post("/auth/forgot-password", { email });
      toast.success("Password reset link sent! Please check your email.");
      console.log("at forgot password");
      console.log("data is gere ", res.data);
      return res.data; // Return the entire response data including url
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
          "Password reset failed. Please try again."
      );
      return { success: false, error: error.response?.data?.message };
    } finally {
      set({ loading: false });
    }
  },

  verifyEmail: async ({ verificationCode }) => {
    try {
      const res = await axiosInstance.post("/auth/verify", {
        verificationCode,
      });

      return res.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Verification failed",
      };
    }
  },

  resendMail: async ({ email }) => {
    try {
      const user = await axiosInstance.post("/auth/resend-verification", {
        email,
      });

      toast.success("Verification email resent! Please check your inbox.");
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
          "Resend verification failed. Please try again."
      );
    }
  },

  resetPassword: async ({ token, newPassword }) => {
    try {
      const res = await axiosInstance.post(`/auth/reset-password/${token}`, {
        newPassword,
      });

      return {
        success: true,
        message: res.data.message || "Password reset successful!",
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Password reset failed. Please try again.",
      };
    }
  },
}));
