import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/useAuthStore.js";

export default function AuthForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    contact_number: "",
  });

  const { signup, loading } = useAuthStore();
  const { fullName, email, password, contact_number } = formData;
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!fullName || !email || !password || !contact_number) {
        toast.error("All fields are required.");
        return;
      }

      const response = await signup(formData);

      if (
        response &&
        (response.success === true || response.success !== false)
      ) {
        toast.success(
          response.message || "Signup successful! Please verify your email."
        );

        // Navigate to verification page with email as URL parameter
        sessionStorage.setItem("verificationEmail", email);
        window.location.href = `/verify-email/${encodeURIComponent(email)}`;
      } else {
        toast.error(response?.error || response?.message || "Signup failed.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Create Your Account
        </h2>
        <p className="text-center text-gray-500 mb-8">Let’s get you started!</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={fullName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <input
            type="tel"
            name="contact_number"
            placeholder="Contact Number"
            value={contact_number}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition disabled:bg-blue-400"
          >
            {loading ? "Loading..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 font-medium hover:underline ml-1"
          >
            Login
          </button>
        </div>
      </motion.div>
    </div>
  );
}
