import { useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Loader2,
  Mail,
  Lock,
  User,
  Phone,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";

export default function Login({ onStudentLogin }) {
  const [activeTab, setActiveTab] = useState("student"); // 'admin' or 'student'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // --- Admin State ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // --- Student State ---
  const [loginId, setLoginId] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [pendingStudent, setPendingStudent] = useState(null);

  // --- Student Forgot Password State ---
  const [showForgotMode, setShowForgotMode] = useState(false);
  const [forgotLoginId, setForgotLoginId] = useState("");
  const [forgotWhatsapp, setForgotWhatsapp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);

  // ==============================
  // ADMIN AUTHENTICATION LOGIC
  // ==============================
  const handleAdminAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Success! Check your email for the confirmation link.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  // ==============================
  // STUDENT AUTHENTICATION LOGIC
  // ==============================
  const handleStudentAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("login_id", loginId)
        .eq("password", studentPassword)
        .single();

      if (error || !data) throw new Error("Invalid Login ID or Password.");

      if (data.is_first_login) {
        setIsFirstLogin(true);
        setPendingStudent(data);
      } else {
        onStudentLogin(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFirstLoginPasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("students")
        .update({ password: newPassword, is_first_login: false })
        .eq("id", pendingStudent.id)
        .select()
        .single();

      if (error) throw error;
      onStudentLogin(data);
    } catch (err) {
      setError("Failed to update password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // STUDENT FORGOT PASSWORD LOGIC
  // ==============================
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const { data: studentMatch, error: fetchError } = await supabase
        .from("students")
        .select("id, name")
        .eq("login_id", forgotLoginId.trim())
        .eq("whatsapp_number", forgotWhatsapp.trim())
        .single();

      if (fetchError || !studentMatch) {
        throw new Error(
          "Verification failed. Make sure your Login ID and registered WhatsApp number are correct.",
        );
      }

      const { error: updateError } = await supabase
        .from("students")
        .update({ password: forgotNewPassword, is_first_login: false })
        .eq("id", studentMatch.id);

      if (updateError) throw updateError;

      setMessage(
        `Password reset successful for ${studentMatch.name}! You can now log in.`,
      );
      setShowForgotMode(false);
      setLoginId(forgotLoginId);
      setForgotLoginId("");
      setForgotWhatsapp("");
      setForgotNewPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // RENDER UI
  // ==============================
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-green-100 relative overflow-hidden">
        {/* Toggle Tabs */}
        {!isFirstLogin && !showForgotMode && (
          <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "student"
                  ? "bg-white text-green-700 shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => {
                setActiveTab("student");
                setError(null);
                setMessage(null);
              }}
            >
              Student Login
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "admin"
                  ? "bg-white text-green-700 shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => {
                setActiveTab("admin");
                setError(null);
                setMessage(null);
              }}
            >
              Admin Login
            </button>
          </div>
        )}

        {/* Global Messages */}
        {message && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* --- STUDENT: FORGOT PASSWORD FLOW --- */}
        {showForgotMode ? (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <button
              onClick={() => {
                setShowForgotMode(false);
                setError(null);
              }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
            >
              <ArrowLeft size={16} /> Back to Login
            </button>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                Reset Password
              </h1>
              <p className="text-gray-600 mt-2 text-sm">
                Verify your identity to create a new password
              </p>
            </div>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">
                  Login ID
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={forgotLoginId}
                    onChange={(e) => setForgotLoginId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="e.g. STU-12345"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">
                  Registered WhatsApp No.
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={forgotWhatsapp}
                    onChange={(e) => setForgotWhatsapp(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="+91 9876543210"
                    required
                  />
                </div>
              </div>
              <div className="pt-2">
                <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type={showForgotNewPassword ? "text" : "password"}
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Min. 6 characters"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowForgotNewPassword(!showForgotNewPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                  >
                    {showForgotNewPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </div>
        ) : /* --- STUDENT: FIRST LOGIN FLOW --- */
        isFirstLogin ? (
          <form
            onSubmit={handleFirstLoginPasswordChange}
            className="space-y-4 animate-in zoom-in-95 duration-300"
          >
            <h2 className="text-xl font-bold text-center mb-2">
              Welcome, {pendingStudent.name}!
            </h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              As this is your first time logging in, please set a new password
              to secure your account.
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">
                New Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg flex justify-center mt-4 shadow-md"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Set Password & Login"
              )}
            </button>
          </form>
        ) : /* --- STUDENT: REGULAR LOGIN FLOW --- */
        activeTab === "student" ? (
          <div className="animate-in fade-in duration-200">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                Student Portal
              </h1>
              <p className="text-gray-600 mt-2 text-sm">
                Sign in to view your schedule and profile
              </p>
            </div>
            <form onSubmit={handleStudentAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">
                  Login ID
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Provided by Admin"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type={showStudentPassword ? "text" : "password"}
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPassword(!showStudentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                  >
                    {showStudentPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotMode(true);
                    setError(null);
                    setMessage(null);
                  }}
                  className="text-xs font-medium text-green-600 hover:text-green-700 underline"
                >
                  Forgot Password?
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold py-2.5 rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        ) : (
          /* --- ADMIN: REGULAR LOGIN FLOW --- */
          <div className="animate-in fade-in duration-200">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
              <p className="text-gray-600 mt-2 text-sm">
                {isSignUp
                  ? "Create an account to get started"
                  : "Sign in to access your dashboard"}
              </p>
            </div>

            <form onSubmit={handleAdminAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type={showAdminPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                  >
                    {showAdminPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2.5 rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : isSignUp ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <button
                onClick={handleGoogleLogin}
                className="mt-6 w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-gray-600">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-medium text-green-600 hover:text-green-500 underline"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
