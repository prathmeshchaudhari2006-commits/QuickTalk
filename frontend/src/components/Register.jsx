import React, { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { ArrowLeft, UserPlus } from "lucide-react";

const Register = ({ onRegisterSuccess, switchToLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/api/auth/register", { name, email, password });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      onRegisterSuccess(user, token);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F5F3EE] font-sans selection:bg-[#C1511A] selection:text-white">
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#DEDAD1] rounded-[6px] p-8">
        
        {/* Brand Header */}
        <div className="border-b border-[#DEDAD1] pb-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#C1511A] rounded-[2px]" />
            <span className="font-semibold tracking-tight text-sm text-[#1C1B19]">
              Signal
            </span>
          </div>
          <span className="text-xs text-[#6F6B62]">Registration</span>
        </div>

        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#1C1B19] mb-1">
            Create Account
          </h1>
          <p className="text-xs text-[#6F6B62]">
            Create your account to start messaging.
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
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Alice Smith"
              className="w-full bg-[#FFFFFF] border border-[#DEDAD1] rounded-[4px] px-3 py-2 text-xs text-[#1C1B19] placeholder-[#A39C8F] focus:outline-none focus:border-[#C1511A] transition-colors"
            />
          </div>

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
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Register</span>
                <UserPlus className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs">
          <button
            onClick={switchToLogin}
            className="text-[#6F6B62] hover:text-[#1C1B19] font-medium flex items-center justify-center gap-1 mx-auto cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </button>
        </div>

      </div>
    </div>
  );
};

export default Register;
