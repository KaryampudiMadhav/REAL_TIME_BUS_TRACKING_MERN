import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/useAuthStore"; // Adjust the import path

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLinkSent, setIsLinkSent] = useState(false);
  const { forgotPassword, loading } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    const response = await forgotPassword(email);
    console.log("url", response);
    if (response && response.success) {
      setIsLinkSent(true);
      sessionStorage.setItem("resetEmail", email);

      console.log(response.resetToken);
      window.location.href = `/reset/${response.resetToken}`;
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
        {!isLinkSent ? (
          <>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
              Forgot Your Password?
            </h2>
            <p className="text-center text-gray-500 mb-8">
              No problem! Enter your email below and we'll send you a link to
              reset it.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition disabled:bg-blue-400"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-green-600 mb-4">
              Check Your Email!
            </h2>
            <p className="text-gray-600 mb-4">
              A password reset link has been sent to <strong>{email}</strong>.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h3 className="font-semibold text-blue-800 mb-2">Next Steps:</h3>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. Check your email inbox (and spam folder)</li>
                <li>2. Click the reset link in the email</li>
                <li>3. You'll be taken to the password reset page</li>
                <li>4. Enter your new password</li>
              </ol>
            </div>
          </div>
        )}
        <div className="mt-6 text-center text-sm text-gray-600">
          <Link
            to="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            ← Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default ForgotPasswordPage;
