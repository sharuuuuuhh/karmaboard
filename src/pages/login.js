import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import "./login.css";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState(null); // { type: "success"|"error", msg }
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setFeedback({ type: "error", msg: error.message });
    } else {
      setFeedback({ type: "success", msg: "Logged in! Redirecting…" });
      setTimeout(() => navigate("/dashboard"), 800);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">Welcome Boss</h1>
        <p className="auth-subtitle">Only for MuAdmins</p>

        <form className="auth-form" onSubmit={handleLogin}>
          <input
            className="auth-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            disabled={loading}
            required
          />
          <input
            className="auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            disabled={loading}
            required
          />

          {/* inline feedback — no alert() */}
          {feedback && (
            <p className={`auth-feedback ${feedback.type}`}>{feedback.msg}</p>
          )}

          <div className="auth-actions">
            <button
              className="auth-button primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in…" : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
