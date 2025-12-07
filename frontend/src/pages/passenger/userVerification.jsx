import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/useAuthStore";

function VerifyEmailForm() {
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, resendMail, loading } = useAuthStore();

  const { email } = useParams();
  const emailFromStorage = sessionStorage.getItem("verificationEmail");
  const isResendPage = location.pathname === "/resend-verification";

  const userEmailToUse = isResendPage
    ? userEmail || emailFromStorage || (email ? decodeURIComponent(email) : "")
    : email
    ? decodeURIComponent(email)
    : emailFromStorage || userEmail;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email on resend page
    if (isResendPage && (!userEmail || userEmail.trim() === "")) {
      toast.error("Please enter your email address.");
      return;
    }

    // Validate verification code
    if (!verificationCode || verificationCode.trim().length !== 6) {
      toast.error("Please enter a complete 6-digit verification code.");
      return;
    }

    // Validate that verification code contains only numbers
    if (!/^\d{6}$/.test(verificationCode.trim())) {
      toast.error("Verification code must contain only numbers.");
      return;
    }

    try {
      const response = await verifyEmail({
        verificationCode: verificationCode.trim(),
      });

      if (response && response.success !== false) {
        setIsVerified(true);
        toast.success("Email verified successfully!");
        // Navigate to login after successful verification
        setTimeout(() => {
          sessionStorage.removeItem("verificationEmail");
          window.location.href = "/login";
        }, 1500);
      } else {
        toast.error(
          response?.error ||
            "Verification failed. Please check your code and try again."
        );
      }
    } catch (error) {
      toast.error("Verification failed. Please check your code and try again.");
    }
  };

  const handleResend = async () => {
    // If we're not on the resend page, navigate to it
    if (!isResendPage) {
      window.location.href = "/resend-verification";
      return;
    }

    // Validate email before sending
    const emailToUse = userEmail.trim();
    if (!emailToUse) {
      toast.error("Please enter your email address first.");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToUse)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!canResend) {
      toast.error(`Please wait ${resendTimer} seconds before resending.`);
      return;
    }

    setResendLoading(true);
    setCanResend(false);

    try {
      await resendMail({ email: emailToUse });

      // Start countdown timer (60 seconds)
      let timer = 60;
      setResendTimer(timer);

      const countdown = setInterval(() => {
        timer -= 1;
        setResendTimer(timer);

        if (timer <= 0) {
          clearInterval(countdown);
          setCanResend(true);
          setResendTimer(0);
        }
      }, 1000);
    } catch (error) {
      toast.error("Failed to send verification code. Please try again.");
      setCanResend(true);
      setResendTimer(0);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {isResendPage ? "Resend Verification Code" : "Check Your Email"}
        </h2>
        <p className="text-gray-500 mb-6">
          {isResendPage ? (
            <>
              Enter your email address to receive a new verification code,{" "}
              <br />
              then enter the 6-digit code to verify your account
            </>
          ) : (
            <>
              We've sent a 6-digit verification code to <br />
              <strong>{userEmailToUse || "your email address"}</strong>
            </>
          )}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(isResendPage || !userEmailToUse) && (
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 text-left"
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email address"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="verificationCode"
              className="block text-sm font-medium text-gray-700 text-left"
            >
              Verification Code
            </label>
            <input
              type="text"
              name="verificationCode"
              id="verificationCode"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => {
                // Only allow numbers and limit to 6 characters
                const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                setVerificationCode(value);
              }}
              autoComplete="one-time-code"
              required
              maxLength="6"
              pattern="[0-9]{6}"
              className="w-full px-4 py-3 text-center text-2xl tracking-[0.3em] rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:bg-gray-100"
              disabled={isVerified}
            />
            <p className="text-xs text-gray-500 text-center">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || isVerified}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Account"}
          </button>
        </form>

        {isVerified ? (
          <div className="mt-6">
            <p className="text-green-600 font-semibold mb-4">
              Verification Successful!
            </p>
            <button
              onClick={() => (window.location.href = "/login")}
              className="text-blue-600 font-medium hover:underline"
            >
              Proceed to Login
            </button>
          </div>
        ) : (
          <div className="mt-6 text-sm text-gray-600">
            {isResendPage ? (
              <div className="text-center space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm mb-2">
                    Step 1: Click "Send New Code" to receive a verification
                    email
                  </p>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={
                      loading ||
                      resendLoading ||
                      !canResend ||
                      !userEmail.trim()
                    }
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition"
                  >
                    {resendLoading
                      ? "Sending..."
                      : !canResend
                      ? `Resend in ${resendTimer}s`
                      : "Send New Code"}
                  </button>
                </div>
                <p className="text-gray-600">
                  Step 2: Check your email and enter the 6-digit code above,
                  then click "Verify Account"
                </p>
              </div>
            ) : (
              <>
                Didn't receive the code?{" "}
                <button
                  onClick={handleResend}
                  disabled={loading || resendLoading}
                  className="text-blue-600 font-medium hover:underline disabled:text-gray-400"
                >
                  Go to Resend Page
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailForm;
