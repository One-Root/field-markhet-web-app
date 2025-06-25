"use client";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginWithOTP = () => {
  const [mobileNumber, setNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const TEMPLATE = "Markhet+Buyer";
  const API_BASE = "/api";
  const navigate = useNavigate();

  const sendOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber, template: TEMPLATE }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");

      setStep(2);
    } catch (err) {
      alert("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      const deviceId =
        crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15);

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber, otp, deviceId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP verification failed");

      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);

      // ✅ Store hardcoded fieldUserId for testing
      localStorage.setItem(
        "fieldUserId",
        "b90ef910-331a-41d6-bd5e-ef59c778459d"
      );

      alert("Login successful!");
      navigate("/home");
    } catch (err) {
      alert("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          {step === 1 ? "Login with Mobile" : "Verify OTP"}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            step === 1 ? sendOtp() : verifyOtp();
          }}
        >
          {step === 1 ? (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-4 py-3 mb-5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={loading || mobileNumber.length < 10}
                className="w-full bg-blue-600 hover:bg-blue-700 transition text-black font-medium py-3 rounded-md disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full px-4 py-3 mb-5 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className="w-full bg-green-600 text-black hover:bg-green-700 transition font-medium py-3 rounded-md disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>
              <p
                onClick={() => setStep(1)}
                className="text-center text-sm mt-4 text-blue-600 cursor-pointer hover:underline"
              >
                ← Change number
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginWithOTP;
