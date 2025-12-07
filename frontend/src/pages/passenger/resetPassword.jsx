import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/useAuthStore"; // Adjust the import path

function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { resetPassword, loading } = useAuthStore();
  const navigate = useNavigate();

  // This hook gets the 'id' from the URL (e.g., /reset/THIS_IS_THE_TOKEN)
  const { token } = useParams();
  const resetEmail = sessionStorage.getItem("resetEmail");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in both fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    // The store function needs the token and the new password
    const response = await resetPassword({ token, newPassword });

    // On success, clear sessionStorage and redirect to the login page
    if (response && response.success) {
      sessionStorage.removeItem("resetEmail");
      toast.success(
        response.message ||
          "Password reset successful! Please login with your new password."
      );
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } else {
      toast.error(
        response?.error || "Password reset failed. Please try again."
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Reset Your Password
        </h2>
        <p className="text-center text-gray-500 mb-2">
          {resetEmail && (
            <>
              Resetting password for: <br />
              <strong>{resetEmail}</strong>
            </>
          )}
        </p>
        <p className="text-center text-gray-500 mb-8">
          Enter your new password below.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition disabled:bg-blue-400"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default ResetPasswordPage;
