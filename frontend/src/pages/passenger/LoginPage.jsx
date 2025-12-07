import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore.js";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading } = useAuthStore();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("All fields are required.");
      return;
    }

    const res = await login({ email, password });
    console.log("Login response:", res);

    if (res && res.success !== false) {
      toast.success(res.message || "Login successful!");
      navigate("/", { replace: true });
    } else {
      // Show specific error messages for different scenarios
      if (res?.error?.includes("verify")) {
        toast.error(
          "Please verify your email before logging in. Check your inbox for the verification code."
        );
      } else if (res?.error?.includes("locked")) {
        toast.error(
          "Account temporarily locked due to failed attempts. Try again in 15 minutes."
        );
      } else if (res?.error?.includes("Invalid credentials")) {
        toast.error(
          "Invalid email or password. Please check your credentials."
        );
      } else {
        toast.error(res?.error || "Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8"
      >
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
          Welcome Back 👋
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
          <p>
            Don’t have an account?{" "}
            <Link to="/signup" className="text-blue-600 font-medium">
              Sign up
            </Link>
          </p>
          <p>
            Forgot password?{" "}
            <Link to="/forgot" className="text-blue-600 font-medium">
              Reset
            </Link>
          </p>
          <p>
            Didn’t get verification mail?{" "}
            <Link
              to="/resend-verification"
              className="text-blue-600 font-medium"
            >
              Resend
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
