import { useState } from "react";
import { useNavigate } from "react-router-dom"; // If using react-router-dom

const LoginWithOTP = () => {
  const [mobileNumber, setNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // useRouter for Next.js; useNavigate for Vite+React

  const TEMPLATE = "Markhet+Buyer";
  const API_BASE = "/api";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 px-4 py-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md border border-green-100 p-6">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <span className="text-white text-xl font-bold">MO</span>
          </div>
          <h1 className="text-2xl font-bold text-green-800">Markhet Ops</h1>
          <p className="text-green-600 text-sm mt-1">
            {step === 1 ? "Enter your mobile number" : "Verify your OTP"}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            step === 1 ? sendOtp() : verifyOtp();
          }}
          className="space-y-5"
        >
          {step === 1 ? (
            <>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-green-500 font-medium text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => setNumber(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-green-900 placeholder-green-400 transition-all text-base"
                    placeholder="9876543210"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || mobileNumber.length < 10}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Enter OTP
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-green-900 placeholder-green-400 transition-all text-lg text-center tracking-widest"
                  placeholder="4-digit OTP"
                />
                <p className="text-xs text-green-500 mt-1 text-center">
                  OTP sent to +91 {mobileNumber}
                </p>
              </div>
              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                }}
                className="w-full text-green-600 hover:text-green-700 font-medium text-sm mt-2"
              >
                ← Change mobile number
              </button>
            </>
          )}
        </form>

        <div className="mt-6 text-center text-xs text-green-500">
          Secure login powered by Markhet Ops
        </div>
      </div>
    </div>
  );
};

export default LoginWithOTP;
