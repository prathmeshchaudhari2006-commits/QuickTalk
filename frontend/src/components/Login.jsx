import React, { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { ArrowRight, UserCheck } from "lucide-react";

const Login = ({ onLoginSuccess, switchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/api/auth/login", { email, password });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      onLoginSuccess(user, token);
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
    try {
      setLoading(true);
      setError("");
      const response = await axiosInstance.post("/api/auth/login", { email: userEmail, password: userPass });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      onLoginSuccess(user, token);
    } catch (err) {
      try {
        const name = userEmail.split("@")[0].toUpperCase();
        const regResp = await axiosInstance.post("/api/auth/register", {
          name,
          email: userEmail,
          password: userPass
        });
        const { token, user } = regResp.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        onLoginSuccess(user, token);
      } catch (regErr) {
        setError(regErr.response?.data?.message || "Failed to auto-create test user");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F5F3EE] font-sans selection:bg-[#C1511A] selection:text-white">
      
      {/* Editorial Card */}
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#DEDAD1] rounded-[6px] p-8">
        
        {/* Brand Header */}
        <div className="border-b border-[#DEDAD1] pb-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#C1511A] rounded-[2px]" />
            <span className="font-semibold tracking-tight text-sm text-[#1C1B19]">
              Signal
            </span>
          </div>
          <span className="text-xs text-[#6F6B62]">1-on-1 Chat</span>
        </div>

        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#1C1B19] mb-1">
            Sign In
          </h1>
          <p className="text-xs text-[#6F6B62]">
            Enter your email and password to access your messages.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-[4px] bg-[#FFF5F2] border border-[#C1511A]/30 text-[#C1511A] text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#1C1B19] mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="alice@signal.net"
              className="w-full bg-[#FFFFFF] border border-[#DEDAD1] rounded-[4px] px-3 py-2 text-xs text-[#1C1B19] placeholder-[#A39C8F] focus:outline-none focus:border-[#C1511A] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1C1B19] mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-[#FFFFFF] border border-[#DEDAD1] rounded-[4px] px-3 py-2 text-xs text-[#1C1B19] placeholder-[#A39C8F] focus:outline-none focus:border-[#C1511A] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#C1511A] hover:bg-[#A84313] text-white font-medium text-xs py-2.5 px-4 rounded-[4px] transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Test Buttons */}
        <div className="mt-8 pt-5 border-t border-[#DEDAD1]">
          <div className="text-[11px] text-[#6F6B62] font-medium mb-3">
            Quick Demo Accounts:
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin("alice@signal.net", "password123")}
              className="p-2.5 bg-[#FFFFFF] border border-[#DEDAD1] hover:bg-[#F5F3EE] hover:border-[#C1511A]/40 rounded-[4px] text-left transition-colors cursor-pointer flex items-center gap-2.5"
            >
              <div className="w-6 h-6 rounded-[4px] bg-[#F0EDE6] text-[#1C1B19] font-bold text-xs flex items-center justify-center border border-[#DEDAD1]">
                A
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-[#1C1B19]">Alice</div>
                <div className="text-[10px] text-[#6F6B62]">Tab 1</div>
              </div>
            </button>

            <button
              onClick={() => handleQuickLogin("bob@signal.net", "password123")}
              className="p-2.5 bg-[#FFFFFF] border border-[#DEDAD1] hover:bg-[#F5F3EE] hover:border-[#C1511A]/40 rounded-[4px] text-left transition-colors cursor-pointer flex items-center gap-2.5"
            >
              <div className="w-6 h-6 rounded-[4px] bg-[#F0EDE6] text-[#1C1B19] font-bold text-xs flex items-center justify-center border border-[#DEDAD1]">
                B
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-[#1C1B19]">Bob</div>
                <div className="text-[10px] text-[#6F6B62]">Tab 2</div>
              </div>
            </button>
          </div>
        </div>

        {/* Switch to Register */}
        <div className="mt-6 text-center text-xs">
          <span className="text-[#6F6B62]">Need an account? </span>
          <button
            onClick={switchToRegister}
            className="text-[#C1511A] hover:underline font-medium cursor-pointer ml-0.5"
          >
            Register
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
