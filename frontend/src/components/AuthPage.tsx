import { useState } from "react";

type Mode = "login" | "signup" | "verify" | "forgot" | "reset";

export default function AuthPage({ onAuth }: { onAuth: (token: string) => void }) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("http://localhost:4000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      setMode("verify");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      onAuth(data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Replace with your backend endpoint
    const endpoint = mode === "login" ? "/login" : "/signup";
    try {
      const res = await fetch(`http://localhost:4000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");
      onAuth(data.token); // Save token in parent/app state
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (mode === "verify") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100">
        <div className="w-full max-w-md bg-white/80 rounded-xl shadow-2xl p-8 backdrop-blur-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-700 drop-shadow">
            Verify Your Email
          </h2>
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Enter 4-digit code"
              required
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (mode === "forgot") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100">
        <div className="w-full max-w-md bg-white/80 rounded-xl shadow-2xl p-8 backdrop-blur-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-700 drop-shadow">
            Forgot Password
          </h2>
          <form
            onSubmit={async e => {
              e.preventDefault();
              setError(null);
              setLoading(true);
              try {
                const res = await fetch("http://localhost:4000/forgot-password", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: resetEmail }),
                });
                if (!res.ok) throw new Error("Failed to send reset code");
                setMode("reset");
              } catch (err: any) {
                setError(err.message);
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-4"
          >
            <input
              type="email"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold"
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (mode === "reset") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100">
        <div className="w-full max-w-md bg-white/80 rounded-xl shadow-2xl p-8 backdrop-blur-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-700 drop-shadow">
            Reset Password
          </h2>
          <form
            onSubmit={async e => {
              e.preventDefault();
              setError(null);
              setLoading(true);
              try {
                const res = await fetch("http://localhost:4000/reset-password", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: resetEmail, resetToken, newPassword }),
                });
                if (!res.ok) throw new Error("Password reset failed");
                setMode("login");
              } catch (err: any) {
                setError(err.message);
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-4"
          >
            <input
              type="text"
              value={resetToken}
              onChange={e => setResetToken(e.target.value)}
              placeholder="Enter reset code"
              required
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100">
      <div className="w-full max-w-md bg-white/80 rounded-xl shadow-2xl p-8 backdrop-blur-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700 drop-shadow">
          {mode === "login" ? "Login" : "Sign Up"}
        </h2>
        <form onSubmit={mode === "login" ? handleSubmit : handleSignup} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              tabIndex={-1}
            >
              {showPassword ? (
                // EyeOff SVG
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675m1.675-1.675A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.336 3.236-.938 4.675m-1.675 1.675A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675" />
                </svg>
              ) : (
                // Eye SVG
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {mode === "signup" && (
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                tabIndex={-1}
              >
                {showPassword ? (
                  // EyeOff SVG
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675m1.675-1.675A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.336 3.236-.938 4.675m-1.675 1.675A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675" />
                  </svg>
                ) : (
                  // Eye SVG
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          )}
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold"
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>
        <div className="mt-4 text-center text-gray-600">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                className="text-blue-700 hover:underline font-semibold"
                onClick={() => setMode("signup")}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                className="text-blue-700 hover:underline font-semibold"
                onClick={() => setMode("login")}
              >
                Login
              </button>
            </>
          )}
        </div>
        {mode === "login" && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="text-blue-700 hover:underline"
            >
              Forgot Password?
            </button>
          </div>
        )}
      </div>
    </div>
  );
}